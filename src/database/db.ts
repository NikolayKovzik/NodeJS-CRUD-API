import { IUser } from 'types/types';
import { readDB, updateDB } from './dbHelpers';

class DB {
  async getUsers() {
    return await readDB();
  }

  async getUser(id: string) {
    const users = await readDB();
    return users.find((user) => user.id === id);
  }

  async updateUser(id: string, data: Partial<Omit<IUser, 'id'>>) {
    const users = await readDB();
    const currentUserIndex = users.findIndex((user) => user.id === id);

    if (currentUserIndex !== -1) {
      users[currentUserIndex] = { ...users[currentUserIndex], ...data };
      await updateDB(users);
      return users[currentUserIndex];
    } else {
      return null;
    }
  }
}

export default DB;
