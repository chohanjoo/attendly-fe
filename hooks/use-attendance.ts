import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { 
  AttendanceResponse, 
  AttendanceBatchRequest, 
  LeaderGbsResponse,
  GbsMembersListResponse,
  LeaderGbsHistoryListResponse
} from "@/types/attendance";

// 리더의 GBS 정보 조회 훅
export const useLeaderGbs = () => {
  return useQuery({
    queryKey: ['leaderGbs'],
    queryFn: async () => {
      const response = await api.get('/api/v1/gbs-members/my-gbs');
      return response.data as LeaderGbsResponse;
    }
  });
};

// GBS 멤버 목록 조회 훅
export const useGbsMembers = (gbsId: number | null) => {
  return useQuery({
    queryKey: ['gbsMembers', gbsId],
    queryFn: async () => {
      const response = await api.get(`/api/v1/gbs-members/${gbsId}`);
      return response.data as GbsMembersListResponse;
    },
    enabled: !!gbsId
  });
};

// GBS 출석 데이터 조회 훅
export const useAttendance = (gbsId: number | null, weekStart: string) => {
  return useQuery({
    queryKey: ['attendance', gbsId, weekStart],
    queryFn: async () => {
      const response = await api.get('/api/attendance', {
        params: { gbsId, weekStart }
      });
      return response.data as AttendanceResponse[];
    },
    enabled: !!gbsId
  });
};

// 출석 데이터 저장 뮤테이션 훅
export const useSaveAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: AttendanceBatchRequest) => {
      try {
        const response = await api.post('/api/attendance', data);
        return response.data;
      } catch (error: any) {
        console.error('출석 저장 오류 상세 정보:', {
          statusCode: error.response?.status,
          message: error.response?.data?.message || error.message,
          errorData: error.response?.data
        });
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.gbsId, variables.weekStart] });
      toast.success("출석 데이터가 성공적으로 저장되었습니다.");
    },
    onError: (error: any) => {
      console.error("출석 데이터 저장 중 오류가 발생했습니다:", error);
      
      // 오류 코드에 따른 메시지 표시
      if (error.response?.status === 403) {
        toast.error("권한이 없습니다. 리더 권한이 필요한 기능입니다.");
      } else if (error.response?.status === 401) {
        toast.error("로그인이 필요합니다. 로그인 후 다시 시도해주세요.");
      } else {
        toast.error(error.response?.data?.message || "출석 데이터 저장에 실패했습니다.");
      }
    }
  });
};

// 리더의 GBS 히스토리 조회 훅
export const useLeaderGbsHistory = (leaderId: number | null) => {
  return useQuery({
    queryKey: ['leaderGbsHistory', leaderId],
    queryFn: async () => {
      const response = await api.get(`/api/v1/gbs-members/leaders/${leaderId}/history`);
      return response.data as LeaderGbsHistoryListResponse;
    },
    enabled: !!leaderId
  });
}; 