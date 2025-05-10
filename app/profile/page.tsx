"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShellLayout } from "@/components/layouts/app-shell-layout";
import api from "@/lib/axios";
import { useLeaderGbsHistory } from "@/hooks/use-attendance";
import { useActiveDelegations } from "@/hooks/use-delegation";
import { UserDetails, LeaderInfo, GbsInfo } from "../../types/profile";
import { ProfileCard } from "../../components/profile/ProfileCard";
import { ProfileDetailTabs } from "../../components/profile/ProfileDetailTabs";
import { LeaderActivityCard } from "../../components/profile/LeaderActivityCard";

export default function ProfilePage() {
  const { user } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableLeaders, setAvailableLeaders] = useState<LeaderInfo[]>([]);
  const [userGbsList, setUserGbsList] = useState<GbsInfo[]>([]);
  const [isLeadersLoading, setIsLeadersLoading] = useState(false);
  
  // 현재 위임 상태 가져오기
  const { refetch: refetchDelegations } = useActiveDelegations(userDetails?.id || null);
  
  // 리더 히스토리 데이터 가져오기
  const { data: leaderHistory } = useLeaderGbsHistory(
    userDetails?.id && (userDetails.role === "LEADER" || userDetails.role === "VILLAGE_LEADER" || userDetails.role === "MINISTER" || userDetails.role === "ADMIN") 
      ? userDetails.id 
      : null
  );

  // 사용자 세부 정보 가져오기
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const response = await api.get("/auth/me");
        setUserDetails(response.data);
      } catch (err) {
        console.error("사용자 정보를 가져오는 중 오류가 발생했습니다:", err);
        setError("사용자 정보를 가져오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [user]);

  // 리더 목록 및 GBS 목록 가져오기
  useEffect(() => {
    const fetchLeadersAndGbs = async () => {
      if (!userDetails) return;
      if (!(userDetails.role === "LEADER" || userDetails.role === "VILLAGE_LEADER" || userDetails.role === "MINISTER" || userDetails.role === "ADMIN")) return;

      try {
        setIsLeadersLoading(true);
        
        // 리더 목록 가져오기
        const leadersResponse = await api.post("/api/users/by-roles", {
          roles: ["LEADER"]
        });
        
        const leaders = leadersResponse.data.users
          .filter((leader: any) => leader.id !== userDetails.id)
          .map((leader: any) => ({
            id: leader.id,
            name: leader.name
          }));
        
        setAvailableLeaders(leaders);
        
        // 리더의 GBS 목록 가져오기
        if (leaderHistory && leaderHistory.histories) {
          const activeGbsList = leaderHistory.histories
            .filter(history => history.isActive)
            .map(history => ({
              id: history.gbsId,
              name: history.gbsName
            }));
          
          setUserGbsList(activeGbsList);
        }
      } catch (err) {
        console.error("리더 및 GBS 정보를 가져오는 중 오류가 발생했습니다:", err);
      } finally {
        setIsLeadersLoading(false);
      }
    };

    fetchLeadersAndGbs();
  }, [userDetails, leaderHistory]);

  if (isLoading) {
    return (
      <AppShellLayout>
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </AppShellLayout>
    );
  }

  if (error || !userDetails) {
    return (
      <AppShellLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
          <Info className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">정보를 불러올 수 없습니다</h2>
          <p className="text-gray-600">{error || "사용자 정보를 찾을 수 없습니다."}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            다시 시도
          </Button>
        </div>
      </AppShellLayout>
    );
  }

  return (
    <AppShellLayout>
      <div className="space-y-6 max-w-4xl mx-auto py-6">
        <div>
          <h1 className="text-3xl font-bold">내 프로필</h1>
          <p className="text-gray-500 mt-1">내 계정 정보와 활동 내역을 확인하세요.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 프로필 요약 카드 */}
          <ProfileCard userDetails={userDetails} />
          
          {/* 상세 정보 탭 */}
          <ProfileDetailTabs userDetails={userDetails} />
        </div>

        {/* 리더 정보 카드 (리더인 경우만 표시) */}
        {(userDetails.role === "LEADER" || userDetails.role === "VILLAGE_LEADER" || userDetails.role === "MINISTER" || userDetails.role === "ADMIN") && (
          <LeaderActivityCard 
            userId={userDetails.id}
            availableLeaders={availableLeaders}
            userGbsList={userGbsList}
            isLeadersLoading={isLeadersLoading}
            onDelegationSuccess={refetchDelegations}
            leaderHistory={leaderHistory}
          />
        )}
      </div>
    </AppShellLayout>
  );
} 