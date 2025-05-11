"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getOneMonthAgo } from "@/hooks/use-statistics";

interface DateRangePickerProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

const DateRangePicker = ({ onDateRangeChange }: DateRangePickerProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(getOneMonthAgo())
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [isOpen, setIsOpen] = useState(false);

  // 날짜 범위가 변경될 때 콜백 호출
  useEffect(() => {
    if (startDate && endDate) {
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");
      onDateRangeChange(formattedStartDate, formattedEndDate);
    }
  }, [startDate, endDate, onDateRangeChange]);

  // 날짜 범위 형식화
  const formattedDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, "yyyy.MM.dd", { locale: ko })} ~ ${format(
        endDate,
        "yyyy.MM.dd",
        { locale: ko }
      )}`;
    }
    return "날짜 범위 선택";
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal sm:w-auto gap-2"
        >
          <Calendar className="h-4 w-4" />
          <span>{formattedDateRange()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">시작일</h4>
            <CalendarComponent
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              disabled={(date) => date > new Date() || (endDate ? date > endDate : false)}
              initialFocus
            />
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm">종료일</h4>
            <CalendarComponent
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
              initialFocus
            />
          </div>
          <div className="flex justify-end">
            <Button 
              size="sm" 
              onClick={() => setIsOpen(false)}
            >
              적용
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker; 