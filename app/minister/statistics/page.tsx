"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, subDays } from "date-fns";
import { ko } from "date-fns/locale";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRange } from "react-day-picker";
import {
  BarChart as LucideBarChart,
  PieChart as LucidePieChart,
  Download,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// 기본 통계 타입
interface StatisticsSummary {
  totalMembers: number;
  attendedMembers: number;
  attendanceRate: number;
  averageQtCount: number;
}

// 부서 통계 타입
interface DepartmentStatistics extends StatisticsSummary {
  departmentId: number;
  departmentName: string;
}

// 마을 통계 타입
interface VillageStatistics extends StatisticsSummary {
  villageId: number;
  villageName: string;
}

// 주간 통계 타입
interface WeeklyStatistics {
  weekStart: string;
  totalMembers: number;
  attendedMembers: number;
  attendanceRate: number;
}

export default function MinisterStatistics() {
  const router = useRouter();
  
  // 날짜 범위 상태 (기본값: 지난 4주)
  const [date, setDate] = useState<DateRange>({
    from: subDays(new Date(), 28),
    to: new Date(),
  });

  const [isLoading, setIsLoading] = useState(true);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStatistics | null>(null);
  const [villageStats, setVillageStats] = useState<VillageStatistics[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStatistics[]>([]);

  useEffect(() => {
    const fetchStatistics = async () => {
      setIsLoading(true);
      
      try {
        // 실제 API 연동 시 아래 코드로 대체
        // const response = await fetch(`/api/departments/1/report?startDate=${format(date.from!, 'yyyy-MM-dd')}&endDate=${format(date.to || date.from!, 'yyyy-MM-dd')}`);
        // const data = await response.json();
        // setDepartmentStats(data.department);
        // setVillageStats(data.villages);
        // setWeeklyStats(data.weeklyStats);

        // 목업 데이터
        const mockDepartmentStats: DepartmentStatistics = {
          departmentId: 1,
          departmentName: "대학부",
          totalMembers: 120,
          attendedMembers: 98,
          attendanceRate: 81.7,
          averageQtCount: 4.2,
        };

        const mockVillageStats: VillageStatistics[] = [
          {
            villageId: 1,
            villageName: "동문 마을",
            totalMembers: 24,
            attendedMembers: 22,
            attendanceRate: 91.7,
            averageQtCount: 4.8,
          },
          {
            villageId: 2,
            villageName: "서문 마을",
            totalMembers: 18,
            attendedMembers: 15,
            attendanceRate: 83.3,
            averageQtCount: 4.2,
          },
          {
            villageId: 3,
            villageName: "남문 마을",
            totalMembers: 21,
            attendedMembers: 16,
            attendanceRate: 76.2,
            averageQtCount: 3.9,
          },
          {
            villageId: 4,
            villageName: "북문 마을",
            totalMembers: 19,
            attendedMembers: 14,
            attendanceRate: 73.7,
            averageQtCount: 3.5,
          },
          {
            villageId: 5,
            villageName: "중앙 마을",
            totalMembers: 22,
            attendedMembers: 17,
            attendanceRate: 77.3,
            averageQtCount: 4.0,
          },
          {
            villageId: 6,
            villageName: "신입생 마을",
            totalMembers: 16,
            attendedMembers: 14,
            attendanceRate: 87.5,
            averageQtCount: 4.6,
          },
        ];

        const mockWeeklyStats: WeeklyStatistics[] = [
          {
            weekStart: "2023-09-03",
            totalMembers: 120,
            attendedMembers: 95,
            attendanceRate: 79.2,
          },
          {
            weekStart: "2023-09-10",
            totalMembers: 120,
            attendedMembers: 102,
            attendanceRate: 85.0,
          },
          {
            weekStart: "2023-09-17",
            totalMembers: 120,
            attendedMembers: 92,
            attendanceRate: 76.7,
          },
          {
            weekStart: "2023-09-24",
            totalMembers: 120,
            attendedMembers: 98,
            attendanceRate: 81.7,
          },
        ];

        setDepartmentStats(mockDepartmentStats);
        setVillageStats(mockVillageStats);
        setWeeklyStats(mockWeeklyStats);
      } catch (error) {
        console.error("통계 데이터 조회 실패:", error);
        toast.error("통계 데이터를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (date.from) {
      fetchStatistics();
    }
  }, [date]);

  // 엑셀 다운로드 핸들러 (목업)
  const handleExcelDownload = () => {
    toast.success("통계 데이터가 다운로드 되었습니다.");
  };

  // 마을별 출석률을 기준으로 정렬
  const sortedVillageStats = [...villageStats].sort(
    (a, b) => b.attendanceRate - a.attendanceRate
  );

  if (isLoading && !departmentStats) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">출석 통계</h1>
          <p className="text-gray-500">
            {departmentStats?.departmentName} 전체 출석 통계를 확인합니다.
          </p>
        </div>
        <DatePickerWithRange dateRange={date} onUpdate={setDate} />
      </div>

      {/* 통계 요약 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">전체 인원</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departmentStats?.totalMembers}명
            </div>
            <p className="text-xs text-gray-500">등록 인원</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">출석 인원</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departmentStats?.attendedMembers}명
            </div>
            <p className="text-xs text-gray-500">평균 출석 인원</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">출석률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departmentStats?.attendanceRate}%
            </div>
            <p className="text-xs text-gray-500">평균 출석률</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">QT 횟수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departmentStats?.averageQtCount}회
            </div>
            <p className="text-xs text-gray-500">평균 QT 횟수</p>
          </CardContent>
        </Card>
      </div>

      {/* 통계 상세 */}
      <Tabs defaultValue="weekly" className="w-full">
        <div className="flex justify-between items-center">
          <TabsList className="w-[400px]">
            <TabsTrigger value="weekly">주간 통계</TabsTrigger>
            <TabsTrigger value="villages">마을별 통계</TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleExcelDownload}
          >
            <Download className="h-4 w-4" /> 엑셀 다운로드
          </Button>
        </div>

        <TabsContent value="weekly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>주간 출석 통계</CardTitle>
              <CardDescription>
                주차별 출석률 변화 추이를 보여줍니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyStats.length > 0 ? (
                <div className="space-y-8">
                  {/* 차트 영역 (실제 프로젝트에서는 차트 라이브러리 사용) */}
                  <div className="h-[300px] w-full bg-slate-50 rounded-md flex items-center justify-center">
                    <LucideBarChart className="h-16 w-16 text-slate-300" />
                    <span className="ml-2 text-slate-400">주간 출석률 차트</span>
                  </div>

                  {/* 주간 통계 표 */}
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3">
                            주차
                          </th>
                          <th scope="col" className="px-6 py-3">
                            전체 인원
                          </th>
                          <th scope="col" className="px-6 py-3">
                            출석 인원
                          </th>
                          <th scope="col" className="px-6 py-3">
                            출석률
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {weeklyStats.map((week) => (
                          <tr
                            key={week.weekStart}
                            className="bg-white border-b hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 font-medium">
                              {format(new Date(week.weekStart), "yyyy년 M월 d일", {
                                locale: ko,
                              })}
                            </td>
                            <td className="px-6 py-4">{week.totalMembers}명</td>
                            <td className="px-6 py-4">{week.attendedMembers}명</td>
                            <td className="px-6 py-4 font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-500 rounded-full"
                                    style={{ width: `${week.attendanceRate}%` }}
                                  />
                                </div>
                                <span>{week.attendanceRate}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-gray-500">선택한 기간의 통계 데이터가 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="villages" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>마을별 출석 통계</CardTitle>
              <CardDescription>
                마을별 출석률과 QT 현황을 비교합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedVillageStats.length > 0 ? (
                <div className="space-y-8">
                  {/* 차트 영역 (실제 프로젝트에서는 차트 라이브러리 사용) */}
                  <div className="h-[300px] w-full bg-slate-50 rounded-md flex items-center justify-center">
                    <LucidePieChart className="h-16 w-16 text-slate-300" />
                    <span className="ml-2 text-slate-400">마을별 출석률 차트</span>
                  </div>

                  {/* 마을별 통계 표 */}
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3">
                            마을명
                          </th>
                          <th scope="col" className="px-6 py-3">
                            전체 인원
                          </th>
                          <th scope="col" className="px-6 py-3">
                            출석 인원
                          </th>
                          <th scope="col" className="px-6 py-3">
                            출석률
                          </th>
                          <th scope="col" className="px-6 py-3">
                            평균 QT
                          </th>
                          <th scope="col" className="px-6 py-3">
                            상세
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedVillageStats.map((village) => (
                          <tr
                            key={village.villageId}
                            className="bg-white border-b hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 font-medium">
                              {village.villageName}
                            </td>
                            <td className="px-6 py-4">{village.totalMembers}명</td>
                            <td className="px-6 py-4">{village.attendedMembers}명</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-500 rounded-full"
                                    style={{ width: `${village.attendanceRate}%` }}
                                  />
                                </div>
                                <span className="font-medium">
                                  {village.attendanceRate}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">{village.averageQtCount}회</td>
                            <td className="px-6 py-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="flex items-center gap-1"
                              >
                                <Link
                                  href={`/minister/statistics/village/${village.villageId}`}
                                >
                                  상세 <ChevronRight className="h-3 w-3" />
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-gray-500">선택한 기간의 마을별 통계가 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 