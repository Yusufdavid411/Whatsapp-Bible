const userService = require('../services/userService');

const DEFAULT_PLAN = 'Daily Bible Reading';

async function handlePlanCommand(phone, args) {
  const action = String(args[0] || '').toLowerCase();

  if (action === 'start' || action === 'on') {
    await userService.updateReadingPlan(phone, DEFAULT_PLAN);
    return `Reading plan started: ${DEFAULT_PLAN}.`;
  }

  if (action === 'off' || action === 'stop') {
    await userService.updateReadingPlan(phone, null);
    return 'Reading plan turned off.';
  }

  return 'Use /plan start to begin or /plan off to stop.';
}

module.exports = {
  handlePlanCommand
};
