const userService = require('../services/userService');
const { isValidTimeHHMM } = require('../utils/dateUtils');

async function handleReminderCommand(phone, action) {
  const normalizedAction = String(action || '').toLowerCase();

  if (normalizedAction === 'on') {
    const user = await userService.updateReminder(phone, true);
    return `Daily Bible reminders are now on at ${user.reminderTime}.`;
  }

  if (normalizedAction === 'off') {
    await userService.updateReminder(phone, false);
    return 'Daily Bible reminders are now off.';
  }

  return 'Use /reminder on or /reminder off.';
}

async function handleSetReminderCommand(phone, time) {
  if (!isValidTimeHHMM(time)) {
    return 'Please use 24-hour time, for example: /setreminder 06:00';
  }

  await userService.updateReminder(phone, true, time);
  return `Daily Bible reminders are now on at ${time}.`;
}

module.exports = {
  handleReminderCommand,
  handleSetReminderCommand
};
