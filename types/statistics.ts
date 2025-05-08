// 주차별 통계 타입
export interface WeeklyStatistics {
  weekStart: string;
  totalMembers: number;
  attendedMembers: number;
  attendanceRate: number;
  averageQtCount: number;
}

// GBS 통계 타입
export interface GbsStatistics {
  gbsId: number;
  gbsName: string;
  leaderName: string;
  totalMembers: number;
  attendedMembers: number;
  attendanceRate: number;
  averageQtCount: number;
  weeklyStats: WeeklyStatistics[];
}

// 마을 통계 타입
export interface VillageStatistics {
  villageId: number;
  villageName: string;
  gbsStats: GbsStatistics[];
  totalMembers: number;
  attendedMembers: number;
  attendanceRate: number;
  averageQtCount: number;
}

// GBS 출석 요약
export interface GbsAttendanceSummary {
  gbsId: number;
  gbsName: string;
  leaderName: string;
  totalMembers: number;
  attendedMembers: number;
  attendanceRate: number;
  memberAttendances: AttendanceResponse[];
}

// 마을 출석 현황 응답
export interface VillageAttendanceResponse {
  villageId: number;
  villageName: string;
  weekStart: string;
  gbsAttendances: GbsAttendanceSummary[];
}

// 아래는 통계 API에 필요한 요청 타입
export interface StatisticsDateRange {
  startDate: string;
  endDate: string;
}

// 부서 통계
export interface DepartmentStatistics {
  departmentId: number;
  departmentName: string;
  startDate: string;
  endDate: string;
  villageStats: VillageStatistics[];
  totalMembers: number;
  attendedMembers: number;
  attendanceRate: number;
  averageQtCount: number;
}

// AttendanceResponse 타입을 함께 정의 (중복 방지용)
export interface AttendanceResponse {
  id: number;
  memberId: number;
  memberName: string;
  weekStart: string;
  worship: 'O' | 'X';
  qtCount: number;
  ministry: 'A' | 'B' | 'C';
} 