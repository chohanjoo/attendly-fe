export interface KanbanCard {
  id: number;
  userId: number;
  userName: string;
  birthDate?: string;
  labels: KanbanLabel[];
}

export interface KanbanLabel {
  id: number;
  name: string;
  leaderId: number;
  color: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

export interface DragItem {
  type: string;
  id: string;
  columnId: string;
  index: number;
  cardId: number;
}

export interface GbsAssignment {
  gbsId: number;
  gbsName: string;
  leaderId: number;
  leaderName: string;
  memberIds: number[];
  villageId: number;
  termStartDate: string;
  termEndDate: string;
}

export interface SaveAssignmentRequest {
  villageId: number;
  termStartDate: string;
  termEndDate: string;
  assignments: GbsAssignment[];
} 