import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import initSqlJs from "sql.js";

const require = createRequire(import.meta.url);
const wasmPath = require.resolve("sql.js/dist/sql-wasm.wasm");

const dataDir = path.resolve(process.env.DATA_DIR ?? "server/data");
const dbPath = path.resolve(process.env.DATABASE_PATH ?? path.join(dataDir, "punaraksha.sqlite"));

let db;

export async function initDb() {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const SQL = await initSqlJs({ locateFile: () => wasmPath });
  db = fs.existsSync(dbPath) ? new SQL.Database(fs.readFileSync(dbPath)) : new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS grievances (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      text TEXT NOT NULL,
      ward_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      category TEXT,
      severity TEXT,
      confidence REAL,
      assigned_to TEXT,
      status TEXT NOT NULL,
      sla_deadline TEXT,
      notice_draft TEXT,
      evidence_json TEXT
    );

    CREATE TABLE IF NOT EXISTS actions (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      agent TEXT NOT NULL,
      grievance_id TEXT,
      ward_id TEXT,
      action_type TEXT NOT NULL,
      detail TEXT NOT NULL,
      payload_json TEXT
    );

    CREATE TABLE IF NOT EXISTS interventions (
      id TEXT PRIMARY KEY,
      ward_id TEXT NOT NULL,
      ward_name TEXT NOT NULL,
      trigger_aqi INTEGER NOT NULL,
      trigger_day INTEGER NOT NULL,
      proposed_actions_json TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('citizen', 'officer', 'admin')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      settings_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  addColumnIfMissing("grievances", "user_id", "TEXT");

  saveDb();
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error("Database is not initialized");
  }

  return db;
}

export function saveDb() {
  if (!db) {
    return;
  }

  fs.writeFileSync(dbPath, Buffer.from(db.export()));
}

export function all(sql, params = []) {
  const statement = getDb().prepare(sql);
  statement.bind(params);
  const rows = [];

  while (statement.step()) {
    rows.push(statement.getAsObject());
  }

  statement.free();
  return rows;
}

export function run(sql, params = []) {
  const statement = getDb().prepare(sql);
  statement.run(params);
  statement.free();
  saveDb();
}

export function dbInfo() {
  return { dbPath };
}

function addColumnIfMissing(tableName, columnName, definition) {
  const columns = [];
  const statement = db.prepare(`PRAGMA table_info(${tableName})`);

  while (statement.step()) {
    columns.push(statement.getAsObject().name);
  }

  statement.free();

  if (!columns.includes(columnName)) {
    db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}
