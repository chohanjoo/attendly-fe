# 교회 조직 관리 API 스펙

아래는 교회 조직 관리를 위해 필요한 API 목록과 스펙을 정리한 내용입니다.

## 1. 부서 관리 API

### 1.1 부서 목록 조회
- **엔드포인트**: GET `/api/admin/organization/departments`
- **설명**: 모든 부서 목록을 조회합니다.
- **응답 데이터**: 
  ```json
  {
    "success": true,
    "timestamp": "2023-08-30T12:00:00Z",
    "data": {
      "items": [
        {
          "id": 1,
          "name": "청년부",
          "createdAt": "2023-01-01T00:00:00Z",
          "updatedAt": "2023-01-01T00:00:00Z"
        },
        ...
      ],
      "totalCount": 10,
      "hasMore": false
    },
    "message": "부서 목록 조회 성공",
    "code": 200
  }
  ```

### 1.2 부서 상세 조회
- **엔드포인트**: GET `/api/admin/organization/departments/{departmentId}`
- **설명**: 특정 부서의 상세 정보를 조회합니다.
- **응답 데이터**: 
  ```json
  {
    "success": true,
    "timestamp": "2023-08-30T12:00:00Z",
    "data": {
      "id": 1,
      "name": "청년부",
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    },
    "message": "부서 상세 조회 성공",
    "code": 200
  }
  ```

### 1.3 부서 생성
- **엔드포인트**: POST `/api/admin/organization/departments`
- **설명**: 새로운 부서를 생성합니다.
- **요청 데이터**:
  ```json
  {
    "name": "청소년부"
  }
  ```
- **응답 데이터**:
  ```json
  {
    "success": true,
    "timestamp": "2023-08-30T12:00:00Z",
    "data": {
      "id": 4,
      "name": "청소년부",
      "createdAt": "2023-08-30T12:00:00Z",
      "updatedAt": "2023-08-30T12:00:00Z"
    },
    "message": "부서 생성 성공",
    "code": 201
  }
  ```

### 1.4 부서 수정
- **엔드포인트**: PUT `/api/admin/organization/departments/{departmentId}`
- **설명**: 기존 부서 정보를 수정합니다.
- **요청 데이터**:
  ```json
  {
    "name": "청소년부 (수정)"
  }
  ```
- **응답 데이터**:
  ```json
  {
    "success": true,
    "timestamp": "2023-08-30T12:00:00Z",
    "data": {
      "id": 4,
      "name": "청소년부 (수정)",
      "createdAt": "2023-08-30T12:00:00Z",
      "updatedAt": "2023-08-30T12:05:00Z"
    },
    "message": "부서 수정 성공",
    "code": 200
  }
  ```

### 1.5 부서 삭제
- **엔드포인트**: DELETE `/api/admin/organization/departments/{departmentId}`
- **설명**: 특정 부서를 삭제합니다.
- **응답 데이터**:
  ```json
  {
    "success": true,
    "timestamp": "2023-08-30T12:00:00Z",
    "data": null,
    "message": "부서 삭제 성공",
    "code": 200
  }
  ```

## 2. 마을 관리 API

### 2.1 마을 목록 조회
- **엔드포인트**: GET `/api/admin/organization/villages`
- **설명**: 모든 마을 목록을 조회합니다. 부서별로 필터링이 가능합니다.
- **쿼리 파라미터**: 
  - `departmentId`: (선택) 특정 부서에 소속된 마을만 조회
  - `name`: (선택) 마을 이름으로 검색
- **응답 데이터**: 
  ```json
  {
    "success": true,
    "timestamp": "2023-08-30T12:00:00Z",
    "data": {
      "items": [
        {
          "id": 1,
          "name": "동문마을",
          "departmentId": 1,
          "departmentName": "청년부",
          "villageLeaderId": 101,
          "villageLeaderName": "김철수",
          "createdAt": "2023-01-01T00:00:00Z",
          "updatedAt": "2023-01-01T00:00:00Z"
        },
        ...
      ],
      "totalCount": 8,
      "hasMore": false
    },
    "message": "마을 목록 조회 성공",
    "code": 200
  }
  ```

### 2.2 마을 상세 조회
- **엔드포인트**: GET `/api/admin/organization/villages/{villageId}`
- **설명**: 특정 마을의 상세 정보를 조회합니다.
- **응답 데이터**: 
  ```json
  {
    "success": true,
    "timestamp": "2023-08-30T12:00:00Z",
    "data": {
      "id": 1,
      "name": "동문마을",
      "departmentId": 1,
      "departmentName": "청년부",
      "villageLeaderId": 101,
      "villageLeaderName": "김철수",
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    },
    "message": "마을 상세 조회 성공",
    "code": 200
  }
  ```

### 2.3 마을 생성
- **엔드포인트**: POST `/api/admin/organization/villages`
- **설명**: 새로운 마을을 생성합니다.
- **요청 데이터**:
  ```json
  {
    "name": "북문마을",
    "departmentId": 1,
    "villageLeaderId": 105
  }
  ```
