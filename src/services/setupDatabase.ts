import { getDb } from '@/database/sqlite';

export async function setupDatabase() {
  const db = await getDb();

  await db.execAsync(`
    -- Recipes
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      total_ingredients INTEGER NOT NULL,
      time INTEGER NOT NULL,
      cover TEXT,
      video TEXT,
      rating REAL DEFAULT 0.00,
      difficulty TEXT NOT NULL DEFAULT 'Intermediário',
      calories TEXT,
      observation TEXT
    );

    -- Recipe Ingredients
    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id INTEGER PRIMARY KEY NOT NULL,
      recipe_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      amount TEXT,
      section TEXT
    );

    -- Recipe Instructions
    CREATE TABLE IF NOT EXISTS recipe_instructions (
      id INTEGER PRIMARY KEY NOT NULL,
      recipe_id INTEGER NOT NULL,
      step TEXT NOT NULL,
      text TEXT NOT NULL
    );

    -- Food Types
    CREATE TABLE IF NOT EXISTS food_types (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL
    );

    -- Recipe Food Types (associativa)
    CREATE TABLE IF NOT EXISTS recipe_food_types (
      recipe_id INTEGER NOT NULL,
      food_type_id INTEGER NOT NULL,
      PRIMARY KEY (recipe_id, food_type_id)
    );
  `);
}
