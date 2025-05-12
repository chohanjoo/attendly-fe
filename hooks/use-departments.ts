import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";

export type Department = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type DepartmentResponse = {
  items: Department[];
  totalCount: number;
  hasMore: boolean;
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ["admin", "departments"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DepartmentResponse>>("/api/admin/organization/departments");
      return response.data.data;
    },
  });
}; 