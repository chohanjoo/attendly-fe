import api from "@/lib/axios";
import { AttendanceResponse } from "@/types/attendance";
import { ApiPageResponse } from "@/types/api";

/**
 * 특정 GBS의 주차별 출석 데이터 조회 API
 * 
 * @param gbsId - GBS 그룹 ID
 * @param weekStart - 조회할 주차 시작일
 * @returns 출석 데이터 배열
 */
export const fetchAttendanceByWeek = async (gbsId: number | null, weekStart: string) => {
  if (!gbsId) return [];
  
  try {
    const response = await api.get<ApiPageResponse<AttendanceResponse>>('/api/attendance', {
      params: { gbsId, weekStart }
    });
    return response.data.data.items;
  } catch (error) {
    console.error("출석 데이터 조회 중 오류가 발생했습니다:", error);
    return [];
  }
}; 