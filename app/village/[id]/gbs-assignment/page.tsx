"use client";

import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useParams } from 'next/navigation';
import { useKanbanBoard } from '@/hooks/use-kanban-board';
import { KanbanColumn } from '@/components/gbs/KanbanColumn';
import { LabelSelector } from '@/components/gbs/LabelSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Calendar, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { UserVillageResponse } from '@/types/user';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';

export default function GbsAssignmentPage() {
  const params = useParams();
  const villageId = Number(params.id);
  const { toast } = useToast();
  const [village, setVillage] = useState<UserVillageResponse | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isVillageLoading, setIsVillageLoading] = useState(true);

  const {
    columns,
    labels,
    isLoading,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    moveCard,
    addLabelToCard,
    removeLabelFromCard,
    saveAssignments
  } = useKanbanBoard({ villageId });

  // 마을 정보 로드
  useEffect(() => {
    async function loadVillage() {
      if (!villageId) return;
      
      try {
        const response = await fetch(`/api/village/${villageId}`);
        if (!response.ok) throw new Error('마을 정보를 불러오는데 실패했습니다.');
        
        const data = await response.json();
        setVillage(data.data);
        setIsVillageLoading(false);
      } catch (error) {
        console.error('마을 정보 로드 실패:', error);
        toast({
          title: '오류',
          description: '마을 정보를 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
        setIsVillageLoading(false);
      }
    }
    
    loadVillage();
  }, [villageId, toast]);

  // 라벨 선택 처리
  const handleSelectLabel = (labelId: number) => {
    if (!selectedCardId) return;
    
    addLabelToCard(selectedCardId, labelId);
    setSelectedCardId(null);
  };

  // 카드 클릭 처리
  const handleCardClick = (cardId: string) => {
    setSelectedCardId(cardId === selectedCardId ? null : cardId);
  };

  // 배치 저장 처리
  const handleSaveAssignments = async () => {
    const result = await saveAssignments();
    if (result) {
      setSelectedCardId(null);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <header className="mb-6">
        {isVillageLoading ? (
          <Skeleton className="h-10 w-full max-w-md mb-2" />
        ) : (
          <h1 className="text-2xl font-bold text-gray-900">
            {village?.villageName} 마을 GBS 배치
          </h1>
        )}
        <p className="text-gray-600">
          각 조원을 해당 리더에게 배정하세요. 완료 컬럼의 카드만 저장됩니다.
        </p>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>GBS 기간 설정</CardTitle>
          <CardDescription>
            생성되는 GBS 그룹의 활동 기간을 설정하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium mb-2">시작일</p>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 opacity-70" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-2">종료일</p>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 opacity-70" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
        <div className="w-full md:w-64">
          <LabelSelector 
            labels={labels} 
            onSelectLabel={handleSelectLabel} 
            disabled={!selectedCardId}
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            variant="default" 
            onClick={handleSaveAssignments}
            className="flex items-center gap-2"
          >
            <Save size={16} />
            배치 저장
          </Button>
        </div>
      </div>

      <DndProvider backend={HTML5Backend}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              {[0, 1, 2].map((i) => (
                <Card key={i} className="h-[500px]">
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[0, 1, 2, 3].map((j) => (
                        <Skeleton key={j} className="h-20 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  onMoveCard={moveCard}
                  onRemoveLabel={removeLabelFromCard}
                />
              ))}
            </>
          )}
        </div>
      </DndProvider>
    </div>
  );
} 