"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AppShellLayout } from "@/components/layouts/app-shell-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck2, Calendar, Save, X, Check, AlertCircle } from "lucide-react";
import logger from "@/lib/logger";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

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

// 출석 입력 타입 정의
interface AttendanceItemRequest {
  memberId: number;
  worship: 'O' | 'X';
  qtCount: number;
  ministry: 'A' | 'B' | 'C';
}

interface AttendanceBatchRequest {
  gbsId: number;
  weekStart: string;
  attendances: AttendanceItemRequest[];
}

// 리더 GBS 응답 타입 정의
interface LeaderGbsResponse {
  gbsId: number;
  gbsName: string;
  villageId: number;
  villageName: string;
  leaderId: number;
  leaderName: string;
  startDate: string;
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
  const [gbsId, setGbsId] = useState<number | null>(null);
  const [weekStart, setWeekStart] = useState<string>(getWeekStart());
  const [openModal, setOpenModal] = useState(false);
  const [attendanceInputs, setAttendanceInputs] = useState<AttendanceItemRequest[]>([]);
  const queryClient = useQueryClient();
  
  // 출석 페이지 접근 로깅
  useEffect(() => {
    if (user) {
      logger.info(`[출석페이지] ${user.name}님이 출석 페이지에 접속했습니다. 역할: ${user.role}`);
    }
  }, [user]);

  // 리더의 GBS 정보 조회
  const { data: leaderGbs } = useQuery({
    queryKey: ['leaderGbs'],
    queryFn: async () => {
      const response = await api.get('/api/v1/gbs-members/my-gbs');
      return response.data as LeaderGbsResponse;
    },
    enabled: !!user
  });

  // gbsId 설정
  useEffect(() => {
    if (leaderGbs) {
      setGbsId(leaderGbs.gbsId);
    }
  }, [leaderGbs]);

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
    },
    enabled: !!gbsId
  });

  // 출석 입력 변경 핸들러
  const handleInputChange = (index: number, field: keyof AttendanceItemRequest, value: any) => {
    const newInputs = [...attendanceInputs];
    newInputs[index] = { ...newInputs[index], [field]: value };
    setAttendanceInputs(newInputs);
  };

  // 출석 데이터 저장 뮤테이션
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: AttendanceBatchRequest) => {
      try {
        const response = await api.post('/api/attendance', data);
        return response.data;
      } catch (error: any) {
        // 더 자세한 오류 정보를 콘솔에 기록
        console.error('출석 저장 오류 상세 정보:', {
          statusCode: error.response?.status,
          message: error.response?.data?.message || error.message,
          errorData: error.response?.data
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', gbsId, weekStart] });
      setOpenModal(false);
      toast.success("출석 데이터가 성공적으로 저장되었습니다.");
    },
    onError: (error: any) => {
      console.error("출석 데이터 저장 중 오류가 발생했습니다:", error);
      
      // 오류 코드에 따른 메시지 표시
      if (error.response?.status === 403) {
        toast.error("권한이 없습니다. 리더 권한이 필요한 기능입니다.");
      } else if (error.response?.status === 401) {
        toast.error("로그인이 필요합니다. 로그인 후 다시 시도해주세요.");
        // 로그인 페이지로 리다이렉트할 수도 있음
      } else {
        toast.error(error.response?.data?.message || "출석 데이터 저장에 실패했습니다.");
      }
    }
  });

  // 예배 출석 상태를 토글하는 함수
  const toggleWorship = (index: number) => {
    const newInputs = [...attendanceInputs];
    newInputs[index].worship = newInputs[index].worship === 'O' ? 'X' : 'O';
    setAttendanceInputs(newInputs);
  };

  // 출석 입력 시작하기
  const handleStartAttendanceInput = () => {
    // 기존 데이터가 있으면 그대로 사용, 없으면 빈 템플릿 생성
    const initialInputs = attendances && attendances.length > 0
      ? attendances.map(att => ({
          memberId: att.memberId,
          worship: att.worship,
          qtCount: att.qtCount,
          ministry: att.ministry
        }))
      : [
          // 실제 환경에서는 API로부터 GBS 멤버 목록을 가져와야 함
          { memberId: 1, worship: 'O' as 'O', qtCount: 0, ministry: 'A' as 'A' },
          { memberId: 2, worship: 'O' as 'O', qtCount: 0, ministry: 'A' as 'A' },
          { memberId: 3, worship: 'O' as 'O', qtCount: 0, ministry: 'A' as 'A' }
        ];
    
    setAttendanceInputs(initialInputs);
    setOpenModal(true);
  };

  // 출석 데이터 저장
  const handleSaveAttendance = () => {
    if (!gbsId) {
      toast.error("GBS 정보가 없습니다.");
      return;
    }
    
    const attendanceData: AttendanceBatchRequest = {
      gbsId,
      weekStart,
      attendances: attendanceInputs
    };
    
    mutate(attendanceData);
  };

  // 날짜 형식 포맷 함수
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy년 MM월 dd일', { locale: ko });
  };

  return (
    <AuthLayout>
      <AppShellLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
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
                <>
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
                  <div className="mt-4">
                    <Button className="w-full" onClick={handleStartAttendanceInput}>
                      출석 정보 수정하기
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 py-8 text-center">
                  <p className="mb-4">현재 주간에 등록된 출석 데이터가 없습니다.</p>
                  <Button className="w-full" onClick={handleStartAttendanceInput}>
                    출석 입력 시작하기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 출석 입력 모달 */}
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>GBS 출석 입력</DialogTitle>
              <DialogDescription>
                {formatDate(weekStart)} 주간의 GBS 출석 정보를 입력하세요.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {attendanceInputs.map((input, index) => {
                // 실제 환경에서는 attendances에서 멤버 이름을 가져와야 함
                const memberName = attendances?.find(a => a.memberId === input.memberId)?.memberName || `조원 ${index + 1}`;
                
                return (
                  <div key={index} className="grid grid-cols-12 gap-4 items-center border-b pb-4">
                    <div className="col-span-3">
                      <Label>이름</Label>
                      <p className="font-medium mt-1">{memberName}</p>
                    </div>
                    
                    <div className="col-span-3">
                      <Label htmlFor={`worship-${index}`}>예배 출석</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Switch
                          id={`worship-${index}`}
                          checked={input.worship === 'O'}
                          onCheckedChange={() => toggleWorship(index)}
                        />
                        <Badge variant={input.worship === 'O' ? "default" : "destructive"}>
                          {input.worship}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="col-span-3">
                      <Label htmlFor={`qt-${index}`}>QT 횟수</Label>
                      <Input
                        id={`qt-${index}`}
                        type="number"
                        min={0}
                        max={6}
                        value={input.qtCount}
                        onChange={(e) => handleInputChange(index, 'qtCount', parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="col-span-3">
                      <Label htmlFor={`ministry-${index}`}>대학부 등급</Label>
                      <Select
                        value={input.ministry}
                        onValueChange={(value) => handleInputChange(index, 'ministry', value as 'A' | 'B' | 'C')}
                      >
                        <SelectTrigger id={`ministry-${index}`} className="mt-1">
                          <SelectValue placeholder="등급 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}

              {attendanceInputs.length === 0 && (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  <p>조원 정보를 불러올 수 없습니다.</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenModal(false)}>
                <X className="mr-2 h-4 w-4" />
                취소
              </Button>
              <Button 
                onClick={handleSaveAttendance} 
                disabled={isPending || attendanceInputs.length === 0}
              >
                {isPending ? (
                  <>저장 중...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    저장하기
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AppShellLayout>
    </AuthLayout>
  );
} 