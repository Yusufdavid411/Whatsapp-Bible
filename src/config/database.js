const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const databasePath = path.resolve(
  process.cwd(),
  process.env.DATABASE_PATH || path.join('data', 'whatsapp-bible.sqlite')
);

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    phone TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    joinedAt TEXT NOT NULL,
    lastSeen TEXT NOT NULL,
    totalMessages INTEGER NOT NULL DEFAULT 0,
    reminderEnabled INTEGER NOT NULL DEFAULT 0,
    reminderTime TEXT NOT NULL,
    readingPlan TEXT,
    lastReminderSent TEXT,
    translation TEXT NOT NULL DEFAULT 'kjv'
  );

  CREATE TABLE IF NOT EXISTS groups (
    groupId TEXT PRIMARY KEY,
    groupName TEXT NOT NULL,
    joinedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS stats (
    key TEXT PRIMARY KEY,
    value INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS daily_active_users (
    dateKey TEXT NOT NULL,
    phone TEXT NOT NULL,
    PRIMARY KEY (dateKey, phone)
  );
`);

function toBooleanFields(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,
    reminderEnabled: Boolean(user.reminderEnabled)
  };
}

module.exports = {
  db,
  databasePath,
  toBooleanFields
};