- **응답 데이터**:
  ```json
  {
    "success": true,
    "timestamp": "2023-08-30T12:00:00Z",
    "data": {
      "id": 4,
      "name": "북문마을",
      "departmentId": 1,
      "departmentName": "청년부",
      "villageLeaderId": 105,
      "villageLeaderName": "한지민",
      "createdAt": "2023-08-30T12:00:00Z",
      "updatedAt": "2023-08-30T12:00:00Z"
    },
    "message": "마을 생성 성공",
    "code": 201
  }
  ```

### 2.4 마을 수정
- **엔드포인트**: PUT `/api/admin/organization/villages/{villageId}`
- **설명**: 기존 마을 정보를 수정합니다.
- **요청 데이터**:
  ```json
  {
    "name": "북문마을 (수정)",
    "departmentId": 2
  }
  ```
- **응답 데이터**:
  ```json
  {
    "success": true,
    "timestamp": "2023-08-30T12:00:00Z",
    "data": {
      "id": 4,
      "name": "북문마을 (수정)",
      "departmentId": 2,
      "departmentName": "장년부",
      "villageLeaderId": 105,
      "villageLeaderName": "한지민",
      "createdAt": "2023-08-30T12:00:00Z",
      "updatedAt": "2023-08-30T12:05:00Z"
    },
    "message": "마을 수정 성공",
    "code": 200
  }
  ```

### 2.5 마을 삭제
- **엔드포인트**: DELETE `/api/admin/organization/villages/{villageId}`
- **설명**: 특정 마을을 삭제합니다.
- **응답 데이터**:
  ```json
  {
    "success": true,
    "timestamp": "2023-08-30T12:00:00Z",
    "data": null,
    "message": "마을 삭제 성공",
    "code": 200
  }
  ```

## 3. GBS 그룹 관리 API

### 3.1 GBS 그룹 목록 조회
- **엔드포인트**: GET `/api/admin/organization/gbs-groups`
- **설명**: GBS 그룹 목록을 조회합니다. 마을별로 필터링이 가능합니다.
- **쿼리 파라미터**: 
  - `villageId`: (선택) 특정 마을에 소속된 GBS 그룹만 조회
  - `name`: (선택) 그룹 이름으로 검색
- **응답 데이터**: 
  ```json
  {
    "success": true,
    "timestamp": "2023-08-30T12:00:00Z",
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
          "memberCount": 5,
          "createdAt": "2023-01-01T00:00:00Z",
          "updatedAt": "2023-01-01T00:00:00Z"
        },
        ...
      ],
      "totalCount": 5,
      "hasMore": false
    },
    "message": "GBS 그룹 목록 조회 성공",
    "code": 200
  }
  ```

### 3.2 GBS 그룹 상세 조회
- **엔드포인트**: GET `/api/admin/organization/gbs-groups/{gbsGroupId}`
- **설명**: 특정 GBS 그룹의 상세 정보를 조회합니다.
- **응답 데이터**: 
  ```json
  {
    "success": true,
    "timestamp": "2023-08-30T12:00:00Z",
    "data": {
      "id": 1,
      "name": "동문마을 1조",
      "villageId": 1,
      "villageName": "동문마을",
      "termStartDate": "2023-01-01",
      "termEndDate": "2023-06-30",
      "leaderId": 101,
      "leaderName": "김철수",
      "members": [
        {
          "id": 1,
          "userId": 105,
          "userName": "한지민",
          "startDate": "2023-01-01",
          "endDate": null
        },
        {
          "id": 2,
          "userId": 106,
          "userName": "송혜교",
          "startDate": "2023-01-01",
          "endDate": null
        }
      ],
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    },
    "message": "GBS 그룹 상세 조회 성공",
    "code": 200
  }
  ```

### 3.3 GBS 그룹 생성
- **엔드포인트**: POST `/api/admin/organization/gbs-groups`
- **설명**: 새로운 GBS 그룹을 생성합니다.
- **요청 데이터**:
  ```json
  {
    "name": "동문마을 3조",
    "villageId": 1,
    "termStartDate": "2023-07-01",
    "termEndDate": "2023-12-31",
    "leaderId": 103
  }
  ```
- **응답 데이터**:
  ```json
  {
    "success": true,
    "timestamp": "2023-08-30T12:00:00Z",
    "data": {
      "id": 4,
      "name": "동문마을 3조",
      "villageId": 1,
      "villageName": "동문마을",
      "termStartDate": "2023-07-01",
      "termEndDate": "2023-12-31",
      "leaderId": 103,
      "leaderName": "박지성",
      "members": [],
      "createdAt": "2023-08-30T12:00:00Z",
      "updatedAt": "2023-08-30T12:00:00Z"
    },
    "message": "GBS 그룹 생성 성공",
    "code": 201
  }
  ```

