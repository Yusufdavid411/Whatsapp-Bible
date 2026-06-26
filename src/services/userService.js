const { db, toBooleanFields } = require('../config/database');
const statsService = require('./statsService');
const { nowISO } = require('../utils/dateUtils');

function normalizePhone(value) {
  return String(value || '')
    .replace('@c.us', '')
    .replace('@s.whatsapp.net', '')
    .replace(/\D/g, '');
}

async function registerOrUpdateUser(phone, name = 'Unknown') {
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    return null;
  }

  const existing = db
    .prepare('SELECT * FROM users WHERE phone = ?')
    .get(normalizedPhone);
  const timestamp = nowISO();

  if (!existing) {
    const user = {
      phone: normalizedPhone,
      name: name || 'Unknown',
      joinedAt: timestamp,
      lastSeen: timestamp,
      totalMessages: 1,
      reminderEnabled: false,
      reminderTime: process.env.DEFAULT_REMINDER_TIME || '06:00',
      readingPlan: null,
      translation: process.env.BIBLE_TRANSLATION || 'kjv'
    };

    db.prepare(`
      INSERT INTO users (
        phone,
        name,
        joinedAt,
        lastSeen,
        totalMessages,
        reminderEnabled,
        reminderTime,
        readingPlan,
        translation
      )
      VALUES (@phone, @name, @joinedAt, @lastSeen, @totalMessages, @reminderEnabled, @reminderTime, @readingPlan, @translation)
    `).run({
      ...user,
      reminderEnabled: user.reminderEnabled ? 1 : 0
    });

    await statsService.recordUserCreated();
    await statsService.recordMessage(normalizedPhone);
    return user;
  }

  const resolvedName = name && existing.name === 'Unknown' ? name : existing.name;
  db.prepare(`
    UPDATE users
    SET name = ?, lastSeen = ?, totalMessages = totalMessages + 1
    WHERE phone = ?
  `).run(resolvedName, timestamp, normalizedPhone);

  await statsService.recordMessage(normalizedPhone);

  return getUser(normalizedPhone);
}

async function getUser(phone) {
  return toBooleanFields(
    db.prepare('SELECT * FROM users WHERE phone = ?').get(normalizePhone(phone))
  );
}

async function getAllUsers() {
  return db
    .prepare('SELECT * FROM users ORDER BY joinedAt DESC')
    .all()
    .map(toBooleanFields);
}

async function updateReminder(phone, enabled, time) {
  const updates = {
    reminderEnabled: Boolean(enabled)
  };

  if (time) {
    updates.reminderTime = time;
  }

  const existing = await getUser(phone);
  if (!existing) {
    return null;
  }

  db.prepare(`
    UPDATE users
    SET reminderEnabled = ?, reminderTime = ?
    WHERE phone = ?
  `).run(
    updates.reminderEnabled ? 1 : 0,
    updates.reminderTime || existing.reminderTime,
    normalizePhone(phone)
  );

  return getUser(phone);
}

async function setReminderSent(phone, dateKey) {
  db.prepare('UPDATE users SET lastReminderSent = ? WHERE phone = ?').run(
    dateKey,
    normalizePhone(phone)
  );
}

async function getUsersWithReminderTime(time) {
  return db
    .prepare('SELECT * FROM users WHERE reminderTime = ? AND reminderEnabled = 1')
    .all(time)
    .map(toBooleanFields);
}

async function updateReadingPlan(phone, readingPlan) {
  db.prepare('UPDATE users SET readingPlan = ? WHERE phone = ?').run(
    readingPlan,
    normalizePhone(phone)
  );

  return getUser(phone);
}

async function updateTranslation(phone, translation) {
  db.prepare('UPDATE users SET translation = ? WHERE phone = ?').run(
    translation,
    normalizePhone(phone)
  );

  return getUser(phone);
}

module.exports = {
  normalizePhone,
  registerOrUpdateUser,
  getUser,
  getAllUsers,
  updateReminder,
  setReminderSent,
  getUsersWithReminderTime,
  updateReadingPlan,
  updateTranslation
};
