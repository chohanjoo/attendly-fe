"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { VillageAttendanceResponse, GbsAttendanceSummary } from "@/types/statistics";
import { Filter, Users, Search, Grid, List, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import VillageAttendanceEditor from "@/components/statistics/VillageAttendanceEditor";
import { Badge } from "@/components/ui/badge";

interface VillageAttendanceTableProps {
  data: VillageAttendanceResponse | null;
}

const VillageAttendanceTable = ({ data }: VillageAttendanceTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "attendance" | "leader">("name");
  const [attendanceFilter, setAttendanceFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const ITEMS_PER_PAGE = 12;
  
  if (!data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">마을 출석 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-gray-500">
            출석 데이터가 없습니다
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // 주차 기간 포맷팅 (MM월 DD일 ~ MM월 DD일)
  const formatWeekPeriod = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    
    return `${format(start, "MM월 dd일", { locale: ko })} ~ ${format(end, "MM월 dd일", { locale: ko })}`;
  };

  // 필터링 및 정렬 적용된 GBS 목록
  const processedGbsList = useMemo(() => {
    // 검색어 필터링
    let filtered = data.gbsAttendances.filter(gbs => {
      if (!searchTerm) return true;
      
      // GBS 이름 또는 리더 이름으로 검색
      if (gbs.gbsName.toLowerCase().includes(searchTerm.toLowerCase()) || 
          gbs.leaderName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }
      
      // 멤버 이름으로 검색
      return gbs.memberAttendances.some(attendance => 
        attendance.memberName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    
    // 출석률 필터링
    if (attendanceFilter !== "all") {
      filtered = filtered.filter(gbs => {
        if (attendanceFilter === "high") return gbs.attendanceRate >= 80;
        if (attendanceFilter === "medium") return gbs.attendanceRate >= 60 && gbs.attendanceRate < 80;
        if (attendanceFilter === "low") return gbs.attendanceRate < 60;
        return true;
      });
    }
    
    // 정렬
    return filtered.sort((a, b) => {
      if (sortBy === "name") return a.gbsName.localeCompare(b.gbsName);
      if (sortBy === "leader") return a.leaderName.localeCompare(b.leaderName);
      if (sortBy === "attendance") return b.attendanceRate - a.attendanceRate;
      return 0;
    });
  }, [data.gbsAttendances, searchTerm, sortBy, attendanceFilter]);
  
  // 페이지네이션 처리
  const totalPages = Math.ceil(processedGbsList.length / ITEMS_PER_PAGE);
  const currentItems = processedGbsList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  // 평균 출석률 계산
  const averageAttendanceRate = processedGbsList.length > 0 
    ? (processedGbsList.reduce((sum, gbs) => sum + gbs.attendanceRate, 0) / processedGbsList.length).toFixed(1)
    : "0.0";
  
  // 데이터 새로고침 핸들러
  const handleDataRefresh = () => {
    // 캐시 무효화나 데이터 리로드는 상위 컴포넌트에서 자동으로 처리됨
    console.log("출석 데이터가 업데이트되었습니다.");
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // 페이지네이션 컴포넌트 렌더링
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              aria-disabled={currentPage === 1}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else {
              // 현재 페이지가 가운데 오도록 계산
              const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
              pageNumber = start + i;
            }
            
            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  onClick={() => handlePageChange(pageNumber)}
                  isActive={currentPage === pageNumber}
                  className="cursor-pointer"
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          
          {totalPages > 5 && currentPage < totalPages - 1 && (
            <PaginationItem>
              <PaginationLink
                onClick={() => handlePageChange(totalPages)}
                className="cursor-pointer"
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              aria-disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };
  
  // 출석률에 따른 색상 지정
  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-amber-600";
    return "text-red-600";
  };
  
  // Grid 뷰
  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
      {currentItems.map((gbs) => (
        <Card key={gbs.gbsId} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <CardTitle className="text-base font-semibold">{gbs.gbsName}</CardTitle>
                </div>
                <p className="text-sm text-gray-500 mt-1">리더: {gbs.leaderName}</p>
              </div>
              <Badge 
                className={`${
                  gbs.attendanceRate >= 80 
                    ? "bg-green-100 text-green-600 hover:bg-green-200" 
                    : gbs.attendanceRate >= 60 
                    ? "bg-amber-100 text-amber-600 hover:bg-amber-200" 
                    : "bg-red-100 text-red-600 hover:bg-red-200"
                }`}
              >
                출석률 {gbs.attendanceRate.toFixed(1)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-sm text-gray-600 flex justify-between items-center">
              <span>참석자: {gbs.attendedMembers}/{gbs.totalMembers}명</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setView("list");
                  setTimeout(() => {
                    const accordionTrigger = document.getElementById(`gbs-details-${gbs.gbsId}`);
                    if (accordionTrigger && !accordionTrigger.getAttribute("data-state")?.includes("open")) {
                      accordionTrigger.click();
                    }
                  }, 100);
                }}
                className="text-xs h-8"
              >
                상세보기
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  // 리스트 뷰 (아코디언)
  const renderListView = () => (
    <Accordion type="multiple" className="w-full px-4">
      {currentItems.map((gbs) => (
        <AccordionItem key={gbs.gbsId} value={`gbs-${gbs.gbsId}`} className="border-b">
          <AccordionTrigger 
            id={`gbs-details-${gbs.gbsId}`}
            className="px-4 py-3 hover:no-underline hover:bg-gray-50"
          >
            <div className="flex flex-1 justify-between items-center text-left">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{gbs.gbsName}</span>
                <span className="text-sm text-gray-500">({gbs.leaderName})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">
                  출석률:&nbsp;
                  <span className={`font-medium ${getAttendanceRateColor(gbs.attendanceRate)}`}>
                    {gbs.attendanceRate.toFixed(1)}%
                  </span>
                </span>
                <span className="text-sm text-gray-500">
                  {gbs.attendedMembers}/{gbs.totalMembers}명
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-0">
            <GbsAttendanceTable 
              gbs={gbs} 
              villageId={data.villageId} 
              weekStart={data.weekStart}
              onAttendanceUpdate={handleDataRefresh}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">마을 출석 현황</CardTitle>
            <div className="text-sm text-gray-500 mt-1">
              {formatWeekPeriod(data.weekStart)}
            </div>
          </div>
          <Badge variant="outline" className="text-sm font-medium">
            평균 출석률: {averageAttendanceRate}%
          </Badge>
        </div>
        
        <div className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="GBS, 리더 또는 멤버 검색"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="h-4 w-4" />
              <span>필터:</span>
              
              <Select
                value={attendanceFilter}
                onValueChange={(value) => {
                  setAttendanceFilter(value as "all" | "high" | "medium" | "low");
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[140px]">
                  <SelectValue placeholder="출석률" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 보기</SelectItem>
                  <SelectItem value="high">높음 (≥80%)</SelectItem>
                  <SelectItem value="medium">중간 (≥60%)</SelectItem>
                  <SelectItem value="low">낮음 (&lt;60%)</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value as "name" | "attendance" | "leader");
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[140px]">
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">GBS 이름순</SelectItem>
                  <SelectItem value="leader">리더 이름순</SelectItem>
                  <SelectItem value="attendance">출석률순</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center">
              <div className="flex border border-input rounded-md overflow-hidden">
                <Button
                  variant={view === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView("grid")}
                  className={`rounded-none py-1 px-2 h-8 ${view === "grid" ? "" : "text-gray-500"}`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView("list")}
                  className={`rounded-none py-1 px-2 h-8 ${view === "list" ? "" : "text-gray-500"}`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <div className="ml-2 text-sm text-gray-500">
                총 {processedGbsList.length}개 GBS
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-0 pb-6">
        <div className="overflow-hidden">
          {view === "grid" ? renderGridView() : renderListView()}
          <div className="px-4 mt-4">{renderPagination()}</div>
        </div>
      </CardContent>
    </Card>
  );
};

interface GbsAttendanceTableProps {
  gbs: GbsAttendanceSummary;
  villageId: number;
  weekStart: string;
  onAttendanceUpdate?: () => void;
}

const GbsAttendanceTable = ({ gbs, villageId, weekStart, onAttendanceUpdate }: GbsAttendanceTableProps) => {
  // 예배/QT/대학부 등급에 따른 색상 지정
  const getWorshipColor = (worship: string) => {
    return worship === 'O' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  };
  
  const getQtColor = (count: number) => {
    if (count >= 5) return 'bg-green-100 text-green-700';
    if (count >= 3) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };
  
  const getMinistryColor = (grade: string) => {
    if (grade === 'A') return 'bg-green-100 text-green-700';
    if (grade === 'B') return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };
  
  return (
    <div className="overflow-x-auto">
      <div className="flex justify-end px-4 py-2">
        <VillageAttendanceEditor 
          villageId={villageId} 
          gbsAttendance={gbs} 
          weekStart={weekStart}
          onSuccess={onAttendanceUpdate}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">이름</TableHead>
            <TableHead>예배</TableHead>
            <TableHead>QT</TableHead>
            <TableHead>대학부</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gbs.memberAttendances.map((attendance) => (
            <TableRow key={attendance.id}>
              <TableCell className="font-medium">{attendance.memberName}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${getWorshipColor(attendance.worship)}`}>
                  {attendance.worship}
                </span>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${getQtColor(attendance.qtCount)}`}>
                  {attendance.qtCount}/6
                </span>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${getMinistryColor(attendance.ministry)}`}>
                  {attendance.ministry}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VillageAttendanceTable; 