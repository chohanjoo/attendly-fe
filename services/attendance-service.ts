import { toast } from "sonner";
import { AttendanceResponse, MonthlyAttendance } from "@/types/attendance";
import { getCurrentMonthWeeks } from "@/lib/attendance-utils";
import { fetchAttendanceByWeek } from "@/hooks/use-attendance-api";

// 이번달 출석 데이터 조회 함수
export const fetchMonthlyAttendance = async (gbsId: number | null): Promise<MonthlyAttendance[]> => {
  if (!gbsId) return [];
  
  try {
    const weekStarts = getCurrentMonthWeeks();
    const allAttendances: AttendanceResponse[][] = [];
    
    // 각 주차별 출석 데이터 조회
    for (const week of weekStarts) {
      try {
        const attendances = await fetchAttendanceByWeek(gbsId, week);
        allAttendances.push(attendances);
      } catch (error) {
        // 데이터가 없는 주차는 빈 배열로 처리
        allAttendances.push([]);
      }
    }
    
    // 조원별로 데이터 재구성
    if (allAttendances.some(week => week.length > 0)) {
      const memberIds = new Set<number>();
      const memberNames = new Map<number, string>();
      
      // 모든 멤버 ID와 이름 수집
      allAttendances.forEach(week => {
        week.forEach(attendance => {
          memberIds.add(attendance.memberId);
          memberNames.set(attendance.memberId, attendance.memberName);
        });
      });
      
      // 월간 출석 데이터 구성
      const monthly: MonthlyAttendance[] = Array.from(memberIds).map(memberId => {
        const attendances = weekStarts
          .map(week => {
            const weekData = allAttendances.find(
              attendances => attendances.find(a => a.weekStart === week && a.memberId === memberId)
            );
            
            const attendance = weekData?.find(a => a.memberId === memberId);
            
            // 실제 출석 데이터가 있는 주차만 반환
            if (attendance) {
              return {
                weekStart: week,
                worship: attendance.worship,
                qtCount: attendance.qtCount,
                ministry: attendance.ministry
              };
            }
            
            return null;
          })
          .filter(Boolean) as {
            weekStart: string;
            worship: 'O' | 'X';
            qtCount: number;
            ministry: 'A' | 'B' | 'C';
          }[];
        
        return {
          memberId,
          memberName: memberNames.get(memberId) || `멤버 ${memberId}`,
          attendances
        };
      });
      
      return monthly;
    }
    
    return [];
  } catch (error) {
    console.error("월간 출석 데이터 조회 중 오류가 발생했습니다:", error);
    toast.error("월간 출석 데이터를 불러오는데 실패했습니다.");
    return [];
  }
}; 