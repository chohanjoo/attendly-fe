"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// 마을 정보 타입
interface Village {
  id: number;
  name: string;
  departmentId: number;
  departmentName: string;
  currentLeaderId: number | null;
  currentLeaderName: string | null;
}

// 사용자 타입
interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  departmentId: number;
  departmentName: string;
}

export default function AssignVillageLeader({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const villageId = parseInt(params.id);

  const [village, setVillage] = useState<Village | null>(null);
  const [candidates, setCandidates] = useState<User[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 실제 API 연동 시 아래 코드로 대체
        // const villageResponse = await fetch(`/api/minister/villages/${villageId}`);
        // const villageData = await villageResponse.json();
        // setVillage(villageData.village);
        
        // const candidatesResponse = await fetch(`/api/users/by-roles`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ roles: ["MEMBER", "LEADER"] })
        // });
        // const candidatesData = await candidatesResponse.json();
        // setCandidates(candidatesData.data.users);
        // setFilteredCandidates(candidatesData.data.users);

        // 목업 데이터
        const mockVillage: Village = {
          id: villageId,
          name: "동문 마을",
          departmentId: 1,
          departmentName: "대학부",
          currentLeaderId: null,
          currentLeaderName: null,
        };

        const mockCandidates: User[] = [
          {
            id: 101,
            name: "김철수",
            email: "kim@example.com",
            phoneNumber: "010-1234-5678",
            departmentId: 1,
            departmentName: "대학부",
          },
          {
            id: 102,
            name: "이영희",
            email: "lee@example.com",
            phoneNumber: "010-2345-6789",
            departmentId: 1,
            departmentName: "대학부",
          },
          {
            id: 103,
            name: "박지민",
            email: "park@example.com",
            phoneNumber: "010-3456-7890",
            departmentId: 1,
            departmentName: "대학부",
          },
          {
            id: 104,
            name: "정민준",
            email: "jung@example.com",
            phoneNumber: "010-4567-8901",
            departmentId: 1,
            departmentName: "대학부",
          },
          {
            id: 105,
            name: "최서연",
            email: "choi@example.com",
            phoneNumber: "010-5678-9012",
            departmentId: 1,
            departmentName: "대학부",
          },
        ];

        setVillage(mockVillage);
        setCandidates(mockCandidates);
        setFilteredCandidates(mockCandidates);
      } catch (error) {
        console.error("데이터 조회 실패:", error);
        toast.error("데이터를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [villageId]);

  // 검색어에 따라 후보자 필터링
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredCandidates(candidates);
    } else {
      const filtered = candidates.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCandidates(filtered);
    }
  }, [searchTerm, candidates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      toast.error("마을장으로 지정할 사용자를 선택해주세요.");
      return;
    }

    if (!startDate) {
      toast.error("임기 시작일을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 실제 API 연동 시 아래 코드로 대체
      // const response = await fetch('/api/admin/village-leader', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     userId: selectedUserId,
      //     villageId: villageId,
      //     startDate: format(startDate, 'yyyy-MM-dd'),
      //     endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined
      //   })
      // });
      
      // if (!response.ok) {
      //   throw new Error('마을장 지정에 실패했습니다.');
      // }
      
      // 성공 처리 (목업)
      setTimeout(() => {
        toast.success("마을장이 성공적으로 지정되었습니다.");
        router.push(`/minister/villages/${villageId}`);
      }, 1000);
    } catch (error) {
      console.error("마을장 지정 실패:", error);
      toast.error("마을장 지정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!village) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold">마을 정보를 찾을 수 없습니다.</h2>
        <p className="text-gray-500 mt-2">
          요청하신 마을 정보가 존재하지 않습니다.
        </p>
        <Button asChild className="mt-4">
          <Link href="/minister/villages">마을 목록으로 돌아가기</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">마을장 지정</h1>
          <p className="text-gray-500">{village.name}의 마을장을 지정합니다.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>마을장 지정</CardTitle>
            <CardDescription>
              마을을 관리할 마을장을 지정하고 임기를 설정합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 현재 마을 정보 */}
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-gray-500">마을명</span>
                <span className="font-medium">{village.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">소속 부서</span>
                <span className="font-medium">{village.departmentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">현재 마을장</span>
                <span className="font-medium">
                  {village.currentLeaderName || "미지정"}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              {/* 마을장 선택 */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search">마을장 검색</Label>
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="이름 또는 이메일로 검색"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="user">마을장 선택</Label>
                  <Select
                    value={selectedUserId?.toString() || ""}
                    onValueChange={(value) => setSelectedUserId(parseInt(value))}
                  >
                    <SelectTrigger id="user" className="mt-1">
                      <SelectValue placeholder="마을장으로 지정할 사용자 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCandidates.length > 0 ? (
                        filteredCandidates.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>
                          검색 결과가 없습니다
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* 임기 설정 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">임기 시작일</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          id="startDate"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? (
                            format(startDate, "PPP", { locale: ko })
                          ) : (
                            <span>날짜 선택</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          locale={ko}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">임기 종료일 (선택)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          id="endDate"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? (
                            format(endDate, "PPP", { locale: ko })
                          ) : (
                            <span>날짜 선택</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          locale={ko}
                          disabled={(date) =>
                            startDate ? date < startDate : false
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/minister/villages/${villageId}`)}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedUserId || !startDate}
              className="flex items-center gap-1"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-1"></div>
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              마을장 지정
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 