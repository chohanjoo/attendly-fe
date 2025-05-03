# Next.js 라우팅 가이드

Next.js는 파일 시스템 기반 라우팅을 채택하고 있습니다. 즉, 파일 구조가 웹 애플리케이션의 URL 구조를 결정합니다. 이 문서에서는 Next.js의 라우팅 시스템에 대해 설명합니다.

## 목차
1. [App Router vs Pages Router](#app-router-vs-pages-router)
2. [App Router 구조](#app-router-구조)
3. [라우트 정의 방법](#라우트-정의-방법)
4. [동적 라우트](#동적-라우트)
5. [레이아웃과 템플릿](#레이아웃과-템플릿)
6. [미들웨어](#미들웨어)
7. [네비게이션](#네비게이션)
8. [Attendly 프로젝트의 라우팅](#attendly-프로젝트의-라우팅)

## App Router vs Pages Router

Next.js는 두 가지 라우팅 시스템을 제공합니다:

1. **App Router**: Next.js 13 이상에서 도입된 새로운 라우팅 시스템으로, React Server Components를 지원합니다.
2. **Pages Router**: Next.js의 전통적인 라우팅 시스템입니다.

Attendly 프로젝트는 **App Router**를 사용합니다.

## App Router 구조

App Router는 `app` 디렉토리를 사용합니다. 기본 구조는 다음과 같습니다:

```
app/
├── page.tsx        # '/' 경로 (홈페이지)
├── layout.tsx      # 전체 앱에 적용되는 레이아웃
├── about/
│   └── page.tsx    # '/about' 경로
├── blog/
│   ├── page.tsx    # '/blog' 경로
│   └── [slug]/     # 동적 라우트
│       └── page.tsx # '/blog/[slug]' 경로
└── api/
    └── route.ts    # API 라우트
```

## 라우트 정의 방법

### 페이지 정의

- `app` 디렉토리 내에 폴더를 생성하면 해당 폴더명이 URL 경로가 됩니다.
- 각 폴더 내에 `page.tsx` 파일을 생성하면 해당 경로에 접근할 수 있습니다.

예시:
- `app/page.tsx` -> `/` (홈페이지)
- `app/attendance/page.tsx` -> `/attendance`
- `app/village/page.tsx` -> `/village`

### 중첩 라우트

폴더를 중첩하면 중첩된 라우트가 됩니다:

- `app/settings/account/page.tsx` -> `/settings/account`
- `app/settings/notifications/page.tsx` -> `/settings/notifications`

## 동적 라우트

대괄호(`[]`)를 사용하여 동적 라우트를 정의할 수 있습니다:

- `app/village/[id]/page.tsx` -> `/village/123`, `/village/456` 등
- `app/gbs/[groupId]/page.tsx` -> `/gbs/a1b2c3`, `/gbs/x7y8z9` 등

동적 라우트 매개변수는 컴포넌트에서 다음과 같이 접근할 수 있습니다:

```tsx
// app/village/[id]/page.tsx
export default function VillagePage({ params }: { params: { id: string } }) {
  // params.id에 접근 가능
  return <div>마을 ID: {params.id}</div>;
}
```

## 레이아웃과 템플릿

### 레이아웃 (layout.tsx)

레이아웃은 여러 페이지 간에 공유되는 UI입니다. 레이아웃은 상태를 유지하고, 다시 렌더링되지 않습니다.

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <header>공통 헤더</header>
        {children}
        <footer>공통 푸터</footer>
      </body>
    </html>
  );
}
```

### 중첩 레이아웃

각 폴더에 레이아웃을 정의하면 중첩 레이아웃이 됩니다:

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav>대시보드 내비게이션</nav>
      {children}
    </div>
  );
}
```

## 미들웨어

프로젝트 루트에 `middleware.ts` 파일을 생성하여 라우트 처리 전에 실행되는 미들웨어를 정의할 수 있습니다:

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 인증 검사 등을 수행
  if (!request.cookies.has('accessToken')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// 미들웨어가 적용될 경로 설정
export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*'],
};
```

## 네비게이션

### 클라이언트 컴포넌트에서 네비게이션

클라이언트 컴포넌트에서는 `useRouter` 훅이나 `<Link>` 컴포넌트를 사용합니다:

```tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navigation() {
  const router = useRouter();
  
  return (
    <div>
      {/* Link 컴포넌트 사용 */}
      <Link href="/attendance">출석 관리</Link>
      
      {/* 프로그래밍 방식으로 네비게이션 */}
      <button onClick={() => router.push('/settings')}>
        설정
      </button>
      
      {/* 뒤로 가기 */}
      <button onClick={() => router.back()}>
        뒤로
      </button>
    </div>
  );
}
```

## Attendly 프로젝트의 라우팅

Attendly 프로젝트에서는 다음과 같은 라우트가 구현되어 있습니다:

- `/` - 홈페이지/대시보드
- `/login` - 로그인 페이지
- `/signup` - 회원가입 페이지
- `/attendance` - 출석 입력 페이지
- `/village` - 마을 관리 페이지
- `/reports` - 통계 보고서 페이지

각 경로는 해당하는 디렉토리 구조와 `page.tsx` 파일로 구성됩니다:

```
app/
├── page.tsx         # 홈페이지
├── login/
│   └── page.tsx     # 로그인 페이지
├── signup/
│   └── page.tsx     # 회원가입 페이지
├── attendance/
│   └── page.tsx     # 출석 입력 페이지
├── village/
│   └── page.tsx     # 마을 관리 페이지
└── reports/
    └── page.tsx     # 통계 보고서 페이지
```

미들웨어를 통해 인증이 필요한 페이지와 그렇지 않은 페이지를 구분하여 관리합니다:
- 인증이 필요하지 않은 페이지: `/login`, `/signup`, `/forgot-password`
- 그 외 모든 페이지는 인증 필요

### 주의 사항

새로운 페이지를 만들 때는 다음 단계를 따르세요:

1. `app` 디렉토리 내에 해당 경로의 폴더 생성 (예: `app/new-route/`)
2. 해당 폴더 내에 `page.tsx` 파일 생성
3. 필요한 경우 `layout.tsx` 파일도 생성
4. 클라이언트 컴포넌트의 경우 파일 상단에 `"use client"` 지시문 추가
5. 미들웨어에서 인증 처리가 필요한지 확인

앞으로 라우팅 관련 문제가 발생하면 먼저 파일 구조가 올바른지 확인하는 것이 중요합니다. 404 오류가 발생하면 대부분 해당 경로에 `page.tsx` 파일이 없기 때문입니다. 