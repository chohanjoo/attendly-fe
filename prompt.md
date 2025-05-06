-- 문제 제기 및 개선 요청
# AS-IS 
gbs 의 출석 조회 API 를 호출하여 출석체크한 member만 "GBS 출력 입력" 에 노출 

# 문제점 
GBS 에 속한 member 중에 출석체크 안한 조원은 노출되지 않는 문제가 있다. 
예를 들어, GBS 에 3명의 member 가 있고 2명의 member 만 출석체크를 했다면 
다시 수정할때 나머지 1명은 보이지 않는다. 

# TO-BE 
"GBS 출력 입력" 에는 GBS 에 속한 모든 member 가 나온다. 
단, 출석체크를 하지 않은 조원은 비활성화 상태로 노출되고 이미 출석체크한 조원은 활성화 상태로 나온다. 

# API 
GBS 에 속한 모든 조원 조회 : /api/v1/gbs-members/my-gbs 
GBS 출석 조회 API : /api/attendance 

API 스펙은 @api-docs.json 을 참고한다