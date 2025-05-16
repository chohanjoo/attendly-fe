# GBS 그룹 관리 API 추가 구현 스펙

## 1. GBS 그룹 목록 조회 API

### 요청 정보
- **URI**: `/api/admin/organization/gbs-groups`
- **Method**: GET
- **설명**: GBS 그룹 목록을 페이징하여 조회합니다. 마을 ID와 이름으로 필터링이 가능합니다.

### 요청 파라미터
| 파라미터명 | 타입 | 필수 여부 | 설명 |
|------------|------|---------|------|
| villageId | Integer | 선택 | 마을 ID 기준 필터링 |
| name | String | 선택 | 그룹 이름 검색 |
| page | Integer | 선택 | 페이지 번호 (기본값: 0) |
| size | Integer | 선택 | 페이지 크기 (기본값: 20) |

### 응답 구조
```json
{
  "success": true,
  "timestamp": "2023-09-15T12:34:56.789Z",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "동문마을 1조",
        "villageId": 1,
        "villageName": "동문마을",
        "termStartDate": "2023-01-01",
        "termEndDate": "2023-06-30",
        "leaderId": 101,
        "leaderName": "김철수",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z",
        "memberCount": 5
      },
      // ... 다른 GBS 그룹 항목들
    ],
    "totalCount": 25,
    "hasMore": true
  },
  "message": "GBS 그룹 목록 조회가 완료되었습니다.",
  "code": 200
}
```

## 2. GBS 그룹 멤버 조회 API

### 요청 정보
- **URI**: `/api/admin/organization/gbs-groups/{gbsGroupId}/members`
- **Method**: GET
- **설명**: 특정 GBS 그룹에 소속된 멤버 목록을 조회합니다.

### 요청 파라미터
| 파라미터명 | 타입 | 필수 여부 | 설명 |
|------------|------|---------|------|
| gbsGroupId | Integer | 필수 | GBS 그룹 ID |

### 응답 구조
```json
{
  "success": true,
  "timestamp": "2023-09-15T12:34:56.789Z",
  "data": [
    {
      "id": 1,
      "userId": 201,
      "userName": "홍길동",
      "gbsGroupId": 1,
      "startDate": "2023-01-01",
      "endDate": null
    },
    {
      "id": 2,
      "userId": 202,
      "userName": "김영희",
      "gbsGroupId": 1,
      "startDate": "2023-01-01",
      "endDate": "2023-05-15"
    }
    // ... 다른 멤버들
  ],
  "message": "GBS 그룹 멤버 조회가 완료되었습니다.",
  "code": 200
}
```

## 3. GBS 그룹 삭제 API

### 요청 정보
- **URI**: `/api/admin/organization/gbs-groups/{gbsGroupId}`
- **Method**: DELETE
- **설명**: 특정 GBS 그룹을 삭제합니다.

### 요청 파라미터
| 파라미터명 | 타입 | 필수 여부 | 설명 |
|------------|------|---------|------|
| gbsGroupId | Integer | 필수 | 삭제할 GBS 그룹 ID |

### 응답 구조
```json
{
  "success": true,
  "timestamp": "2023-09-15T12:34:56.789Z",
  "data": null,
  "message": "GBS 그룹이 성공적으로 삭제되었습니다.",
  "code": 200
}
```

## 4. GBS 그룹 리더 해제 API

### 요청 정보
- **URI**: `/api/admin/organization/gbs-groups/{gbsGroupId}/leaders`
- **Method**: DELETE
- **설명**: 특정 GBS 그룹의 리더를 해제합니다.

### 요청 파라미터
| 파라미터명 | 타입 | 필수 여부 | 설명 |
|------------|------|---------|------|
| gbsGroupId | Integer | 필수 | GBS 그룹 ID |

### 요청 바디
없음

### 응답 구조
```json
{
  "success": true,
  "timestamp": "2023-09-15T12:34:56.789Z",
  "data": {
    "id": 1,
    "name": "동문마을 1조",
    "villageId": 1,
    "villageName": "동문마을",
    "termStartDate": "2023-01-01",
    "termEndDate": "2023-06-30",
    "leaderId": null,
    "leaderName": null,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-09-15T12:34:56.789Z",
    "memberCount": 5
  },
  "message": "GBS 그룹 리더가 성공적으로 해제되었습니다.",
  "code": 200
}
```

## 5. GBS 그룹 멤버 추가 API

