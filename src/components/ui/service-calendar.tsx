"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import type { ServiceDay, ServiceDayConfig } from "@/types"
import { isServiceDay } from "@/lib/date-utils"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type ServiceCalendarProps = React.ComponentProps<typeof DayPicker> & {
  serviceDayConfig?: ServiceDayConfig;
}

function ServiceCalendar({
  className,
  classNames,
  showOutsideDays = true,
  serviceDayConfig,
  selected,
  ...props
}: ServiceCalendarProps) {
  
  // Create a disabled function based on service day configuration
  const getDisabledDates = React.useCallback((date: Date) => {
    if (!serviceDayConfig) {
      // Default to Saturday if no config provided (backward compatibility)
      return date.getDay() !== 6;
    }
    
    const { primaryDay, additionalDays = [], allowCustomDates = false } = serviceDayConfig;
    
    // If custom dates are allowed, don't disable any dates
    if (allowCustomDates) {
      return false;
    }
    
    // Check if date matches primary day or any additional days
    const allowedDays = [primaryDay, ...additionalDays];
    return !allowedDays.includes(date.getDay() as ServiceDay);
  }, [serviceDayConfig]);

  // Merge the disabled function with any existing disabled prop
  const disabledDates = React.useMemo(() => {
    if (props.disabled) {
      if (typeof props.disabled === 'function') {
        return (date: Date) => props.disabled!(date) || getDisabledDates(date);
      } else if (Array.isArray(props.disabled)) {
        return (date: Date) => props.disabled!.some(d => d.getTime() === date.getTime()) || getDisabledDates(date);
      } else {
        return (date: Date) => props.disabled === date || getDisabledDates(date);
      }
    }
    return getDisabledDates;
  }, [props.disabled, getDisabledDates]);

  // Determine the month to display - use selected date's month if available
  const displayMonth = React.useMemo(() => {
    if (selected && selected instanceof Date) {
      return selected;
    }
    return props.month || new Date();
  }, [selected, props.month]);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      month={displayMonth}
      selected={selected}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      disabled={disabledDates}
      {...props}
    />
  )
}
ServiceCalendar.displayName = "ServiceCalendar"

export { ServiceCalendar }
