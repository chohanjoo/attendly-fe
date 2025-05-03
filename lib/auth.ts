import api from './axios';
import { useRouter } from 'next/navigation';
import cookies from 'js-cookie';

// 로그인 인터페이스 타입 정의
export interface LoginCredentials {
  email: string;
  password: string;
}

// 로그인 응답 타입 정의
interface LoginResponse {
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
const isClientSide = () => typeof window !== 'undefined';

/**
 * 토큰을 저장하는 함수
 * localStorage와 쿠키에 모두 저장
 */
const saveTokens = (accessToken: string, refreshToken: string) => {
  if (!isClientSide()) return;
  
  console.log('토큰 저장 시작:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
  
  // localStorage에 저장 (클라이언트 사이드에서 사용)
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  // 쿠키에 저장 (미들웨어에서 인증 체크용)
  // accessToken은 1일 만료, refreshToken은 7일 만료
  cookies.set('accessToken', accessToken, { 
    expires: 1, 
    path: '/',
    sameSite: 'strict'
  });
  cookies.set('refreshToken', refreshToken, { 
    expires: 7,
    path: '/',
    sameSite: 'strict'  
  });
  
  console.log('쿠키 설정 완료: accessToken =', cookies.get('accessToken') ? '있음' : '없음');
};

/**
 * 로그인 함수
 * @param credentials 이메일과 비밀번호
 * @returns 로그인 결과
 */
export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    
    // 토큰 저장
    saveTokens(response.data.accessToken, response.data.refreshToken);
    
    // 사용자 정보가 있으면 저장
    if (response.data.user && isClientSide()) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || '로그인 중 오류가 발생했습니다.'
    };
  }
};

/**
 * 로그아웃 함수
 */
export const logout = () => {
  if (!isClientSide()) return;
  
  console.log('로그아웃 시작');
  
  // localStorage에서 제거
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // 쿠키에서 제거
  cookies.remove('accessToken', { path: '/' });
  cookies.remove('refreshToken', { path: '/' });
  
  console.log('로그아웃 완료: 쿠키 제거됨 =', !cookies.get('accessToken'));
  
  // 잠시 대기 후 페이지 이동 (쿠키 변경이 적용될 시간 필요)
  setTimeout(() => {
    console.log('로그아웃 후 리디렉션 수행');
    window.location.href = '/login';
  }, 300);
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