const { formatDate } = require('../utils/dateUtils');

function formatProfile(user) {
  if (!user) {
    return 'Profile not found. Send /help to start using WhatsApp Bible.';
  }

  return [
    '*Your WhatsApp Bible Profile*',
    '',
    `Name: ${user.name || 'Unknown'}`,
    `Phone: ${user.phone}`,
    `Joined: ${formatDate(user.joinedAt)}`,
    `Reminder: ${user.reminderEnabled ? `On at ${user.reminderTime}` : 'Off'}`,
    `Reading plan: ${user.readingPlan || 'None'}`,
    `Translation: ${(user.translation || 'kjv').toUpperCase()}`,
    `Total messages: ${user.totalMessages || 0}`
  ].join('\n');
}

module.exports = {
  formatProfile
};
