"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Church } from 'lucide-react';
import { getHolidaysForYear, getUpcomingHolidays, Holiday } from '@/lib/holidays';
import { formatDateForDisplay } from '@/lib/date-utils';

interface HolidaySelectorProps {
  onSelectDate: (date: Date, holidayName?: string) => void;
  currentYear?: number;
}

const HOLIDAY_ICON = <Church className="h-4 w-4" />;

export default function HolidaySelector({ onSelectDate, currentYear }: HolidaySelectorProps) {
  const [selectedYear, setSelectedYear] = useState(currentYear || new Date().getFullYear());

  const holidays = useMemo(() => {
    return getHolidaysForYear(selectedYear);
  }, [selectedYear]);

  const upcomingHolidays = useMemo(() => {
    return getUpcomingHolidays(3);
  }, []);

  const handleHolidaySelect = (holiday: Holiday) => {
    onSelectDate(holiday.date, holiday.name);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 1; year <= currentYear + 2; year++) {
      years.push(year);
    }
    return years;
  };

  return (
    <div className="space-y-6">
      {/* Quick Access - Upcoming Holidays */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Holidays
          </CardTitle>
          <CardDescription>
            Quick access to the next few holidays
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            {upcomingHolidays.map((holiday) => (
              <Button
                key={holiday.id}
                variant="outline"
                className="justify-start h-auto p-3"
                onClick={() => handleHolidaySelect(holiday)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="text-primary">
                    {HOLIDAY_ICON}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{holiday.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateForDisplay(holiday.date)}
                    </div>
                  </div>

                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Full Holiday Browser */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Browse All Holidays</CardTitle>
          <CardDescription>
            Browse holidays by year
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Year Filter */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {generateYearOptions().map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Holiday List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {holidays.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No holidays found for the selected criteria.
              </div>
            ) : (
              holidays.map((holiday) => (
                <Button
                  key={holiday.id}
                  variant="ghost"
                  className="justify-start h-auto p-3 w-full"
                  onClick={() => handleHolidaySelect(holiday)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="text-primary">
                      {HOLIDAY_ICON}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{holiday.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateForDisplay(holiday.date)}
                      </div>
                      {holiday.description && (
                        <div className="text-xs text-muted-foreground">
                          {holiday.description}
                        </div>
                      )}
                    </div>

                  </div>
                </Button>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
