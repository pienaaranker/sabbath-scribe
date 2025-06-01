import { addDays, subDays } from 'date-fns';

export interface Holiday {
  id: string;
  name: string;
  date: Date;
  type: 'christian';
  description?: string;
  isMoveable: boolean; // Whether the date changes each year
}

// Calculate Easter Sunday for a given year (Western Christianity)
function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
}



export function getHolidaysForYear(year: number): Holiday[] {
  const easter = calculateEaster(year);

  return [
    // Fixed Christian Holidays
    {
      id: 'epiphany',
      name: 'Epiphany',
      date: new Date(year, 0, 6),
      type: 'christian' as const,
      description: 'Celebration of the visit of the Magi',
      isMoveable: false
    },
    {
      id: 'christmas-eve',
      name: 'Christmas Eve',
      date: new Date(year, 11, 24),
      type: 'christian' as const,
      description: 'Evening before Christmas',
      isMoveable: false
    },
    {
      id: 'christmas',
      name: 'Christmas Day',
      date: new Date(year, 11, 25),
      type: 'christian' as const,
      description: 'Celebration of the birth of Jesus Christ',
      isMoveable: false
    },

    // Moveable Christian Holidays (based on Easter)
    {
      id: 'palm-sunday',
      name: 'Palm Sunday',
      date: subDays(easter, 7),
      type: 'christian' as const,
      description: 'Sunday before Easter',
      isMoveable: true
    },
    {
      id: 'maundy-thursday',
      name: 'Maundy Thursday',
      date: subDays(easter, 3),
      type: 'christian' as const,
      description: 'Thursday before Easter',
      isMoveable: true
    },
    {
      id: 'good-friday',
      name: 'Good Friday',
      date: subDays(easter, 2),
      type: 'christian' as const,
      description: 'Friday before Easter',
      isMoveable: true
    },
    {
      id: 'easter-sunday',
      name: 'Easter Sunday',
      date: easter,
      type: 'christian' as const,
      description: 'Celebration of the resurrection of Jesus Christ',
      isMoveable: true
    },
    {
      id: 'easter-monday',
      name: 'Easter Monday',
      date: addDays(easter, 1),
      type: 'christian' as const,
      description: 'Monday after Easter',
      isMoveable: true
    },
    {
      id: 'ascension-day',
      name: 'Ascension Day',
      date: addDays(easter, 39),
      type: 'christian' as const,
      description: '39 days after Easter',
      isMoveable: true
    },
    {
      id: 'pentecost',
      name: 'Pentecost',
      date: addDays(easter, 49),
      type: 'christian' as const,
      description: '49 days after Easter',
      isMoveable: true
    },

    // Additional Christian Holidays
    {
      id: 'ash-wednesday',
      name: 'Ash Wednesday',
      date: subDays(easter, 46),
      type: 'christian' as const,
      description: 'Beginning of Lent',
      isMoveable: true
    },
    {
      id: 'trinity-sunday',
      name: 'Trinity Sunday',
      date: addDays(easter, 56),
      type: 'christian' as const,
      description: 'First Sunday after Pentecost',
      isMoveable: true
    },
    {
      id: 'corpus-christi',
      name: 'Corpus Christi',
      date: addDays(easter, 60),
      type: 'christian' as const,
      description: 'Feast of the Body and Blood of Christ',
      isMoveable: true
    },
    {
      id: 'all-saints',
      name: 'All Saints Day',
      date: new Date(year, 10, 1), // November 1st
      type: 'christian' as const,
      description: 'Celebration of all Christian saints',
      isMoveable: false
    },
    {
      id: 'advent-first',
      name: 'First Sunday of Advent',
      date: subDays(new Date(year, 11, 25), ((new Date(year, 11, 25).getDay() + 7 - 0) % 7) + 21),
      type: 'christian' as const,
      description: 'Beginning of the Advent season',
      isMoveable: true
    }
  ].sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getUpcomingHolidays(count: number = 5): Holiday[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const nextYear = currentYear + 1;
  
  const thisYearHolidays = getHolidaysForYear(currentYear).filter(h => h.date >= now);
  const nextYearHolidays = getHolidaysForYear(nextYear);
  
  const allUpcoming = [...thisYearHolidays, ...nextYearHolidays];
  
  return allUpcoming.slice(0, count);
}

export function getHolidaysByType(type: Holiday['type'], year?: number): Holiday[] {
  const targetYear = year || new Date().getFullYear();
  return getHolidaysForYear(targetYear).filter(h => h.type === type);
}
