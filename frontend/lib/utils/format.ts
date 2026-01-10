import { format, parseISO } from 'date-fns';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy hh:mm a');
}

export function formatDuration(minutes: number): string {
  if (!minutes) return 'N/A';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function getStatusColor(status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  const statusMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    completed: 'success',
    paid: 'success',
    scheduled: 'info',
    pending: 'warning',
    partially_paid: 'warning',
    cancelled: 'danger',
    unpaid: 'danger',
    no_show: 'default',
  };

  return statusMap[status.toLowerCase()] || 'default';
}
