import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { VillageStatistics, VillageAttendanceResponse, DepartmentStatistics } from "@/types/statistics";
import { UserVillageResponse } from "@/types/user";
import { AttendanceItemRequest } from "@/types/attendance";
import { ApiResponse } from "@/types/api";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

/**
 * 현재, 사용자의 마을 정보 조회 훅
 */
export const useUserVillage = () => {
  return useQuery({
    queryKey: ['userVillage'],
    queryFn: async () => {
      try {
        const response = await api.get<ApiResponse<UserVillageResponse>>('/api/users/my-village');
        return response.data.data;
      } catch (error) {
        console.error("마을 정보 조회 중 오류가 발생했습니다:", error);
        toast.error("마을 정보를 불러오는데 실패했습니다.");
        throw error;
      }
    }
  });
};

/**
 * 마을 출석 통계 조회 훅
 */
export const useVillageStatistics = (
  villageId: number | null,
  startDate: string,
  endDate: string
) => {
  return useQuery({
    queryKey: ['villageStatistics', villageId, startDate, endDate],
    queryFn: async () => {
      try {
        const response = await api.get<ApiResponse<VillageStatistics>>(
          `/api/villages/${villageId}/report`,
          {
            params: { startDate, endDate }
          }
        );
        return response.data.data;
      } catch (error) {
        console.error("마을 통계 조회 중 오류가 발생했습니다:", error);
        toast.error("마을 통계를 불러오는데 실패했습니다.");
        throw error;
      }
    },
    enabled: !!villageId
  });
};

/**
 * 마을 출석 현황 조회 훅
 */
export const useVillageAttendance = (
  villageId: number | null,
  weekStart: string
) => {
  return useQuery({
    queryKey: ['villageAttendance', villageId, weekStart],
    queryFn: async () => {
      try {
        const response = await api.get<ApiResponse<VillageAttendanceResponse>>(
          `/api/village/${villageId}/attendance`,
          {
            params: { weekStart }
          }
        );
        return response.data.data;
      } catch (error) {
        console.error("마을 출석 현황 조회 중 오류가 발생했습니다:", error);
        toast.error("마을 출석 현황을 불러오는데 실패했습니다.");
        throw error;
      }
    },
    enabled: !!villageId
  });
};

/**
 * 마을장 권한으로 GBS 출석 데이터 수정 훅
 */
export const useUpdateGbsAttendanceByVillageLeader = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      villageId,
      gbsId,
      weekStart,
      attendances
    }: {
      villageId: number;
      gbsId: number;
      weekStart: string;
      attendances: AttendanceItemRequest[];
    }) => {
      const requestData = {
        gbsId,
        weekStart,
        attendances
      };
      
      const response = await api.post<ApiResponse<any>>(
        `/api/village-leader/${villageId}/attendance`,
        requestData
      );
      
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      toast.success("출석 데이터가 성공적으로 저장되었습니다.");
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ['villageAttendance', variables.villageId, variables.weekStart]
      });
      queryClient.invalidateQueries({
        queryKey: ['villageStatistics', variables.villageId]
      });
    },
    onError: (error: any) => {
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
    }
  });
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

/**
 * 부서 통계 데이터 조회 훅
 */
export const useDepartmentStatistics = (
  departmentId: number,
  dateRange: DateRange | undefined
) => {
  return useQuery({
    queryKey: ["departmentStatistics", departmentId, dateRange],
    queryFn: async () => {
      if (!dateRange?.from) {
        throw new Error("날짜를 선택해주세요");
      }

      const startDate = format(dateRange.from, "yyyy-MM-dd");
      const endDate = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : startDate;

      try {
        console.log(`통계 데이터 요청: departmentId=${departmentId}, startDate=${startDate}, endDate=${endDate}`);
        
        // API 경로 테스트 - 백엔드 구현에 따라 수정이 필요할 수 있음
        // 두 가지 경로 모두 시도 (admin, minister)
        let response;
        
        try {
          response = await api.get<ApiResponse<DepartmentStatistics>>(
            `/api/admin/departments/${departmentId}/statistics`,
            {
              params: {
                startDate,
                endDate,
              },
            }
          );
        } catch (adminApiError) {
          console.log("Admin API 호출 실패, minister API 시도:", adminApiError);
          
          // admin API 실패 시 minister API 시도
          response = await api.get<ApiResponse<DepartmentStatistics>>(
            `/api/admin/departments/${departmentId}/statistics`,
            {
              params: {
                startDate,
                endDate,
              },
            }
          );
        }
        
        console.log("통계 응답 데이터:", response.data);
        
        if (!response.data.success) {
          throw new Error(response.data.message || "데이터를 불러오는데 실패했습니다");
        }
        
        return response.data.data;
      } catch (error) {
        console.error("통계 데이터 요청 오류:", error);
        throw error;
      }
    },
    enabled: !!dateRange?.from,
  });
};

/**
 * 부서 통계 엑셀 다운로드 함수
 */
export const downloadDepartmentStatisticsExcel = (
  departmentId: number, 
  dateRange: DateRange | undefined
) => {
  if (!dateRange?.from) {
    toast.error("날짜를 선택해주세요");
    return;
  }

  const startDate = format(dateRange.from, "yyyy-MM-dd");
  const endDate = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : startDate;
  
  window.location.href = `/api/admin/departments/${departmentId}/statistics/download?startDate=${startDate}&endDate=${endDate}&format=xls`;
}; 