// 출석 데이터 타입 정의
export interface AttendanceResponse {
  id: number;
  memberId: number;
  memberName: string;
  weekStart: string;
  worship: 'O' | 'X';
  qtCount: number;
  ministry: 'A' | 'B' | 'C';
}

// 출석 입력 타입 정의
export interface AttendanceItemRequest {
  memberId: number;
  worship: 'O' | 'X';
  qtCount: number;
  ministry: 'A' | 'B' | 'C';
}

export interface AttendanceBatchRequest {
  gbsId: number;
  weekStart: string;
  attendances: AttendanceItemRequest[];
}

// 리더 GBS 응답 타입 정의
export interface LeaderGbsResponse {
  gbsId: number;
  gbsName: string;
  villageId: number;
  villageName: string;
  leaderId: number;
  leaderName: string;
  startDate: string;
}

// GBS 멤버 응답 타입 정의
export interface GbsMemberResponse {
  id: number;
  name: string;
  email?: string;
  birthDate?: string;
  joinDate: string;
  phoneNumber?: string;
}

// GBS 멤버 목록 응답 타입 정의
export interface GbsMembersListResponse {
  gbsId: number;
  gbsName: string;
  memberCount: number;
  members: GbsMemberResponse[];
}

// 리더 GBS 히스토리 응답 타입 정의
export interface LeaderGbsHistoryResponse {
  historyId: number;
  gbsId: number;
  gbsName: string;
  villageId: number;
  villageName: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  members: GbsMemberResponse[];
}

// 리더 GBS 히스토리 리스트 응답 타입 정의
export interface LeaderGbsHistoryListResponse {
  leaderId: number;
  leaderName: string;
  historyCount: number;
  histories: LeaderGbsHistoryResponse[];
}

// 이번달 출석 통계 타입 정의
export interface MonthlyAttendance {
  memberId: number;
  memberName: string;
  attendances: {
    weekStart: string;
    worship: 'O' | 'X';
    qtCount: number;
    ministry: 'A' | 'B' | 'C';
  }[];
} 