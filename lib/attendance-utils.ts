import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { startOfMonth, endOfMonth, eachWeekOfInterval } from "date-fns";

// 주간 시작일을 계산하는 함수 (일요일 기준)
export function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
  const diff = now.getDate() - dayOfWeek;
  const sunday = new Date(now.setDate(diff));
  return format(sunday, 'yyyy-MM-dd');
}

// ministryGrade에 따른 색상 반환 함수
export function getMinistryBadgeVariant(grade: string) {
  switch (grade) {
    case 'A': return "default";
    case 'B': return "secondary";
    case 'C': return "destructive";
    default: return "outline";
  }
}

// 날짜 형식 포맷 함수
export function formatDate(dateString: string) {
  return format(new Date(dateString), 'yyyy년 MM월 dd일', { locale: ko });
}

// 이번달 주차 배열 생성
export function getCurrentMonthWeeks() {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  
  return eachWeekOfInterval(
    { start: monthStart, end: monthEnd },
    { weekStartsOn: 0 } // 0: 일요일부터 시작
  ).map(date => format(date, 'yyyy-MM-dd'));
} 