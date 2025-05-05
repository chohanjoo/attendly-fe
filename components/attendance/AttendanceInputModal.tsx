"use client";

import { useState, useEffect } from "react";
import { AttendanceItemRequest } from "@/types/attendance";
import { formatDate } from "@/lib/attendance-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X, AlertCircle, User, UserX } from "lucide-react";

interface AttendanceInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekStart: string;
  attendanceInputs: AttendanceItemRequest[];
  memberNames: Record<number, string>;
  onInputChange: (index: number, field: keyof AttendanceItemRequest, value: any) => void;
  onToggleWorship: (index: number) => void;
  onSave: (activeInputs: AttendanceItemRequest[]) => void;
  isPending: boolean;
  attendanceExists?: boolean[]; // 각 멤버별로 기존 출석 데이터 존재 여부
}

export default function AttendanceInputModal({
  open,
  onOpenChange,
  weekStart,
  attendanceInputs,
  memberNames,
  onInputChange,
  onToggleWorship,
  onSave,
  isPending,
  attendanceExists = []
}: AttendanceInputModalProps) {
  const [activeMemberIndices, setActiveMemberIndices] = useState<Set<number>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  // 모달이 열릴 때만 활성화 상태 초기화
  useEffect(() => {
    if (open && !isInitialized && attendanceInputs.length > 0) {
      // 기존 출석 데이터가 있는 멤버만 활성화
      const initialActiveIndices = new Set<number>();
      
      attendanceInputs.forEach((_, index) => {
        // attendanceExists 배열이 제공되면 해당 값을 사용하고, 아니면 모든 멤버 활성화
        if (attendanceExists.length > 0) {
          if (attendanceExists[index]) {
            initialActiveIndices.add(index);
          }
        } else {
          initialActiveIndices.add(index);
        }
      });
      
      setActiveMemberIndices(initialActiveIndices);
      setIsInitialized(true);
    } else if (!open) {
      // 모달이 닫힐 때 초기화 상태 리셋
      setIsInitialized(false);
    }
  }, [open, attendanceInputs, isInitialized, attendanceExists]);

  const toggleMemberActive = (index: number) => {
    const newActiveMemberIndices = new Set(activeMemberIndices);
    if (newActiveMemberIndices.has(index)) {
      newActiveMemberIndices.delete(index);
    } else {
      newActiveMemberIndices.add(index);
    }
    setActiveMemberIndices(newActiveMemberIndices);
  };

  const handleSave = () => {
    // 활성화된 멤버들만 필터링
    const activeInputs = attendanceInputs.filter((_, index) => activeMemberIndices.has(index));
    
    // API 요청에서 비활성화된 멤버 제외
    onSave(activeInputs);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>GBS 출석 입력</DialogTitle>
          <DialogDescription>
            {formatDate(weekStart)} 주간의 GBS 출석 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {attendanceInputs.map((input, index) => {
            const memberName = memberNames[input.memberId] || `조원 ${index + 1}`;
            const isActive = activeMemberIndices.has(index);
            
            return (
              <div key={index} className={`grid grid-cols-12 gap-4 items-center border-b pb-4 ${!isActive ? 'opacity-50' : ''}`}>
                <div className="col-span-3">
                  <Label>이름</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium">{memberName}</p>
                    <Switch
                      id={`active-${index}`}
                      checked={isActive}
                      onCheckedChange={() => toggleMemberActive(index)}
                      aria-label={`${memberName} 활성화`}
                    />
                    {isActive ? (
                      <User className="h-4 w-4 text-green-500" />
                    ) : (
                      <UserX className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                
                <div className="col-span-3">
                  <Label htmlFor={`worship-${index}`}>예배 출석</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Switch
                      id={`worship-${index}`}
                      checked={input.worship === 'O'}
                      onCheckedChange={() => onToggleWorship(index)}
                      disabled={!isActive}
                    />
                    <Badge variant={input.worship === 'O' ? "default" : "destructive"}>
                      {input.worship}
                    </Badge>
                  </div>
                </div>
                
                <div className="col-span-3">
                  <Label htmlFor={`qt-${index}`}>QT 횟수</Label>
                  <Input
                    id={`qt-${index}`}
                    type="number"
                    min={0}
                    max={6}
                    value={input.qtCount}
                    onChange={(e) => onInputChange(index, 'qtCount', parseInt(e.target.value) || 0)}
                    className="mt-1"
                    disabled={!isActive}
                  />
                </div>
                
                <div className="col-span-3">
                  <Label htmlFor={`ministry-${index}`}>대학부 등급</Label>
                  <Select
                    value={input.ministry}
                    onValueChange={(value) => onInputChange(index, 'ministry', value as 'A' | 'B' | 'C')}
                    disabled={!isActive}
                  >
                    <SelectTrigger id={`ministry-${index}`} className="mt-1">
                      <SelectValue placeholder="등급 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}

          {attendanceInputs.length === 0 && (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <AlertCircle className="mr-2 h-5 w-5" />
              <p>조원 정보를 불러올 수 없습니다.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-2 h-4 w-4" />
            취소
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isPending || attendanceInputs.length === 0}
          >
            {isPending ? (
              <>저장 중...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                저장하기
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 