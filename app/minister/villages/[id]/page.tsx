"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  UserPlus,
  Users,
  Edit,
  BarChart,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

// 상세 마을 정보 타입
interface VillageDetail {
  id: number;
  name: string;
  leaderName: string | null;
  leaderId: number | null;
  departmentId: number;
  departmentName: string;
  membersCount: number;
  gbsGroupsCount: number;
  createdAt: string;
  updatedAt: string;
}

// GBS 그룹 타입
interface GbsGroup {
  id: number;
  name: string;
  leaderName: string | null;
  leaderId: number | null;
  membersCount: number;
  startDate: string;
  endDate: string;
}

// 마을 멤버 타입
interface VillageMember {
  id: number;
  name: string;
  role: string;
  email: string | null;
  phoneNumber: string | null;
  gbsGroupName: string | null;
  gbsGroupId: number | null;
}

// 출석 통계
interface AttendanceStats {
  weekStart: string;
  totalCount: number;
  attendedCount: number;
  attendanceRate: number;
}

export default function VillageDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const villageId = parseInt(params.id);
  
  const [village, setVillage] = useState<VillageDetail | null>(null);
  const [gbsGroups, setGbsGroups] = useState<GbsGroup[]>([]);
  const [members, setMembers] = useState<VillageMember[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVillageData = async () => {
      setIsLoading(true);
      try {
        // 실제 API 연동 시 아래 코드로 대체
        // const response = await fetch(`/api/minister/villages/${villageId}`);
        // const data = await response.json();
        // setVillage(data.village);
        // setGbsGroups(data.gbsGroups);
        // setMembers(data.members);
        // setAttendanceStats(data.attendanceStats);

        // 목업 데이터
        const mockVillage: VillageDetail = {
          id: villageId,
          name: "동문 마을",
          leaderName: "김철수",
          leaderId: 101,
          departmentId: 1,
          departmentName: "대학부",
          membersCount: 24,
          gbsGroupsCount: 4,
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-06-15T00:00:00Z",
        };

        const mockGbsGroups: GbsGroup[] = [
          {
            id: 1,
            name: "믿음 GBS",
            leaderName: "이믿음",
            leaderId: 201,
            membersCount: 6,
            startDate: "2023-03-01",
            endDate: "2023-08-31",
          },
          {
            id: 2,
            name: "소망 GBS",
            leaderName: "박소망",
            leaderId: 202,
            membersCount: 7,
            startDate: "2023-03-01",
            endDate: "2023-08-31",
          },
          {
            id: 3,
            name: "사랑 GBS",
            leaderName: "김사랑",
            leaderId: 203,
            membersCount: 5,
            startDate: "2023-03-01",
            endDate: "2023-08-31",
          },
          {
            id: 4,
            name: "기쁨 GBS",
            leaderName: "최기쁨",
            leaderId: 204,
            membersCount: 6,
            startDate: "2023-03-01",
            endDate: "2023-08-31",
          },
        ];

        const mockMembers: VillageMember[] = [
          {
            id: 101,
            name: "김철수",
            role: "VILLAGE_LEADER",
            email: "kim@example.com",
            phoneNumber: "010-1234-5678",
            gbsGroupName: null,
            gbsGroupId: null,
          },
          {
            id: 201,
            name: "이믿음",
            role: "LEADER",
            email: "lee@example.com",
            phoneNumber: "010-2345-6789",
            gbsGroupName: "믿음 GBS",
            gbsGroupId: 1,
          },
          {
            id: 202,
            name: "박소망",
            role: "LEADER",
            email: "park@example.com",
            phoneNumber: "010-3456-7890",
            gbsGroupName: "소망 GBS",
            gbsGroupId: 2,
          },
          // 추가 멤버 생략...
        ];

        const mockAttendanceStats: AttendanceStats[] = [
          {
            weekStart: "2023-09-03",
            totalCount: 24,
            attendedCount: 20,
            attendanceRate: 83.3,
          },
          {
            weekStart: "2023-09-10",
            totalCount: 24,
            attendedCount: 22,
            attendanceRate: 91.7,
          },
          {
            weekStart: "2023-09-17",
            totalCount: 24,
            attendedCount: 19,
            attendanceRate: 79.2,
          },
          {
            weekStart: "2023-09-24",
            totalCount: 24,
            attendedCount: 21,
            attendanceRate: 87.5,
          },
        ];

        setVillage(mockVillage);
        setGbsGroups(mockGbsGroups);
        setMembers(mockMembers);
        setAttendanceStats(mockAttendanceStats);
      } catch (error) {
        console.error("마을 데이터 조회 실패:", error);
        toast.error("마을 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (villageId) {
      fetchVillageData();
    }
  }, [villageId]);

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
        <p className="text-gray-500 mt-2">요청하신 마을 정보가 존재하지 않습니다.</p>
        <Button asChild className="mt-4">
          <Link href="/minister/villages">마을 목록으로 돌아가기</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
            <h1 className="text-3xl font-bold">{village.name}</h1>
            <p className="text-gray-500">
              {village.departmentName} | 
              {village.leaderName ? (
                <Link 
                  href={`/minister/members/${village.leaderId}`}
                  className="text-blue-600 hover:underline ml-1"
                >
                  마을장: {village.leaderName}
                </Link>
              ) : (
                <span className="text-red-500 ml-1">마을장 미지정</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          {!village.leaderName && (
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => router.push(`/minister/villages/${village.id}/assign-leader`)}
            >
              <UserPlus className="h-4 w-4" /> 마을장 지정
            </Button>
          )}
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push(`/minister/villages/${village.id}/edit`)}
          >
            <Edit className="h-4 w-4" /> 마을 수정
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={() => router.push(`/minister/statistics/village/${village.id}`)}
          >
            <BarChart className="h-4 w-4" /> 출석 통계
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="groups">GBS 그룹</TabsTrigger>
          <TabsTrigger value="members">구성원</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>마을 정보</CardTitle>
                <CardDescription>마을의 기본 정보입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">마을명</span>
                    <span className="font-medium">{village.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">부서</span>
                    <span className="font-medium">{village.departmentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">마을장</span>
                    <span className="font-medium">
                      {village.leaderName || "미지정"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">인원 수</span>
                    <span className="font-medium">{village.membersCount}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">GBS 그룹 수</span>
                    <span className="font-medium">{village.gbsGroupsCount}개</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>최근 출석 현황</CardTitle>
                <CardDescription>최근 4주간의 출석 현황입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {attendanceStats.map((stat) => (
                    <div key={stat.weekStart} className="flex justify-between items-center">
                      <span className="text-gray-500">
                        {new Date(stat.weekStart).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${stat.attendanceRate}%` }}
                          />
                        </div>
                        <span className="font-medium text-sm">
                          {stat.attendanceRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => router.push(`/minister/statistics/village/${village.id}`)}
                >
                  <Calendar className="h-4 w-4" /> 출석 기록 보기
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="groups" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>GBS 그룹 목록</CardTitle>
                <CardDescription>마을에 속한 GBS 그룹 목록입니다.</CardDescription>
              </div>
              <Button asChild className="flex items-center gap-2">
                <Link href={`/minister/villages/${village.id}/groups/new`}>
                  <UserPlus className="h-4 w-4" /> 그룹 추가
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {gbsGroups.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>그룹명</TableHead>
                      <TableHead>리더</TableHead>
                      <TableHead className="text-right">인원수</TableHead>
                      <TableHead className="text-right">기간</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gbsGroups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell>
                          {group.leaderName ? (
                            <Link
                              href={`/minister/members/${group.leaderId}`}
                              className="text-blue-600 hover:underline"
                            >
                              {group.leaderName}
                            </Link>
                          ) : (
                            "미지정"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {group.membersCount}명
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {new Date(group.startDate).toLocaleDateString('ko-KR')} ~ 
                          {new Date(group.endDate).toLocaleDateString('ko-KR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8"
                          >
                            <Link href={`/minister/gbs/${group.id}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-gray-500">등록된 GBS 그룹이 없습니다.</p>
                  <Button asChild className="mt-4">
                    <Link href={`/minister/villages/${village.id}/groups/new`}>
                      그룹 추가하기
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>구성원 목록</CardTitle>
                <CardDescription>마을에 속한 모든 구성원 목록입니다.</CardDescription>
              </div>
              <Button asChild className="flex items-center gap-2">
                <Link href={`/minister/villages/${village.id}/members/assign`}>
                  <Users className="h-4 w-4" /> 구성원 배정
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {members.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>역할</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>연락처</TableHead>
                      <TableHead>GBS 그룹</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>
                          {member.role === "VILLAGE_LEADER" 
                            ? "마을장" 
                            : member.role === "LEADER"
                            ? "리더"
                            : "조원"}
                        </TableCell>
                        <TableCell>{member.email || "-"}</TableCell>
                        <TableCell>{member.phoneNumber || "-"}</TableCell>
                        <TableCell>
                          {member.gbsGroupName ? (
                            <Link
                              href={`/minister/gbs/${member.gbsGroupId}`}
                              className="text-blue-600 hover:underline"
                            >
                              {member.gbsGroupName}
                            </Link>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8"
                          >
                            <Link href={`/minister/members/${member.id}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-gray-500">등록된 구성원이 없습니다.</p>
                  <Button asChild className="mt-4">
                    <Link href={`/minister/villages/${village.id}/members/assign`}>
                      구성원 배정하기
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 