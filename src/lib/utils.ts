import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
}

export function getStreakColor(streak: number): string {
  if (streak >= 30) return 'text-emerald-500';
  if (streak >= 14) return 'text-green-500';
  if (streak >= 7) return 'text-lime-500';
  if (streak >= 3) return 'text-yellow-500';
  return 'text-orange-500';
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'bg-red-500/20 text-red-600 border-red-500/30';
    case 'high':
      return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
    case 'low':
      return 'bg-green-500/20 text-green-600 border-green-500/30';
    default:
      return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30';
    case 'in_progress':
      return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
    case 'pending':
      return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    case 'missed':
      return 'bg-red-500/20 text-red-600 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
  }
}

export function calculateProductivityScore(params: {
  studyHours: number;
  targetStudyHours: number;
  tasksCompleted: number;
  totalTasks: number;
  streak: number;
  habitsCompleted: number;
  totalHabits: number;
  wakeUpTime?: string;
  targetWakeUpTime: string;
}): number {
  let score = 0;

  // Study hours contribution (40 points)
  const studyPercentage = Math.min((params.studyHours / params.targetStudyHours) * 100, 100);
  score += (studyPercentage / 100) * 40;

  // Task completion contribution (30 points)
  const taskPercentage = params.totalTasks > 0
    ? (params.tasksCompleted / params.totalTasks) * 100
    : 100;
  score += (taskPercentage / 100) * 30;

  // Habit completion contribution (20 points)
  const habitPercentage = params.totalHabits > 0
    ? (params.habitsCompleted / params.totalHabits) * 100
    : 100;
  score += (habitPercentage / 100) * 20;

  // Wake-up time contribution (10 points)
  if (params.wakeUpTime) {
    const [wakeHour] = params.wakeUpTime.split(':').map(Number);
    const [targetHour] = params.targetWakeUpTime.split(':').map(Number);
    if (wakeHour <= targetHour) {
      score += 10;
    } else if (wakeHour <= targetHour + 1) {
      score += 5;
    }
  }

  return Math.min(Math.round(score), 100);
}

export function getDateRange(date: Date, range: 'day' | 'week' | 'month'): { start: Date; end: Date } {
  const start = new Date(date);
  const end = new Date(date);

  switch (range) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(date.getDate() - date.getDay());
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(start.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}
