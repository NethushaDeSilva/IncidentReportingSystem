function pad(value) {
  return String(value).padStart(2, "0");
}

export function getTodayInputValue(now = new Date()) {
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join("-");
}

export function getCurrentDateTimeInputValue(now = new Date()) {
  return `${getTodayInputValue(now)}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function parseDateInputValue(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function parseDateTimeInputValue(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value || "");
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] || 0);
  const parsed = new Date(year, month - 1, day, hour, minute, second);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day ||
    parsed.getHours() !== hour ||
    parsed.getMinutes() !== minute ||
    parsed.getSeconds() !== second
  ) {
    return null;
  }

  return parsed;
}

export function isFutureDateInput(value, now = new Date()) {
  const parsed = parseDateInputValue(value);
  if (!parsed) return false;
  const today = parseDateInputValue(getTodayInputValue(now));
  return parsed > today;
}

export function isFutureDateTimeInput(value, now = new Date()) {
  const parsed = parseDateTimeInputValue(value);
  return parsed ? parsed > now : false;
}

export function isFutureDateTimeValue(value, now = new Date()) {
  if (!value) return false;

  const parsed =
    value instanceof Date
      ? value
      : typeof value?.toDate === "function"
        ? value.toDate()
        : parseDateTimeInputValue(value) || new Date(value);

  return Number.isNaN(parsed.getTime()) ? false : parsed > now;
}

export function clampDateInputToToday(value, now = new Date()) {
  return isFutureDateInput(value, now) ? getTodayInputValue(now) : value;
}

export function clampDateTimeInputToNow(value, now = new Date()) {
  return isFutureDateTimeInput(value, now) ? getCurrentDateTimeInputValue(now) : value;
}
