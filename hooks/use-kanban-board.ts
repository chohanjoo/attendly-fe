import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/axios';
import { 
  KanbanCard, 
  KanbanColumn, 
  KanbanLabel, 
  GbsAssignment,
  SaveAssignmentRequest 
} from '@/types/kanban';

const COLUMN_IDS = {
  WAITING: 'waiting',
  PENDING: 'pending',
  COMPLETED: 'completed'
};

// 랜덤 색상 생성 함수
const getRandomColor = () => {
  const colors = [
    'bg-red-100 border-red-200',
    'bg-blue-100 border-blue-200',
    'bg-green-100 border-green-200',
    'bg-yellow-100 border-yellow-200',
    'bg-purple-100 border-purple-200',
    'bg-pink-100 border-pink-200',
    'bg-indigo-100 border-indigo-200',
    'bg-orange-100 border-orange-200',
    'bg-teal-100 border-teal-200',
    'bg-lime-100 border-lime-200',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

interface UseKanbanBoardProps {
  villageId: number;
}

export function useKanbanBoard({ villageId }: UseKanbanBoardProps) {
  const { toast } = useToast();
  const isMovingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [columns, setColumns] = useState<KanbanColumn[]>([
    { id: COLUMN_IDS.WAITING, title: '대기', cards: [] },
    { id: COLUMN_IDS.PENDING, title: '보류', cards: [] },
    { id: COLUMN_IDS.COMPLETED, title: '완료', cards: [] },
  ]);
  const [labels, setLabels] = useState<KanbanLabel[]>([]);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]
  );

  // 멤버(조원) 목록 로드
  const loadMembers = useCallback(async () => {
    if (!villageId) return;
    
    setIsLoading(true);
    try {
      const response = await api.get(`/api/village/${villageId}/members`);
      
      // 대기열 컬럼에 멤버 카드 추가
      setColumns(prev => {
        const newColumns = [...prev];
        const waitingColumn = newColumns.find(col => col.id === COLUMN_IDS.WAITING);
        
        if (waitingColumn) {
          waitingColumn.cards = response.data.data.items.map((member: any) => ({
            id: Math.random().toString(36).substring(2, 9),
            userId: member.id,
            userName: member.name,
            birthDate: member.birthDate,
            labels: []
          }));
        }
        
        return newColumns;
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('멤버 로드 실패:', error);
      toast({
        title: '오류',
        description: '멤버 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }, [villageId, toast]);

  // 리더 목록 로드 및 라벨 생성
  const loadLeaders = useCallback(async () => {
    if (!villageId) return;
    
    try {
      const response = await api.get(`/api/village/${villageId}/leader-candidates`);
      
      // 리더 목록으로 라벨 생성
      const newLabels = response.data.data.items.map((leader: any) => ({
        id: leader.id,
        name: leader.name,
        leaderId: leader.id,
        color: getRandomColor()
      }));
      
      setLabels(newLabels);
    } catch (error) {
      console.error('리더 로드 실패:', error);
      toast({
        title: '오류',
        description: '리더 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    }
  }, [villageId, toast]);

  // 초기 데이터 로드
  useEffect(() => {
    if (villageId) {
      Promise.all([
        loadMembers(),
        loadLeaders()
      ]);
    }
  }, [villageId, loadMembers, loadLeaders]);

  // 카드 이동 처리
  const moveCard = useCallback(
    (
      sourceColumnId: string,
      destinationColumnId: string,
      sourceIndex: number,
      destinationIndex: number,
    ) => {
      setColumns(prevColumns => {
        // 깊은 복사를 통해 columns 배열과 내부 cards 배열을 모두 새로 생성
        const newColumns = prevColumns.map(column => ({
          ...column,
          cards: [...column.cards],
        }));
        
        // 원본 컬럼 찾기
        const sourceColumn = newColumns.find(col => col.id === sourceColumnId);
        if (!sourceColumn) return prevColumns;
        
        // 목적지 컬럼 찾기
        const destinationColumn = newColumns.find(col => col.id === destinationColumnId);
        if (!destinationColumn) return prevColumns;
        
        // 이동할 카드를 복제하여 참조 문제 방지
        const cardToMove = { ...sourceColumn.cards[sourceIndex] };
        
        // 원본에서 카드 제거
        sourceColumn.cards.splice(sourceIndex, 1);
        
        // 목적지에 카드 추가
        destinationColumn.cards.splice(destinationIndex, 0, cardToMove);
        
        return newColumns;
      });
    },
    []
  );

  // 카드에 라벨 추가
  const addLabelToCard = (cardId: string, labelId: number) => {
    setColumns(prevColumns => {
      return prevColumns.map(column => {
        const cardIndex = column.cards.findIndex(card => card.id.toString() === cardId);
        
        if (cardIndex !== -1) {
          const label = labels.find(l => l.id === labelId);
          if (!label) return column;
          
          // 이미 같은 라벨이 있는지 확인
          const hasLabel = column.cards[cardIndex].labels.some(l => l.id === labelId);
          if (hasLabel) return column;
          
          const updatedCards = [...column.cards];
          updatedCards[cardIndex] = {
            ...updatedCards[cardIndex],
            labels: [...updatedCards[cardIndex].labels, label]
          };
          
          return { ...column, cards: updatedCards };
        }
        
        return column;
      });
    });
  };

  // 카드에서 라벨 제거
  const removeLabelFromCard = (cardId: string, labelId: number) => {
    setColumns(prevColumns => {
      return prevColumns.map(column => {
        const cardIndex = column.cards.findIndex(card => card.id.toString() === cardId);
        
        if (cardIndex !== -1) {
          const updatedCards = [...column.cards];
          updatedCards[cardIndex] = {
            ...updatedCards[cardIndex],
            labels: updatedCards[cardIndex].labels.filter(label => label.id !== labelId)
          };
          
          return { ...column, cards: updatedCards };
        }
        
        return column;
      });
    });
  };

  // 최종 배치 저장
  const saveAssignments = async () => {
    // 완료 컬럼의 카드만 저장 대상으로 함
    const completedColumn = columns.find(col => col.id === COLUMN_IDS.COMPLETED);
    if (!completedColumn || completedColumn.cards.length === 0) {
      toast({
        title: '알림',
        description: '완료 상태의 배치가 없습니다.',
        variant: 'default',
      });
      return;
    }

    // 라벨별로 그룹화하여 GBS 그룹 생성
    const assignmentsByLabel = new Map<number, GbsAssignment>();
    
    completedColumn.cards.forEach(card => {
      card.labels.forEach(label => {
        if (!assignmentsByLabel.has(label.leaderId)) {
          assignmentsByLabel.set(label.leaderId, {
            gbsId: 0, // 신규 생성이므로 0
            gbsName: `${label.name}의 GBS`, // 기본 이름 설정
            leaderId: label.leaderId,
            leaderName: label.name,
            memberIds: [card.userId],
            villageId,
            termStartDate: startDate,
            termEndDate: endDate
          });
        } else {
          const assignment = assignmentsByLabel.get(label.leaderId);
          if (assignment) {
            assignment.memberIds.push(card.userId);
          }
        }
      });
    });

    // 저장할 데이터 구성
    const requestData: SaveAssignmentRequest = {
      villageId,
      termStartDate: startDate,
      termEndDate: endDate,
      assignments: Array.from(assignmentsByLabel.values())
    };

    try {
      const response = await api.post('/api/gbs/assignments', requestData);
      
      toast({
        title: '성공',
        description: 'GBS 배치가 저장되었습니다.',
        variant: 'default',
      });
      
      return response.data;
    } catch (error) {
      console.error('GBS 배치 저장 실패:', error);
      toast({
        title: '오류',
        description: 'GBS 배치 저장에 실패했습니다.',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
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
    saveAssignments,
    loadMembers,
    loadLeaders
  };
} 