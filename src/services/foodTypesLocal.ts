import { api } from '@/services/api';
import { getDb } from '@/database/sqlite';

export type FoodType = {
  id: number;
  name: string;
};

export async function fetchFoodTypesIfNeeded(): Promise<void> {
  const db = await getDb();

  const localFoodTypes = await db.getAllAsync<FoodType>('SELECT * FROM food_types');
  const response = await api.get('/foodtypes');
  const remoteFoodTypes: FoodType[] = response.data;

  if (localFoodTypes.length === 0) {
    const insertStatement = await db.prepareAsync(`
      INSERT INTO food_types (id, name) VALUES (?, ?)
    `);

    try {
      for (const foodTypes of remoteFoodTypes) {
        await insertStatement.executeAsync([foodTypes.id, foodTypes.name]);
      }
    } finally {
      await insertStatement.finalizeAsync();
    }
    return;
  }

  if (localFoodTypes.length !== remoteFoodTypes.length) {
    await db.runAsync('DELETE FROM food_types');
    const insertStatement = await db.prepareAsync(`
      INSERT INTO food_types (id, name) VALUES (?, ?)
    `);

    try {
      for (const foodTypes of remoteFoodTypes) {
        await insertStatement.executeAsync([foodTypes.id, foodTypes.name]);
      }
    } finally {
      await insertStatement.finalizeAsync();
    }
    return;
  }
}

export async function getLocalFoodTypes(): Promise<FoodType[]> {
  const db = await getDb();
  return db.getAllAsync<FoodType>('SELECT * FROM food_types');
}
