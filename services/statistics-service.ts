import api from "@/lib/axios";
import { toast } from "sonner";
import { VillageStatistics, VillageAttendanceResponse } from "@/types/statistics";
import { UserVillageResponse } from "@/types/user";

/**
 * 현재 사용자의 마을 정보 조회 함수
 * @returns 사용자의 마을 정보
 */
export const fetchUserVillage = async (): Promise<UserVillageResponse | null> => {
  try {
    const response = await api.get('/api/users/my-village');
    return response.data;
  } catch (error) {
    console.error("마을 정보 조회 중 오류가 발생했습니다:", error);
    toast.error("마을 정보를 불러오는데 실패했습니다.");
    return null;
  }
};

/**
 * 마을 출석 통계 조회 함수
 * @param villageId 마을 ID
 * @param startDate 시작일 (YYYY-MM-DD)
 * @param endDate 종료일 (YYYY-MM-DD)
 * @returns 마을 통계 데이터
 */
export const fetchVillageStatistics = async (
  villageId: number,
  startDate: string,
  endDate: string
): Promise<VillageStatistics | null> => {
  try {
    const response = await api.get(`/api/villages/${villageId}/report`, {
      params: { startDate, endDate }
    });
    
    return response.data;
  } catch (error) {
    console.error("마을 통계 조회 중 오류가 발생했습니다:", error);
    toast.error("마을 통계를 불러오는데 실패했습니다.");
    return null;
  }
};

/**
 * 마을 출석 현황 조회 함수
 * @param villageId 마을 ID
 * @param weekStart 주차 시작일 (YYYY-MM-DD)
 * @returns 마을 출석 현황 데이터
 */
export const fetchVillageAttendance = async (
  villageId: number,
  weekStart: string
): Promise<VillageAttendanceResponse | null> => {
  try {
    const response = await api.get(`/api/village/${villageId}/attendance`, {
      params: { weekStart }
    });
    
    return response.data;
  } catch (error) {
    console.error("마을 출석 현황 조회 중 오류가 발생했습니다:", error);
    toast.error("마을 출석 현황을 불러오는데 실패했습니다.");
    return null;
  }
};

/**
 * 현재 날짜로부터 한 달 전 날짜를 YYYY-MM-DD 형식으로 반환
 */
export const getOneMonthAgo = (): string => {
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  return oneMonthAgo.toISOString().split('T')[0];
};

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export const getTodayFormatted = (): string => {
  return new Date().toISOString().split('T')[0];
}; 