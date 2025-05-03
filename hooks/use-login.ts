"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface UseLoginProps {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useLogin({ redirectTo = "/", onSuccess, onError }: UseLoginProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      
      // 로그인 성공 처리
      toast.success("로그인 성공");
      
      // 성공 콜백 실행
      if (onSuccess) {
        onSuccess();
      }
      
      // 리다이렉트
      router.push(redirectTo);
    } catch (err: any) {
      // 에러 메시지 설정
      const errorMessage = err.message || "로그인 중 오류가 발생했습니다.";
      setError(errorMessage);
      
      // 에러 토스트 표시
      toast.error(errorMessage);
      
      // 에러 콜백 실행
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login: handleLogin,
    isLoading,
    error,
  };
} 