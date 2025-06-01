"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Church } from 'lucide-react';
import { getHolidaysForYear, getUpcomingHolidays, Holiday } from '@/lib/holidays';
import { formatDateForDisplay } from '@/lib/date-utils';

interface HolidaySelectorProps {
  onSelectDate: (date: Date, holidayName?: string) => void;
  currentYear?: number;
}

const HOLIDAY_TYPE_ICONS = {
  christian: <Church className="h-4 w-4" />
};

const HOLIDAY_TYPE_COLORS = {
  christian: 'bg-blue-100 text-blue-800 border-blue-200'
};

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
            Upcoming Christian Holidays
          </CardTitle>
          <CardDescription>
            Quick access to the next few Christian holidays
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
                    {HOLIDAY_TYPE_ICONS[holiday.type]}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{holiday.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateForDisplay(holiday.date)}
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${HOLIDAY_TYPE_COLORS[holiday.type]}`}
                  >
                    {holiday.type}
                  </Badge>
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
            Browse Christian holidays by year
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
                      {HOLIDAY_TYPE_ICONS[holiday.type]}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{holiday.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateForDisplay(holiday.date)}
                        {holiday.description && ` • ${holiday.description}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {holiday.isMoveable && (
                        <Badge variant="outline" className="text-xs">
                          Moveable
                        </Badge>
                      )}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${HOLIDAY_TYPE_COLORS[holiday.type]}`}
                      >
                        {holiday.type}
                      </Badge>
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
