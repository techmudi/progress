export const APP_TIME_ZONE = 'Africa/Lusaka';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const numberFormatter = new Intl.NumberFormat('en-US');
const percentFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});
const relativeFormatter = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

function parseDateOnly(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split('-').map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

export function getTodayDateOnly() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  return `${year}-${month}-${day}`;
}

export function formatDateOnly(value) {
  const date = parseDateOnly(value);
  return date ? dateFormatter.format(date) : 'Not available';
}

export function formatDateTime(value) {
  if (!value) return 'Not available';
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Not available';

  return dateTimeFormatter.format(date);
}

export function formatRelativeTime(value) {
  if (!value) return 'Not available';
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Not available';

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];

  for (const [unit, unitSeconds] of units) {
    if (Math.abs(seconds) >= unitSeconds) {
      return relativeFormatter.format(Math.round(seconds / unitSeconds), unit);
    }
  }

  return relativeFormatter.format(seconds, 'second');
}

export function formatNumber(value) {
  if (value === null || value === undefined) return 'Not available';
  return numberFormatter.format(value);
}

export function formatPercent(value) {
  if (value === null || value === undefined) return 'Not available';
  return `${percentFormatter.format(value)}%`;
}

export function humanizeValue(value) {
  if (!value) return 'Not available';

  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
