"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useVillage } from "@/hooks/useVillage";
import { AppShellLayout } from "@/components/layouts/app-shell-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import DateRangePicker from "@/components/DateRangePicker";
import VillageStatsChart from "@/components/statistics/VillageStatsChart";
import VillageAttendanceTable from "@/components/statistics/VillageAttendanceTable";
import { getOneMonthAgo, getTodayFormatted } from "@/hooks/use-statistics";
import { useUserVillage, useVillageStatistics, useVillageAttendance } from "@/hooks/use-statistics";
import { VillageStatistics, VillageAttendanceResponse } from "@/types/statistics";
import { UserVillageResponse } from "@/types/user";
import { 
  BarChart, 
  Users, 
  Calendar, 
  FileDown, 
  Loader2, 
  ArrowLeft, 
  Edit, 
  Trello
} from "lucide-react";
import { getCurrentWeekStart } from "@/lib/attendance-utils";

export default function VillagePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // 상태 관리
  const [activeTab, setActiveTab] = useState<"stats" | "attendance" | "detail">("stats");
  const [villageId, setVillageId] = useState<number | null>(null);
  const [selectedVillageId, setSelectedVillageId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>(getOneMonthAgo());
  const [endDate, setEndDate] = useState<string>(getTodayFormatted());
  const [weekStart, setWeekStart] = useState<string>(getCurrentWeekStart());
  
  // 데이터 로딩 훅 사용
  const { data: villageInfo, isLoading: isLoadingVillage } = useUserVillage();
  const { data: villageStats, isLoading: isLoadingStats } = useVillageStatistics(
    villageId,
    startDate,
    endDate
  );
  const { data: villageAttendance, isLoading: isLoadingAttendance } = useVillageAttendance(
    villageId,
    weekStart
  );
  
  // 선택된 마을 상세 정보 가져오기
  const { village, isLoading: isLoadingVillageDetail } = useVillage(selectedVillageId || 0);
  
  // 마을장 권한 체크 및 마을 정보 가져오기
  useEffect(() => {
    if (!user) return;
    
    if (user.role !== "VILLAGE_LEADER" && user.role !== "MINISTER" && user.role !== "ADMIN") {
      router.push("/");
      return;
    }
    
    if (villageInfo) {
      setVillageId(villageInfo.villageId);
    }
  }, [user, router, villageInfo]);
  
  // URL 파라미터에서 마을 ID 확인
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      const villageIdNum = parseInt(id);
      setSelectedVillageId(villageIdNum);
      setActiveTab('detail');
    }
  }, []);
  
  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };
  
  // 주차 선택 핸들러
  const handleWeekChange = (week: string) => {
    setWeekStart(week);
  };
  
  // 주차 옵션 생성 (지난 8주)
  const weekOptions = useMemo(() => {
    const weeks = [];
    const currentDate = new Date();
    
    // 일요일로 조정
    const currentDay = currentDate.getDay(); // 0: 일요일, 1: 월요일, ...
    const diff = currentDay === 0 ? 0 : -currentDay;
    const currentSunday = new Date(currentDate);
    currentSunday.setDate(currentDate.getDate() + diff);
    
    // 최근 8주차 생성
    for (let i = 0; i < 8; i++) {
      const date = new Date(currentSunday);
      date.setDate(date.getDate() - (i * 7));
      
      const formattedDate = date.toISOString().split('T')[0];
      const displayDate = `${date.getMonth() + 1}월 ${date.getDate()}일`;
      
      weeks.push({ value: formattedDate, label: displayDate });
    }
    
    return weeks;
  }, []);
  
  // 마을 선택 핸들러
  const handleSelectVillage = (id: number) => {
    setSelectedVillageId(id);
    setActiveTab('detail');
    
    // URL 파라미터 업데이트
    const url = new URL(window.location.href);
    url.searchParams.set('id', id.toString());
    window.history.pushState({}, '', url.toString());
  };
  
  // 마을 목록으로 돌아가기
  const handleBackToVillages = () => {
    setSelectedVillageId(null);
    setActiveTab('stats');
    
    // URL 파라미터 제거
    const url = new URL(window.location.href);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url.toString());
  };
  
  // 로딩 중이면 로딩 인디케이터 표시
  if (authLoading || isLoadingVillage) {
    return (
      <AppShellLayout>
        <div className="flex items-center justify-center h-80">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </AppShellLayout>
    );
  }
  
  // 마을 상세 정보 화면 렌더링
  if (selectedVillageId && village) {
    return (
      <AppShellLayout>
        <div className="container mx-auto py-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToVillages}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{village.villageName}</h1>
                <p className="text-gray-500">
                  {village.departmentName} {village.isVillageLeader ? '| 마을장 권한' : ''}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => router.push(`/village/attendance?id=${village.villageId}`)}
              >
                <Calendar className="h-4 w-4" /> 출석 현황
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => router.push(`/village/statistics?id=${village.villageId}`)}
              >
                <BarChart className="h-4 w-4" /> 통계
              </Button>
              
              <Button
                className="flex items-center gap-2"
                onClick={() => router.push(`/village/${village.villageId}/gbs-assignment`)}
              >
                <Trello className="h-4 w-4" /> GBS 배치
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>마을 정보</CardTitle>
                <CardDescription>마을의 기본 정보입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-gray-500">마을명</span>
                    <span className="font-medium">{village.villageName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-gray-500">부서</span>
                    <span className="font-medium">{village.departmentName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-gray-500">권한</span>
                    <span className="font-medium">
                      {village.isVillageLeader ? '마을장' : '조회자'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GBS 관리</CardTitle>
                <CardDescription>
                  GBS 그룹 관리 및 조편성 작업을 수행할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm">
                  6개월마다 재편성되는 GBS 그룹을 칸반 보드를 통해 손쉽게 관리하세요.
                  드래그 앤 드롭으로 조원을 배치하고, 리더에게 할당할 수 있습니다.
                </p>
                <Button 
                  className="flex items-center gap-2 w-full"
                  onClick={() => router.push(`/village/${village.villageId}/gbs-assignment`)}
                >
                  <Trello className="h-4 w-4" /> GBS 배치 바로가기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppShellLayout>
    );
  }
  
  // 마을 목록 화면 렌더링
  return (
    <AppShellLayout>
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">마을 관리</h1>
            <p className="text-gray-500 mt-1">
              {villageInfo?.villageName || villageStats?.villageName || "마을"} 출석 현황 및 통계
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {activeTab === "stats" ? (
              <DateRangePicker onDateRangeChange={handleDateRangeChange} />
            ) : (
              <div className="flex">
                <select
                  className="border rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={weekStart}
                  onChange={(e) => handleWeekChange(e.target.value)}
                >
                  {weekOptions.map((week) => (
                    <option key={week.value} value={week.value}>
                      {week.label} 시작
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <Button variant="outline" className="gap-2">
              <FileDown className="h-4 w-4" />
              <span>내보내기</span>
            </Button>
          </div>
        </div>
        
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "stats" | "attendance" | "detail")}
          className="w-full"
        >
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="stats" className="gap-2">
              <BarChart className="h-4 w-4" />
              <span>통계</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span>출석 현황</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats" className="mt-0">
            {isLoadingStats ? (
              <div className="flex items-center justify-center h-80">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                  <StatCard 
                    title="총원" 
                    value={`${villageStats?.totalMembers || 0}명`} 
                    icon={<Users className="h-5 w-5 text-indigo-500" />} 
                  />
                  <StatCard 
                    title="출석 인원" 
                    value={`${villageStats?.attendedMembers || 0}명`} 
                    icon={<Users className="h-5 w-5 text-green-500" />} 
                  />
                  <StatCard 
                    title="출석률" 
                    value={`${villageStats?.attendanceRate?.toFixed(1) || 0}%`} 
                    icon={<BarChart className="h-5 w-5 text-amber-500" />} 
                  />
                  <StatCard 
                    title="평균 QT" 
                    value={`${villageStats?.averageQtCount?.toFixed(1) || 0}회`} 
                    icon={<Calendar className="h-5 w-5 text-blue-500" />} 
                  />
                </div>
                
                <div className="mb-6">
                  <VillageStatsChart 
                    data={villageStats?.gbsStats || []} 
                    title="GBS별 통계" 
                  />
                </div>
                
                {/* 마을 목록 추가 */}
                {villageInfo && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>내 마을 목록</CardTitle>
                      <CardDescription>관리 권한이 있는 마을 목록입니다</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>마을명</TableHead>
                              <TableHead>부서</TableHead>
                              <TableHead>권한</TableHead>
                              <TableHead className="text-right">관리</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Array.isArray(villageInfo) ? (
                              villageInfo.map((village: UserVillageResponse) => (
                                <TableRow key={village.villageId}>
                                  <TableCell className="font-medium">{village.villageName}</TableCell>
                                  <TableCell>{village.departmentName}</TableCell>
                                  <TableCell>{village.isVillageLeader ? '마을장' : '조회자'}</TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleSelectVillage(village.villageId)}
                                    >
                                      상세보기
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : villageInfo ? (
                              <TableRow>
                                <TableCell className="font-medium">{villageInfo.villageName}</TableCell>
                                <TableCell>{villageInfo.departmentName}</TableCell>
                                <TableCell>{villageInfo.isVillageLeader ? '마을장' : '조회자'}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSelectVillage(villageInfo.villageId)}
                                  >
                                    상세보기
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ) : null}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="attendance" className="mt-0">
            {isLoadingAttendance ? (
              <div className="flex items-center justify-center h-80">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="mb-6">
                {villageAttendance && (
                  <VillageAttendanceTable 
                    data={villageAttendance}
                  />
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShellLayout>
  );
}

// 통계 카드 컴포넌트
const StatCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
  <Card>
    <CardContent className="p-4 flex justify-between items-center">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className="p-2 bg-gray-100 rounded-full">
        {icon}
      </div>
    </CardContent>
  </Card>
); 