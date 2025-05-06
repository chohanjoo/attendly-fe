/// <reference types="next" />

declare namespace NodeJS {
  interface ProcessEnv {
    // 클라이언트와 서버 모두에서 접근 가능한 환경 변수
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_ENABLE_API_LOGGING: string;
    NEXT_PUBLIC_DISCORD_WEBHOOK_URL?: string;
    
    // 서버에서만 접근 가능한 환경 변수 (예시)
    SECRET_API_KEY?: string;
    DATABASE_URL?: string;
    JWT_SECRET?: string;
    
    // NODE_ENV는 기본적으로 제공됨
    NODE_ENV: 'development' | 'production' | 'test';
  }
} 