"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { DayPicker } from "react-day-picker";

interface DatePickerProps {
  selectedDate?: Date;
  selectDate: (date: Date) => void;
}

export function DatePicker({ selectedDate, selectDate }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!selectedDate}
          className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
        >
          <CalendarIcon />
          {selectedDate ? (
            format(selectedDate, "PPP")
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <DayPicker
          required
          animate
          mode="single"
          selected={selectedDate}
          onSelect={selectDate}
          footer={"Pick a day."}
        />
      </PopoverContent>
    </Popover>
  );
}
