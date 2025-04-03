import { getDb } from '@/database/sqlite';
import { api } from '@/services/api';
import { checkAndCreateLocalUser } from '@/services/checkUser';
import { useUserStore } from '@/store/userStore';

jest.mock('@/database/sqlite', () => ({
  getDb: jest.fn(),
}));

jest.mock('@/services/api', () => ({
  api: {
    post: jest.fn(),
  },
}));

describe('checkAndCreateLocalUser', () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      getAllAsync: jest.fn(),
      runAsync: jest.fn(),
    };

    (getDb as jest.Mock).mockReset();
    (getDb as jest.Mock).mockResolvedValue(mockDb);
    (api.post as jest.Mock).mockReset();
    useUserStore.setState({ userId: null });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a new user if no local user exists and api returns a valid id', async () => {
    const fakeId = 100;
    const randomValue = 0.123456789;
    const expectedRandomName = 'user_' + randomValue.toString(36).substring(2, 10);

    mockDb.getAllAsync.mockResolvedValueOnce([]);
    (api.post as jest.Mock).mockResolvedValueOnce({ data: { id: fakeId } });
    jest.spyOn(Math, 'random').mockReturnValue(randomValue);

    await checkAndCreateLocalUser();

    expect(mockDb.runAsync).toHaveBeenCalledWith('INSERT INTO users (id, name) VALUES (?, ?)', [
      fakeId,
      expectedRandomName,
    ]);
    expect(useUserStore.getState().userId).toBe(fakeId);
  });

  it('should update the user store with the existing local user if one exists', async () => {
    const localUser = { id: 42, name: 'Existing User' };
    mockDb.getAllAsync.mockResolvedValueOnce([localUser]);

    await checkAndCreateLocalUser();

    expect(useUserStore.getState().userId).toBe(String(localUser.id));
    expect(api.post).not.toHaveBeenCalled();
    expect(mockDb.runAsync).not.toHaveBeenCalled();
  });

  it('should log an error if api.post fails', async () => {
    const error = new Error('API error');
    mockDb.getAllAsync.mockResolvedValueOnce([]);
    (api.post as jest.Mock).mockRejectedValueOnce(error);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await checkAndCreateLocalUser();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao criar usuário: ', error);
    expect(useUserStore.getState().userId).toBeNull();
    expect(mockDb.runAsync).not.toHaveBeenCalled();
  });

  it('should not update the user store if api response does not include an id', async () => {
    mockDb.getAllAsync.mockResolvedValueOnce([]);
    (api.post as jest.Mock).mockResolvedValueOnce({ data: {} });

    await checkAndCreateLocalUser();

    expect(mockDb.runAsync).not.toHaveBeenCalled();
    expect(useUserStore.getState().userId).toBeNull();
  });
});
