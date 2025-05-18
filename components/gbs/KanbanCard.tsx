import { useDrag } from 'react-dnd';
import { X, Tag } from 'lucide-react';
import { KanbanCard as KanbanCardType, KanbanLabel } from '@/types/kanban';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import React from 'react';

interface KanbanCardProps {
  card: KanbanCardType;
  columnId: string;
  index: number;
  onRemoveLabel: (cardId: string, labelId: number) => void;
  onAddLabel?: (cardId: string, labelId: number) => void;
  labels?: KanbanLabel[];
}

export function KanbanCard({ 
  card, 
  columnId, 
  index, 
  onRemoveLabel,
  onAddLabel,
  labels = []
}: KanbanCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'CARD',
    item: { 
      type: 'CARD', 
      id: card.id, 
      columnId, 
      index,
      cardId: card.id
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // 이미 할당된 라벨 ID들
  const assignedLabelIds = card.labels.map(label => label.id);

  return (
    <div
      ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
      className={`p-3 mb-2 bg-white rounded-lg shadow border border-gray-200 cursor-move ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-medium">{card.userName}</div>
          
          {card.birthDate && (
            <div className="text-xs text-gray-500 mt-1">
              생년월일: {new Date(card.birthDate).toLocaleDateString()}
            </div>
          )}
        </div>
        
        {onAddLabel && labels.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1 hover:bg-gray-100 rounded-full">
              <Tag size={14} className="text-gray-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto">
              {labels.map((label) => (
                <DropdownMenuItem 
                  key={label.id}
                  onClick={() => {
                    if (!assignedLabelIds.includes(label.id)) {
                      onAddLabel(card.id.toString(), label.id);
                    }
                  }}
                  disabled={assignedLabelIds.includes(label.id)}
                >
                  <div className="flex items-center">
                    <div 
                      className={`w-3 h-3 rounded-full mr-2 ${label.color.split(' ')[0]}`} 
                    />
                    <span>{label.name}</span>
                    {assignedLabelIds.includes(label.id) && <span className="ml-2 text-xs text-gray-500">✓</span>}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {card.labels.map((label) => (
            <LabelBadge 
              key={label.id} 
              label={label} 
              onRemove={() => onRemoveLabel(card.id.toString(), label.id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface LabelBadgeProps {
  label: KanbanLabel;
  onRemove: () => void;
}

function LabelBadge({ label, onRemove }: LabelBadgeProps) {
  return (
    <div className={`flex items-center text-xs px-2 py-1 rounded-full ${label.color} border`}>
      <span>{label.name}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-1 p-0.5 hover:bg-gray-100 rounded-full"
      >
        <X size={10} />
      </button>
    </div>
  );
} 