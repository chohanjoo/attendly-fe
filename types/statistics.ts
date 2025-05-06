// 주별 통계 타입 정의
export interface WeeklyStatistics {
  weekStart: string;
  totalMembers: number;
  attendedMembers: number;
  attendanceRate: number;
  averageQtCount: number;
}

// GBS 출석 통계 타입 정의
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

// 마을 출석 통계 타입 정의
export interface VillageStatistics {
  villageId: number;
  villageName: string;
  gbsStats: GbsStatistics[];
  totalMembers: number;
  attendedMembers: number;
  attendanceRate: number;
  averageQtCount: number;
}

// 부서 출석 통계 타입 정의
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