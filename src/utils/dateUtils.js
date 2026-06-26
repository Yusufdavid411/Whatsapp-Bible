function nowISO() {
  return new Date().toISOString();
}

function getTimezone() {
  return process.env.TIMEZONE || 'Africa/Lagos';
}

function todayKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: getTimezone(),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

function currentTimeHHMM(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: getTimezone(),
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(date);

  const hour = parts.find((part) => part.type === 'hour').value;
  const minute = parts.find((part) => part.type === 'minute').value;
  return `${hour}:${minute}`;
}

function isValidTimeHHMM(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function formatDate(value) {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: getTimezone(),
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

module.exports = {
  nowISO,
  todayKey,
  currentTimeHHMM,
  isValidTimeHHMM,
  formatDate,
  getTimezone
};
