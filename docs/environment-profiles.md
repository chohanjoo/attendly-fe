# React 환경별 프로필 설정 가이드

## 목차

1. [개요](#개요)
2. [환경 변수 기본 개념](#환경-변수-기본-개념)
3. [Next.js에서의 환경 변수 설정](#nextjs에서의-환경-변수-설정)
4. [환경별 설정 파일](#환경별-설정-파일)
5. [npm 스크립트 설정](#npm-스크립트-설정)
6. [실제 사용 예시](#실제-사용-예시)
7. [환경 변수 타입 안전성](#환경-변수-타입-안전성)
8. [배포 환경에서의 환경 변수 관리](#배포-환경에서의-환경-변수-관리)
9. [문제 해결 및 팁](#문제-해결-및-팁)
10. [참고자료](#참고자료)

---

## 개요

프론트엔드 애플리케이션은 개발, 테스트, 스테이징, 프로덕션 등 여러 환경에서 실행될 수 있습니다. 각 환경마다 API 엔드포인트, 기능 플래그, 로깅 레벨 등이 다를 수 있으므로 환경별로 다른 설정을 적용해야 합니다. 이 문서는 React(특히 Next.js) 애플리케이션에서 환경별 프로필을 설정하고 관리하는 방법을 설명합니다.

---

## 환경 변수 기본 개념

### 환경 변수란?

환경 변수는 애플리케이션이 실행되는 환경에 따라 동적으로 변경될 수 있는 값입니다. 이를 통해 소스 코드를 변경하지 않고도 애플리케이션의 동작을 다르게 할 수 있습니다.

### React에서의 환경 변수

React 애플리케이션(Create React App 기반)에서는 `REACT_APP_` 접두사를 가진 환경 변수만 클라이언트에 노출됩니다. 보안 이슈를 방지하기 위해 민감한 정보(API 키, 비밀번호 등)는 클라이언트 환경 변수에 저장하지 않는 것이 좋습니다.

### Next.js에서의 환경 변수

Next.js에서는 환경 변수에 접근하는 방법이 조금 다릅니다:

- `process.env.VARIABLE_NAME`: 서버 사이드에서만 접근 가능
- `process.env.NEXT_PUBLIC_VARIABLE_NAME`: 클라이언트와 서버 모두에서 접근 가능

---

## Next.js에서의 환경 변수 설정

### 기본 파일 구조

Next.js는 다음 파일들을 자동으로 로드합니다(우선순위 높은 순):

1. `.env.$(NODE_ENV).local` - 로컬 환경별 오버라이드(예: `.env.development.local`)
2. `.env.local` - 로컬 오버라이드
3. `.env.$(NODE_ENV)` - 환경별 설정(예: `.env.production`)
4. `.env` - 기본 설정

### 환경 변수 접두사

- `NEXT_PUBLIC_`: 이 접두사가 붙은 변수는 브라우저에 노출됩니다. 
- 접두사가 없는 변수는 서버 사이드에서만 사용 가능합니다.

### NODE_ENV

`NODE_ENV` 환경 변수는 애플리케이션이 실행되는 모드를 지정합니다:
- `development`: 개발 모드
- `production`: 프로덕션 모드
- `test`: 테스트 모드

---

## 환경별 설정 파일

우리 프로젝트에서는 다음과 같은 환경별 설정 파일을 사용합니다:

### `.env.development`

개발 환경 설정을 포함합니다. 주로 로컬 개발 서버와 통신하기 위한 설정이 들어갑니다.

```
# 개발 환경 설정
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_ENV=development
```

### `.env.production`

프로덕션 환경 설정을 포함합니다. 실제 배포된 API와 통신하기 위한 설정이 들어갑니다.

```
# 프로덕션 환경 설정
NEXT_PUBLIC_API_URL=https://api.attendly-church.com
NEXT_PUBLIC_ENV=production
```

### `.env`

모든 환경에서 공통으로 사용되는 설정을 포함합니다.

---

## npm 스크립트 설정

`package.json` 파일에 환경별 스크립트를 추가하여 쉽게 환경을 전환할 수 있습니다:

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:local": "NODE_ENV=development next dev",
    "dev:prod": "NODE_ENV=production next dev",
    "build": "next build",
    "build:dev": "NODE_ENV=development next build",
    "build:prod": "NODE_ENV=production next build",
    "start": "next start"
  }
}
```

각 스크립트의 설명:

- `dev`: 기본 개발 서버 실행
- `dev:local`: 개발 환경 설정으로 개발 서버 실행
- `dev:prod`: 프로덕션 환경 설정으로 개발 서버 실행
- `build:dev`: 개발 환경 설정으로 빌드
- `build:prod`: 프로덕션 환경 설정으로 빌드

### Windows 사용자를 위한 참고사항

Windows에서는 환경 변수 설정 방식이 다릅니다. 다음과 같이 `cross-env` 패키지를 사용하는 것이 좋습니다:

```json
{
  "scripts": {
    "dev:local": "cross-env NODE_ENV=development next dev"
  }
}
```

---

## 실제 사용 예시

### API URL 설정

`lib/axios.ts`에서 환경 변수를 사용하여 API 기본 URL을 설정합니다:

```typescript
import axios from 'axios';

// API 기본 URL
const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
const environment = process.env.NEXT_PUBLIC_ENV || 'local';

// 개발 환경에서만 로그 출력
if (process.env.NODE_ENV !== 'production') {
  console.log('Current API URL:', baseURL);
  console.log('Environment:', environment);
}

// axios 인스턴스 생성
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

### 환경에 따른 기능 활성화

특정 환경에서만 기능을 활성화하려면 다음과 같이 할 수 있습니다:

```tsx
const isDevelopment = process.env.NODE_ENV === 'development';

function DebugPanel() {
  if (!isDevelopment) {
    return null;
  }
  
  return (
    <div className="debug-panel">
      {/* 디버그 정보 표시 */}
    </div>
  );
}
```

### 환경별 로깅 설정

```typescript
const logger = {
  debug: (...args: any[]) => {
    if (process.env.NEXT_PUBLIC_ENV === 'development') {
      console.debug(...args);
    }
  },
  log: (...args: any[]) => console.log(...args),
  warn: (...args: any[]) => console.warn(...args),
  error: (...args: any[]) => console.error(...args),
};

export default logger;
```

---

## 환경 변수 타입 안전성

TypeScript를 사용하는 경우, 환경 변수에 대한 타입 안전성을 제공하려면 다음과 같이 할 수 있습니다:

1. `env.d.ts` 파일 생성:

```typescript
/// <reference types="next" />

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_ENV: 'development' | 'production' | 'test';
    // 다른 환경 변수 추가
  }
}
```

2. `tsconfig.json`에 이 파일 포함:

```json
{
  "include": ["next-env.d.ts", "env.d.ts", "**/*.ts", "**/*.tsx"]
}
```

이렇게 하면 `process.env`에서 환경 변수를 사용할 때 자동 완성과 타입 검사가 작동합니다.

---

## 배포 환경에서의 환경 변수 관리

### Vercel

Vercel에 배포하는 경우 프로젝트 설정에서 환경 변수를 설정할 수 있습니다:

1. Vercel 대시보드에서 프로젝트 선택
2. Settings > Environment Variables로 이동
3. 필요한 환경 변수 추가
4. 필요한 경우 환경별(Production, Preview, Development)로 다른 값 설정

### Docker

Docker 컨테이너를 사용하는 경우 다음과 같이 환경 변수를 설정할 수 있습니다:

1. Dockerfile에서 환경 변수 설정:
```dockerfile
ENV NEXT_PUBLIC_API_URL=https://api.attendly-church.com
```

2. docker-compose.yml 파일에서 설정:
```yml
services:
  web:
    build: .
    environment:
      - NEXT_PUBLIC_API_URL=https://api.attendly-church.com
```

3. 실행 시 설정:
```bash
docker run -e NEXT_PUBLIC_API_URL=https://api.attendly-church.com my-nextjs-app
```

---

## 문제 해결 및 팁

### 환경 변수가 반영되지 않을 때

1. 서버를 다시 시작했는지 확인하세요. 환경 변수 변경은 서버를 다시 시작해야 반영됩니다.
2. `NEXT_PUBLIC_` 접두사가 있는지 확인하세요. 클라이언트에서 접근하려면 이 접두사가 필요합니다.
3. `.env` 파일의 위치가 프로젝트 루트 디렉토리인지 확인하세요.

### 배포 시 주의사항

1. `.env*.local` 파일은 `.gitignore`에 추가하는 것이 좋습니다. 로컬에서만 사용되는 설정이나 민감한 정보가 포함될 수 있습니다.
2. CI/CD 파이프라인에서 환경 변수를 설정하는 방법을 문서화하세요.
3. 프로덕션 빌드 전에 항상 환경 변수가 올바르게 설정되었는지 확인하세요.

### 보안 관련 팁

1. 민감한 정보(API 키, 비밀번호, 토큰 등)는 클라이언트 환경 변수(`NEXT_PUBLIC_`)에 저장하지 마세요.
2. 서버 사이드에서만 필요한 정보는 `NEXT_PUBLIC_` 접두사 없이 저장하세요.
3. 프로덕션 환경에서는 환경 변수를 로깅하지 마세요.

---

## 참고자료

- [Next.js 공식 문서 - 환경 변수](https://nextjs.org/docs/basic-features/environment-variables)
- [Next.js 공식 문서 - 환경별 설정](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel - 환경 변수 설정](https://vercel.com/docs/environment-variables)
- [Docker - 환경 변수 사용](https://docs.docker.com/compose/environment-variables/)

---

## 결론

환경별 프로필 설정은 효율적인 개발 워크플로우와 안정적인 배포를 위해 중요합니다. 위 가이드를 따라 프로젝트에 적합한 환경 설정을 구성하고, 항상 보안 모범 사례를 준수하세요.

