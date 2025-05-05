import { useState, useEffect } from "react";
import { useLeaderGbs, useGbsMembers, useAttendance, useSaveAttendance } from "@/hooks/use-attendance";
import { fetchMonthlyAttendance } from "@/services/attendance-service";
import { getWeekStart } from "@/lib/attendance-utils";
import { AttendanceItemRequest, MonthlyAttendance } from "@/types/attendance";

export const useAttendanceManager = () => {
  const [gbsId, setGbsId] = useState<number | null>(null);
  const [weekStart, setWeekStart] = useState<string>(getWeekStart());
  const [openModal, setOpenModal] = useState(false);
  const [attendanceInputs, setAttendanceInputs] = useState<AttendanceItemRequest[]>([]);
  const [attendanceExists, setAttendanceExists] = useState<boolean[]>([]);
  const [activeTab, setActiveTab] = useState("weekly");
  const [monthlyData, setMonthlyData] = useState<MonthlyAttendance[]>([]);
  const [isMonthlyLoading, setIsMonthlyLoading] = useState(false);
  
  // API 호출 훅 사용
  const { data: leaderGbs } = useLeaderGbs();
  const { data: gbsMembers, isLoading: isMembersLoading, error: membersError } = useGbsMembers(gbsId);
  const { data: attendances, isLoading, error } = useAttendance(gbsId, weekStart);
  const { mutate, isPending } = useSaveAttendance();

  // gbsId 설정
  useEffect(() => {
    if (leaderGbs) {
      setGbsId(leaderGbs.gbsId);
    }
  }, [leaderGbs]);

  // 출석 입력 변경 핸들러
  const handleInputChange = (index: number, field: keyof AttendanceItemRequest, value: any) => {
    const newInputs = [...attendanceInputs];
    newInputs[index] = { ...newInputs[index], [field]: value };
    setAttendanceInputs(newInputs);
  };

  // 예배 출석 상태를 토글하는 함수
  const toggleWorship = (index: number) => {
    const newInputs = [...attendanceInputs];
    newInputs[index].worship = newInputs[index].worship === 'O' ? 'X' : 'O';
    setAttendanceInputs(newInputs);
  };

  // 출석 입력 시작하기
  const handleStartAttendanceInput = () => {
    if (!gbsMembers || gbsMembers.members.length === 0) {
      setAttendanceInputs([]);
      setAttendanceExists([]);
      setOpenModal(true);
      return;
    }
    
    // GBS 모든 멤버를 포함하는 초기 데이터 생성
    const initialInputs: AttendanceItemRequest[] = [];
    const existsFlags: boolean[] = [];
    
    gbsMembers.members.forEach(member => {
      // 기존 출석 데이터가 있는 멤버인지 확인
      const existingAttendance = attendances?.find(att => att.memberId === member.id);
      
      if (existingAttendance) {
        // 기존 출석 데이터가 있는 경우
        initialInputs.push({
          memberId: existingAttendance.memberId,
          worship: existingAttendance.worship,
          qtCount: existingAttendance.qtCount,
          ministry: existingAttendance.ministry
        });
        existsFlags.push(true); // 출석 데이터 있음
      } else {
        // 기존 출석 데이터가 없는 경우
        initialInputs.push({
          memberId: member.id,
          worship: 'X' as 'O' | 'X',
          qtCount: 0,
          ministry: 'A' as 'A' | 'B' | 'C'
        });
        existsFlags.push(false); // 출석 데이터 없음
      }
    });
    
    setAttendanceInputs(initialInputs);
    setAttendanceExists(existsFlags);
    setOpenModal(true);
  };

  // 출석 데이터 저장
  const handleSaveAttendance = (activeInputs: AttendanceItemRequest[]) => {
    if (!gbsId) return;
    
    const attendanceData = {
      gbsId,
      weekStart,
      attendances: activeInputs // AttendanceInputModal에서 이미 필터링된 멤버만 사용
    };
    
    mutate(attendanceData);
  };

  // 이번달 출석 데이터 조회
  const handleFetchMonthlyAttendance = async () => {
    if (!gbsId) return;
    
    setIsMonthlyLoading(true);
    const data = await fetchMonthlyAttendance(gbsId);
    setMonthlyData(data);
    setIsMonthlyLoading(false);
  };

  // 월간 탭 클릭 시 데이터 로드
  useEffect(() => {
    if (activeTab === "monthly" && gbsId) {
      handleFetchMonthlyAttendance();
    }
  }, [activeTab, gbsId]);

  // 멤버 이름을 매핑한 객체 생성
  const getMemberNameMap = () => {
    const nameMap: Record<number, string> = {};
    
    // gbsMembers에서 모든 멤버 이름 추출
    gbsMembers?.members.forEach(member => {
      nameMap[member.id] = member.name;
    });
    
    // attendances에서 멤버 이름 추가 또는 업데이트
    attendances?.forEach(att => {
      nameMap[att.memberId] = att.memberName;
    });
    
    return nameMap;
  };

  return {
    gbsId,
    weekStart,
    openModal,
    setOpenModal,
    attendanceInputs,
    attendanceExists,
    activeTab,
    setActiveTab,
    monthlyData,
    isMonthlyLoading,
    leaderGbs,
    gbsMembers,
    isMembersLoading,
    membersError,
    attendances,
    isLoading,
    error,
    isPending,
    handleInputChange,
    toggleWorship,
    handleStartAttendanceInput,
    handleSaveAttendance,
    handleFetchMonthlyAttendance,
    getMemberNameMap
  };
}; 