import { KanbanLabel } from '@/types/kanban';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LeaderTagSelectorProps {
  labels: KanbanLabel[];
  selectedLabelIds: number[];
  onSelectLabel: (labelId: number) => void;
  disabled?: boolean;
}

export function LeaderTagSelector({ 
  labels, 
  selectedLabelIds, 
  onSelectLabel, 
  disabled = false 
}: LeaderTagSelectorProps) {
  if (labels.length === 0) {
    return <div className="text-sm text-gray-500">리더 정보가 없습니다</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => (
        <Button
          key={label.id}
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            "transition-all",
            selectedLabelIds.includes(label.id) 
              ? "ring-2 ring-primary" 
              : "",
            label.color
          )}
          onClick={() => onSelectLabel(label.id)}
        >
          {label.name}
        </Button>
      ))}
    </div>
  );
} 