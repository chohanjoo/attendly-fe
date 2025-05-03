"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AppShellLayout } from "@/components/layouts/app-shell-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck2, Calendar } from "lucide-react";
import logger from "@/lib/logger";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// 출석 데이터 타입 정의
interface AttendanceResponse {
  id: number;
  memberId: number;
  memberName: string;
  weekStart: string;
  worship: 'O' | 'X';
  qtCount: number;
  ministry: 'A' | 'B' | 'C';
}

// 주간 시작일을 계산하는 함수 (일요일 기준)
function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
  const diff = now.getDate() - dayOfWeek;
  const sunday = new Date(now.setDate(diff));
  return format(sunday, 'yyyy-MM-dd');
}

// ministryGrade에 따른 색상 반환 함수
function getMinistryBadgeVariant(grade: string) {
  switch (grade) {
    case 'A': return "default";
    case 'B': return "secondary";
    case 'C': return "destructive";
    default: return "outline";
  }
}

export default function AttendancePage() {
  const { user } = useAuth();
  const [gbsId, setGbsId] = useState<number>(1); // 기본 GBS ID
  const [weekStart, setWeekStart] = useState<string>(getWeekStart());
  
  // 출석 페이지 접근 로깅
  useEffect(() => {
    if (user) {
      logger.info(`[출석페이지] ${user.name}님이 출석 페이지에 접속했습니다. 역할: ${user.role}`);
    }
  }, [user]);

  // GBS 출석 데이터 조회
  const { data: attendances, isLoading, error } = useQuery({
    queryKey: ['attendance', gbsId, weekStart],
    queryFn: async () => {
      const response = await api.get('/api/attendance', {
        params: {
          gbsId,
          weekStart
        }
      });
      return response.data as AttendanceResponse[];
    }
  });

  // 날짜 형식 포맷 함수
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy년 MM월 dd일', { locale: ko });
  };

  return (
    <AuthLayout>
      <AppShellLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">출석 입력</h1>
            <p className="text-gray-500 mt-1">GBS 모임 참석자의 출석 상태를 기록하세요.</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-500" />
                주간 선택
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <p className="text-sm">현재 선택된 주간: {formatDate(weekStart)}</p>
                {/* 여기에 주간 선택 컴포넌트를 추가할 수 있습니다 */}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarCheck2 className="h-5 w-5 text-indigo-500" />
                GBS 출석 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : error ? (
                <div className="text-red-500 py-4">
                  출석 데이터를 불러오는 중 오류가 발생했습니다.
                </div>
              ) : attendances && attendances.length > 0 ? (
                <Table>
                  <TableCaption>주간 GBS 출석 현황</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>예배 출석</TableHead>
                      <TableHead>QT 횟수</TableHead>
                      <TableHead>대학부 등급</TableHead>
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
              ) : (
                <div className="text-gray-500 py-8 text-center">
                  <p className="mb-4">현재 주간에 등록된 출석 데이터가 없습니다.</p>
                  <Button className="w-full">
                    출석 입력 시작하기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppShellLayout>
    </AuthLayout>
  );
} 