### 요청 정보
- **URI**: `/api/admin/organization/gbs-groups/{gbsGroupId}/members`
- **Method**: POST
- **설명**: 특정 GBS 그룹에 멤버를 추가합니다.

### 요청 파라미터
| 파라미터명 | 타입 | 필수 여부 | 설명 |
|------------|------|---------|------|
| gbsGroupId | Integer | 필수 | GBS 그룹 ID |

### 요청 바디 (GbsMemberAssignRequest)
```json
{
  "memberId": 201,
  "startDate": "2023-09-15",
  "endDate": "2023-12-31"
}
```

### 응답 구조
```json
{
  "success": true,
  "timestamp": "2023-09-15T12:34:56.789Z",
  "data": null,
  "message": "멤버가 GBS 그룹에 성공적으로 추가되었습니다.",
  "code": 200
}
```

## 6. GBS 그룹 멤버 삭제 API

### 요청 정보
- **URI**: `/api/admin/organization/gbs-groups/{gbsGroupId}/members/{memberId}`
- **Method**: DELETE
- **설명**: 특정 GBS 그룹에서 멤버를 제거합니다.

### 요청 파라미터
| 파라미터명 | 타입 | 필수 여부 | 설명 |
|------------|------|---------|------|
| gbsGroupId | Integer | 필수 | GBS 그룹 ID |
| memberId | Integer | 필수 | 제거할 멤버의 User ID |

### 응답 구조
```json
{
  "success": true,
  "timestamp": "2023-09-15T12:34:56.789Z",
  "data": null,
  "message": "멤버가 GBS 그룹에서 성공적으로 제거되었습니다.",
  "code": 200
}
```

## 7. GBS 그룹 리더 지정 API

### 요청 정보
- **URI**: `/api/admin/organization/gbs-groups/{gbsGroupId}/leaders`
- **Method**: POST
- **설명**: 특정 GBS 그룹에 리더를 지정합니다.

### 요청 파라미터
| 파라미터명 | 타입 | 필수 여부 | 설명 |
|------------|------|---------|------|
| gbsGroupId | Integer | 필수 | GBS 그룹 ID |

### 요청 바디 (GbsLeaderAssignRequest)
```json
{
  "leaderId": 101,
  "startDate": "2023-09-15",
  "endDate": "2023-12-31"
}
```

### 응답 구조
```json
{
  "success": true,
  "timestamp": "2023-09-15T12:34:56.789Z",
  "data": null,
  "message": "리더가 GBS 그룹에 성공적으로 지정되었습니다.",
  "code": 200
}
```

## 8. DTO 구조 정의

### GbsGroupResponse
```typescript
interface GbsGroupResponse {
  id: number;
  name: string;
  villageId: number;
  villageName: string;
  termStartDate: string; // 'YYYY-MM-DD' 형식
  termEndDate: string; // 'YYYY-MM-DD' 형식
  leaderId?: number;
  leaderName?: string;
  createdAt: string; // ISO 8601 형식
  updatedAt: string; // ISO 8601 형식
  memberCount: number;
}
```

### GbsMemberResponse
```typescript
interface GbsMemberResponse {
  id: number;
  userId: number;
  userName: string;
  gbsGroupId: number;
  startDate: string; // 'YYYY-MM-DD' 형식
  endDate?: string; // 'YYYY-MM-DD' 형식, 종료일이 없는 경우 null
}
```

### GbsGroupCreateRequest
```typescript
interface GbsGroupCreateRequest {
  name: string;
  villageId: number;
  termStartDate: string; // 'YYYY-MM-DD' 형식
  termEndDate: string; // 'YYYY-MM-DD' 형식
  leaderId?: number; // 선택적 리더 ID
}
```

### GbsGroupUpdateRequest
```typescript
interface GbsGroupUpdateRequest {
  name: string;
  villageId: number;
  termStartDate: string; // 'YYYY-MM-DD' 형식
  termEndDate: string; // 'YYYY-MM-DD' 형식
}
```

### GbsLeaderAssignRequest
```typescript
interface GbsLeaderAssignRequest {
  leaderId: number;
  startDate: string; // 'YYYY-MM-DD' 형식
  endDate?: string; // 'YYYY-MM-DD' 형식, 선택적
}
```

### GbsMemberAssignRequest
```typescript
interface GbsMemberAssignRequest {
  memberId: number;
  startDate: string; // 'YYYY-MM-DD' 형식
  endDate?: string; // 'YYYY-MM-DD' 형식, 선택적
}
``` 