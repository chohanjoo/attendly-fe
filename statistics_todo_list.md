# 출석 통계 기능 구현 Todo List

## API 정의

### 1. 부서 통계 요약 API

- [ ] API 엔드포인트 구현: `GET /api/minister/departments/{departmentId}/statistics`
- [ ] 필수 파라미터:
  - departmentId (path): 부서 ID
  - startDate (query): 시작 날짜 (yyyy-MM-dd)
  - endDate (query): 종료 날짜 (yyyy-MM-dd)
- [ ] 응답 형식:

```json
{
  "success": true,
  "timestamp": "2023-10-05T12:00:00",
  "data": {
    "departmentId": 1,
    "departmentName": "대학부",
    "totalMembers": 120,
    "attendedMembers": 98,
    "attendanceRate": 81.7,
    "averageQtCount": 4.2,
    "villages": [
      {
        "villageId": 1,
        "villageName": "동문 마을",
        "totalMembers": 24,
        "attendedMembers": 22,
        "attendanceRate": 91.7,
        "averageQtCount": 4.8
      }
    ],
    "weeklyStats": [
      {
        "weekStart": "2023-09-03",
        "totalMembers": 120,
        "attendedMembers": 95,
        "attendanceRate": 79.2
      }
    ]
  },
  "message": "부서 통계 조회 성공",
  "code": 200
}
```

### 2. 마을별 상세 통계 API

- [ ] API 엔드포인트 구현: `GET /api/minister/departments/{departmentId}/villages/{villageId}/statistics`
- [ ] 필수 파라미터:
  - departmentId (path): 부서 ID
  - villageId (path): 마을 ID
  - startDate (query): 시작 날짜 (yyyy-MM-dd)
  - endDate (query): 종료 날짜 (yyyy-MM-dd)
- [ ] 응답 형식:

```json
{
  "success": true,
  "timestamp": "2023-10-05T12:00:00",
  "data": {
    "villageId": 1,
    "villageName": "동문 마을",
    "totalMembers": 24,
    "attendedMembers": 22,
    "attendanceRate": 91.7,
    "averageQtCount": 4.8,
    "members": [
      {
        "userId": 1,
        "userName": "홍길동",
        "attendanceCount": 4,
        "attendanceRate": 100.0,
        "qtCount": 5
      }
    ],
    "weeklyStats": [
      {
        "weekStart": "2023-09-03",
        "totalMembers": 24,
        "attendedMembers": 22,
        "attendanceRate": 91.7
      }
    ]
  },
  "message": "마을별 통계 조회 성공",
  "code": 200
}
```

### 3. 통계 데이터 다운로드 API

- [ ] API 엔드포인트 구현: `GET /api/minister/departments/{departmentId}/statistics/download`
- [ ] 필수 파라미터:
  - departmentId (path): 부서 ID
  - startDate (query): 시작 날짜 (yyyy-MM-dd)
  - endDate (query): 종료 날짜 (yyyy-MM-dd)
  - format (query): 다운로드 형식 (xls, csv)
- [ ] 응답 형식:
  - Content-Type: application/vnd.ms-excel 또는 text/csv
  - 파일 다운로드 스트림 (Excel 또는 CSV 파일)

## 프론트엔드 구현 작업

### 1. 부서 통계 요약 페이지 수정

- [ ] API 연동 코드 구현:

```typescript
useEffect(() => {
  const fetchStatistics = async () => {
    setIsLoading(true);
    
    try {
      const startDateStr = format(date.from!, 'yyyy-MM-dd');
      const endDateStr = format(date.to || date.from!, 'yyyy-MM-dd');
      
      const response = await fetch(
        `/api/minister/departments/1/statistics?startDate=${startDateStr}&endDate=${endDateStr}`
      );
      
      if (!response.ok) {
        throw new Error('통계 데이터 조회 실패');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const stats = data.data;
        setDepartmentStats({
          departmentId: stats.departmentId,
          departmentName: stats.departmentName,
          totalMembers: stats.totalMembers,
          attendedMembers: stats.attendedMembers,
          attendanceRate: stats.attendanceRate,
          averageQtCount: stats.averageQtCount
        });
        
        setVillageStats(stats.villages);
        setWeeklyStats(stats.weeklyStats);
      } else {
        throw new Error(data.message || '통계 데이터 조회 실패');
      }
    } catch (error) {
      console.error("통계 데이터 조회 실패:", error);
      toast.error("통계 데이터를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (date.from) {
    fetchStatistics();
  }
}, [date]);
```

- [ ] 모킹 데이터 제거

### 2. 엑셀 다운로드 기능 구현

- [ ] 다운로드 핸들러 수정:

```typescript
const handleExcelDownload = () => {
  const startDateStr = format(date.from!, 'yyyy-MM-dd');
  const endDateStr = format(date.to || date.from!, 'yyyy-MM-dd');
  
  window.location.href = `/api/minister/departments/1/statistics/download?startDate=${startDateStr}&endDate=${endDateStr}&format=xls`;
  
  toast.success("통계 데이터가 다운로드 되었습니다.");
};
```

### 3. 마을 상세 통계 페이지 연동

- [ ] 마을 상세 페이지 API 연동 코드 작성
- [ ] 마을별 멤버 데이터 표시 컴포넌트 구현
- [ ] 주차별 출석 통계 차트 구현

## 테스트 작업

- [ ] 부서 통계 요약 API 테스트
- [ ] 마을 상세 통계 API 테스트
- [ ] 데이터 다운로드 기능 테스트
- [ ] 다양한 날짜 범위 선택 테스트
- [ ] 에러 처리 및 예외 케이스 테스트 