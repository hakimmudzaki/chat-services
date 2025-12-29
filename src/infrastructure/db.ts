import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { DatabaseSchema } from '../domain/types.js';

// Setup adapter ke file data/db.json
const adapter = new JSONFile<DatabaseSchema>('data/db.json');
const defaultData: DatabaseSchema = { users: [], messages: [] };

export const db = new Low<DatabaseSchema>(adapter, defaultData);

export async function initDB() {
  await db.read();
  // Jika file kosong, isi dengan default structure
  if (!db.data) {
    db.data = defaultData;
    await db.write();
  }
}