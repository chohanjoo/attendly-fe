import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { UserDetails, LeaderInfo, GbsInfo } from '../types/profile';

// 유저 세부 정보를 가져오는 hook
export const useUserDetails = () => {
  return useQuery({
    queryKey: ['userDetails'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<UserDetails>>('/auth/me');
      return response.data.data;
    },
    retry: 1,
  });
};

// 리더 목록을 가져오는 함수
export const useLeadersList = (userId: number | undefined, enabled: boolean) => {
  return useQuery({
    queryKey: ['leadersList'],
    queryFn: async () => {
      const response = await api.post<ApiResponse<{ users: UserDetails[] }>>('/api/users/by-roles', {
        roles: ['LEADER']
      });
      
      // 현재 사용자를 제외한 리더 목록 반환
      return response.data.data.users
        .filter(leader => leader.id !== userId)
        .map(leader => ({
          id: leader.id,
          name: leader.name
        }));
    },
    enabled: !!userId && enabled,
  });
};

// 활성 GBS 목록 추출 함수
export const extractActiveGbsList = (leaderHistory: any): GbsInfo[] => {
  if (!leaderHistory || !leaderHistory.histories) {
    return [];
  }
  
  return leaderHistory.histories
    .filter((history: any) => history.isActive)
    .map((history: any) => ({
      id: history.gbsId, 
      name: history.gbsName
    }));
}; 