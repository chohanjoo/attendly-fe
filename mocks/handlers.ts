// Mock API 핸들러 (타입 오류는 무시하세요, 실제 구현 시에는 MSW 패키지 설치 필요)
export const handlers = [
  // 마을장이 GBS 출석 데이터를 수정하는 API
  {
    url: '/api/village-leader/:villageId/attendance',
    method: 'POST',
    handleRequest: (req: any, params: { villageId: string }) => {
      const { gbsId, weekStart, attendances } = req.body;
      
      console.log(`마을장 권한으로 GBS 출석 수정 Mock API 호출`);
      console.log(`마을 ID: ${params.villageId}, GBS ID: ${gbsId}, 주차: ${weekStart}`);
      console.log('출석 데이터:', attendances);
      
      // 성공 응답 생성
      const mockResponse = attendances.map((item: any, index: number) => ({
        id: 1000 + index,
        memberId: item.memberId,
        memberName: `멤버 ${item.memberId}`,
        weekStart,
        worship: item.worship,
        qtCount: item.qtCount,
        ministry: item.ministry
      }));
      
      // 약간의 지연 효과를 위한 setTimeout 사용
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            status: 200,
            data: mockResponse
          });
        }, 800);
      });
    }
  },
  
  // 여기에 추가적인 Mock API 핸들러를 추가할 수 있습니다.
]; 