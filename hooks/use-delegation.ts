import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { 
  LeaderDelegationResponse, 
  DelegationCreateRequest 
} from "@/types/delegation";
import { ApiResponse, ApiPageResponse } from "@/types/api";

// 활성화된 위임 조회 훅
export const useActiveDelegations = (userId: number | null, date?: string) => {
  return useQuery({
    queryKey: ['activeDelegations', userId, date],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (userId) {
        params.append('userId', userId.toString());
      }
      
      if (date) {
        params.append('date', date);
      }
      
      const response = await api.get<ApiPageResponse<LeaderDelegationResponse>>(`/api/delegations/active?${params.toString()}`);
      return response.data.data.items;
    },
    enabled: !!userId
  });
};

// 위임받은 GBS 목록 조회 훅
export const useDelegatedGbs = (userId: number | null, date?: string) => {
  return useQuery({
    queryKey: ['delegatedGbs', userId, date],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (userId) {
        params.append('userId', userId.toString());
      }
      
      if (date) {
        params.append('date', date);
      }
      
      const response = await api.get<ApiPageResponse<LeaderDelegationResponse>>(`/api/delegations/active?${params.toString()}`);
      // 리더가 위임받은 GBS만 필터링 (delegateeId가 현재 사용자인 것만)
      return response.data.data.items.filter((delegation: LeaderDelegationResponse) => 
        delegation.delegateeId === userId
      );
    },
    enabled: !!userId
  });
};

// 위임 생성 뮤테이션 훅
export const useCreateDelegation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: DelegationCreateRequest) => {
      const response = await api.post<ApiResponse<LeaderDelegationResponse>>('/api/delegations', data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activeDelegations', variables.delegatorId] });
      toast.success("리더 위임이 성공적으로 생성되었습니다.");
    },
    onError: (error: any) => {
      console.error("리더 위임 생성 중 오류가 발생했습니다:", error);
      toast.error(error.response?.data?.message || "리더 위임 생성에 실패했습니다.");
    }
  });
}; 