import { KanbanLabel } from '@/types/kanban';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tag } from 'lucide-react';

interface LabelSelectorProps {
  labels: KanbanLabel[];
  onSelectLabel: (labelId: number) => void;
  cardId?: string;
  disabled?: boolean;
}

export function LabelSelector({ labels, onSelectLabel, disabled = false }: LabelSelectorProps) {
  if (labels.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled className="w-full">
        <Tag size={16} className="mr-2" />
        <span>리더 없음</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button variant="outline" size="sm" className="w-full">
          <Tag size={16} className="mr-2" />
          <span>리더 선택</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {labels.map((label) => (
          <DropdownMenuItem 
            key={label.id}
            onClick={() => onSelectLabel(label.id)}
          >
            <div className="flex items-center">
              <div 
                className={`w-3 h-3 rounded-full mr-2 ${label.color.split(' ')[0]}`} 
              />
              <span>{label.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 