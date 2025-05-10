import api from "@/lib/axios";
import { toast } from "sonner";
import { VillageStatistics, VillageAttendanceResponse } from "@/types/statistics";
import { UserVillageResponse } from "@/types/user";
import { AttendanceItemRequest } from "@/types/attendance";
import { mockApiRequest } from "@/lib/api-mock";

// 개발 모드 여부 확인 (실제 API 요청 vs 모킹)
const DEV_MODE = process.env.NODE_ENV === 'development';
const USE_MOCK_API = false; // API 실제 구현이 완료되어 모킹 비활성화

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
 * 마을장 권한으로 GBS 출석 데이터 수정 함수
 * @param villageId 마을 ID
 * @param gbsId GBS ID
 * @param weekStart 주차 시작일 (YYYY-MM-DD)
 * @param attendances 출석 데이터 배열
 * @returns 저장된 출석 데이터
 */
export const updateGbsAttendanceByVillageLeader = async (
  villageId: number,
  gbsId: number,
  weekStart: string,
  attendances: AttendanceItemRequest[]
): Promise<any> => {
  try {
    const requestData = {
      gbsId,
      weekStart,
      attendances
    };
    
    // API 스펙에 맞게 요청 전송
    const response = await api.post(`/api/village-leader/${villageId}/attendance`, requestData);
    
    toast.success("출석 데이터가 성공적으로 저장되었습니다.");
    return response.data;
  } catch (error: any) {
    console.error("출석 데이터 수정 중 오류가 발생했습니다:", error);
    
    // 에러 응답 처리
    if (error.response) {
      const status = error.response.status;
      
      if (status === 403) {
        toast.error("권한이 없습니다. 마을장 권한이 필요합니다.");
      } else if (status === 404) {
        toast.error("요청한 GBS 또는 마을을 찾을 수 없습니다.");
      } else if (status === 400) {
        toast.error("잘못된 요청입니다. 입력 데이터를 확인해주세요.");
      } else {
        toast.error("출석 데이터 저장에 실패했습니다.");
      }
    } else {
      toast.error("서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.");
    }
    
    throw error;
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