"use client";

import { useState, useEffect } from "react";
import { AppShellLayout } from "@/components/layouts/app-shell-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeaderGbs, useGbsStatistics } from "@/hooks/use-attendance";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ko } from "date-fns/locale";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRange } from "react-day-picker";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Bar as BarPrimitive,
  BarChart as BarChartPrimitive,
  Line as LinePrimitive,
  LineChart as LineChartPrimitive
} from "recharts";
import { Separator } from "@/components/ui/separator";
import { Info, AlertCircle, TrendingUp, Users, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WeeklyStatistics } from "@/types/statistics";

export default function GbsStatisticsPage() {
  const { user } = useAuth();
  const [selectedGbsId, setSelectedGbsId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(subMonths(new Date(), 1)),
    to: endOfMonth(new Date())
  });

  // GBS 목록 가져오기
  const { data: leaderGbs, isLoading: isLoadingGbs } = useLeaderGbs();

  // 통계 날짜 범위 문자열 변환
  const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
  const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';

  // GBS 출석 통계 가져오기
  const { 
    data: gbsStats, 
    isLoading: isLoadingStats, 
    error: statsError 
  } = useGbsStatistics(selectedGbsId, startDate, endDate);

  // 첫 번째 GBS 자동 선택
  useEffect(() => {
    if (leaderGbs && !selectedGbsId) {
      setSelectedGbsId(leaderGbs.gbsId);
    }
  }, [leaderGbs, selectedGbsId]);

  // 주별 통계 차트 데이터 변환 함수
  const getWeeklyChartData = () => {
    if (!gbsStats?.weeklyStats) return [];
    
    return gbsStats.weeklyStats.map((week: WeeklyStatistics) => ({
      weekStart: format(new Date(week.weekStart), 'MM.dd', { locale: ko }),
      출석률: week.attendanceRate.toFixed(1),
      평균QT: week.averageQtCount.toFixed(1),
      totalMembers: week.totalMembers,
      attendedMembers: week.attendedMembers,
    }));
  };

  // QT 분포 차트 데이터 계산
  const getQtDistribution = () => {
    if (!gbsStats?.weeklyStats) return [];
    
    // 평균 QT 횟수 기준으로 그룹화
    const qtGroups = [
      { name: '0-1회', count: 0 },
      { name: '2-3회', count: 0 },
      { name: '4-5회', count: 0 },
      { name: '6회', count: 0 },
    ];
    
    gbsStats.weeklyStats.forEach((week: WeeklyStatistics) => {
      // QT 횟수 분포를 간단히 시뮬레이션 (실제로는 API에서 제공해야 함)
      if (week.averageQtCount < 2) qtGroups[0].count++;
      else if (week.averageQtCount < 4) qtGroups[1].count++;
      else if (week.averageQtCount < 6) qtGroups[2].count++;
      else qtGroups[3].count++;
    });
    
    return qtGroups;
  };

  if (!user) {
    return (
      <AppShellLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-600">통계를 확인하려면 로그인해주세요.</p>
        </div>
      </AppShellLayout>
    );
  }

  return (
    <AppShellLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">GBS 출석 통계</h1>
            <p className="text-gray-500 mt-1">GBS 출석 데이터의 통계와 추이를 확인할 수 있습니다.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>통계 조회 옵션</CardTitle>
              <CardDescription>GBS와 기간을 선택하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">GBS 선택</label>
                <Select
                  value={selectedGbsId?.toString() || ""}
                  onValueChange={(value) => setSelectedGbsId(parseInt(value))}
                  disabled={isLoadingGbs}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="GBS 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingGbs ? (
                      <SelectItem value="loading" disabled>로딩 중...</SelectItem>
                    ) : leaderGbs ? (
                      <SelectItem value={leaderGbs.gbsId.toString()}>{leaderGbs.gbsName}</SelectItem>
                    ) : (
                      <SelectItem value="none" disabled>GBS가 없습니다</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">기간 선택</label>
                <DatePickerWithRange 
                  dateRange={dateRange} 
                  onUpdate={setDateRange} 
                />
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 grid grid-cols-1 gap-4">
            {isLoadingStats ? (
              <Card>
                <CardContent className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </CardContent>
              </Card>
            ) : statsError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>오류</AlertTitle>
                <AlertDescription>
                  통계 데이터를 불러오는데 실패했습니다. 다시 시도해주세요.
                </AlertDescription>
              </Alert>
            ) : gbsStats ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{gbsStats.gbsName} 요약</span>
                    <span className="text-sm font-normal text-gray-500">
                      {dateRange?.from && dateRange.to ? 
                        `${format(dateRange.from, 'yyyy.MM.dd')} - ${format(dateRange.to, 'yyyy.MM.dd')}` : 
                        '날짜 미선택'}
                    </span>
                  </CardTitle>
                  <CardDescription>전체 기간의 요약 통계입니다</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4 flex flex-col">
                      <div className="flex items-center mb-2">
                        <Users className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-blue-700">총원</span>
                      </div>
                      <span className="text-2xl font-bold">{gbsStats.totalMembers}명</span>
                    </div>
                    
                    <div className="bg-green-50 rounded-xl p-4 flex flex-col">
                      <div className="flex items-center mb-2">
                        <Users className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm font-medium text-green-700">출석인원</span>
                      </div>
                      <span className="text-2xl font-bold">{gbsStats.attendedMembers}명</span>
                    </div>
                    
                    <div className="bg-purple-50 rounded-xl p-4 flex flex-col">
                      <div className="flex items-center mb-2">
                        <TrendingUp className="h-5 w-5 text-purple-500 mr-2" />
                        <span className="text-sm font-medium text-purple-700">출석률</span>
                      </div>
                      <span className="text-2xl font-bold">{gbsStats.attendanceRate.toFixed(1)}%</span>
                    </div>
                    
                    <div className="bg-amber-50 rounded-xl p-4 flex flex-col">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-5 w-5 text-amber-500 mr-2" />
                        <span className="text-sm font-medium text-amber-700">평균 QT</span>
                      </div>
                      <span className="text-2xl font-bold">{gbsStats.averageQtCount.toFixed(1)}회</span>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <Tabs defaultValue="weekly" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="weekly">주간 추이</TabsTrigger>
                      <TabsTrigger value="qt">QT 분석</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="weekly" className="space-y-4">
                      <h3 className="text-lg font-medium">주간 출석 및 QT 추이</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={getWeeklyChartData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="weekStart" />
                            <YAxis yAxisId="left" orientation="left" domain={[0, 100]} />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="출석률" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line yAxisId="right" type="monotone" dataKey="평균QT" stroke="#82ca9d" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="qt" className="space-y-4">
                      <h3 className="text-lg font-medium">QT 빈도 분포</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getQtDistribution()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" name="주 수" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-48">
                  <Info className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">GBS와 기간을 선택하여 통계를 확인하세요.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {gbsStats && (
          <Card>
            <CardHeader>
              <CardTitle>주별 출석 상세</CardTitle>
              <CardDescription>각 주차별 출석 통계입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">주차</th>
                      <th className="text-center py-3 px-4 font-medium">총원</th>
                      <th className="text-center py-3 px-4 font-medium">출석인원</th>
                      <th className="text-center py-3 px-4 font-medium">출석률</th>
                      <th className="text-center py-3 px-4 font-medium">평균 QT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gbsStats.weeklyStats.map((week: WeeklyStatistics, index: number) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {format(new Date(week.weekStart), 'yyyy.MM.dd')}
                        </td>
                        <td className="text-center py-3 px-4">{week.totalMembers}명</td>
                        <td className="text-center py-3 px-4">{week.attendedMembers}명</td>
                        <td className="text-center py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            week.attendanceRate >= 80 ? 'bg-green-100 text-green-800' :
                            week.attendanceRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {week.attendanceRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">{week.averageQtCount.toFixed(1)}회</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShellLayout>
  );
} 