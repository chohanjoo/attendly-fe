"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AppShellLayout } from "@/components/layouts/app-shell-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck2, Calendar, Users, UserCog, Clock } from "lucide-react";
import logger from "@/lib/logger";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/attendance-utils";
import { useAttendanceManager } from "@/hooks/use-attendance-manager";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LeaderDelegationResponse } from "@/types/delegation";

// 출석 관련 컴포넌트 import
import GbsMembersTable from "@/components/attendance/GbsMembersTable";
import WeeklyAttendanceTable from "@/components/attendance/WeeklyAttendanceTable";
import MonthlyAttendanceTable from "@/components/attendance/MonthlyAttendanceTable";
import AttendanceInputModal from "@/components/attendance/AttendanceInputModal";

export default function AttendancePage() {
  const { user } = useAuth();
  const {
    weekStart,
    openModal,
    setOpenModal,
    activeTab,
    setActiveTab,
    monthlyData,
    isMonthlyLoading,
    gbsMembers,
    isMembersLoading,
    membersError,
    attendances,
    isLoading,
    error,
    isPending,
    attendanceInputs,
    attendanceExists,
    handleInputChange,
    toggleWorship,
    handleStartAttendanceInput,
    handleSaveAttendance,
    handleFetchMonthlyAttendance,
    getMemberNameMap,
    leaderGbs,
    delegatedGbsList,
    isDelegatedGbsLoading,
    selectedDelegation,
    handleDelegationSelect
  } = useAttendanceManager();
  
  // 출석 페이지 접근 로깅
  useEffect(() => {
    if (user) {
      logger.info(`[출석페이지] ${user.name}님이 출석 페이지에 접속했습니다. 역할: ${user.role}`);
    }
  }, [user]);

  // 멤버 이름 매핑
  const memberNames = getMemberNameMap();

  // 현재 선택된 GBS 정보
  const currentGbsInfo = selectedDelegation 
    ? `${selectedDelegation.gbsGroupName} (${selectedDelegation.delegatorName}님의 GBS)` 
    : leaderGbs?.gbsName 
    ? `${leaderGbs.gbsName} (내 GBS)` 
    : "GBS 정보 로딩 중...";

  return (
    <AuthLayout>
      <AppShellLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold">출석 입력</h1>
            <p className="text-gray-500 mt-1">GBS 모임 참석자의 출석 상태를 기록하세요.</p>
          </div>

          {/* 위임된 GBS 선택 섹션 */}
          {delegatedGbsList && delegatedGbsList.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-indigo-500" />
                  위임받은 GBS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertTitle>현재 선택된 GBS</AlertTitle>
                    <AlertDescription>
                      {currentGbsInfo}
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium">
                      GBS 선택
                    </label>
                    <Select 
                      onValueChange={(value) => {
                        if (value === "my") {
                          handleDelegationSelect(null);
                        } else {
                          const delegation = delegatedGbsList.find(d => d.id.toString() === value);
                          if (delegation) {
                            handleDelegationSelect(delegation);
                          }
                        }
                      }}
                      defaultValue="my"
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="GBS 선택하기" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="my">내 GBS</SelectItem>
                        {delegatedGbsList.map((delegation) => (
                          <SelectItem key={delegation.id} value={delegation.id.toString()}>
                            {delegation.gbsGroupName} ({delegation.delegatorName}님의 GBS)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {delegatedGbsList.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">※ 위임받은 GBS의 출석도 입력하실 수 있습니다.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-500" />
                주간 선택
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <p className="text-sm">현재 선택된 주간: {formatDate(weekStart)}</p>
                {/* 여기에 주간 선택 컴포넌트를 추가할 수 있습니다 */}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                GBS 멤버 목록
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GbsMembersTable 
                isLoading={isMembersLoading}
                error={membersError}
                gbsMembers={gbsMembers}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarCheck2 className="h-5 w-5 text-indigo-500" />
                GBS 출석 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="weekly">주간 출석</TabsTrigger>
                  <TabsTrigger value="monthly">이번달 출석</TabsTrigger>
                </TabsList>
                
                <TabsContent value="weekly">
                  <WeeklyAttendanceTable
                    isLoading={isLoading}
                    error={error}
                    attendances={attendances}
                    onStartAttendanceInput={handleStartAttendanceInput}
                    hasMembersToShow={!isMembersLoading && !!gbsMembers && gbsMembers.memberCount > 0}
                  />
                </TabsContent>
                
                <TabsContent value="monthly">
                  <MonthlyAttendanceTable
                    isLoading={isMonthlyLoading}
                    monthlyData={monthlyData}
                    onFetchData={handleFetchMonthlyAttendance}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* 출석 입력 모달 */}
        <AttendanceInputModal
          open={openModal}
          onOpenChange={setOpenModal}
          weekStart={weekStart}
          attendanceInputs={attendanceInputs}
          attendanceExists={attendanceExists}
          memberNames={memberNames}
          onInputChange={handleInputChange}
          onToggleWorship={toggleWorship}
          onSave={handleSaveAttendance}
          isPending={isPending}
          selectedDelegation={selectedDelegation}
          gbsName={leaderGbs?.gbsName}
        />
      </AppShellLayout>
    </AuthLayout>
  );
} 