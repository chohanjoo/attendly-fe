"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GbsStatistics, 
  WeeklyStatistics 
} from "@/types/statistics";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, ArrowUpDown, Search } from "lucide-react";

interface ChartProps {
  data: GbsStatistics[];
  title: string;
}

const VillageStatsChart = ({ data, title }: ChartProps) => {
  const [activeTab, setActiveTab] = useState<"attendance" | "qt">("attendance");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // 검색 및 정렬된 데이터
  const processedData = useMemo(() => {
    // 검색 필터링
    let filtered = data;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = data.filter(gbs => 
        gbs.gbsName.toLowerCase().includes(term) || 
        gbs.leaderName.toLowerCase().includes(term)
      );
    }
    
    // 정렬
    return [...filtered].sort((a, b) => {
      const valueA = activeTab === "attendance" ? a.attendanceRate : a.averageQtCount;
      const valueB = activeTab === "attendance" ? b.attendanceRate : b.averageQtCount;
      return sortOrder === "desc" ? valueB - valueA : valueA - valueB;
    });
  }, [data, activeTab, sortOrder, searchTerm]);
  
  // 페이지네이션
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage]);
  
  // 페이지 변경 시 맨 위로 스크롤
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [processedData.length]);
  
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  
  // 차트 데이터 준비
  const renderBarChart = () => {
    if (!data || data.length === 0) {
      return <div className="flex items-center justify-center h-64 text-gray-500">통계 데이터가 없습니다</div>;
    }
    
    const maxValue = activeTab === "attendance" 
      ? 100 // 출석률은 100%가 최대
      : Math.max(...data.map(gbs => gbs.averageQtCount)) + 1; // QT는 데이터 기반
      
    return (
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="GBS 이름 또는 리더 검색"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="flex items-center gap-1"
            >
              <span>{activeTab === "attendance" ? "출석률" : "QT"} {sortOrder === "desc" ? "내림차순" : "오름차순"}</span>
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 mb-2">
          전체 {processedData.length}개 GBS 중 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, processedData.length)}개 표시
        </div>

        <Accordion type="single" collapsible className="w-full space-y-2">
          {paginatedData.map((gbs) => (
            <AccordionItem 
              key={gbs.gbsId} 
              value={gbs.gbsId.toString()}
              className="border rounded-lg shadow-sm"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50">
                <div className="w-full flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="font-medium text-sm">{gbs.gbsName} ({gbs.leaderName})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {activeTab === "attendance" 
                        ? `${gbs.attendanceRate.toFixed(1)}%` 
                        : `평균 ${gbs.averageQtCount.toFixed(1)}회`}
                    </span>
                    <div 
                      className={`h-3 w-20 rounded-full overflow-hidden ${
                        activeTab === "attendance" 
                          ? gbs.attendanceRate >= 75 ? "bg-emerald-100" : "bg-gray-100" 
                          : gbs.averageQtCount >= 3 ? "bg-amber-100" : "bg-gray-100"
                      }`}
                    >
                      <div 
                        className={`h-full ${
                          activeTab === "attendance" 
                            ? gbs.attendanceRate >= 75 ? "bg-emerald-500" : "bg-indigo-500" 
                            : gbs.averageQtCount >= 3 ? "bg-amber-500" : "bg-amber-400"
                        }`}
                        style={{ 
                          width: `${activeTab === "attendance" 
                            ? gbs.attendanceRate 
                            : (gbs.averageQtCount / maxValue) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3 bg-gray-50 rounded-b-lg">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">총 인원</span>
                      <span className="font-medium">{gbs.totalMembers}명</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">참석 인원</span>
                      <span className="font-medium">{gbs.attendedMembers}명</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">출석률</span>
                      <span className="font-medium">{gbs.attendanceRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">평균 QT</span>
                      <span className="font-medium">{gbs.averageQtCount.toFixed(1)}회</span>
                    </div>
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
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              {processedData.length}개 GBS 중 {currentPage} / {totalPages} 페이지
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
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
      <div className="h-64 flex items-end space-x-4 mt-4 px-4">
        {recentWeeks.map((week, index) => {
          const value = activeTab === "attendance" ? week.attendanceRate : week.averageQtCount;
          const maxValue = activeTab === "attendance" ? 100 : 6;
          const height = `${(value / maxValue) * 60}%`;
          
          const date = new Date(week.weekStart);
          const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
          
          return (
            <div key={week.weekStart} className="flex flex-col items-center" style={{ width: '14.28%' }}>
              <div className="w-full h-52 flex items-end">
                <div 
                  className={`w-full relative ${activeTab === "attendance" ? "bg-indigo-500" : "bg-amber-500"} rounded-t-lg`}
                  style={{ height }}
                >
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap font-medium">
                    {activeTab === "attendance" 
                      ? `${value.toFixed(0)}%` 
                      : `${value.toFixed(1)}`}
                  </span>
                </div>
              </div>
              <span className="text-xs mt-2 text-gray-600">{formattedDate}</span>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-normal text-gray-500">전체 {data.length}개 GBS</span>
        </CardTitle>
        <Tabs defaultValue="attendance" className="w-full" onValueChange={(value) => {
          setActiveTab(value as "attendance" | "qt");
          setCurrentPage(1);
        }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="attendance">출석률</TabsTrigger>
            <TabsTrigger value="qt">QT 현황</TabsTrigger>
          </TabsList>
          <TabsContent value="attendance" className="mt-4">
            <CardContent className="px-6">
              {renderBarChart()}
              <div className="mt-8 mb-4 border-t pt-4">
                <h4 className="font-medium text-sm mb-4">주간 출석률 추이</h4>
                {renderWeeklyTrendChart()}
              </div>
            </CardContent>
          </TabsContent>
          <TabsContent value="qt" className="mt-4">
            <CardContent className="px-6">
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
