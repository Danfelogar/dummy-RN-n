/**
 * Formats a date string into a human-readable relative format.
 *
 * @param dateStr - ISO date string (e.g., "2026-04-22T10:30:00-05:00")
 * @returns Formatted string like "Today, 10:30 AM", "Yesterday, 2:45 PM", or "Apr 20, 3:15 PM"
 */
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isSameDay(date, now)) {
    return `Today, ${timeStr}`;
  } else if (isSameDay(date, yesterday)) {
    return `Yesterday, ${timeStr}`;
  }

  return (
    date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }) + `, ${timeStr}`
  );
};
