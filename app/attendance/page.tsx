"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AppShellLayout } from "@/components/layouts/app-shell-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck2 } from "lucide-react";
import logger from "@/lib/logger";

export default function AttendancePage() {
  const { user } = useAuth();
  
  // 출석 페이지 접근 로깅
  useEffect(() => {
    if (user) {
      logger.info(`[출석페이지] ${user.name}님이 출석 페이지에 접속했습니다. 역할: ${user.role}`);
    }
  }, [user]);

  return (
    <AuthLayout>
      <AppShellLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">출석 입력</h1>
            <p className="text-gray-500 mt-1">GBS 모임 참석자의 출석 상태를 기록하세요.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarCheck2 className="h-5 w-5 text-indigo-500" />
                이번 주 출석 입력
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                현재 출석 입력 기능이 개발 중입니다. 곧 사용하실 수 있습니다.
              </p>
              <Button className="w-full">
                출석 입력 시작하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShellLayout>
    </AuthLayout>
  );
} 