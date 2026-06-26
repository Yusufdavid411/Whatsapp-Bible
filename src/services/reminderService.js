const cron = require('node-cron');
const bibleService = require('./bibleService');
const userService = require('./userService');
const { currentTimeHHMM, todayKey, getTimezone } = require('../utils/dateUtils');

let reminderTask = null;

async function sendReminderToUser(client, user, dateKey) {
  const verse = await bibleService.getVerseOfTheDay();
  const verseText = verse.ok ? `\n\n${verse.message}` : '';

  await client.sendMessage(
    `${user.phone}@c.us`,
    `Take time to study God's Word today.${verseText}`
  );

  await userService.setReminderSent(user.phone, dateKey);
}

async function processDueReminders(client) {
  if (!client?.info?.wid) {
    return;
  }

  const time = currentTimeHHMM();
  const dateKey = todayKey();
  const users = await userService.getUsersWithReminderTime(time);

  for (const user of users) {
    if (user.lastReminderSent === dateKey) {
      continue;
    }

    try {
      await sendReminderToUser(client, user, dateKey);
      console.log(`Reminder sent to ${user.phone}`);
    } catch (error) {
      console.error(`Failed to send reminder to ${user.phone}:`, error.message);
    }
  }
}

function initReminderScheduler(client) {
  if (reminderTask) {
    return reminderTask;
  }

  reminderTask = cron.schedule(
    '* * * * *',
    () => {
      processDueReminders(client).catch((error) => {
        console.error('Reminder scheduler failed:', error.message);
      });
    },
    {
      scheduled: true,
      timezone: getTimezone()
    }
  );

  console.log(`Reminder scheduler started in ${getTimezone()} timezone.`);
  return reminderTask;
}

module.exports = {
  initReminderScheduler,
  processDueReminders
};
