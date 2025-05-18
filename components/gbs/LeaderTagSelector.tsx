import { KanbanLabel } from '@/types/kanban';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

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
    <div className="flex flex-col gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <Button 
            variant="outline" 
            className="w-full max-w-sm flex justify-between items-center"
          >
            <span>
              {selectedLabelIds.length === 0
                ? "리더를 선택하세요"
                : `${selectedLabelIds.length}명의 리더 선택됨`}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[240px] max-h-[300px] overflow-y-auto">
          <DropdownMenuLabel>리더 목록</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {labels.map((label) => (
            <DropdownMenuCheckboxItem
              key={label.id}
              checked={selectedLabelIds.includes(label.id)}
              onSelect={(e) => {
                e.preventDefault();
                onSelectLabel(label.id);
              }}
            >
              <div className="flex items-center gap-2">
                <span className={cn("w-3 h-3 rounded-full", label.color)} />
                <span>{label.name}</span>
              </div>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {selectedLabelIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {labels
            .filter((label) => selectedLabelIds.includes(label.id))
            .map((label) => (
              <Button
                key={label.id}
                variant="outline"
                size="sm"
                className={cn("transition-all", label.color)}
                onClick={() => onSelectLabel(label.id)}
              >
                {label.name}
                <span className="ml-1">×</span>
              </Button>
            ))}
        </div>
      )}
    </div>
  );
} 