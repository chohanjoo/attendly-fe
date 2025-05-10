"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X, Edit } from "lucide-react";
import { AttendanceItemRequest } from "@/types/attendance";
import { GbsAttendanceSummary } from "@/types/statistics";
import { updateGbsAttendanceByVillageLeader } from "@/services/statistics-service";

interface VillageAttendanceEditorProps {
  villageId: number;
  gbsAttendance: GbsAttendanceSummary;
  weekStart: string;
  onSuccess?: () => void;
}

export default function VillageAttendanceEditor({
  villageId,
  gbsAttendance,
  weekStart,
  onSuccess,
}: VillageAttendanceEditorProps) {
  const [open, setOpen] = useState(false);
  const [attendanceInputs, setAttendanceInputs] = useState<AttendanceItemRequest[]>([]);
  const [isPending, setIsPending] = useState(false);
  
  const queryClient = useQueryClient();
  
  // 출석 수정 모달 열기
  const handleOpenEditor = () => {
    // GBS 멤버의 출석 데이터를 초기화
    const initialInputs = gbsAttendance.memberAttendances.map(attendance => ({
      memberId: attendance.memberId,
      worship: attendance.worship,
      qtCount: attendance.qtCount,
      ministry: attendance.ministry
    }));
    
    setAttendanceInputs(initialInputs);
    setOpen(true);
  };
  
  // 출석 상태 토글
  const toggleWorship = (index: number) => {
    const newInputs = [...attendanceInputs];
    newInputs[index].worship = newInputs[index].worship === 'O' ? 'X' : 'O';
    setAttendanceInputs(newInputs);
  };
  
  // 출석 입력 변경 핸들러
  const handleInputChange = (index: number, field: keyof AttendanceItemRequest, value: any) => {
    const newInputs = [...attendanceInputs];
    newInputs[index] = { ...newInputs[index], [field]: value };
    setAttendanceInputs(newInputs);
  };
  
  // 출석 데이터 저장
  const handleSaveAttendance = async () => {
    if (attendanceInputs.length === 0) return;
    
    try {
      setIsPending(true);
      
      await updateGbsAttendanceByVillageLeader(
        villageId, 
        gbsAttendance.gbsId, 
        weekStart, 
        attendanceInputs
      );
      
      // 캐시 무효화 처리
      queryClient.invalidateQueries({ queryKey: ['villageAttendance', villageId, weekStart] });
      
      // 모달 닫기
      setOpen(false);
      
      // 성공 콜백 실행
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("출석 데이터 저장 실패:", error);
    } finally {
      setIsPending(false);
    }
  };
  
  // 주차 기간 포맷팅 (MM월 DD일 ~ MM월 DD일)
  const formatWeekPeriod = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    
    return `${format(start, "MM월 dd일", { locale: ko })} ~ ${format(end, "MM월 dd일", { locale: ko })}`;
  };
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenEditor}
        className="gap-1"
      >
        <Edit className="h-3.5 w-3.5" />
        <span>출석 수정</span>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {gbsAttendance.gbsName} 출석 수정 - {formatWeekPeriod(weekStart)}
            </DialogTitle>
            <DialogDescription>
              {gbsAttendance.leaderName} 리더 / 총 {gbsAttendance.totalMembers}명
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            {attendanceInputs.map((input, index) => {
              const memberAttendance = gbsAttendance.memberAttendances.find(
                m => m.memberId === input.memberId
              );
              const memberName = memberAttendance?.memberName || `멤버 ${input.memberId}`;
              
              return (
                <Card key={input.memberId} className="p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-base">{memberName}</h3>
                      <Badge variant={input.worship === 'O' ? "default" : "destructive"}>
                        {input.worship === 'O' ? '출석' : '결석'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* 예배 출석 토글 */}
                      <div className="flex items-center justify-between gap-2">
                        <Label htmlFor={`worship-${input.memberId}`} className="flex-1">
                          예배 출석
                        </Label>
                        <Switch
                          id={`worship-${input.memberId}`}
                          checked={input.worship === 'O'}
                          onCheckedChange={() => toggleWorship(index)}
                        />
                      </div>
                      
                      {/* QT 횟수 선택 */}
                      <div className="flex items-center gap-3">
                        <Label htmlFor={`qt-${input.memberId}`} className="flex-1">
                          QT 횟수
                        </Label>
                        <Select
                          value={input.qtCount.toString()}
                          onValueChange={(value) => handleInputChange(index, 'qtCount', parseInt(value))}
                        >
                          <SelectTrigger id={`qt-${input.memberId}`} className="w-20">
                            <SelectValue placeholder="0" />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5, 6].map((count) => (
                              <SelectItem key={count} value={count.toString()}>
                                {count}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* 대학부 등급 선택 */}
                      <div className="flex items-center gap-3">
                        <Label htmlFor={`ministry-${input.memberId}`} className="flex-1">
                          대학부 등급
                        </Label>
                        <Select
                          value={input.ministry}
                          onValueChange={(value) => handleInputChange(index, 'ministry', value as 'A' | 'B' | 'C')}
                        >
                          <SelectTrigger id={`ministry-${input.memberId}`} className="w-20">
                            <SelectValue placeholder="A" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              <X className="h-4 w-4 mr-2" />
              취소
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveAttendance} 
              disabled={isPending || attendanceInputs.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              {isPending ? '저장 중...' : '저장하기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 