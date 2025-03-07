import { getDb } from '@/database/sqlite';
import { setupDatabase } from '@/services/setupDatabase';

jest.mock('@/database/sqlite', () => ({
  getDb: jest.fn(),
}));

describe('setupDatabase', () => {
  it('should call getDb and create tables if they do not exist', async () => {
    const mockExecAsync = jest.fn().mockResolvedValueOnce(undefined);
    const mockDb = { execAsync: mockExecAsync };

    (getDb as jest.Mock).mockResolvedValueOnce(mockDb);

    await setupDatabase();

    expect(getDb).toHaveBeenCalledTimes(1);

    expect(mockExecAsync).toHaveBeenCalledTimes(1);

    expect(mockExecAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS recipes')
    );
  });
});
