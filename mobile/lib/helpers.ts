import { formatDistanceToNow, format } from 'date-fns';

export function formatSalary(min?: number, max?: number, currency?: string): string {
  const sym = currency === 'INR' ? '\u20B9' : '$';
  if (!min && !max) return 'Salary not disclosed';
  if (min && max) return `${sym}${formatNumber(min)} - ${sym}${formatNumber(max)}`;
  if (min) return `From ${sym}${formatNumber(min)}`;
  return `Up to ${sym}${formatNumber(max!)}`;
}

function formatNumber(n: number): string {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function timeAgo(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: string): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function getMatchColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.substring(0, len) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
