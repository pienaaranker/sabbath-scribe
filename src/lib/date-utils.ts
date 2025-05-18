import { nextSaturday, previousSaturday, isSaturday, format, addDays, subDays, startOfDay } from 'date-fns';

export const DATE_FORMAT_DB = 'yyyy-MM-dd'; // For storing dates
export const DATE_FORMAT_DISPLAY = 'EEEE, MMMM d, yyyy'; // For displaying dates

export const getNearestSaturday = (date: Date): Date => {
  const today = startOfDay(date);
  if (isSaturday(today)) return today;
  return nextSaturday(today);
};

export const getPreviousSabbath = (currentSabbath: Date): Date => {
  return subDays(currentSabbath, 7);
};

export const getNextSabbath = (currentSabbath: Date): Date => {
  return addDays(currentSabbath, 7);
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
