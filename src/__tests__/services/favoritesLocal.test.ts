import { getDb } from '@/database/sqlite';
import {
  favoriteRecipe,
  getFavoriteRecipeById,
  unfavoriteRecipe,
  getAllFavoriteRecipes,
} from '@/services/favoritesLocal';
import { RecipeProps } from '@/hooks/useRecipeById';
import { downloadImageFile } from '@/utils/fileSystemUtils';

jest.mock('@/database/sqlite', () => ({
  getDb: jest.fn(),
}));

jest.mock('@/utils/fileSystemUtils', () => ({
  downloadImageFile: jest.fn().mockResolvedValue('cover.jpg'),
  deleteLocalFile: jest.fn().mockResolvedValue(undefined),
}));

describe('favoritesLocal', () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      withExclusiveTransactionAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      getAllAsync: jest.fn(),
    };
    (getDb as jest.Mock).mockReset();
    (getDb as jest.Mock).mockResolvedValue(mockDb);
  });

  describe('favoriteRecipe', () => {
    it('should insert recipe and related data into the database', async () => {
      const fakeRecipe: RecipeProps = {
        id: '1',
        name: 'Test Recipe',
        total_ingredients: '2',
        time: '45',
        cover: 'cover.jpg',
        video: 'video.mp4',
        rating: '4.5',
        difficulty: 'Easy',
        calories: '200',
        observation: 'Test observation',
        ingredients: [
          {
            id: '101',
            recipe_id: '1',
            name: 'Ingredient 1',
            amount: '1',
            section: 'Section A',
          },
          {
            id: '102',
            recipe_id: '1',
            name: 'Ingredient 2',
            amount: '2',
            section: 'Section B',
          },
        ],
        instructions: [
          { id: '201', recipe_id: '1', step: '1', text: 'Do something' },
          { id: '202', recipe_id: '1', step: '2', text: 'Do something else' },
        ],
        food_types: [
          { id: '301', name: 'Type A' },
          { id: '302', name: 'Type B' },
        ],
      };

      const fakeTransaction = {
        runAsync: jest.fn().mockResolvedValue(undefined),
      };

      mockDb.withExclusiveTransactionAsync.mockImplementation(async (callback: Function) => {
        await callback(fakeTransaction);
      });

      await favoriteRecipe(fakeRecipe);

      expect(fakeTransaction.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO recipes'),
        expect.arrayContaining([
          Number(fakeRecipe.id),
          fakeRecipe.name,
          Number(fakeRecipe.total_ingredients),
          Number(fakeRecipe.time),
          fakeRecipe.cover,
          fakeRecipe.video,
          Number(fakeRecipe.rating),
          fakeRecipe.difficulty,
          fakeRecipe.calories,
          fakeRecipe.observation,
        ])
      );

      const ingredientCalls = fakeTransaction.runAsync.mock.calls.filter((call: any) =>
        call[0].includes('INSERT OR REPLACE INTO recipe_ingredients')
      );
      expect(ingredientCalls.length).toBe(fakeRecipe.ingredients.length);

      const instructionCalls = fakeTransaction.runAsync.mock.calls.filter((call: any) =>
        call[0].includes('INSERT OR REPLACE INTO recipe_instructions')
      );
      expect(instructionCalls.length).toBe(fakeRecipe.instructions.length);

      const foodTypesCalls = fakeTransaction.runAsync.mock.calls.filter((call: any) =>
        call[0].includes('INSERT OR REPLACE INTO food_types')
      );
      expect(foodTypesCalls.length).toBe(fakeRecipe.food_types.length);

      const recipeFoodTypesCalls = fakeTransaction.runAsync.mock.calls.filter((call: any) =>
        call[0].includes('INSERT OR REPLACE INTO recipe_food_types')
      );
      expect(recipeFoodTypesCalls.length).toBe(fakeRecipe.food_types.length);
    });

    it('should split the cover to capture the file when it starts with http', async () => {
      const fakeRecipe: RecipeProps = {
        id: '2',
        name: 'Test Recipe http cover',
        total_ingredients: '2',
        time: '45',
        cover: 'https://exemplo.com/minha-imagem.jpg',
        video: '',
        rating: '4.5',
        difficulty: 'Easy',
        calories: '200',
        observation: 'Test observation http cover',
        ingredients: [],
        instructions: [],
        food_types: [],
      };

      const fakeTransaction = { runAsync: jest.fn().mockResolvedValue(undefined) };
      const mockDb = {
        withExclusiveTransactionAsync: jest.fn(async (callback: Function) => {
          await callback(fakeTransaction);
        }),
      };
      (getDb as jest.Mock).mockResolvedValueOnce(mockDb);

      await favoriteRecipe(fakeRecipe);

      expect(downloadImageFile).toHaveBeenCalledWith(
        'https://exemplo.com/minha-imagem.jpg',
        'minha-imagem.jpg'
      );
    });
  });

  describe('getFavoriteRecipeById', () => {
    it('should return null if no recipe is found', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null);

      const result = await getFavoriteRecipeById('1');
      expect(result).toBeNull();
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(expect.stringContaining('FROM recipes'), [
        Number('1'),
      ]);
    });

    it('should return a recipe with mapped ingredients, instructions, and food types', async () => {
      const dbRecipeRow = {
        id: 1,
        name: 'Test Recipe',
        total_ingredients: 3,
        time: 45,
        cover: 'cover.jpg',
        video: 'video.mp4',
        rating: 4.5,
        difficulty: 'Easy',
        calories: '200',
        observation: 'Observation',
      };
      const dbIngredients = [
        { id: 101, recipe_id: 1, name: 'Ingredient 1', amount: '1 cup', section: 'A' },
      ];
      const dbInstructions = [{ id: 201, recipe_id: 1, step: '1', text: 'Step 1' }];
      const dbFoodTypes = [{ id: 301, name: 'Type A' }];

      mockDb.getFirstAsync.mockResolvedValueOnce(dbRecipeRow);
      mockDb.getAllAsync
        .mockResolvedValueOnce(dbIngredients)
        .mockResolvedValueOnce(dbInstructions)
        .mockResolvedValueOnce(dbFoodTypes);

      const result = await getFavoriteRecipeById('1');

      expect(result).toEqual({
        id: '1',
        name: dbRecipeRow.name,
        total_ingredients: String(dbRecipeRow.total_ingredients),
        time: String(dbRecipeRow.time),
        cover: dbRecipeRow.cover || '',
        video: dbRecipeRow.video || '',
        rating: String(dbRecipeRow.rating),
        difficulty: dbRecipeRow.difficulty,
        calories: dbRecipeRow.calories || '',
        observation: dbRecipeRow.observation,
        ingredients: dbIngredients.map((row) => ({
          id: String(row.id),
          recipe_id: String(row.recipe_id),
          name: row.name,
          amount: row.amount ?? '',
          section: row.section ?? '',
        })),
        instructions: dbInstructions.map((row) => ({
          id: String(row.id),
          recipe_id: String(row.recipe_id),
          step: row.step,
          text: row.text,
        })),
        food_types: dbFoodTypes.map((row) => ({
          id: String(row.id),
          name: row.name,
        })),
      });
    });

    it('should return recipe with default values for cover, video, and calories when they are null', async () => {
      const dbRecipeRow = {
        id: 1,
        name: 'Test Recipe',
        total_ingredients: 3,
        time: 45,
        cover: null,
        video: null,
        rating: 4.5,
        difficulty: 'Easy',
        calories: null,
        observation: null,
      };

      const dbIngredients: any[] = [];
      const dbInstructions: any[] = [];
      const dbFoodTypes: any[] = [];

      mockDb.getFirstAsync.mockResolvedValueOnce(dbRecipeRow);
      mockDb.getAllAsync
        .mockResolvedValueOnce(dbIngredients)
        .mockResolvedValueOnce(dbInstructions)
        .mockResolvedValueOnce(dbFoodTypes);

      const result = await getFavoriteRecipeById('1');

      expect(result).toEqual({
        id: '1',
        name: dbRecipeRow.name,
        total_ingredients: String(dbRecipeRow.total_ingredients),
        time: String(dbRecipeRow.time),
        cover: '',
        video: '',
        rating: String(dbRecipeRow.rating),
        difficulty: dbRecipeRow.difficulty,
        calories: '',
        observation: dbRecipeRow.observation,
        ingredients: [],
        instructions: [],
        food_types: [],
      });
    });

    it('should map ingredient fields and fallback to empty string when amount and section are null', async () => {
      const dbRecipeRow = {
        id: 1,
        name: 'Test Recipe',
        total_ingredients: 3,
        time: 45,
        cover: 'cover.jpg',
        video: 'video.mp4',
        rating: 4.5,
        difficulty: 'Easy',
        calories: '200',
        observation: 'Observation',
      };
      const dbIngredients = [
        { id: 101, recipe_id: 1, name: 'Ingredient 1', amount: null, section: null },
      ];
      const dbInstructions: any[] = [];
      const dbFoodTypes: any[] = [];

      mockDb.getFirstAsync.mockResolvedValueOnce(dbRecipeRow);
      mockDb.getAllAsync
        .mockResolvedValueOnce(dbIngredients)
        .mockResolvedValueOnce(dbInstructions)
        .mockResolvedValueOnce(dbFoodTypes);

      const result = await getFavoriteRecipeById('1');

      expect(result?.ingredients).toEqual([
        {
          id: '101',
          recipe_id: '1',
          name: 'Ingredient 1',
          amount: '',
          section: '',
        },
      ]);
    });
  });

  describe('getAllFavoriteRecipes', () => {
    it('should return all favorite recipes as FavoriteListItem[]', async () => {
      const dbRows = [
        {
          id: 1,
          name: 'Recipe 1',
          total_ingredients: 3,
          time: 45,
          cover: 'cover1.jpg',
          rating: 4.5,
          difficulty: 'Easy',
          video: 'video1.mp4',
          calories: 200,
        },
        {
          id: 2,
          name: 'Recipe 2',
          total_ingredients: 5,
          time: 30,
          cover: 'cover2.jpg',
          rating: 4.0,
          difficulty: 'Medium',
          video: 'video2.mp4',
          calories: 150,
        },
      ];
      mockDb.getAllAsync.mockResolvedValueOnce(dbRows);

      const result = await getAllFavoriteRecipes();

      expect(result).toEqual(
        dbRows.map((row) => ({
          id: String(row.id),
          name: row.name,
          total_ingredients: String(row.total_ingredients),
          time: String(row.time),
          cover: row.cover ?? '',
          rating: String(row.rating),
          difficulty: row.difficulty,
          video: row.video ?? '',
          calories: String(row.calories),
        }))
      );
      expect(mockDb.getAllAsync).toHaveBeenCalledWith('SELECT * FROM recipes;');
    });

    it('should map recipe fields with fallback for cover and video when undefined', async () => {
      const dbRows = [
        {
          id: 1,
          name: 'Recipe 1',
          total_ingredients: 5,
          time: 30,
          cover: undefined,
          rating: 4.0,
          difficulty: 'Easy',
          video: undefined,
          calories: undefined,
        },
      ];
      mockDb.getAllAsync.mockResolvedValueOnce(dbRows);

      const result = await getAllFavoriteRecipes();

      expect(result).toEqual([
        {
          id: '1',
          name: 'Recipe 1',
          total_ingredients: '5',
          time: '30',
          cover: '',
          rating: '4',
          difficulty: 'Easy',
          video: '',
          calories: 'undefined',
        },
      ]);
    });
  });

  describe('unfavoriteRecipe', () => {
    it('should delete favorite recipe and related data', async () => {
      const fakeTransaction = {
        runAsync: jest.fn().mockResolvedValue(undefined),
      };

      mockDb.withExclusiveTransactionAsync.mockImplementation(async (cb: Function) => {
        await cb(fakeTransaction);
      });

      await unfavoriteRecipe('1');

      expect(fakeTransaction.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM recipe_food_types'),
        [Number('1')]
      );
      expect(fakeTransaction.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM recipe_ingredients'),
        [Number('1')]
      );
      expect(fakeTransaction.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM recipe_instructions'),
        [Number('1')]
      );
      expect(fakeTransaction.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM recipes'),
        [Number('1')]
      );
    });
  });
});
