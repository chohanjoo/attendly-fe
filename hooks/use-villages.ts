import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { ApiResponse } from "@/types/api";

// 타입 정의
export interface Village {
  id: number
  name: string
  departmentId: number
  departmentName: string
  villageLeaderId?: number
  villageLeaderName?: string
  createdAt: string
  updatedAt: string
}

export interface VillagePageResponse {
  items: Village[]
  totalCount: number
  hasMore: boolean
}

export interface VillageCreateRequest {
  name: string
  departmentId: number
  villageLeaderId?: number
}

export interface VillageUpdateRequest {
  name: string
  departmentId: number
}

export interface VillageLeaderAssignRequest {
  userId: number
  villageId: number
  startDate: string
  endDate?: string
}

// 마을 목록 조회 훅
export const useVillages = (departmentId?: number, name?: string, page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: ["admin", "villages", departmentId, name, page, size],
    queryFn: async () => {
      const params: Record<string, any> = { page, size }
      if (departmentId) params.departmentId = departmentId
      if (name) params.name = name

      const response = await api.get<ApiResponse<VillagePageResponse>>("/api/admin/organization/villages", {
        params
      });
      return response.data.data;
    },
  });
};

// 특정 마을 조회 훅
export const useVillage = (villageId: string | number) => {
  return useQuery({
    queryKey: ["admin", "village", villageId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Village>>(`/api/admin/organization/villages/${villageId}`);
      return response.data.data;
    },
    enabled: !!villageId,
  });
};

// 마을 생성 훅
export const useCreateVillage = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (values: VillageCreateRequest) => {
      return api.post("/api/admin/organization/villages", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "villages"] });
      toast.success("마을이 성공적으로 생성되었습니다.");
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      console.error("마을 생성 중 오류 발생:", error);
      toast.error(error.response?.data?.message || "마을 생성에 실패했습니다.");
    },
  });
};

// 마을 수정 훅
export const useUpdateVillage = (villageId: string | number, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (values: VillageUpdateRequest) => {
      return api.put(`/api/admin/organization/villages/${villageId}`, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "villages"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "village", villageId] });
      toast.success("마을 정보가 업데이트되었습니다.");
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      console.error("마을 정보 업데이트 중 오류 발생:", error);
      toast.error(error.response?.data?.message || "마을 정보 업데이트에 실패했습니다.");
    },
  });
};

// 마을장 지정 훅
export const useAssignVillageLeader = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (values: VillageLeaderAssignRequest) => {
      return api.post("/api/admin/village-leader", values);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "villages"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "village", variables.villageId] });
      toast.success("마을장이 성공적으로 지정되었습니다.");
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      console.error("마을장 지정 중 오류 발생:", error);
      toast.error(error.response?.data?.message || "마을장 지정에 실패했습니다.");
    },
  });
};

// 마을장 해제 훅
export const useTerminateVillageLeader = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (villageId: number) => {
      return api.delete(`/api/admin/village-leader/${villageId}`);
    },
    onSuccess: (_, villageId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "villages"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "village", villageId] });
      toast.success("마을장이 해제되었습니다.");
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      console.error("마을장 해제 중 오류 발생:", error);
      toast.error(error.response?.data?.message || "마을장 해제에 실패했습니다.");
    },
  });
}; 