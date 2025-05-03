"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { startOfMonth } from "date-fns";
import { MonthlyAttendance } from "@/types/attendance";
import { getCurrentMonthWeeks } from "@/lib/attendance-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ListFilter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MonthlyAttendanceTableProps {
  isLoading: boolean;
  monthlyData: MonthlyAttendance[];
  onFetchData: () => void;
}

export default function MonthlyAttendanceTable({
  isLoading,
  monthlyData,
  onFetchData,
}: MonthlyAttendanceTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (monthlyData.length > 0) {
    return (
      <Table>
        <TableCaption>
          이번달 GBS 출석 현황 ({format(startOfMonth(new Date()), 'yyyy년 MM월', { locale: ko })})
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">이름</TableHead>
            {getCurrentMonthWeeks().map((week, index) => (
              <TableHead key={week} className="text-center">
                {index+1}주차<br/>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(week), 'MM/dd', { locale: ko })}
                </span>
              </TableHead>
            ))}
            <TableHead className="text-center">출석률</TableHead>
            <TableHead className="text-center">평균 QT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {monthlyData.map((member) => {
            // 출석률 계산
            const attendedWeeks = member.attendances.filter(a => a.worship === 'O').length;
            const totalWeeks = member.attendances.length;
            const attendanceRate = totalWeeks > 0 ? (attendedWeeks / totalWeeks) * 100 : 0;
            
            // 평균 QT 횟수 계산
            const totalQtCount = member.attendances.reduce((sum, a) => sum + a.qtCount, 0);
            const averageQt = totalWeeks > 0 ? totalQtCount / totalWeeks : 0;
            
            return (
              <TableRow key={member.memberId}>
                <TableCell className="font-medium">{member.memberName}</TableCell>
                
                {member.attendances.map(attendance => (
                  <TableCell key={`${member.memberId}-${attendance.weekStart}`} className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Badge variant={attendance.worship === 'O' ? "default" : "destructive"}>
                        {attendance.worship}
                      </Badge>
                      <div className="text-xs">QT: {attendance.qtCount}</div>
                    </div>
                  </TableCell>
                ))}
                
                <TableCell className="text-center">
                  <Badge variant={attendanceRate >= 75 ? "default" : attendanceRate >= 50 ? "secondary" : "destructive"}>
                    {attendanceRate.toFixed(0)}%
                  </Badge>
                </TableCell>
                
                <TableCell className="text-center">
                  {averageQt.toFixed(1)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="text-gray-500 py-8 text-center">
      <p className="mb-4">이번달 출석 데이터가 없습니다.</p>
      <Button className="w-full" onClick={onFetchData}>
        <ListFilter className="mr-2 h-4 w-4" />
        이번달 출석 데이터 조회하기
      </Button>
    </div>
  );
} 