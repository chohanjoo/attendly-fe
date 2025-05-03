"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AppShellLayout } from "@/components/layouts/app-shell-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck2, Calendar, Save, X, Check, AlertCircle, Users, ListFilter } from "lucide-react";
import logger from "@/lib/logger";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { format, startOfMonth, endOfMonth, eachWeekOfInterval, addDays } from "date-fns";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

// GBS 멤버 응답 타입 정의
interface GbsMemberResponse {
  id: number;
  name: string;
  email?: string;
  birthDate?: string;
  joinDate: string;
  phoneNumber?: string;
}

// GBS 멤버 목록 응답 타입 정의
interface GbsMembersListResponse {
  gbsId: number;
  gbsName: string;
  memberCount: number;
  members: GbsMemberResponse[];
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

// 이번달 출석 통계 타입 정의
interface MonthlyAttendance {
  memberId: number;
  memberName: string;
  attendances: {
    weekStart: string;
    worship: 'O' | 'X';
    qtCount: number;
    ministry: 'A' | 'B' | 'C';
  }[];
}

export default function AttendancePage() {
  const { user } = useAuth();
  const [gbsId, setGbsId] = useState<number | null>(null);
  const [weekStart, setWeekStart] = useState<string>(getWeekStart());
  const [openModal, setOpenModal] = useState(false);
  const [attendanceInputs, setAttendanceInputs] = useState<AttendanceItemRequest[]>([]);
  const [activeTab, setActiveTab] = useState("weekly");
  const [monthlyData, setMonthlyData] = useState<MonthlyAttendance[]>([]);
  const [isMonthlyLoading, setIsMonthlyLoading] = useState(false);
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

  // GBS 멤버 목록 조회
  const { data: gbsMembers, isLoading: isMembersLoading, error: membersError } = useQuery({
    queryKey: ['gbsMembers', gbsId],
    queryFn: async () => {
      const response = await api.get(`/api/v1/gbs-members/${gbsId}`);
      return response.data as GbsMembersListResponse;
    },
    enabled: !!gbsId
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
    // 기존 데이터가 있으면 그대로 사용, 없으면 GBS 멤버 데이터로 초기화
    const initialInputs = attendances && attendances.length > 0
      ? attendances.map(att => ({
          memberId: att.memberId,
          worship: att.worship,
          qtCount: att.qtCount,
          ministry: att.ministry
        }))
      : gbsMembers?.members.map(member => ({
          memberId: member.id,
          worship: 'X' as 'O' | 'X',
          qtCount: 0,
          ministry: 'A' as 'A' | 'B' | 'C'
        })) || [];
    
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

  // 이번달 주차 배열 생성
  const getCurrentMonthWeeks = () => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    
    return eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 0 } // 0: 일요일부터 시작
    ).map(date => format(date, 'yyyy-MM-dd'));
  };

  // 이번달 출석 데이터 조회
  const fetchMonthlyAttendance = async () => {
    if (!gbsId) return;
    
    setIsMonthlyLoading(true);
    try {
      const weekStarts = getCurrentMonthWeeks();
      const allAttendances: AttendanceResponse[][] = [];
      
      // 각 주차별 출석 데이터 조회
      for (const week of weekStarts) {
        try {
          const response = await api.get('/api/attendance', {
            params: { gbsId, weekStart: week }
          });
          allAttendances.push(response.data);
        } catch (error) {
          // 데이터가 없는 주차는 빈 배열로 처리
          allAttendances.push([]);
        }
      }
      
      // 조원별로 데이터 재구성
      if (allAttendances.some(week => week.length > 0)) {
        const memberIds = new Set<number>();
        const memberNames = new Map<number, string>();
        
        // 모든 멤버 ID와 이름 수집
        allAttendances.forEach(week => {
          week.forEach(attendance => {
            memberIds.add(attendance.memberId);
            memberNames.set(attendance.memberId, attendance.memberName);
          });
        });
        
        // 월간 출석 데이터 구성
        const monthly: MonthlyAttendance[] = Array.from(memberIds).map(memberId => {
          const attendances = weekStarts.map(week => {
            const weekData = allAttendances.find(
              attendances => attendances.find(a => a.weekStart === week && a.memberId === memberId)
            );
            
            const attendance = weekData?.find(a => a.memberId === memberId);
            
            return {
              weekStart: week,
              worship: attendance?.worship || 'X',
              qtCount: attendance?.qtCount || 0,
              ministry: attendance?.ministry || 'C'
            };
          });
          
          return {
            memberId,
            memberName: memberNames.get(memberId) || `멤버 ${memberId}`,
            attendances
          };
        });
        
        setMonthlyData(monthly);
      }
    } catch (error) {
      console.error("월간 출석 데이터 조회 중 오류가 발생했습니다:", error);
      toast.error("월간 출석 데이터를 불러오는데 실패했습니다.");
    } finally {
      setIsMonthlyLoading(false);
    }
  };

