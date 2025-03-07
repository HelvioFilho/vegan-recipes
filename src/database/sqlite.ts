import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

let _db: SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLiteDatabase> {
  if (_db) {
    return _db;
  }
  _db = await openDatabaseAsync('recipes.db');
  return _db;
}

export function _resetDb() {
  _db = null;
}
