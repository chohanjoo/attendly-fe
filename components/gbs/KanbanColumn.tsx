import { useDrop } from 'react-dnd';
import { KanbanCard } from './KanbanCard';
import { KanbanColumn as KanbanColumnType, KanbanCard as KanbanCardType, KanbanLabel } from '@/types/kanban';
import React from 'react';

interface KanbanColumnProps {
  column: KanbanColumnType;
  onMoveCard: (
    sourceColumnId: string,
    destColumnId: string,
    sourceIndex: number,
    destIndex: number
  ) => void;
  onRemoveLabel: (cardId: string, labelId: number) => void;
  onAddLabel: (cardId: string, labelId: number) => void;
  labels: KanbanLabel[];
}

export function KanbanColumn({ column, onMoveCard, onRemoveLabel, onAddLabel, labels }: KanbanColumnProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'CARD',
    drop: () => ({ name: column.id }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    hover(item: any, monitor) {
      if (!monitor.isOver({ shallow: true })) {
        return;
      }
      
      const draggedItemColumnId = item.columnId;
      const targetColumnId = column.id;
      
      // 같은 컬럼이면 처리하지 않음
      if (draggedItemColumnId === targetColumnId) {
        return;
      }
      
      // 다른 컬럼으로 이동
      onMoveCard(draggedItemColumnId, targetColumnId, item.index, 0);
      
      // 아이템의 컬럼 ID 업데이트
      item.columnId = targetColumnId;
      item.index = 0;
    },
  });

  return (
    <div
      ref={drop as unknown as React.LegacyRef<HTMLDivElement>}
      className={`flex-1 flex flex-col p-2 rounded-lg bg-gray-100 min-h-[500px] ${
        isOver ? 'border-2 border-blue-400' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2 p-2 bg-white rounded">
        <h3 className="font-bold text-gray-700">{column.title}</h3>
        <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
          {column.cards.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {column.cards.map((card: KanbanCardType, index: number) => (
          <KanbanCard
            key={card.id}
            card={card}
            index={index}
            columnId={column.id}
            onRemoveLabel={onRemoveLabel}
            onAddLabel={onAddLabel}
            labels={labels}
          />
        ))}
        
        {column.cards.length === 0 && (
          <div className="p-3 text-center text-gray-500 italic text-sm">
            카드가 없습니다
          </div>
        )}
      </div>
    </div>
  );
} 