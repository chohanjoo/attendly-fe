# Discord 로깅 설정 가이드

Attendly 애플리케이션에서 발생하는 로그를 Discord 채널로 전송하기 위한 설정 가이드입니다.

## 1. Discord 웹훅 생성하기

1. Discord 서버의 채널 설정을 엽니다 (채널명 옆의 톱니바퀴 아이콘).
2. **통합** 메뉴로 이동합니다.
3. **웹훅 생성** 버튼을 클릭합니다.
4. 웹훅 이름을 `Attendly 로깅` 으로 설정하고 원하는 아이콘을 선택합니다.
5. **웹훅 URL 복사** 버튼을 클릭하여 웹훅 URL을 복사합니다.

## 2. 환경 변수 설정하기

### 개발 환경 (.env.local)

개발 환경에서 Discord 로깅을 사용하려면 프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```
NEXT_PUBLIC_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your/webhook/url
```

### 프로덕션 환경

프로덕션 환경에서는 배포 플랫폼(Vercel, Netlify 등)의 환경 변수 설정 메뉴에서 `NEXT_PUBLIC_DISCORD_WEBHOOK_URL` 환경 변수를 설정합니다.

## 3. 로그 레벨

Attendly는 다음과 같은 로그 레벨을 사용하며, 각 레벨에 따라 Discord에서 다른 색상으로 표시됩니다:

- **DEBUG** (회색): 개발 환경에서만 사용되는 상세한 디버깅 정보
- **INFO** (파랑): 일반적인 정보성 메시지
- **WARN** (주황): 잠재적인 문제 또는 주의가 필요한 경우
- **ERROR** (빨강): 에러 및 예외 상황

## 4. 로그 사용 예제

애플리케이션 코드에서 다음과 같이 로그를 사용할 수 있습니다:

```typescript
import logger from '@/lib/logger';

// 정보성 로그
logger.info('사용자가 로그인했습니다', { userId: '123', role: 'ADMIN' });

// 경고 로그
logger.warn('API 응답 지연 발생', { endpoint: '/api/users', responseTime: '3500ms' });

// 에러 로그
try {
  // 작업 수행
} catch (error) {
  logger.error('데이터 저장 중 오류 발생', error);
}
```

## 5. 웹훅 비활성화

Discord 로깅을 비활성화하려면 `NEXT_PUBLIC_DISCORD_WEBHOOK_URL` 환경 변수를 제거하거나 빈 문자열로 설정하세요.

## 6. Rate Limiting

Discord API는 과도한 요청에 대해 429 (Too Many Requests) 오류를 반환합니다. 이를 방지하기 위해 Attendly의 로깅 시스템은 다음과 같은 Rate Limiting 메커니즘을 구현하고 있습니다:

- **메시지 큐**: 모든 로그 메시지는 먼저 큐에 추가되고 일정 간격으로 처리됩니다.
- **간격 제어**: 기본적으로 각 메시지는 2초(2000ms) 간격으로 Discord에 전송됩니다.
- **오류 처리**: API 제한에 도달하면 자동으로 재시도 메커니즘이 작동합니다.

만약 Discord 로깅에서 성능 문제가 발생한다면, `lib/logger.ts` 파일에서 `RATE_LIMIT_INTERVAL` 값을 조정하세요:

```typescript
// Rate limiting 변수
const RATE_LIMIT_INTERVAL = 2000; // 2초 간격 (밀리초)
```

간격을 늘리면(예: 5000ms) API 제한 문제를 줄일 수 있지만, 로그 전송이 지연될 수 있습니다.

## 7. 주의사항

- 민감한 정보(개인 식별 정보, 비밀번호 등)는 절대 로그에 포함하지 마세요.
- 프로덕션 환경에서는 중요한 정보만 로깅하여 Discord 채널이 불필요한 메시지로 가득 차지 않도록 합니다.
- Discord 웹훅 URL은 공개되지 않도록 주의하세요. 이 URL을 알고 있는 사람은 누구나 해당 채널에 메시지를 보낼 수 있습니다. 
- 짧은 시간 내에 너무 많은 로그를 발생시키면 Discord API 제한에 도달할 수 있으므로, 중요한 이벤트만 로깅하는 것이 좋습니다. 