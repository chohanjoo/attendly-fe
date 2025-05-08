// 사용자 마을 정보 응답 타입
export interface UserVillageResponse {
  userId: number;
  userName: string;
  villageId: number;
  villageName: string;
  departmentId: number;
  departmentName: string;
  isVillageLeader: boolean;
} 