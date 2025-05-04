# 토큰 기반 인증 시스템 가이드

## 1. 토큰이란 무엇인가요?

토큰은 사용자가 인증되었음을 증명하는 디지털 열쇠라고 생각하면 됩니다. 웹 또는 모바일 애플리케이션에서 로그인하면, 서버는 사용자에게 '토큰'이라는 특별한 문자열을 발급합니다. 이 토큰은 사용자의 신원과 권한을 증명하는 역할을 합니다.

예시 토큰:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkhvbmdnaWxkb25nIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9.IvnNEkn5JtIRzIagA6Pp5xXV-t8
```

## 2. Access Token과 Refresh Token의 개념

### Access Token (액세스 토큰)
- **역할**: 보호된 리소스(API)에 접근할 수 있는 권한을 증명합니다.
- **특징**: 짧은 유효 기간(보통 15분~1시간)을 가집니다.
- **용도**: 모든 API 요청에 포함하여 사용자 인증을 증명합니다.

### Refresh Token (리프레시 토큰)
- **역할**: 액세스 토큰이 만료되었을 때, 새 액세스 토큰을 발급받기 위한 용도로 사용됩니다.
- **특징**: 더 긴 유효 기간(보통 1일~2주)을 가집니다.
- **용도**: 액세스 토큰이 만료되어 401 오류가 발생했을 때만 사용합니다.

## 3. 토큰 인증 방식의 작동 원리

### 로그인 과정
1. 사용자가 이메일/비밀번호로 로그인합니다.
2. 서버는 사용자 정보를 확인하고, 두 종류의 토큰(Access Token, Refresh Token)을 발급합니다.
3. 클라이언트(브라우저)는 이 토큰들을 저장합니다.
   - Access Token: 모든 API 요청에 사용
   - Refresh Token: Access Token이 만료되었을 때 갱신용

### API 요청 과정
1. 클라이언트는 모든 API 요청의 헤더에 Access Token을 포함하여 전송합니다.
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
2. 서버는 토큰을 검증하고, 유효하면 요청을 처리합니다.

### 토큰 갱신 과정
1. Access Token이 만료되면 서버는 401 에러를 반환합니다.
2. 클라이언트는 이 에러를 감지하고, Refresh Token을 사용하여 새 토큰을 요청합니다.
3. 서버는 Refresh Token을 확인하고, 유효하면 새 Access Token(때로는 새 Refresh Token도)을 발급합니다.
4. 클라이언트는 새 토큰을 저장하고, 원래 요청을 새 Access Token으로 다시 시도합니다.

## 4. 토큰 기반 인증의 장점

1. **서버 부하 감소**: 세션 관리가 필요 없어 서버 자원을 절약할 수 있습니다.
2. **확장성**: 여러 서버에서도 동일한 토큰으로 인증이 가능합니다.
3. **모바일 친화적**: 모바일 앱에서도 쉽게 인증을 처리할 수 있습니다.
4. **보안 강화**: 토큰 만료 시간을 짧게 설정하여 보안을 강화할 수 있습니다.

## 5. 우리 앱에서의 토큰 처리 방식

### 토큰 저장 위치
- **로컬 스토리지**: `localStorage`에 토큰을 저장합니다.
- **쿠키**: 서버 통신을 위해 쿠키에도 토큰을 저장합니다.

```javascript
// 토큰 저장 방식
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// 쿠키에도 저장
cookies.set('accessToken', accessToken, { expires: 1, path: '/' });
cookies.set('refreshToken', refreshToken, { expires: 7, path: '/' });
```

### 자동 토큰 갱신 구현
우리 앱에서는 axios 인터셉터를 사용하여 액세스 토큰이 만료되었을 때 자동으로 리프레시 토큰으로 갱신하는 기능을 구현했습니다:

```javascript
// 응답 인터셉터에서 401 에러 처리
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 401 에러 발생 시 토큰 갱신 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      try {
        // 리프레시 토큰으로 새 토큰 요청
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/auth/refresh', { refreshToken });
        
        // 새 토큰 저장
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        
        // 새 토큰으로 원래 요청 재시도
        return axios(originalRequest);
      } catch (refreshError) {
        // 리프레시 토큰도 만료된 경우 로그아웃
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

## 6. 토큰 보안 관련 주의사항

1. **토큰 저장 위치**: 토큰은 XSS 공격에 취약할 수 있는 로컬 스토리지보다 HttpOnly 쿠키에 저장하는 것이 더 안전합니다.
2. **토큰 만료 시간**: Access Token의 유효 기간은 짧게 설정하세요(15분~1시간).
3. **HTTPS 사용**: 토큰 전송 시 항상 HTTPS를 사용하여 중간자 공격을 방지하세요.
4. **토큰 내용**: 토큰에 민감한 정보를 포함하지 마세요.

## 7. 자주 묻는 질문 (FAQ)

### Q: Access Token과 Refresh Token을 모두 사용하는 이유는 무엇인가요?
A: Access Token만 사용할 경우, 두 가지 문제가 있습니다:
   - 유효 기간이 길면 보안에 취약해집니다.
   - 유효 기간이 짧으면 사용자가 자주 로그인해야 합니다.
   
   Refresh Token을 함께 사용하면, Access Token은 짧은 유효 기간으로 보안을 강화하고, Refresh Token은 사용자 경험을 향상시킵니다.

### Q: 토큰이 만료되면 어떻게 되나요?
A: 우리 앱에서는 Access Token이 만료되면 자동으로 Refresh Token을 사용하여 새 토큰을 발급받습니다. 사용자는 토스트 메시지로 "인증이 갱신되었습니다"라는 알림만 받고, 별도의 조치를 취할 필요가 없습니다.

### Q: Refresh Token도 만료되면 어떻게 되나요?
A: Refresh Token이 만료되면 사용자는 다시 로그인해야 합니다. 보안을 위해 Refresh Token의 유효 기간도 제한적입니다. 