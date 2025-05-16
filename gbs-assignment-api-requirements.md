# GBS 배치 시스템 API 요구사항

현재 GBS 배치 페이지(`app/village/[id]/gbs-assignment/page.tsx`)에 필요한 API 중 `api-docs.json`에 일부가 누락되어 있습니다. 아래는 구현이 필요한 API들의 상세 명세입니다.

## 1. 특정 마을 정보 조회 API

현재 API에는 현재 로그인한 사용자의 마을 정보를 조회하는 API(`/api/users/my-village`)만 있고, 특정 마을 ID로 마을 정보를 조회하는 API가 없습니다.

### 요청 정보
- **Method**: GET
- **Endpoint**: `/api/village/{id}`
- **Path Variables**:
  - `id`: 마을 ID (정수)
- **Headers**:
  - `Authorization`: Bearer {token}

### 응답 정보
```json
{
  "success": true,
  "timestamp": "2023-06-01T12:00:00Z",
  "data": {
    "villageId": 1,
    "villageName": "1마을",
    "departmentId": 1,
    "departmentName": "대학부",
    "isVillageLeader": true
  },
  "message": "마을 정보 조회 성공",
  "code": 200
}
```

## 2. GBS 배치 정보 조회 API

GBS 배치 관리를 위한 칸반 보드에 필요한 정보를 조회하는 API입니다.

### 요청 정보
- **Method**: GET
- **Endpoint**: `/api/village/{id}/gbs-assignment`
- **Path Variables**:
  - `id`: 마을 ID (정수)
- **Query Parameters**:
  - `date`: 조회 기준 날짜 (선택 사항, 기본값: 현재 날짜)
- **Headers**:
  - `Authorization`: Bearer {token}

### 응답 정보
```json
{
  "success": true,
  "timestamp": "2023-06-01T12:00:00Z",
  "data": {
    "villageId": 1,
    "villageName": "1마을",
    "columns": [
      {
        "id": "unassigned",
        "title": "미배정 멤버",
        "cards": [
          {
            "id": "user-123",
            "content": "김홍길",
            "labels": []
          },
          {
            "id": "user-456",
            "content": "이철수",
            "labels": []
          }
        ]
      },
      {
        "id": "leaders",
        "title": "리더",
        "cards": [
          {
            "id": "user-789",
            "content": "박지성",
            "labels": [
              {
                "id": 1,
                "name": "믿음 GBS",
                "color": "#FF5733"
              }
            ]
          }
        ]
      },
      {
        "id": "assigned",
        "title": "배정 완료",
        "cards": []
      }
    ],
    "labels": [
      {
        "id": 1,
        "name": "믿음 GBS",
        "color": "#FF5733"
      },
      {
        "id": 2,
        "name": "소망 GBS",
        "color": "#33FF57"
      }
    ]
  },
  "message": "GBS 배치 정보 조회 성공",
  "code": 200
}
```

## 3. GBS 배치 정보 저장 API

칸반 보드에서 설정한 GBS 배치 정보를 저장하는 API입니다.

### 요청 정보
- **Method**: POST
- **Endpoint**: `/api/village/{id}/gbs-assignment`
- **Path Variables**:
  - `id`: 마을 ID (정수)
- **Headers**:
  - `Authorization`: Bearer {token}
  - `Content-Type`: application/json
- **Request Body**:
```json
{
  "startDate": "2023-06-01",
  "endDate": "2023-12-31",
  "assignments": [
    {
      "gbsId": 1,
      "leaderId": 789,
      "memberIds": [123, 456]
    },
    {
      "gbsId": 2,
      "leaderId": 101,
      "memberIds": [102, 103, 104]
    }
  ]
}
```

### 응답 정보
```json
{
  "success": true,
  "timestamp": "2023-06-01T12:00:00Z",
  "data": {
    "villageId": 1,
    "assignmentCount": 2,
    "memberCount": 7,
    "message": "GBS 배치가 성공적으로 저장되었습니다."
  },
  "message": "GBS 배치 저장 성공",
  "code": 200
}
```

## 4. GBS 리더 후보 목록 조회 API

GBS 리더로 지정할 수 있는 사용자 목록을 조회하는 API입니다.

### 요청 정보
- **Method**: GET
- **Endpoint**: `/api/village/{id}/leader-candidates`
- **Path Variables**:
  - `id`: 마을 ID (정수)
- **Headers**:
  - `Authorization`: Bearer {token}

### 응답 정보
```json
{
  "success": true,
  "timestamp": "2023-06-01T12:00:00Z",
  "data": {
    "candidates": [
      {
        "id": 789,
        "name": "박지성",
        "email": "park@example.com",
        "isLeader": true,
        "previousGbsCount": 2
      },
      {
        "id": 101,
        "name": "손흥민",
        "email": "son@example.com",
        "isLeader": true,
        "previousGbsCount": 1
      }
    ]
  },
  "message": "리더 후보 목록 조회 성공",
  "code": 200
}
```

## 5. GBS 그룹 목록 조회 API

생성 가능한 GBS 그룹 목록과 정보를 조회하는 API입니다.

### 요청 정보
- **Method**: GET
- **Endpoint**: `/api/village/{id}/gbs-groups`
- **Path Variables**:
  - `id`: 마을 ID (정수)
- **Headers**:
  - `Authorization`: Bearer {token}

### 응답 정보
```json
{
  "success": true,
  "timestamp": "2023-06-01T12:00:00Z",
  "data": {
    "groups": [
      {
        "id": 1,
        "name": "믿음 GBS",
        "description": "믿음 중심 GBS",
        "color": "#FF5733",
        "isActive": true
      },
      {
        "id": 2,
        "name": "소망 GBS",
        "description": "소망 중심 GBS",
        "color": "#33FF57",
        "isActive": true
      }
    ]
  },
  "message": "GBS 그룹 목록 조회 성공",
  "code": 200
}
```

## 구현 시 참고사항

1. 모든 API는 인증된 사용자만 접근할 수 있어야 합니다.
2. 마을장 권한이 있는 사용자만 GBS 배치 정보를 저장할 수 있어야 합니다.
3. GBS 기간은 반기별(6개월)로 설정되는 것이 일반적이므로, 날짜 선택 시 이를 고려해야 합니다.
4. 각 GBS 그룹별로 적정 인원은 리더 포함 5-10명 정도가 권장됩니다. 