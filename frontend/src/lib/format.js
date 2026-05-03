import { format, formatDistanceToNowStrict, isPast, isToday, isTomorrow } from 'date-fns';

export function fmtDate(d) {
  if (!d) return '';
  return format(new Date(d), 'MMM d, yyyy');
}

export function fmtRelative(d) {
  if (!d) return '';
  return formatDistanceToNowStrict(new Date(d), { addSuffix: true });
}

export function dueLabel(d) {
  if (!d) return null;
  const date = new Date(d);
  if (isToday(date)) return { text: 'Today', tone: 'warning' };
  if (isTomorrow(date)) return { text: 'Tomorrow', tone: 'primary' };
  if (isPast(date)) return { text: `Overdue · ${fmtDate(date)}`, tone: 'destructive' };
  return { text: fmtDate(date), tone: 'default' };
}

export const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High' };
export const STATUS_LABEL = { todo: 'To do', in_progress: 'In progress', completed: 'Completed' };
