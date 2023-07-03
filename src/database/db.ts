import { readDB } from './dbHelpers';

class DB {
  async getUsers() {
    return await readDB();
  }

  async getUser(id: string) {
    const users = await readDB();
    return users.find((user) => user.id === id);
  }
}

export default DB;
