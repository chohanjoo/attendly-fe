'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("로그인 시도:", credentials.email);
      const userData = await login(credentials.email, credentials.password);
      console.log("로그인 성공, 사용자 역할에 따라 리다이렉트 시도", userData?.role);
      
      // 사용자 역할에 따라 리다이렉트
      handleRedirect(userData?.role);
    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 역할에 따른 리다이렉트 처리 함수
  const handleRedirect = (role?: string) => {
    console.log("역할에 따른 리다이렉트 실행:", role);
    
    let targetPath = '/'; // 기본 경로
    
    // 역할에 따라 다른 경로로 리다이렉트
    if (role === "VILLAGE_LEADER") {
      targetPath = '/village'; // 마을장은 마을 관리 페이지로
    } else if (role === "LEADER") {
      targetPath = '/attendance'; // 리더는 출석 페이지로
    } else if (role === "MINISTER" || role === "ADMIN") {
      targetPath = '/admin'; // 교역자와 관리자는 통계 페이지로
    }
    
    // 경로 리다이렉트
    window.location.href = targetPath;
    
    // 백업 리다이렉트
    setTimeout(() => {
      console.log("1차 리다이렉트 실패, 추가 시도");
      window.location.replace(targetPath);
      router.replace(targetPath);
    }, 500);
  };

  return (
    <div className="w-full max-w-md p-6 mx-auto bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">로그인</h2>
      
      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="email">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={credentials.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="이메일 주소를 입력하세요"
          />
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="password">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="비밀번호를 입력하세요"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
} 