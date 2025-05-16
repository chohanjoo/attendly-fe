import { useDrag } from 'react-dnd';
import { X } from 'lucide-react';
import { KanbanCard as KanbanCardType, KanbanLabel } from '@/types/kanban';

interface KanbanCardProps {
  card: KanbanCardType;
  columnId: string;
  index: number;
  onRemoveLabel: (cardId: string, labelId: number) => void;
}

export function KanbanCard({ card, columnId, index, onRemoveLabel }: KanbanCardProps) {
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

  return (
    <div
      ref={drag}
      className={`p-3 mb-2 bg-white rounded-lg shadow border border-gray-200 cursor-move ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="text-sm font-medium">{card.userName}</div>
      
      {card.birthDate && (
        <div className="text-xs text-gray-500 mt-1">
          생년월일: {new Date(card.birthDate).toLocaleDateString()}
        </div>
      )}
      
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
        className="ml-1 p-0.5 hover:bg-gray-200 rounded-full"
      >
        <X size={10} />
      </button>
    </div>
  );
} 