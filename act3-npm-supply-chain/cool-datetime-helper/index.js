function formatDate(date = new Date()) {
  return date.toISOString().split("T")[0];
}

function formatTime(date = new Date()) {
  return date.toTimeString().split(" ")[0];
}

function formatDateTime(date = new Date()) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return formatDate(d);
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];
  for (const { label, seconds: s } of intervals) {
    const count = Math.floor(seconds / s);
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

module.exports = { formatDate, formatTime, formatDateTime, daysFromNow, timeAgo };
