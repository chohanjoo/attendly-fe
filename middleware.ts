import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 인증이 필요하지 않은 페이지 목록
const publicPaths = ['/login', '/signup', '/forgot-password'];

// 정적 파일 확장자 목록
const staticExtensions = [
  '.jpg', '.jpeg', '.png', '.gif', '.ico', '.svg',
  '.css', '.js', '.json', 
  '.woff', '.woff2', '.ttf', '.eot'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 정적 파일 경로는 처리하지 않음
  if (staticExtensions.some(ext => pathname.endsWith(ext)) || 
      pathname.startsWith('/_next') || 
      pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // 현재 토큰 가져오기 - accessToken 또는 refreshToken 중 하나라도 있으면 인증됨으로 간주
  const hasAccessToken = request.cookies.has('accessToken');
  const hasRefreshToken = request.cookies.has('refreshToken');
  const hasToken = hasAccessToken || hasRefreshToken;
  
  console.log(`[미들웨어] 경로: ${pathname}`);
  console.log(`[미들웨어] 토큰 상태: accessToken=${hasAccessToken}, refreshToken=${hasRefreshToken}`);
  
  // public 경로에 대한 완전 일치 검사
  const isPublicPath = publicPaths.includes(pathname) || 
                      publicPaths.some(path => pathname.startsWith(`${path}/`));
  console.log(`[미들웨어] 퍼블릭 경로 여부: ${isPublicPath}`);
                      
  // 1. 인증이 필요 없는 페이지에 접근했는데 이미 로그인 상태라면 메인으로 리디렉트
  if (isPublicPath && hasToken) {
    console.log(`[미들웨어] 로그인된 상태로 퍼블릭 경로 접근. 메인으로 리다이렉트`);
    // 강제 리다이렉트 - 캐시 방지를 위한 헤더 추가
    const response = NextResponse.redirect(new URL('/', request.url));
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }
  
  // 2. 인증이 필요한 페이지에 접근했는데 로그인 상태가 아니라면 로그인 페이지로 리디렉트
  if (!isPublicPath && !hasToken) {
    console.log(`[미들웨어] 비로그인 상태로 보호된 경로 접근. 로그인 페이지로 리다이렉트`);
    // 강제 리다이렉트 - 캐시 방지를 위한 헤더 추가
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }
  
  // 기본 응답에도 캐시 관련 헤더 추가
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

// 미들웨어가 적용될 경로 설정
export const config = {
  matcher: [
    /*
     * 다음 경로는 미들웨어 처리에서 제외:
     * - api 경로 (/api/*)
     * - 정적 파일 (_next/static/*, _next/image/*, 등)
     * - 파비콘 (favicon.ico)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 