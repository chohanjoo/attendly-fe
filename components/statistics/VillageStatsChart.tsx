"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GbsStatistics, 
  WeeklyStatistics 
} from "@/types/statistics";

interface ChartProps {
  data: GbsStatistics[];
  title: string;
}

const VillageStatsChart = ({ data, title }: ChartProps) => {
  const [activeTab, setActiveTab] = useState<"attendance" | "qt">("attendance");
  
  // 차트 데이터 준비
  const renderBarChart = () => {
    if (!data || data.length === 0) {
      return <div className="flex items-center justify-center h-64 text-gray-500">통계 데이터가 없습니다</div>;
    }
    
    const maxValue = activeTab === "attendance" 
      ? 100 // 출석률은 100%가 최대
      : Math.max(...data.map(gbs => gbs.averageQtCount)) + 1; // QT는 데이터 기반
      
    return (
      <div className="space-y-4">
        {data.map((gbs) => (
          <div key={gbs.gbsId} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">{gbs.gbsName} ({gbs.leaderName})</span>
              <span className="text-sm text-gray-500">
                {activeTab === "attendance" 
                  ? `${gbs.attendanceRate.toFixed(1)}% (${gbs.attendedMembers}/${gbs.totalMembers}명)` 
                  : `평균 ${gbs.averageQtCount.toFixed(1)}회`}
              </span>
            </div>
            <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${activeTab === "attendance" ? "bg-indigo-500" : "bg-amber-500"}`}
                style={{ 
                  width: `${activeTab === "attendance" 
                    ? gbs.attendanceRate 
                    : (gbs.averageQtCount / maxValue) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // 주간 추이 차트
  const renderWeeklyTrendChart = () => {
    if (!data || data.length === 0 || !data[0].weeklyStats || data[0].weeklyStats.length === 0) {
      return <div className="flex items-center justify-center h-64 text-gray-500">주간 추이 데이터가 없습니다</div>;
    }
    
    // 모든 GBS의 주간 데이터 합치기
    const allWeeklyStats: WeeklyStatistics[] = [];
    
    // 모든 GBS의 주간 데이터를 날짜 기준으로 정렬하여 합침
    data.forEach(gbs => {
      gbs.weeklyStats.forEach(weekStat => {
        const existingStat = allWeeklyStats.find(stat => stat.weekStart === weekStat.weekStart);
        
        if (existingStat) {
          // 이미 같은 주차가 있으면 합산
          existingStat.totalMembers += weekStat.totalMembers;
          existingStat.attendedMembers += weekStat.attendedMembers;
          
          // 평균값 재계산
          existingStat.attendanceRate = (existingStat.attendedMembers / existingStat.totalMembers) * 100;
          
          // QT 평균은 단순 평균으로 계산 (더 복잡한 가중치 계산이 필요하면 변경 가능)
          existingStat.averageQtCount = (existingStat.averageQtCount + weekStat.averageQtCount) / 2;
        } else {
          // 새로운 주차 데이터 추가
          allWeeklyStats.push({...weekStat});
        }
      });
    });
    
    // 날짜순 정렬
    allWeeklyStats.sort((a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime());
    
    // 최근 6주 데이터만 표시
    const recentWeeks = allWeeklyStats.slice(-6);
    
    return (
      <div className="h-64 flex items-end space-x-2 mt-4">
        {recentWeeks.map((week, index) => {
          const value = activeTab === "attendance" ? week.attendanceRate : week.averageQtCount;
          const maxValue = activeTab === "attendance" ? 100 : 6;
          const height = `${(value / maxValue) * 100}%`;
          
          // 주차 날짜 포맷 (MM.DD)
          const date = new Date(week.weekStart);
          const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
          
          return (
            <div key={week.weekStart} className="flex flex-col items-center flex-1">
              <div className="w-full flex-1 flex items-end">
                <div 
                  className={`w-full relative ${activeTab === "attendance" ? "bg-indigo-500" : "bg-amber-500"} rounded-t`}
                  style={{ height }}
                >
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs">
                    {activeTab === "attendance" 
                      ? `${value.toFixed(0)}%` 
                      : `${value.toFixed(1)}`}
                  </span>
                </div>
              </div>
              <span className="text-xs mt-2">{formattedDate}</span>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <Tabs defaultValue="attendance" className="w-full" onValueChange={(value) => setActiveTab(value as "attendance" | "qt")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="attendance">출석률</TabsTrigger>
            <TabsTrigger value="qt">QT 현황</TabsTrigger>
          </TabsList>
          <TabsContent value="attendance" className="mt-4">
            <CardContent className="px-2">
              {renderBarChart()}
              <div className="mt-8 mb-4 border-t pt-4">
                <h4 className="font-medium text-sm mb-4">주간 출석률 추이</h4>
                {renderWeeklyTrendChart()}
              </div>
            </CardContent>
          </TabsContent>
          <TabsContent value="qt" className="mt-4">
            <CardContent className="px-2">
              {renderBarChart()}
              <div className="mt-8 mb-4 border-t pt-4">
                <h4 className="font-medium text-sm mb-4">주간 QT 평균 추이</h4>
                {renderWeeklyTrendChart()}
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
};

export default VillageStatsChart; 