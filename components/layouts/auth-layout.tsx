"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import logger from "@/lib/logger";

interface AuthLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

/**
 * 인증 관련 레이아웃 컴포넌트
 * requireAuth: true - 인증이 필요한 페이지 (로그인 필요)
 * requireAuth: false - 인증이 필요 없는 페이지 (로그인/회원가입 페이지)
 */
export function AuthLayout({ children, requireAuth = true }: AuthLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // 화면에 접근할 때마다 유저 정보 로깅
  useEffect(() => {
    if (!isLoading) {
      logger.logUserInfo(user);
    }
  }, [user, isLoading]);

  useEffect(() => {
    // 로딩 중이면 리다이렉트하지 않음
    if (isLoading) return;

    // 인증이 필요한 페이지인데 로그인되지 않은 경우
    if (requireAuth && !user) {
      console.log("인증이 필요한 페이지인데 로그인되지 않았습니다. 로그인 페이지로 이동합니다.");
      router.push("/login");
      return;
    }
    
    // 이미 로그인되어 있는데 로그인/회원가입 페이지로 접근한 경우
    if (!requireAuth && user) {
      console.log("이미 로그인되어 있습니다. 메인 페이지로 이동합니다.");
      router.push("/");
      return;
    }
  }, [user, isLoading, requireAuth, router]);

  // 로딩 중인 경우 로딩 표시
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // 인증이 필요 없는 페이지(로그인, 회원가입)는 항상 보여줌
  if (!requireAuth) {
    return <>{children}</>;
  }

  // 인증이 필요한 페이지인데 로그인되지 않은 경우에도 리다이렉트 중에는 로딩 화면 표시
  if (requireAuth && !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg font-medium text-gray-600">로그인한 사용자 없음</div>
      </div>
    );
  }

  return <>{children}</>;
} 