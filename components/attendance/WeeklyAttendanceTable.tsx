"use client";

import { AttendanceResponse } from "@/types/attendance";
import { getMinistryBadgeVariant } from "@/lib/attendance-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WeeklyAttendanceTableProps {
  isLoading: boolean;
  error: any;
  attendances: AttendanceResponse[] | undefined;
  onStartAttendanceInput: () => void;
  hasMembersToShow: boolean;
}

export default function WeeklyAttendanceTable({
  isLoading,
  error,
  attendances,
  onStartAttendanceInput,
  hasMembersToShow,
}: WeeklyAttendanceTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 py-4">
        출석 데이터를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  if (attendances && attendances.length > 0) {
    return (
      <>
        <Table>
          <TableCaption>주간 GBS 출석 현황</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>대예배</TableHead>
              <TableHead>QT 횟수</TableHead>
              <TableHead>대학부</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendances.map((attendance) => (
              <TableRow key={attendance.id}>
                <TableCell className="font-medium">{attendance.memberName}</TableCell>
                <TableCell>
                  <Badge variant={attendance.worship === 'O' ? "default" : "destructive"}>
                    {attendance.worship}
                  </Badge>
                </TableCell>
                <TableCell>{attendance.qtCount}/6</TableCell>
                <TableCell>
                  <Badge variant={getMinistryBadgeVariant(attendance.ministry)}>
                    {attendance.ministry}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4">
          <Button 
            className="w-full" 
            onClick={onStartAttendanceInput}
            disabled={!hasMembersToShow}
          >
            {!hasMembersToShow ? 'GBS 멤버가 없습니다' : '출석 정보 수정하기'}
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="text-gray-500 py-8 text-center">
      <p className="mb-4">현재 주간에 등록된 출석 데이터가 없습니다.</p>
      <Button 
        className="w-full" 
        onClick={onStartAttendanceInput} 
        disabled={!hasMembersToShow}
      >
        {!hasMembersToShow ? 'GBS 멤버가 없습니다' : '출석 입력 시작하기'}
      </Button>
    </div>
  );
} 