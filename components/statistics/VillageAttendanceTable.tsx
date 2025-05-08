"use client";

import { useState } from "react";
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
import { VillageAttendanceResponse, GbsAttendanceSummary } from "@/types/statistics";
import { Filter, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface VillageAttendanceTableProps {
  data: VillageAttendanceResponse | null;
}

const VillageAttendanceTable = ({ data }: VillageAttendanceTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
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

  // 검색 필터 적용
  const filteredGbsList = data.gbsAttendances.filter(gbs => {
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
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">마을 출석 현황</CardTitle>
        <div className="text-sm text-gray-500 mt-1">
          {formatWeekPeriod(data.weekStart)}
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="GBS, 리더 또는 멤버 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-1">
        <div className="overflow-auto">
          <div className="flex justify-between px-4 text-sm text-gray-500 mb-2">
            <div>총 {filteredGbsList.length}개 GBS</div>
            <div>
              출석률: {((data.gbsAttendances.reduce((sum, gbs) => sum + gbs.attendanceRate, 0) / data.gbsAttendances.length) || 0).toFixed(1)}%
            </div>
          </div>
          <Accordion type="multiple" className="w-full">
            {filteredGbsList.map((gbs) => (
              <AccordionItem key={gbs.gbsId} value={`gbs-${gbs.gbsId}`} className="border-b">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50">
                  <div className="flex flex-1 justify-between items-center text-left">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{gbs.gbsName}</span>
                      <span className="text-sm text-gray-500">({gbs.leaderName})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">
                        출석률:&nbsp;
                        <span className={`font-medium ${gbs.attendanceRate >= 80 ? 'text-green-600' : gbs.attendanceRate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
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
                  <GbsAttendanceTable gbs={gbs} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
};

const GbsAttendanceTable = ({ gbs }: { gbs: GbsAttendanceSummary }) => {
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