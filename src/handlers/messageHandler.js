const { getHelpMessage } = require('../commands/helpCommand');
const { formatProfile } = require('../commands/profileCommand');
const {
  handleReminderCommand,
  handleSetReminderCommand
} = require('../commands/reminderCommand');
const { handlePlanCommand } = require('../commands/planCommand');
const { handleAdminCommand } = require('../commands/adminCommand');
const { handleTranslationCommand } = require('../commands/translationCommand');
const bibleService = require('../services/bibleService');
const statsService = require('../services/statsService');
const userService = require('../services/userService');
const { parseScriptureReference } = require('../utils/scriptureParser');
const { handleGroupMessage } = require('./groupHandler');

async function getSenderDetails(message) {
  const contact = await message.getContact();
  const phone = userService.normalizePhone(message.author || message.from);
  const name = contact.pushname || contact.name || contact.shortName || phone;

  return { phone, name };
}

async function sendReply(message, text) {
  await message.reply(text);
}

async function handleCommand({ client, message, phone, body }) {
  const parts = body.trim().split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case '/help':
      return sendReply(message, getHelpMessage());

    case '/profile': {
      const user = await userService.getUser(phone);
      return sendReply(message, formatProfile(user));
    }

    case '/verse': {
      const reference = args.join(' ');
      const user = await userService.getUser(phone);
      const result = await bibleService.lookupVerse(reference, user?.translation);
      return sendReply(message, result.message);
    }

    case '/verseoftheday': {
      const user = await userService.getUser(phone);
      const result = await bibleService.getVerseOfTheDay(user?.translation);
      return sendReply(message, result.message);
    }

    case '/reminder': {
      const response = await handleReminderCommand(phone, args[0]);
      return sendReply(message, response);
    }

    case '/setreminder': {
      const response = await handleSetReminderCommand(phone, args[0]);
      return sendReply(message, response);
    }

    case '/plan': {
      const response = await handlePlanCommand(phone, args);
      return sendReply(message, response);
    }

    case '/stats': {
      const stats = await statsService.getStats();
      return sendReply(message, statsService.formatStats(stats));
    }

    case '/admin': {
      const response = await handleAdminCommand({ phone, args, client });
      return sendReply(message, response);
    }

    case '/translation': {
      const response = await handleTranslationCommand(phone, args);
      return sendReply(message, response);
    }

    default:
      return sendReply(message, `Unknown command.\n\n${getHelpMessage()}`);
  }
}

async function handleTextMessage({ client, message, body }) {
  const { phone, name } = await getSenderDetails(message);
  await userService.registerOrUpdateUser(phone, name);

  if (body.startsWith('/')) {
    return handleCommand({ client, message, phone, body });
  }

  const reference = parseScriptureReference(body);

  if (reference) {
    const user = await userService.getUser(phone);
    const result = await bibleService.lookupVerse(reference.reference, user?.translation);
    return sendReply(message, result.message);
  }

  return sendReply(
    message,
    'Send a Bible reference like John 3:16, or type /help to see commands.'
  );
}

async function handleIncomingMessage(client, message) {
  try {
    console.log('Received message:', {
      from: message.from,
      fromMe: message.fromMe,
      body: message.body,
      author: message.author
    });

    if (!message || message.fromMe || message.from === 'status@broadcast') {
      console.log('Message ignored (fromMe or broadcast)');
      return;
    }

    const body = String(message.body || '').trim();

    if (!body) {
      console.log('Message ignored (empty body)');
      return;
    }

    if (message.from.endsWith('@g.us')) {
      console.log('Handling group message');
      return handleGroupMessage(client, message);
    }

    console.log('Handling text message');
    return handleTextMessage({ client, message, body });
  } catch (error) {
    console.error('Message handling failed:', error);

    try {
      await message.reply('Something went wrong while processing your message. Please try again.');
    } catch (replyError) {
      console.error('Failed to send error reply:', replyError.message);
    }
  }
}

module.exports = {
  handleIncomingMessage,
  handleTextMessage
};
