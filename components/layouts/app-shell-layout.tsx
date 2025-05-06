"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogOut, User, Calendar, Home, BarChart } from "lucide-react";
import logger from "@/lib/logger";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppShellLayoutProps {
  children: ReactNode;
}

export function AppShellLayout({ children }: AppShellLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // 로그아웃 핸들러 - 기존 로그아웃 함수를 호출하기 전에 쿠키 직접 제거
  const handleLogout = async () => {
    console.log("앱 쉘에서 로그아웃 시작");
    
    // 쿠키 직접 제거
    try {
      const cookies = await import('js-cookie').then(mod => mod.default);
      cookies.remove('accessToken', { path: '/' });
      cookies.remove('refreshToken', { path: '/' });
      console.log("앱 쉘에서 쿠키 제거 완료:", !cookies.get('accessToken'));
    } catch (error) {
      console.error("쿠키 제거 중 오류:", error);
    }
    
    // useAuth의 로그아웃 함수 호출
    logout();
  };

  // 화면 접근 시 유저 정보 로깅
  useEffect(() => {
    if (user) {
      logger.info(`사용자 ${user.name}(${user.email})님이 ${pathname} 페이지에 접근했습니다.`);
    }
  }, [pathname, user]);

  // 현재 경로에 따른 네비게이션 활성화 여부 확인
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  // 사용자 역할에 따른 메뉴 표시 여부
  const isAdmin = user?.role === "ADMIN";
  const isMinister = user?.role === "MINISTER";
  const isVillageLeader = user?.role === "VILLAGE_LEADER";
  const isLeader = user?.role === "LEADER";

  return (
    <div className="flex flex-col min-h-screen">
      {/* 상단 네비게이션 바 */}
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <span className="text-indigo-600">Attendly</span>
            </Link>
          </div>
          
          {/* 네비게이션 링크 */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                isActive("/") ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              홈
            </Link>
            
            {/* 리더 - 출석 입력 */}
            {(isLeader || isVillageLeader || isMinister || isAdmin) && (
              <Link
                href="/attendance"
                className={`text-sm font-medium transition-colors ${
                  isActive("/attendance") ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                출석 입력
              </Link>
            )}
            
            {/* 마을장 - 대시보드 */}
            {(isVillageLeader || isMinister || isAdmin) && (
              <Link
                href="/village"
                className={`text-sm font-medium transition-colors ${
                  isActive("/village") ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                마을 관리
              </Link>
            )}
            
            {/* 교역자 - 통계 */}
            {(isMinister || isAdmin) && (
              <Link
                href="/reports"
                className={`text-sm font-medium transition-colors ${
                  isActive("/reports") ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                통계
              </Link>
            )}
          </nav>
          
          {/* 사용자 메뉴 */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <span className="hidden md:inline-block">{user?.name || '사용자'}</span>
                  <User className="h-4 w-4" />
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>프로필</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-500">
                  <LogOut className="h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* 모바일 하단 네비게이션 바 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-white z-10">
        <div className="flex justify-around">
          <Link href="/" className={`flex flex-col items-center py-2 px-4 ${isActive("/") ? "text-indigo-600" : "text-gray-500"}`}>
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">홈</span>
          </Link>
          
          {(isLeader || isVillageLeader || isMinister || isAdmin) && (
            <Link href="/attendance" className={`flex flex-col items-center py-2 px-4 ${isActive("/attendance") ? "text-indigo-600" : "text-gray-500"}`}>
              <Calendar className="h-5 w-5" />
              <span className="text-xs mt-1">출석</span>
            </Link>
          )}
          
          {(isMinister || isAdmin) && (
            <Link href="/reports" className={`flex flex-col items-center py-2 px-4 ${isActive("/reports") ? "text-indigo-600" : "text-gray-500"}`}>
              <BarChart className="h-5 w-5" />
              <span className="text-xs mt-1">통계</span>
            </Link>
          )}
          
          <Link href="/profile" className={`flex flex-col items-center py-2 px-4 ${isActive("/profile") ? "text-indigo-600" : "text-gray-500"}`}>
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">프로필</span>
          </Link>
        </div>
      </div>
      
      {/* 메인 컨텐츠 */}
      <main className="flex-1 container px-4 py-6 md:py-8 md:px-6">
        {children}
      </main>
      
      {/* 모바일 네비게이션을 위한 하단 여백 */}
      <div className="md:hidden h-16"></div>
    </div>
  );
} 