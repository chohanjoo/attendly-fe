"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { AppShellLayout } from "@/components/layouts/app-shell-layout";

export default function MinisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // 인증이 완료되었고 목회자가 아닌 경우 홈으로 리디렉션
    if (!isLoading && user && user.role !== "MINISTER") {
      router.push("/");
    }
    
    // 인증이 완료되었고 로그인하지 않은 경우 로그인 페이지로 리디렉션
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // 로딩 중이거나 사용자가 없으면 아무것도 렌더링하지 않음
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return <AppShellLayout>{children}</AppShellLayout>;
} 