### 3.4 GBS 그룹 수정
- **엔드포인트**: PUT `/api/admin/organization/gbs-groups/{gbsGroupId}`
- **설명**: 기존 GBS 그룹 정보를 수정합니다.
- **요청 데이터**:
  ```json
  {
    "name": "동문마을 3조 (수정)",
    "villageId": 1,
    "termStartDate": "2023-07-01",
    "termEndDate": "2023-12-31"
  }
  ```
- **응답 데이터**:
  ```json
  {
    "success": true,
    "timestamp": "2023-08-30T12:00:00Z",
    "data": {
      "id": 4,
      "name": "동문마을 3조 (수정)",
      "villageId": 1,
      "villageName": "동문마을",
      "termStartDate": "2023-07-01",
      "termEndDate": "2023-12-31",
      "leaderId": 103,
      "leaderName": "박지성",
      "createdAt": "2023-08-30T12:00:00Z",
      "updatedAt": "2023-08-30T12:05:00Z"
    },
    "message": "GBS 그룹 수정 성공",
    "code": 200
  }
  ```

### 3.5 GBS 그룹 삭제
- **엔드포인트**: DELETE `/api/admin/organization/gbs-groups/{gbsGroupId}`
- **설명**: 특정 GBS 그룹을 삭제합니다.
- **응답 데이터**:
  ```json
  {
    "success": true,
    "timestamp": "2023-08-30T12:00:00Z",
    "data": null,
    "message": "GBS 그룹 삭제 성공",
    "code": 200
  }
  ```

### 3.6 GBS 그룹 리더 지정
- **엔드포인트**: POST `/api/admin/organization/gbs-groups/{gbsGroupId}/leaders`
- **설명**: GBS 그룹에 리더를 지정합니다.
- **요청 데이터**:
  ```json
  {
    "leaderId": 104,
    "startDate": "2023-08-30"
  }
  ```
- **응답 데이터**:
  ```json
  {
    "success": true,
    "timestamp": "2023-08-30T12:00:00Z",
    "data": null,
    "message": "GBS 리더 지정 성공",
    "code": 200
  }
  ```

### 3.7 GBS 그룹 멤버 추가
- **엔드포인트**: POST `/api/admin/organization/gbs-groups/{gbsGroupId}/members`
- **설명**: GBS 그룹에 멤버를 추가합니다.
- **요청 데이터**:
  ```json
  {
    "memberId": 107,
    "startDate": "2023-08-30"
  }
  ```
- **응답 데이터**:
  ```json
  {
    "success": true,
    "timestamp": "2023-08-30T12:00:00Z",
    "data": null,
    "message": "GBS 멤버 추가 성공",
    "code": 200
  }
  ```

### 3.8 GBS 그룹 멤버 제거
- **엔드포인트**: DELETE `/api/admin/organization/gbs-groups/{gbsGroupId}/members/{userId}`
- **설명**: GBS 그룹에서 멤버를 제거합니다.
- **쿼리 파라미터**: 
  - `endDate`: (선택) 종료일을 지정하면 기록이 유지됨, 없으면 완전 삭제
- **응답 데이터**:
  ```json
  {
    "success": true,
    "timestamp": "2023-08-30T12:00:00Z",
    "data": null,
    "message": "GBS 멤버 제거 성공",
    "code": 200
  }
  ```

## 4. 마을장 관리 API

### 4.1 마을장 지정
- **엔드포인트**: POST `/api/admin/village-leader`
- **설명**: 마을장을 지정합니다.
- **요청 데이터**:
  ```json
  {
    "userId": 105,
    "villageId": 1,
    "startDate": "2023-08-30",
    "endDate": "2023-12-31"
  }
  ```
- **응답 데이터**:
  ```json
  {
    "success": true,
    "timestamp": "2023-08-30T12:00:00Z",
    "data": {
      "userId": 105,
      "userName": "한지민",
      "villageId": 1,
      "villageName": "동문마을",
      "startDate": "2023-08-30",
      "endDate": "2023-12-31",
      "createdAt": "2023-08-30T12:00:00Z",
      "updatedAt": "2023-08-30T12:00:00Z"
    },
    "message": "마을장 지정 성공",
    "code": 200
  }
  ```

### 4.2 마을장 해제
- **엔드포인트**: DELETE `/api/admin/village-leader/{villageId}`
- **설명**: 마을장을 해제합니다.
- **쿼리 파라미터**: 
  - `endDate`: (선택) 종료일을 지정하면 기록이 유지됨
- **응답 데이터**:
  ```json
  {
    "success": true,
    "timestamp": "2023-08-30T12:00:00Z",
    "data": {
      "userId": 105,
      "userName": "한지민",
      "villageId": 1,
      "villageName": "동문마을",
      "startDate": "2023-08-30",
      "endDate": "2023-08-30",
      "createdAt": "2023-08-30T12:00:00Z",
      "updatedAt": "2023-08-30T12:05:00Z"
    },
    "message": "마을장 해제 성공",
    "code": 200
  }
  ``` 