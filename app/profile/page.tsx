"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShellLayout } from "@/components/layouts/app-shell-layout";
import { useLeaderGbsHistory } from "@/hooks/use-attendance";
import { useActiveDelegations } from "@/hooks/use-delegation";
import { UserDetails, LeaderInfo, GbsInfo } from "../../types/profile";
import { ProfileCard } from "../../components/profile/ProfileCard";
import { ProfileDetailTabs } from "../../components/profile/ProfileDetailTabs";
import { LeaderActivityCard } from "../../components/profile/LeaderActivityCard";
import { useUserDetails, useLeadersList, extractActiveGbsList } from "@/hooks/use-profile";

export default function ProfilePage() {
  const { user } = useAuth();
  const [userGbsList, setUserGbsList] = useState<GbsInfo[]>([]);
  
  // 사용자 세부 정보 가져오기
  const { data: userDetails, isLoading, error: userError } = useUserDetails();
  
  // 현재 위임 상태 가져오기
  const { refetch: refetchDelegations } = useActiveDelegations(userDetails?.id || null);
  
  // 리더 히스토리 데이터 가져오기
  const isLeaderOrHigher = userDetails?.role === "LEADER" || 
                         userDetails?.role === "VILLAGE_LEADER" || 
                         userDetails?.role === "MINISTER" || 
                         userDetails?.role === "ADMIN";
  
  const { data: leaderHistory } = useLeaderGbsHistory(
    userDetails?.id && isLeaderOrHigher ? userDetails.id : null
  );

  // 리더 목록 가져오기
  const { data: availableLeaders = [], isLoading: isLeadersLoading } = useLeadersList(
    userDetails?.id,
    !!userDetails && isLeaderOrHigher
  );

  // GBS 목록 설정
  useEffect(() => {
    if (leaderHistory) {
      setUserGbsList(extractActiveGbsList(leaderHistory));
    }
  }, [leaderHistory]);

  if (isLoading) {
    return (
      <AppShellLayout>
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </AppShellLayout>
    );
  }

  if (userError || !userDetails) {
    return (
      <AppShellLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
          <Info className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">정보를 불러올 수 없습니다</h2>
          <p className="text-gray-600">{userError instanceof Error ? userError.message : "사용자 정보를 찾을 수 없습니다."}</p>
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
        {isLeaderOrHigher && (
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