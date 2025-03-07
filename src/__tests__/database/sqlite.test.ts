import { getDb, _resetDb } from '@/database/sqlite';
import { openDatabaseAsync } from 'expo-sqlite';

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

describe('Sqlite', () => {
  const fakeDb = { exec: jest.fn() };

  beforeEach(() => {
    _resetDb();
    jest.clearAllMocks();
  });

  it('should call openDatabaseAsync only once and return the cached instance', async () => {
    (openDatabaseAsync as jest.Mock).mockResolvedValue(fakeDb);

    const db1 = await getDb();
    expect(db1).toBe(fakeDb);
    expect(openDatabaseAsync).toHaveBeenCalledTimes(1);

    const db2 = await getDb();
    expect(db2).toBe(fakeDb);
    expect(openDatabaseAsync).toHaveBeenCalledTimes(1);
  });

  it('should propagate error when openDatabaseAsync fails', async () => {
    const error = new Error('Failed to open the database');
    (openDatabaseAsync as jest.Mock).mockRejectedValueOnce(error);

    await expect(getDb()).rejects.toThrow(error);
  });
});
