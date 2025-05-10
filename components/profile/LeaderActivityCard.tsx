import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart3, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GbsMembersModal } from "./GbsMembersModal";
import { DelegationForm } from "./DelegationForm";
import { DelegationStatus } from "./DelegationStatus";
import { GbsHistory } from "./GbsHistory";
import { LeaderInfo, GbsInfo } from "../../types/profile";

interface LeaderActivityCardProps {
  userId: number;
  availableLeaders: LeaderInfo[];
  userGbsList: GbsInfo[];
  isLeadersLoading: boolean;
  onDelegationSuccess: () => void;
  leaderHistory: any; // 타입 정의 필요
}

export const LeaderActivityCard = ({
  userId,
  availableLeaders,
  userGbsList,
  isLeadersLoading,
  onDelegationSuccess,
  leaderHistory
}: LeaderActivityCardProps) => {
  return (
    <Card className="md:col-span-3 mt-6">
      <CardHeader>
        <CardTitle>리더 활동 정보</CardTitle>
        <CardDescription>리더로서의 활동 및 담당 GBS 정보</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center">
            <Users className="h-12 w-12 text-indigo-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">담당 GBS 관리</h3>
            <p className="text-gray-500 text-center mb-4">담당하고 있는 GBS의 멤버와 출석 정보를 확인하세요.</p>
            <GbsMembersModal leaderHistory={leaderHistory} />
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center">
            <BarChart3 className="h-12 w-12 text-indigo-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">출석 통계</h3>
            <p className="text-gray-500 text-center mb-4">담당 GBS의 출석 통계와 추이를 확인하세요.</p>
            <Link href="/gbs/statistics">
              <Button variant="outline" className="w-full">출석 통계 확인</Button>
            </Link>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center">
            <UserPlus className="h-12 w-12 text-indigo-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">리더 위임 관리</h3>
            <p className="text-gray-500 text-center mb-4">출석 입력을 다른 리더에게 위임하세요.</p>
            <DelegationForm 
              userId={userId}
              availableLeaders={availableLeaders}
              userGbsList={userGbsList}
              isLeadersLoading={isLeadersLoading}
              onSuccess={onDelegationSuccess}
            />
          </div>
        </div>

        {/* 리더 위임 섹션 */}
        <DelegationStatus userId={userId} />

        {/* GBS 히스토리 섹션 */}
        <GbsHistory userId={userId} />
      </CardContent>
    </Card>
  );
}; 