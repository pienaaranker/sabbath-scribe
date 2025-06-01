import { format, addDays, subDays, startOfDay } from 'date-fns';
import type { ServiceDay } from '@/types';

export const DATE_FORMAT_DB = 'yyyy-MM-dd'; // For storing dates
export const DATE_FORMAT_DISPLAY = 'EEEE, MMMM d, yyyy'; // For displaying dates

// Service day utilities
export const getServiceDayName = (serviceDay: ServiceDay): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[serviceDay];
};

export const isServiceDay = (date: Date, serviceDay: ServiceDay): boolean => {
  return date.getDay() === serviceDay;
};

export const getNearestServiceDay = (date: Date, serviceDay: ServiceDay): Date => {
  const today = startOfDay(date);
  if (isServiceDay(today, serviceDay)) return today;

  // Find the next occurrence of the service day
  let nextDate = addDays(today, 1);
  while (!isServiceDay(nextDate, serviceDay)) {
    nextDate = addDays(nextDate, 1);
  }
  return nextDate;
};

export const getPreviousServiceDay = (currentDate: Date, serviceDay: ServiceDay): Date => {
  // Go back 7 days to get the previous week's service day
  const previousWeek = subDays(currentDate, 7);

  // If the current date is already the correct service day, just go back 7 days
  if (currentDate.getDay() === serviceDay) {
    return previousWeek;
  }

  // Otherwise, find the previous occurrence of the service day
  let targetDate = previousWeek;
  while (targetDate.getDay() !== serviceDay) {
    targetDate = subDays(targetDate, 1);
  }
  return targetDate;
};

export const getNextServiceDay = (currentDate: Date, serviceDay: ServiceDay): Date => {
  // Go forward 7 days to get the next week's service day
  const nextWeek = addDays(currentDate, 7);

  // If the current date is already the correct service day, just go forward 7 days
  if (currentDate.getDay() === serviceDay) {
    return nextWeek;
  }

  // Otherwise, find the next occurrence of the service day
  let targetDate = nextWeek;
  while (targetDate.getDay() !== serviceDay) {
    targetDate = addDays(targetDate, 1);
  }
  return targetDate;
};

// Legacy Saturday-specific functions (for backward compatibility)
export const getNearestSaturday = (date: Date): Date => {
  return getNearestServiceDay(date, 6);
};

export const getPreviousSabbath = (currentSabbath: Date): Date => {
  return getPreviousServiceDay(currentSabbath, 6);
};

export const getNextSabbath = (currentSabbath: Date): Date => {
  return getNextServiceDay(currentSabbath, 6);
};

export const formatDateForDb = (date: Date): string => {
  return format(date, DATE_FORMAT_DB);
};

export const formatDateForDisplay = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
   // Ensure the date is interpreted correctly as local time, not UTC, if it's just YYYY-MM-DD
  const adjustedDate = typeof date === 'string' && date.length === 10 ? new Date(date + 'T00:00:00') : dateObj;
  return format(adjustedDate, DATE_FORMAT_DISPLAY);
};

export const parseDateFromDb = (dateString: string): Date => {
  // Handles YYYY-MM-DD by interpreting it as local time
  return new Date(dateString + 'T00:00:00'); 
};
