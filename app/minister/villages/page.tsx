"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, ChevronRight, Plus, Info } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// 마을 정보 타입 정의
interface Village {
  id: number;
  name: string;
  leaderName: string | null;
  leaderId: number | null;
  membersCount: number;
  gbsGroupsCount: number;
}

export default function VillagesManagement() {
  const router = useRouter();
  const [villages, setVillages] = useState<Village[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 마을 목록 가져오기 (API 연동)
    const fetchVillages = async () => {
      setIsLoading(true);
      try {
        // 실제 API 연동 시 아래 코드로 대체
        // const response = await fetch('/api/minister/villages');
        // const data = await response.json();
        // setVillages(data.villages);

        // 목업 데이터
        const mockVillages: Village[] = [
          {
            id: 1,
            name: "동문 마을",
            leaderName: "김철수",
            leaderId: 101,
            membersCount: 24,
            gbsGroupsCount: 4,
          },
          {
            id: 2,
            name: "서문 마을",
            leaderName: "박영희",
            leaderId: 102,
            membersCount: 18,
            gbsGroupsCount: 3,
          },
          {
            id: 3,
            name: "남문 마을",
            leaderName: "이지은",
            leaderId: 103,
            membersCount: 21,
            gbsGroupsCount: 4,
          },
          {
            id: 4,
            name: "북문 마을",
            leaderName: "정민석",
            leaderId: 104,
            membersCount: 19,
            gbsGroupsCount: 3,
          },
          {
            id: 5,
            name: "중앙 마을",
            leaderName: null,
            leaderId: null,
            membersCount: 22,
            gbsGroupsCount: 4,
          },
          {
            id: 6,
            name: "신입생 마을",
            leaderName: "송지원",
            leaderId: 106,
            membersCount: 16,
            gbsGroupsCount: 3,
          },
        ];

        setVillages(mockVillages);
      } catch (error) {
        console.error("마을 목록 조회 실패:", error);
        toast.error("마을 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVillages();
  }, []);

  // 검색어로 마을 필터링
  const filteredVillages = villages.filter(
    (village) =>
      village.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (village.leaderName &&
        village.leaderName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">마을 관리</h1>
          <p className="text-gray-500">부서 내 모든 마을을 관리합니다.</p>
        </div>
        <Button asChild className="flex items-center gap-2">
          <Link href="/minister/villages/new">
            <Plus className="h-4 w-4" /> 마을 추가
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>마을 목록</CardTitle>
          <CardDescription>
            부서에 속한 모든 마을 목록과 기본 정보입니다.
          </CardDescription>
          <div className="flex mt-2 sm:w-[360px]">
            <Input
              placeholder="마을 이름 또는 마을장 이름으로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <Button variant="ghost" size="icon" className="shrink-0">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredVillages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>마을명</TableHead>
                  <TableHead>마을장</TableHead>
                  <TableHead className="text-right">인원수</TableHead>
                  <TableHead className="text-right">GBS 그룹</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVillages.map((village) => (
                  <TableRow key={village.id}>
                    <TableCell className="font-medium">{village.name}</TableCell>
                    <TableCell>
                      {village.leaderName ? (
                        <Link
                          href={`/minister/members/${village.leaderId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {village.leaderName}
                        </Link>
                      ) : (
                        <span className="text-red-500 text-sm flex items-center">
                          <Info className="h-3 w-3 mr-1" /> 마을장 미지정
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {village.membersCount}명
                    </TableCell>
                    <TableCell className="text-right">
                      {village.gbsGroupsCount}개
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8"
                        >
                          <Link href={`/minister/villages/${village.id}`}>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">메뉴 열기</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/minister/villages/${village.id}/edit`
                                )
                              }
                            >
                              수정하기
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/minister/villages/${village.id}/groups`
                                )
                              }
                            >
                              GBS 그룹 관리
                            </DropdownMenuItem>
                            {!village.leaderName && (
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/minister/villages/${village.id}/assign-leader`
                                  )
                                }
                              >
                                마을장 지정하기
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 