
import Dexie from "dexie";

const database = new Dexie("accountdb");
database.version(1).stores({
  user: '++id, email, username, currency, token',
});

export const userTable = database.table('user');

export default database;
