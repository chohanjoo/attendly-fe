"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AppShellLayout } from "@/components/layouts/app-shell-layout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck2, Users, BarChart2, MessageSquare } from "lucide-react";
import logger from "@/lib/logger";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [showDiscordDemo, setShowDiscordDemo] = useState(false);

  // 홈 화면 접근 특별 로깅
  useEffect(() => {
    if (user) {
      logger.info(`[홈페이지] ${user.name}님이 홈페이지에 접속했습니다. 역할: ${user.role}`);
    }
  }, [user]);

  // 개발 환경에서만 Discord 데모 표시
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setShowDiscordDemo(true);
    }
  }, []);

  // 사용자 역할에 따라 적절한 페이지로 리다이렉트
  useEffect(() => {
    if (!user) return;

    // 리더는 출석 입력 페이지로 리다이렉트
    if (user.role === "LEADER") {
      logger.info(`리더 권한 사용자(${user.name})를 출석 입력 페이지로 리다이렉트합니다.`);
      router.push("/attendance");
    }
  }, [user, router]);

  // Discord 로그 테스트 함수
  const testDiscordLogs = () => {
    logger.debug("Discord 로그 테스트: DEBUG 레벨 메시지");
    logger.info("Discord 로그 테스트: INFO 레벨 메시지");
    logger.warn("Discord 로그 테스트: WARN 레벨 메시지");
    logger.error("Discord 로그 테스트: ERROR 레벨 메시지", { 
      testError: true, 
      timestamp: new Date().toISOString(),
      user: user || '로그인하지 않음'
    });
  };

  return (
    <AuthLayout>
      <AppShellLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">환영합니다, {user?.name || '게스트'}님!</h1>
            <p className="text-gray-500 mt-1">오늘도 Attendly와 함께 출석 관리를 시작하세요.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 출석 입력 카드 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarCheck2 className="h-5 w-5 text-indigo-500" />
                  출석 입력
                </CardTitle>
                <CardDescription>리더를 위한 GBS 출석 입력</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  GBS 모임 후 참석자의 출석 상태를 기록하세요.
                </p>
                <Button onClick={() => router.push("/attendance")} className="w-full">
                  출석 입력하기
                </Button>
              </CardContent>
            </Card>

            {/* 마을 대시보드 카드 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-500" />
                  마을 대시보드
                </CardTitle>
                <CardDescription>마을장을 위한 출석 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  마을 내 모든 GBS의 출석 현황 및 통계를 확인하세요.
                </p>
                <Button onClick={() => router.push("/village")} className="w-full">
                  마을 관리하기
                </Button>
              </CardContent>
            </Card>

            {/* 통계 보고서 카드 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-indigo-500" />
                  통계 보고서
                </CardTitle>
                <CardDescription>교역자를 위한 출석 통계</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  부서별 출석 통계 및 리포트를 확인하고 다운로드하세요.
                </p>
                <Button onClick={() => router.push("/reports")} className="w-full">
                  통계 보기
                </Button>
              </CardContent>
            </Card>

            {/* Discord 로그 테스트 카드 (개발 모드에서만 표시) */}
            {showDiscordDemo && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-indigo-500" />
                    Discord 로깅 테스트
                  </CardTitle>
                  <CardDescription>개발자를 위한 로깅 테스트</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    모든 로그 레벨을 Discord로 전송하는 테스트를 실행합니다.
                  </p>
                  <Button onClick={testDiscordLogs} className="w-full" variant="outline">
                    로그 테스트 전송
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </AppShellLayout>
    </AuthLayout>
  );
}
