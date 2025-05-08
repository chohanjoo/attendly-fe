"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { AppShellLayout } from "@/components/layouts/app-shell-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import DateRangePicker from "@/components/DateRangePicker";
import VillageStatsChart from "@/components/statistics/VillageStatsChart";
import VillageAttendanceTable from "@/components/statistics/VillageAttendanceTable";
import { fetchVillageStatistics, fetchVillageAttendance, fetchUserVillage, getOneMonthAgo, getTodayFormatted } from "@/services/statistics-service";
import { VillageStatistics, VillageAttendanceResponse } from "@/types/statistics";
import { UserVillageResponse } from "@/types/user";
import { BarChart, Users, Calendar, FileDown, Loader2 } from "lucide-react";
import { getCurrentWeekStart } from "@/lib/attendance-utils";

export default function VillagePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // 상태 관리
  const [activeTab, setActiveTab] = useState<"stats" | "attendance">("stats");
  const [villageId, setVillageId] = useState<number | null>(null);
  const [villageInfo, setVillageInfo] = useState<UserVillageResponse | null>(null);
  const [startDate, setStartDate] = useState<string>(getOneMonthAgo());
  const [endDate, setEndDate] = useState<string>(getTodayFormatted());
  const [weekStart, setWeekStart] = useState<string>(getCurrentWeekStart());
  const [isLoadingVillage, setIsLoadingVillage] = useState<boolean>(false);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState<boolean>(false);
  const [villageStats, setVillageStats] = useState<VillageStatistics | null>(null);
  const [villageAttendance, setVillageAttendance] = useState<VillageAttendanceResponse | null>(null);
  
  // 마을장 권한 체크 및 마을 정보 가져오기
  useEffect(() => {
    const loadUserVillage = async () => {
      if (!user) return;
      
      if (user.role !== "VILLAGE_LEADER" && user.role !== "MINISTER" && user.role !== "ADMIN") {
        router.push("/");
        return;
      }
      
      try {
        setIsLoadingVillage(true);
        const villageData = await fetchUserVillage();
        if (villageData) {
          setVillageInfo(villageData);
          setVillageId(villageData.villageId);
        }
      } catch (error) {
        console.error("마을 정보 로드 실패:", error);
      } finally {
        setIsLoadingVillage(false);
      }
    };
    
    if (!authLoading) {
      loadUserVillage();
    }
  }, [authLoading, user, router]);
  
  // 통계 데이터 로드
  useEffect(() => {
    const loadVillageStats = async () => {
      if (!villageId) return;
      
      setIsLoadingStats(true);
      const data = await fetchVillageStatistics(villageId, startDate, endDate);
      setVillageStats(data);
      setIsLoadingStats(false);
    };
    
    loadVillageStats();
  }, [villageId, startDate, endDate]);
  
  // 출석 현황 데이터 로드
  useEffect(() => {
    const loadVillageAttendance = async () => {
      if (!villageId) return;
      
      setIsLoadingAttendance(true);
      const data = await fetchVillageAttendance(villageId, weekStart);
      setVillageAttendance(data);
      setIsLoadingAttendance(false);
    };
    
    loadVillageAttendance();
  }, [villageId, weekStart]);
  
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
          onValueChange={(value) => setActiveTab(value as "stats" | "attendance")}
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
                    value={`${villageStats?.attendanceRate.toFixed(1) || 0}%`} 
                    icon={<BarChart className="h-5 w-5 text-amber-500" />} 
                  />
                  <StatCard 
                    title="평균 QT" 
                    value={`${villageStats?.averageQtCount.toFixed(1) || 0}회`} 
                    icon={<Calendar className="h-5 w-5 text-blue-500" />} 
                  />
                </div>
                
                <div className="mb-6">
                  <VillageStatsChart 
                    data={villageStats?.gbsStats || []} 
                    title="GBS별 통계" 
                  />
                </div>
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
                <VillageAttendanceTable data={villageAttendance} />
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