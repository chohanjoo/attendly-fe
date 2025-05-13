import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { z } from "zod";
import { ApiResponse } from "@/types/api";

export const userFormSchema = z.object({
  name: z.string().min(2, { message: "이름은 2글자 이상이어야 합니다." }),
  email: z.string().email({ message: "유효한 이메일 주소를 입력해주세요." }),
  role: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

export type User = {
  id: number
  name: string
  email: string
  role: string
  status: "ACTIVE" | "INACTIVE" | "PENDING"
  createdAt: string
}

export type UserResponse = {
  id: number
  name: string
  email: string
  phoneNumber?: string
  role: string
  departmentId: number
  departmentName: string
  birthDate?: string
  createdAt: string
  updatedAt: string
}

export const useUsers = (page: number, size: number, name: string, departmentId?: number, roles?: string[]) => {
  return useQuery({
    queryKey: ["admin", "users", page, size, name, departmentId, roles],
    queryFn: async () => {
      const response = await api.get("/api/admin/users", {
        params: { 
          page, 
          size, 
          name,
          departmentId,
          ...(roles && roles.length > 0 ? { roles } : {})
        },
        paramsSerializer: {
          indexes: null // 배열을 roles=LEADER&roles=MEMBER 형식으로 직렬화
        }
      });
      return response.data.data;
    },
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["admin", "user", id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<UserResponse>>(`/api/admin/users/${id}`);
      return response.data.data;
    },
  });
};

export const useUpdateUser = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (values: UserFormValues) => {
      return api.put(`/api/admin/users/${id}`, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "user", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("사용자 정보가 업데이트되었습니다.");
    },
    onError: (error: any) => {
      console.error("사용자 정보 업데이트 중 오류 발생:", error);
      toast.error(error.response?.data?.message || "사용자 정보 업데이트에 실패했습니다.");
    },
  });
};

export const useDeleteUser = (id: string, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => {
      return api.delete(`/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("사용자가 삭제되었습니다.");
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      console.error("사용자 삭제 중 오류 발생:", error);
      toast.error(error.response?.data?.message || "사용자 삭제에 실패했습니다.");
    },
  });
};

export type UserCreateValues = {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  birthDate?: string;
  departmentId: number;
};

export const useCreateUser = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (values: UserCreateValues) => {
      return api.post("/api/admin/users", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("사용자가 생성되었습니다.");
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      console.error("사용자 생성 중 오류 발생:", error);
      toast.error(error.response?.data?.message || "사용자 생성에 실패했습니다.");
    },
  });
}; 