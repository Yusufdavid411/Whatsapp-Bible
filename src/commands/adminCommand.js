const statsService = require('../services/statsService');
const userService = require('../services/userService');

function getAdminNumbers() {
  return String(process.env.ADMIN_NUMBERS || '')
    .split(',')
    .map((phone) => userService.normalizePhone(phone))
    .filter(Boolean);
}

function isAdmin(phone) {
  return getAdminNumbers().includes(userService.normalizePhone(phone));
}

async function broadcast(client, message) {
  const users = await userService.getAllUsers();
  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      await client.sendMessage(`${user.phone}@c.us`, message);
      sent += 1;
    } catch (error) {
      failed += 1;
      console.error(`Broadcast failed for ${user.phone}:`, error.message);
    }
  }

  return { sent, failed };
}

async function handleAdminCommand({ phone, args, client }) {
  if (!isAdmin(phone)) {
    return 'You are not authorized to use admin commands.';
  }

  const action = String(args[0] || '').toLowerCase();

  if (action === 'users') {
    const users = await userService.getAllUsers();
    return [
      '*Admin: Users*',
      '',
      `Total registered users: ${users.length}`
    ].join('\n');
  }

  if (action === 'stats') {
    const stats = await statsService.getStats();
    return statsService.formatStats(stats);
  }

  if (action === 'broadcast') {
    const message = args.slice(1).join(' ').trim();

    if (!message) {
      return 'Use /admin broadcast MESSAGE';
    }

    const result = await broadcast(client, message);
    return `Broadcast complete. Sent: ${result.sent}. Failed: ${result.failed}.`;
  }

  return [
    '*Admin Commands*',
    '',
    '/admin users',
    '/admin stats',
    '/admin broadcast MESSAGE'
  ].join('\n');
}

module.exports = {
  isAdmin,
  handleAdminCommand
};
