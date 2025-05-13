import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { ApiResponse, PageResponse } from "@/types/api";

// 관리자용 출석 타입 정의
export type AttendanceRecord = {
  id: number;
  userId: number;
  userName: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  eventType: string;
  note?: string;
}

export type AdminAttendanceResponse = {
  records: AttendanceRecord[];
  totalPages: number;
  currentPage: number;
  totalElements: number;
}

// 관리자 출석 데이터 조회 함수
export const fetchAttendance = async (
  page: number, 
  size: number, 
  search: string,
  startDate?: string,
  endDate?: string,
  status?: string
) => {
  const response = await api.get<ApiResponse<AdminAttendanceResponse>>("/api/admin/attendance", {
    params: { page, size, search, startDate, endDate, status },
  });
  return response.data.data;
};

// 관리자 출석 데이터 조회 훅
export const useAdminAttendance = (
  page: number, 
  limit: number, 
  search: string,
  startDate?: string,
  endDate?: string,
  status?: string
) => {
  return useQuery({
    queryKey: [
      "admin", 
      "attendance", 
      page, 
      limit, 
      search, 
      startDate,
      endDate,
      status
    ],
    queryFn: () => fetchAttendance(
      page, 
      limit, 
      search,
      startDate,
      endDate,
      status
    ),
  });
}; 