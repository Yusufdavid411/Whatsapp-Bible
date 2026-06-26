const { db } = require('../config/database');
const statsService = require('../services/statsService');
const userService = require('../services/userService');
const { nowISO } = require('../utils/dateUtils');

function getBotPhone(client) {
  return userService.normalizePhone(client?.info?.wid?._serialized || '');
}

function removeBotMention(body, botPhone) {
  if (!botPhone) {
    return body.trim();
  }

  return body
    .replace(new RegExp(`@${botPhone}\\b`, 'g'), '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function registerGroup(message) {
  const chat = await message.getChat();
  const groupId = message.from;
  const existing = db.prepare('SELECT groupId FROM groups WHERE groupId = ?').get(groupId);

  if (!existing) {
    db.prepare(`
      INSERT INTO groups (groupId, groupName, joinedAt)
      VALUES (?, ?, ?)
    `).run(groupId, chat.name || 'WhatsApp Group', nowISO());

    await statsService.recordGroupCreated();
  }
}

async function isBotMentioned(client, message) {
  const botId = client?.info?.wid?._serialized;
  const botPhone = getBotPhone(client);
  const mentionedIds = message.mentionedIds || [];
  const body = String(message.body || '');

  return (
    Boolean(botId && mentionedIds.includes(botId)) ||
    Boolean(botPhone && body.includes(`@${botPhone}`))
  );
}

async function handleGroupMessage(client, message) {
  await registerGroup(message);

  const mentioned = await isBotMentioned(client, message);

  if (!mentioned) {
    return;
  }

  const botPhone = getBotPhone(client);
  const cleanBody = removeBotMention(String(message.body || ''), botPhone);

  if (!cleanBody) {
    return message.reply('Send a Bible reference like @WhatsAppBible Psalm 23:1, or use @WhatsAppBible /help.');
  }

  const proxyMessage = Object.create(message);
  proxyMessage.body = cleanBody;

  const { handleTextMessage } = require('./messageHandler');
  return handleTextMessage({ client, message: proxyMessage, body: cleanBody });
}

module.exports = {
  handleGroupMessage
};
