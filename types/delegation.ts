// 리더 위임 응답 타입 정의
export interface LeaderDelegationResponse {
  id: number;
  delegatorId: number;
  delegatorName: string;
  delegateeId: number;
  delegateeName: string;
  gbsGroupId: number;
  gbsGroupName: string;
  startDate: string;
  endDate?: string;
}

// 리더 위임 생성 요청 타입 정의
export interface DelegationCreateRequest {
  delegatorId: number;
  delegateId: number;
  gbsGroupId: number;
  startDate: string;
  endDate: string;
} 