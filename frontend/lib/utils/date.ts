import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export type DateRangePeriod = 'week' | 'month' | 'last_month' | 'last_3_months';

export function getDateRange(period: DateRangePeriod): { start: string; end: string } {
  const now = new Date();
  let start: Date;
  let end: Date;

  switch (period) {
    case 'week':
      start = startOfWeek(now);
      end = endOfWeek(now);
      break;

    case 'month':
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;

    case 'last_month':
      const lastMonth = subMonths(now, 1);
      start = startOfMonth(lastMonth);
      end = endOfMonth(lastMonth);
      break;

    case 'last_3_months':
      start = startOfMonth(subMonths(now, 3));
      end = endOfMonth(now);
      break;

    default:
      start = startOfMonth(now);
      end = endOfMonth(now);
  }

  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  };
}

export function isValidFutureDate(date: string): boolean {
  try {
    const selectedDate = new Date(date);
    const now = new Date();
    return selectedDate >= now;
  } catch {
    return false;
  }
}

export function formatDateForInput(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, "yyyy-MM-dd'T'HH:mm");
}
