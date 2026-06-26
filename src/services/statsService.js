const { db } = require('../config/database');
const { todayKey } = require('../utils/dateUtils');

async function increment(key, amount = 1) {
  db.prepare(`
    INSERT INTO stats (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = value + excluded.value
  `).run(key, amount);
}

async function recordUserCreated() {
  await increment('totalUsers');
}

async function recordGroupCreated() {
  await increment('totalGroups');
}

async function recordMessage(phone) {
  await increment('totalMessages');
  if (phone) {
    db.prepare(`
      INSERT OR IGNORE INTO daily_active_users (dateKey, phone)
      VALUES (?, ?)
    `).run(todayKey(), phone);
  }
}

async function getStats() {
  const rows = db.prepare('SELECT key, value FROM stats').all();
  const stats = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  const daily = db
    .prepare('SELECT COUNT(*) AS count FROM daily_active_users WHERE dateKey = ?')
    .get(todayKey());

  return {
    totalUsers: stats.totalUsers || 0,
    totalMessages: stats.totalMessages || 0,
    totalGroups: stats.totalGroups || 0,
    dailyActiveUsers: daily.count || 0
  };
}

function formatStats(stats) {
  return [
    '*WhatsApp Bible Statistics*',
    '',
    `Users: ${stats.totalUsers}`,
    `Messages: ${stats.totalMessages}`,
    `Groups: ${stats.totalGroups}`,
    `Daily active users: ${stats.dailyActiveUsers}`
  ].join('\n');
}

module.exports = {
  recordUserCreated,
  recordGroupCreated,
  recordMessage,
  getStats,
  formatStats
};
