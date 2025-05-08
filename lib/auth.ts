import api from './axios';
import { useRouter } from 'next/navigation';
import cookies from 'js-cookie';

// 로그인 인터페이스 타입 정의
export interface LoginCredentials {
  email: string;
  password: string;
}

// 로그인 응답 타입 정의
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user?: {
    id: string;
    name: string;
    email: string;
    // 필요한 사용자 정보 추가
  };
}

// 클라이언트 사이드 여부 확인
export const isClientSide = () => typeof window !== 'undefined';

/**
 * 토큰을 저장하는 함수
 * localStorage와 쿠키에 모두 저장
 */
export const saveTokens = (accessToken: string, refreshToken: string) => {
  if (!isClientSide()) return;
  
  console.log('토큰 저장 시작:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
  
  // localStorage에 저장 (클라이언트 사이드에서 사용)
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  // 쿠키에 저장 (미들웨어에서 인증 체크용)
  // accessToken은 1시간 만료, refreshToken은 30일 만료
  cookies.set('accessToken', accessToken, { 
    expires: 1/24, // 1시간
    path: '/',
    sameSite: 'strict'
  });
  cookies.set('refreshToken', refreshToken, { 
    expires: 30, // 30일
    path: '/',
    sameSite: 'strict'  
  });
  
  console.log('쿠키 설정 완료: accessToken =', cookies.get('accessToken') ? '있음' : '없음');
};

/**
 * 토큰과 역할을 함께 저장하는 함수
 * localStorage와 쿠키에 모두 저장
 */
export const saveTokensAndRole = (accessToken: string, refreshToken: string, role: string) => {
  if (!isClientSide()) return;
  
  console.log('토큰 및 역할 저장 시작:', { accessToken: !!accessToken, refreshToken: !!refreshToken, role });
  
  // 기존 토큰 저장 함수 호출
  saveTokens(accessToken, refreshToken);
  
  // 역할 정보 쿠키에 저장
  cookies.set('role', role, { 
    expires: 30, // 30일
    path: '/',
    sameSite: 'strict'  
  });
  
  // API 인스턴스의 기본 헤더 설정
  api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  
  console.log('역할 정보 설정 완료: role =', cookies.get('role'));
};

/**
 * 현재 로그인 상태 확인
 * @returns 로그인 여부
 */
export const isAuthenticated = (): boolean => {
  if (!isClientSide()) return false;
  return !!localStorage.getItem('accessToken');
};

/**
 * 사용자 정보 조회
 * @returns 저장된 사용자 정보
 */
export const getUser = () => {
  if (!isClientSide()) return null;
  
  const userJson = localStorage.getItem('user');
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch (e) {
      return null;
    }
  }
  return null;
}; 