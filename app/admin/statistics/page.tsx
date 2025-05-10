"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
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
import axios from "axios"

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

// 실제 API 통신 함수
const fetchStatistics = async (period: string) => {
  // const response = await axios.get(`/api/admin/statistics?period=${period}`)
  // return response.data
  
  // 임시로 데이터 반환
  return {
    attendanceData,
    villageData,
    statusDistribution,
    totalAttended: 1253,
    totalMembers: 1478,
    attendanceRate: 84.8,
    absentRate: 15.2
  }
}

export default function StatisticsPage() {
  const [period, setPeriod] = useState("year")
  const [activeTab, setActiveTab] = useState("overview")

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "statistics", period],
    queryFn: () => fetchStatistics(period),
  })

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={statusDistribution}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {statusDistribution.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={attendanceData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="출석률" stackId="1" stroke="#4ade80" fill="#4ade80" />
        <Area type="monotone" dataKey="결석률" stackId="1" stroke="#f87171" fill="#f87171" />
      </AreaChart>
    </ResponsiveContainer>
  )

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={villageData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#8884d8" name="인원수" />
      </BarChart>
    </ResponsiveContainer>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">통계 및 리포트</h1>
          <p className="text-muted-foreground mt-2">
            출석 데이터 통계와 리포트를 확인합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={period}
            onValueChange={setPeriod}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="기간 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">월간</SelectItem>
              <SelectItem value="quarter">분기</SelectItem>
              <SelectItem value="half">반기</SelectItem>
              <SelectItem value="year">연간</SelectItem>
            </SelectContent>
          </Select>
          <Button>
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
            <div className="text-2xl font-bold">{isLoading ? "-" : data?.totalAttended.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              전체 {isLoading ? "-" : data?.totalMembers.toLocaleString()}명 중
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">출석률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "-" : `${data?.attendanceRate}%`}</div>
            <p className="text-xs text-muted-foreground mt-1">
              전월 대비 +2.5%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">결석률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "-" : `${data?.absentRate}%`}</div>
            <p className="text-xs text-muted-foreground mt-1">
              전월 대비 -2.5%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">마을 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "-" : villageData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              최근 1개 마을 추가
            </p>
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
              <CardTitle>월별 출석 추이</CardTitle>
              <CardDescription>
                월간 출석률 및 결석률 추이 그래프입니다.
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
              <CardTitle>마을별 인원 현황</CardTitle>
              <CardDescription>
                각 마을별 인원 분포를 확인합니다.
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
  )
} 