  // 월간 탭 클릭 시 데이터 로드
  useEffect(() => {
    if (activeTab === "monthly" && gbsId) {
      fetchMonthlyAttendance();
    }
  }, [activeTab, gbsId]);

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

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                GBS 멤버 목록
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isMembersLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : membersError ? (
                <div className="text-red-500 py-4">
                  GBS 멤버 정보를 불러오는 중 오류가 발생했습니다.
                </div>
              ) : gbsMembers && gbsMembers.members.length > 0 ? (
                <>
                  <Table>
                    <TableCaption>{gbsMembers.gbsName} 멤버 목록 (총 {gbsMembers.memberCount}명)</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>이름</TableHead>
                        <TableHead>이메일</TableHead>
                        <TableHead>생년월일</TableHead>
                        <TableHead>가입일</TableHead>
                        <TableHead>연락처</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gbsMembers.members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell>{member.email || '-'}</TableCell>
                          <TableCell>{member.birthDate ? formatDate(member.birthDate) : '-'}</TableCell>
                          <TableCell>{formatDate(member.joinDate)}</TableCell>
                          <TableCell>{member.phoneNumber || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <div className="text-gray-500 py-8 text-center">
                  <p className="mb-4">현재 GBS에 등록된 멤버가 없습니다.</p>
                </div>
              )}
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
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="weekly">주간 출석</TabsTrigger>
                  <TabsTrigger value="monthly">이번달 출석</TabsTrigger>
                </TabsList>
                
                <TabsContent value="weekly">
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
                        <Button 
                          className="w-full" 
                          onClick={handleStartAttendanceInput}
                          disabled={isMembersLoading || !gbsMembers || gbsMembers.memberCount === 0}
                        >
                          {isMembersLoading ? '멤버 정보 로딩 중...' : 
                          !gbsMembers || gbsMembers.memberCount === 0 ? 'GBS 멤버가 없습니다' : '출석 정보 수정하기'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500 py-8 text-center">
                      <p className="mb-4">현재 주간에 등록된 출석 데이터가 없습니다.</p>
                      <Button 
                        className="w-full" 
                        onClick={handleStartAttendanceInput} 
                        disabled={isMembersLoading || !gbsMembers || gbsMembers.memberCount === 0}
                      >
                        {isMembersLoading ? '멤버 정보 로딩 중...' : 
                         !gbsMembers || gbsMembers.memberCount === 0 ? 'GBS 멤버가 없습니다' : '출석 입력 시작하기'}
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="monthly">
                  {isMonthlyLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : monthlyData.length > 0 ? (
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
                  ) : (
                    <div className="text-gray-500 py-8 text-center">
                      <p className="mb-4">이번달 출석 데이터가 없습니다.</p>
                      <Button className="w-full" onClick={fetchMonthlyAttendance}>
                        <ListFilter className="mr-2 h-4 w-4" />
                        이번달 출석 데이터 조회하기
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
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
                // attendances 또는 gbsMembers에서 멤버 이름 찾기
                const memberName = attendances?.find(a => a.memberId === input.memberId)?.memberName || 
                                  gbsMembers?.members.find(m => m.id === input.memberId)?.name || 
                                  `조원 ${index + 1}`;
                
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