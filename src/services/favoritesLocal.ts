import { RecipeProps, Ingredient, Instruction, FoodType } from '@/hooks/useRecipeById';

import { getDb } from '@/database/sqlite';
import { deleteLocalFile, downloadImageFile } from '@/utils/fileSystemUtils';

interface DbRecipeRow {
  id: number;
  name: string;
  total_ingredients: number;
  time: number;
  cover: string | null;
  video: string | null;
  rating: number;
  difficulty: string;
  calories: string | null;
  observation: string | null;
}

interface DbIngredientRow {
  id: number;
  recipe_id: number;
  name: string;
  amount: string | null;
  section: string | null;
}

interface DbInstructionRow {
  id: number;
  recipe_id: number;
  step: string;
  text: string;
}

interface DbFoodTypeRow {
  id: number;
  name: string;
}

interface DbRecipeListRow {
  id: number;
  name: string;
  total_ingredients: number;
  time: number;
  cover: string | null;
  rating: number;
  difficulty: string;
  video: string | null;
  calories: number;
}

export type FavoriteListItem = {
  id: string;
  name: string;
  total_ingredients: string;
  time: string;
  cover: string;
  rating: string;
  difficulty: string;
  video: string;
  calories: string;
};

export async function favoriteRecipe(recipe: RecipeProps): Promise<void> {
  const db = await getDb();

  const remoteImageUrl = recipe.cover;
  const fileName = recipe.cover.startsWith('http') ? recipe.cover.split('/').pop()! : recipe.cover;

  const localCoverUri = await downloadImageFile(remoteImageUrl, fileName);
  const updatedRecipe = { ...recipe, cover: localCoverUri };

  await db.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(
      `INSERT OR REPLACE INTO recipes
       (id, name, total_ingredients, time, cover, video, rating, difficulty, calories, observation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        Number(updatedRecipe.id),
        updatedRecipe.name,
        Number(updatedRecipe.total_ingredients),
        Number(updatedRecipe.time),
        updatedRecipe.cover,
        updatedRecipe.video,
        Number(updatedRecipe.rating),
        updatedRecipe.difficulty,
        updatedRecipe.calories,
        updatedRecipe.observation,
      ]
    );

    for (const ingredients of updatedRecipe.ingredients) {
      await transaction.runAsync(
        `INSERT OR REPLACE INTO recipe_ingredients
         (id, recipe_id, name, amount, section)
         VALUES (?, ?, ?, ?, ?);`,
        [
          Number(ingredients.id),
          Number(recipe.id),
          ingredients.name,
          ingredients.amount,
          ingredients.section,
        ]
      );
    }

    for (const instructions of updatedRecipe.instructions) {
      await transaction.runAsync(
        `INSERT OR REPLACE INTO recipe_instructions
         (id, recipe_id, step, text)
         VALUES (?, ?, ?, ?);`,
        [Number(instructions.id), Number(recipe.id), instructions.step, instructions.text]
      );
    }

    for (const foodTypes of updatedRecipe.food_types) {
      await transaction.runAsync(`INSERT OR REPLACE INTO food_types (id, name) VALUES (?, ?);`, [
        Number(foodTypes.id),
        foodTypes.name,
      ]);
      await transaction.runAsync(
        `INSERT OR REPLACE INTO recipe_food_types (recipe_id, food_type_id)
         VALUES (?, ?);`,
        [Number(recipe.id), Number(foodTypes.id)]
      );
    }
  });
}

export async function getFavoriteRecipeById(id: string): Promise<RecipeProps | null> {
  const db = await getDb();
  const recipeRow = await db.getFirstAsync<DbRecipeRow>(
    `SELECT *
     FROM recipes
     WHERE id = ?;`,
    [Number(id)]
  );
  if (!recipeRow) {
    return null;
  }

  const ingredientsRows = await db.getAllAsync<DbIngredientRow>(
    `SELECT *
     FROM recipe_ingredients
     WHERE recipe_id = ?;`,
    [Number(id)]
  );

  const ingredients: Ingredient[] = ingredientsRows.map((row) => ({
    id: String(row.id),
    recipe_id: String(row.recipe_id),
    name: row.name,
    amount: row.amount ?? '',
    section: row.section ?? '',
  }));

  const instructionsRows = await db.getAllAsync<DbInstructionRow>(
    `SELECT *
     FROM recipe_instructions
     WHERE recipe_id = ?;`,
    [Number(id)]
  );

  const instructions: Instruction[] = instructionsRows.map((row) => ({
    id: String(row.id),
    recipe_id: String(row.recipe_id),
    step: row.step,
    text: row.text,
  }));

  const foodTypesRows = await db.getAllAsync<DbFoodTypeRow>(
    `SELECT ft.id, ft.name
     FROM food_types ft
     JOIN recipe_food_types rft ON ft.id = rft.food_type_id
     WHERE rft.recipe_id = ?;`,
    [Number(id)]
  );

  const food_types: FoodType[] = foodTypesRows.map((row) => ({
    id: String(row.id),
    name: row.name,
  }));

  const recipe: RecipeProps = {
    id: String(recipeRow.id),
    name: recipeRow.name,
    total_ingredients: String(recipeRow.total_ingredients),
    time: String(recipeRow.time),
    cover: recipeRow.cover || '',
    video: recipeRow.video || '',
    rating: String(recipeRow.rating),
    difficulty: recipeRow.difficulty,
    calories: recipeRow.calories || '',
    observation: recipeRow.observation,
    ingredients,
    instructions,
    food_types,
  };

  return recipe;
}

export async function getAllFavoriteRecipes(): Promise<FavoriteListItem[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<DbRecipeListRow>(`SELECT * FROM recipes;`);

  return rows.map((row) => ({
    id: String(row.id),
    name: row.name,
    total_ingredients: String(row.total_ingredients),
    time: String(row.time),
    cover: row.cover ?? '',
    rating: String(row.rating),
    difficulty: row.difficulty,
    video: row.video ?? '',
    calories: String(row.calories),
  }));
}

export async function unfavoriteRecipe(id: string): Promise<void> {
  const recipe = await getFavoriteRecipeById(id);
  await deleteLocalFile(recipe?.cover!);

  const db = await getDb();
  await db.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(`DELETE FROM recipe_food_types WHERE recipe_id = ?;`, [Number(id)]);
    await transaction.runAsync(`DELETE FROM recipe_ingredients WHERE recipe_id = ?;`, [Number(id)]);
    await transaction.runAsync(`DELETE FROM recipe_instructions WHERE recipe_id = ?;`, [
      Number(id),
    ]);
    await transaction.runAsync(`DELETE FROM recipes WHERE id = ?;`, [Number(id)]);
  });
}
