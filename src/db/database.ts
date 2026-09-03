import initSqlJs, { Database } from 'sql.js';
import { openDB } from 'idb';

const DB_NAME = 'prompt-library-db';
const DB_VERSION = 1;
const SQL_WASM_URL = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm';

let dbInstance: Database | null = null;

export interface Prompt {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

async function initDB(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs({
    locateFile: () => SQL_WASM_URL
  });

  const db = new SQL.Database();
  
  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      tags TEXT DEFAULT '',
      isFavorite INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  dbInstance = db;
  
  // Load from IndexedDB if exists
  try {
    const idb = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sql')) {
          db.createObjectStore('sql');
        }
      }
    });

    const savedData = await idb.get('sql', 'main');
    if (savedData && savedData.length > 0) {
      const uint8Array = new Uint8Array(savedData);
      dbInstance = new SQL.Database(uint8Array);
    }
  } catch (e) {
    console.log('No saved database found, starting fresh');
  }

  return dbInstance!;
}

export async function saveToIndexedDB(db: Database): Promise<void> {
  const data = db.export();
  const idb = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('sql')) {
        db.createObjectStore('sql');
      }
    }
  });
  
  await idb.put('sql', Array.from(data), 'main');
}

export async function getPrompts(): Promise<Prompt[]> {
  const db = await initDB();
  const results = db.exec('SELECT * FROM prompts ORDER BY updatedAt DESC');
  
  if (results.length === 0) {
    return [];
  }

  const columns = results[0].columns;
  const values = results[0].values;

  return values.map(row => {
    const prompt: any = {};
    columns.forEach((col, idx) => {
      prompt[col] = row[idx];
    });
    prompt.isFavorite = prompt.isFavorite === 1;
    return prompt as Prompt;
  });
}

export async function createPrompt(prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prompt> {
  const db = await initDB();
  const now = new Date().toISOString();
  
  db.run(`
    INSERT INTO prompts (title, content, category, tags, isFavorite, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    prompt.title,
    prompt.content,
    prompt.category,
    prompt.tags,
    prompt.isFavorite ? 1 : 0,
    now,
    now
  ]);

  await saveToIndexedDB(db);

  const result = db.exec('SELECT last_insert_rowid()');
  const id = result[0].values[0][0] as number;

  return {
    ...prompt,
    id,
    createdAt: now,
    updatedAt: now
  };
}

export async function updatePrompt(id: number, updates: Partial<Prompt>): Promise<void> {
  const db = await initDB();
  const now = new Date().toISOString();
  
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.content !== undefined) {
    fields.push('content = ?');
    values.push(updates.content);
  }
  if (updates.category !== undefined) {
    fields.push('category = ?');
    values.push(updates.category);
  }
  if (updates.tags !== undefined) {
    fields.push('tags = ?');
    values.push(updates.tags);
  }
  if (updates.isFavorite !== undefined) {
    fields.push('isFavorite = ?');
    values.push(updates.isFavorite ? 1 : 0);
  }

  if (fields.length > 0) {
    fields.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    db.run(`
      UPDATE prompts SET ${fields.join(', ')} WHERE id = ?
    `, values);

    await saveToIndexedDB(db);
  }
}

export async function deletePrompt(id: number): Promise<void> {
  const db = await initDB();
  db.run('DELETE FROM prompts WHERE id = ?', [id]);
  await saveToIndexedDB(db);
}

export async function searchPrompts(query: string): Promise<Prompt[]> {
  const db = await initDB();
  const searchTerm = `%${query}%`;
  
  const results = db.exec(`
    SELECT * FROM prompts 
    WHERE title LIKE ? OR content LIKE ? OR tags LIKE ? OR category LIKE ?
    ORDER BY updatedAt DESC
  `, [searchTerm, searchTerm, searchTerm, searchTerm]);
  
  if (results.length === 0) {
    return [];
  }

  const columns = results[0].columns;
  const values = results[0].values;

  return values.map(row => {
    const prompt: any = {};
    columns.forEach((col, idx) => {
      prompt[col] = row[idx];
    });
    prompt.isFavorite = prompt.isFavorite === 1;
    return prompt as Prompt;
  });
}

export async function getCategories(): Promise<string[]> {
  const db = await initDB();
  const results = db.exec('SELECT DISTINCT category FROM prompts ORDER BY category');
  
  if (results.length === 0) {
    return [];
  }

  return results[0].values.map(row => row[0] as string);
}

export async function exportDatabase(): Promise<Uint8Array> {
  const db = await initDB();
  return db.export();
}

export async function importDatabase(data: Uint8Array): Promise<void> {
  const SQL = await initSqlJs({
    locateFile: () => SQL_WASM_URL
  });
  
  const newDb = new SQL.Database(data);
  dbInstance = newDb;
  await saveToIndexedDB(newDb);
}
