const db = require('./db');

// List all tables and objects that reference sessions_old
const allObjects = db
  .prepare("SELECT name, type, sql FROM sqlite_master WHERE sql LIKE '%sessions_old%'")
  .all();

console.log('Objects referencing sessions_old:', allObjects);

const tables = db
  .prepare("SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view')")
  .all();

console.log('All tables/views:', tables);

