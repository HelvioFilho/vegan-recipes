import { getDb } from '@/database/sqlite';

import { api } from '@/services/api';
import { fetchFoodTypesIfNeeded, getLocalFoodTypes, FoodType } from '@/services/foodTypesLocal';

jest.mock('@/database/sqlite', () => ({
  getDb: jest.fn(),
}));

jest.mock('@/services/api', () => ({
  api: {
    get: jest.fn(),
  },
}));

describe('foodTypesLocal', () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      getAllAsync: jest.fn(),
      prepareAsync: jest.fn(),
      runAsync: jest.fn(),
    };

    (getDb as jest.Mock).mockReset();
    (getDb as jest.Mock).mockResolvedValue(mockDb);
    (api.get as jest.Mock).mockReset();
  });

  describe('fetchFoodTypesIfNeeded', () => {
    it('should insert remote food types if localFoodTypes is empty', async () => {
      const remoteFoodTypes: FoodType[] = [
        { id: 1, name: 'Type 1' },
        { id: 2, name: 'Type 2' },
      ];
      mockDb.getAllAsync.mockResolvedValueOnce([]);
      (api.get as jest.Mock).mockResolvedValueOnce({ data: remoteFoodTypes });

      const mockInsertStatement = {
        executeAsync: jest.fn().mockResolvedValue(undefined),
        finalizeAsync: jest.fn().mockResolvedValue(undefined),
      };
      mockDb.prepareAsync.mockResolvedValueOnce(mockInsertStatement);

      await fetchFoodTypesIfNeeded();

      expect(mockDb.prepareAsync).toHaveBeenCalledTimes(1);
      expect(mockInsertStatement.executeAsync).toHaveBeenCalledTimes(remoteFoodTypes.length);
      expect(mockInsertStatement.finalizeAsync).toHaveBeenCalled();
      expect(mockDb.runAsync).not.toHaveBeenCalled();
    });

    it('should delete local food types and insert remote ones if counts differ', async () => {
      const localFoodTypes: FoodType[] = [{ id: 1, name: 'Type 1' }];
      const remoteFoodTypes: FoodType[] = [
        { id: 1, name: 'Type 1' },
        { id: 2, name: 'Type 2' },
      ];
      mockDb.getAllAsync.mockResolvedValueOnce(localFoodTypes);
      (api.get as jest.Mock).mockResolvedValueOnce({ data: remoteFoodTypes });

      const mockInsertStatement = {
        executeAsync: jest.fn().mockResolvedValue(undefined),
        finalizeAsync: jest.fn().mockResolvedValue(undefined),
      };
      mockDb.prepareAsync.mockResolvedValueOnce(mockInsertStatement);

      await fetchFoodTypesIfNeeded();

      expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM food_types');
      expect(mockDb.prepareAsync).toHaveBeenCalledTimes(1);
      expect(mockInsertStatement.executeAsync).toHaveBeenCalledTimes(remoteFoodTypes.length);
      expect(mockInsertStatement.finalizeAsync).toHaveBeenCalled();
    });

    it('should do nothing if local and remote food types have the same length', async () => {
      const localFoodTypes: FoodType[] = [
        { id: 1, name: 'Type 1' },
        { id: 2, name: 'Type 2' },
      ];
      const remoteFoodTypes: FoodType[] = [
        { id: 1, name: 'Type 1' },
        { id: 2, name: 'Type 2' },
      ];
      mockDb.getAllAsync.mockResolvedValueOnce(localFoodTypes);
      (api.get as jest.Mock).mockResolvedValueOnce({ data: remoteFoodTypes });

      await fetchFoodTypesIfNeeded();

      expect(mockDb.prepareAsync).not.toHaveBeenCalled();
      expect(mockDb.runAsync).not.toHaveBeenCalled();
    });
  });

  describe('getLocalFoodTypes', () => {
    it('should return local food types using the proper query', async () => {
      const localFoodTypes: FoodType[] = [
        { id: 1, name: 'Type 1' },
        { id: 2, name: 'Type 2' },
      ];
      mockDb.getAllAsync.mockResolvedValueOnce(localFoodTypes);

      const result = await getLocalFoodTypes();

      expect(result).toEqual(localFoodTypes);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith('SELECT * FROM food_types');
    });
  });
});
