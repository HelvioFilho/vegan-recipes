import { api } from '@/services/api';
import { getDb } from '@/database/sqlite';
import { useUserStore } from '@/store/userStore';

export async function checkAndCreateLocalUser(): Promise<void> {
  const db = await getDb();

  const localUsers = await db.getAllAsync<{ id: number; name: string }>(
    'SELECT * FROM users LIMIT 1'
  );

  if (localUsers.length === 0) {
    const randomName = 'user_' + Math.random().toString(36).substring(2, 10);

    try {
      const response = await api.post('/create_user', { name: randomName });
      const data = response.data;
      if (data.id) {
        await db.runAsync('INSERT INTO users (id, name) VALUES (?, ?)', [data.id, randomName]);
        useUserStore.getState().setUserId(data.id);
        return;
      }
    } catch (error) {
      console.error('Erro ao criar usuário: ', error);
    }
  } else {
    const localUser = localUsers[0];
    useUserStore.getState().setUserId(String(localUser.id));
  }
}
