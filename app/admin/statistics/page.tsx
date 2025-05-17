"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { 
  AreaChart, 
  BarChart,
  Bar, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { 
  Download,
  LineChart,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDepartmentStatistics, downloadDepartmentStatisticsExcel } from "@/hooks/use-statistics"
import { useDepartments } from "@/hooks/use-departments"
import { DepartmentStatistics } from "@/types/statistics"

// 임시 데이터
const attendanceData = [
  { month: "1월", 출석률: 79, 결석률: 21 },
  { month: "2월", 출석률: 80, 결석률: 20 },
  { month: "3월", 출석률: 81, 결석률: 19 },
  { month: "4월", 출석률: 78, 결석률: 22 },
  { month: "5월", 출석률: 82, 결석률: 18 },
  { month: "6월", 출석률: 84, 결석률: 16 },
  { month: "7월", 출석률: 83, 결석률: 17 },
  { month: "8월", 출석률: 85, 결석률: 15 },
  { month: "9월", 출석률: 86, 결석률: 14 },
  { month: "10월", 출석률: 87, 결석률: 13 },
  { month: "11월", 출석률: 88, 결석률: 12 },
  { month: "12월", 출석률: 85, 결석률: 15 },
]

const villageData = [
  { name: "마을 1", count: 120 },
  { name: "마을 2", count: 98 },
  { name: "마을 3", count: 86 },
  { name: "마을 4", count: 65 },
  { name: "마을 5", count: 72 },
  { name: "마을 6", count: 54 },
]

const statusDistribution = [
  { name: "출석", value: 72, color: "#4ade80" },
  { name: "결석", value: 18, color: "#f87171" },
  { name: "지각", value: 6, color: "#facc15" },
  { name: "사유", value: 4, color: "#60a5fa" },
]

const COLORS = ["#4ade80", "#f87171", "#facc15", "#60a5fa"]

export default function StatisticsPage() {
  // 오늘 날짜를 기준으로 지난 30일간의 데이터를 기본으로 설정
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: thirtyDaysAgo,
    to: today
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 부서 목록 조회
  const { data: departmentsData, isLoading: isDepartmentsLoading } = useDepartments();

  // 부서가 로드되면 첫 번째 부서를 기본 선택
  if (departmentsData?.items && departmentsData.items.length > 0 && departmentId === null) {
    setDepartmentId(departmentsData.items[0].id);
  }

  // 훅을 사용하여 데이터 로딩
  const { data: statisticsData, isLoading, error: fetchError } = useDepartmentStatistics(
    departmentId || 0,
    dateRange
  );

  // 에러 처리
  if (fetchError && !error) {
    const errorMessage = fetchError instanceof Error ? fetchError.message : "데이터를 불러오는데 실패했습니다";
    setError(errorMessage);
  }

  const renderPieChart = () => {
    if (!statisticsData) return null;

    const statusData = [
      { name: "출석", value: statisticsData.attendedMembers, color: "#4ade80" },
      { name: "결석", value: statisticsData.totalMembers - statisticsData.attendedMembers, color: "#f87171" },
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={statusData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {statusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderAreaChart = () => {
    if (!statisticsData?.weeklyStats) return null;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={statisticsData.weeklyStats}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="weekStart" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area 
            type="monotone" 
            name="출석률" 
            dataKey="attendanceRate" 
            stroke="#4ade80" 
            fill="#4ade80" 
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const renderBarChart = () => {
    if (!statisticsData?.villages) return null;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={statisticsData.villages}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="villageName" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="attendanceRate" 
            fill="#8884d8" 
            name="출석률" 
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // 로딩 중 메시지
  if (isLoading || isDepartmentsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-lg font-medium">통계 데이터를 불러오고 있습니다...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">오류 발생! </strong>
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">통계 및 리포트</h1>
          <p className="text-muted-foreground mt-2">
            출석 데이터 통계와 리포트를 확인합니다.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {departmentsData?.items?.length > 0 && (
            <Select
              value={departmentId?.toString()}
              onValueChange={(value) => setDepartmentId(Number(value))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="부서 선택" />
              </SelectTrigger>
              <SelectContent>
                {departmentsData?.items.map((department) => (
                  <SelectItem key={department.id} value={department.id.toString()}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "yyyy-MM-dd")} ~{" "}
                        {format(dateRange.to, "yyyy-MM-dd")}
                      </>
                    ) : (
                      format(dateRange.from, "yyyy-MM-dd")
                    )
                  ) : (
                    <span>날짜를 선택하세요</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={() => departmentId && downloadDepartmentStatisticsExcel(departmentId, dateRange)} disabled={!departmentId}>
            <Download className="h-4 w-4 mr-2" />
            <span>리포트 내보내기</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 출석 인원</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading || !statisticsData ? "-" : statisticsData.attendedMembers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              전체 {isLoading || !statisticsData ? "-" : statisticsData.totalMembers.toLocaleString()}명 중
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">출석률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading || !statisticsData ? "-" : `${statisticsData.attendanceRate.toFixed(1)}%`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">평균 QT 횟수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading || !statisticsData ? "-" : statisticsData.averageQtCount.toFixed(1)}회
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">마을 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading || !statisticsData ? "-" : statisticsData.villages?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span>개요</span>
          </TabsTrigger>
          <TabsTrigger value="village" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>마을별 통계</span>
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            <span>출석 상태</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>주간 출석 추이</CardTitle>
              <CardDescription>
                주간 출석률 추이 그래프입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                  데이터를 불러오고 있습니다...
                </div>
              ) : (
                renderAreaChart()
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="village" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>마을별 출석률</CardTitle>
              <CardDescription>
                각 마을별 출석률을 확인합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                  데이터를 불러오고 있습니다...
                </div>
              ) : (
                renderBarChart()
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="status" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>출석 상태 분포</CardTitle>
              <CardDescription>
                출석 상태에 따른 분포도를 확인합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                  데이터를 불러오고 있습니다...
                </div>
              ) : (
                renderPieChart()
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 