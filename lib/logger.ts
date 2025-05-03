/**
 * 환경에 따라 다른 로깅 수준을 제공하는 로거 유틸리티
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// User 타입 정의 가져오기
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  [key: string]: any; // 추가 필드가 있을 수 있음
}

/**
 * 로그 레벨별로 다른 포맷과 조건을 가진 로거
 */
const logger = {
  /**
   * 디버그 로그 - 개발 환경에서만 출력
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  },

  /**
   * 정보 로그 - 모든 환경에서 출력
   */
  info: (...args: any[]) => {
    console.info('[INFO]', ...args);
  },

  /**
   * 경고 로그 - 모든 환경에서 출력
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * 에러 로그 - 모든 환경에서 출력
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },

  /**
   * 환경 정보 로깅 - 앱 시작 시 유용
   */
  logEnvironment: () => {
    if (isDevelopment) {
      console.group('🚀 환경 정보');
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('환경:', process.env.NEXT_PUBLIC_ENV);
      console.groupEnd();
    }
  },

  /**
   * 로그인한 유저 정보 로깅
   * @param user 사용자 객체
   */
  logUserInfo: (user: User | null) => {
    if (!user) {
      console.log('[USER] 로그인한 사용자 없음');
      return;
    }

    console.group('👤 로그인한 유저 정보');
    console.log('ID:', user.id);
    console.log('이름:', user.name);
    console.log('이메일:', user.email);
    console.log('역할:', user.role);
    
    // 추가 정보가 있다면 출력
    const additionalKeys = Object.keys(user).filter(
      key => !['id', 'name', 'email', 'role'].includes(key)
    );
    
    if (additionalKeys.length > 0) {
      console.group('추가 정보');
      additionalKeys.forEach(key => {
        console.log(`${key}:`, user[key]);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  },
};

// 앱 시작 시 환경 정보 출력
if (typeof window !== 'undefined' && isDevelopment) {
  logger.logEnvironment();
}

export default logger; 