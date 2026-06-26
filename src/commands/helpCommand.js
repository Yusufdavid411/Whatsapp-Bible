function getHelpMessage() {
  return [
    '*WhatsApp Bible Commands*',
    '',
    '/help - Show this help message',
    '/profile - Show your profile',
    '/verse John 3:16 - Look up a Bible verse',
    '/verseoftheday - Get a random verse for today',
    '/translation kjv - Set Bible translation (kjv, niv, esv, etc.)',
    '/reminder on - Enable daily reminders',
    '/reminder off - Disable daily reminders',
    '/setreminder 06:00 - Set reminder time',
    '/plan start - Start a simple reading plan',
    '/plan off - Turn off the reading plan',
    '/stats - Show bot statistics',
    '',
    'You can also send a reference directly, like: Romans 8:28'
  ].join('\n');
}

module.exports = {
  getHelpMessage
};
