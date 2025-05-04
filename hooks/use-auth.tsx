"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { saveTokens, isClientSide } from "@/lib/auth";
import { toast } from "sonner";

// 사용자 타입 정의
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  tokenRefreshed: boolean;
}

// Auth Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider Props 타입
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider 컴포넌트
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenRefreshed, setTokenRefreshed] = useState<boolean>(false);
  const router = useRouter();

  // 토큰 갱신 이벤트 리스너 설정
  useEffect(() => {
    if (isClientSide()) {
      const handleTokenRefreshed = (event: Event) => {
        const customEvent = event as CustomEvent;
        console.log("토큰 갱신 알림:", customEvent.detail.message);
        
        // 토스트 알림 표시
        toast.success("인증이 갱신되었습니다", {
          description: "세션이 자동으로 연장되었습니다.",
          duration: 3000,
        });
        
        setTokenRefreshed(true);
        
        // 3초 후 알림 상태 초기화
        setTimeout(() => {
          setTokenRefreshed(false);
        }, 3000);
      };
      
      window.addEventListener('token-refreshed', handleTokenRefreshed);
      
      return () => {
        window.removeEventListener('token-refreshed', handleTokenRefreshed);
      };
    }
  }, []);

  // 컴포넌트 마운트시 토큰 확인
  useEffect(() => {
    // 브라우저 환경에서만 실행
    if (typeof window !== "undefined") {
      const checkAuth = async () => {
        try {
          const token = localStorage.getItem("accessToken");
          
          console.log("토큰 확인:", token ? "토큰 있음" : "토큰 없음");
          console.log("쿠키 확인:", document.cookie.includes('accessToken') ? "쿠키 있음" : "쿠키 없음");
          
          if (!token) {
            setIsLoading(false);
            return;
          }
          
          // 사용자 정보 조회 API 호출
          try {
            console.log("사용자 정보 조회 시도");
            const response = await api.get("/auth/me");
            console.log("사용자 정보 조회 성공:", response.data);
            setUser(response.data);
          } catch (apiError) {
            console.error("사용자 정보 조회 실패:", apiError);
            // 토큰이 유효하지 않은 경우 로컬 스토리지 정리
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
          }
        } catch (err) {
          console.error("인증 확인 중 오류:", err);
          // 토큰이 유효하지 않은 경우 로컬 스토리지 정리
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        } finally {
          setIsLoading(false);
        }
      };
      
      checkAuth();
    } else {
      // 서버 사이드 렌더링 시 로딩 상태 해제
      setIsLoading(false);
    }
  }, []);

  // 로그인 함수
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("로그인 시도:", email);
      const response = await api.post("/auth/login", { email, password });
      const { accessToken, refreshToken, user: userData } = response.data;
      
      console.log("로그인 성공:", userData);
      
      // 토큰 저장
      saveTokens(accessToken, refreshToken);
      
      // 사용자 정보 설정
      setUser(userData);
      
      // 로그인 성공 처리 완료
      console.log("인증 상태 설정 완료, 데이터 반환");
      
      return userData;
    } catch (err: any) {
      console.error("로그인 오류:", err);
      const errorMessage = err.response?.data?.message || "로그인 중 오류가 발생했습니다.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = () => {
    console.log("로그아웃 실행");
    
    if (!isClientSide()) return;
    
    // 로컬 스토리지에서 토큰 제거
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    
    // 쿠키에서도 토큰 제거
    const removeCookies = async () => {
      const cookies = await import('js-cookie').then(mod => mod.default);
      cookies.remove('accessToken', { path: '/' });
      cookies.remove('refreshToken', { path: '/' });
      console.log("쿠키 삭제 완료, 확인:", document.cookie.includes('accessToken') ? "쿠키 남아있음" : "쿠키 없음");
    };
    
    removeCookies();
    
    // 사용자 상태 초기화
    setUser(null);
    
    // 로그인 페이지로 이동
    router.push("/login");
  };

  // 컨텍스트 값
  const value = {
    user,
    login,
    logout,
    isLoading,
    error,
    tokenRefreshed,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// useAuth 훅
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
} 