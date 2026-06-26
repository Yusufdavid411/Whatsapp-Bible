const userService = require('../services/userService');

const COMMON_TRANSLATIONS = [
  'kjv', 'niv', 'esv', 'nlt', 'nasb', 'msg', 'nkjv', 'nrs'
];

async function handleTranslationCommand(phone, args) {
  const translation = String(args[0] || '').toLowerCase();

  if (!translation) {
    return [
      '*Bible Translation*',
      '',
      'Set your preferred Bible translation.',
      '',
      'Common translations:',
      ...COMMON_TRANSLATIONS.map(t => `- ${t.toUpperCase()}`),
      '',
      'Usage: /translation kjv',
      'Usage: /translation niv'
    ].join('\n');
  }

  const validTranslation = translation.trim();

  await userService.updateTranslation(phone, validTranslation);

  return [
    '*Translation Updated*',
    '',
    `Your Bible translation is now set to: ${validTranslation.toUpperCase()}`,
    '',
    'This will be used for all verse lookups.'
  ].join('\n');
}

module.exports = {
  handleTranslationCommand
};
