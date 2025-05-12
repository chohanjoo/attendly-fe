"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { BarChart, Users, ChevronsRight, Building } from "lucide-react";
import Link from "next/link";

export default function MinisterDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [departmentInfo, setDepartmentInfo] = useState({
    name: "",
    id: 0,
    totalMembers: 0,
    totalVillages: 0,
    totalGbsGroups: 0,
  });

  useEffect(() => {
    // 목회자 권한 확인 - 아닐 경우 홈으로 리디렉션
    if (user && user.role !== "MINISTER") {
      router.push("/");
    }

    // 부서 정보 가져오기 - 임시 목업 데이터
    const mockDepartmentInfo = {
      name: "대학부",
      id: 1,
      totalMembers: 120,
      totalVillages: 6,
      totalGbsGroups: 24,
    };
    setDepartmentInfo(mockDepartmentInfo);
  }, [user, router]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">목회자 관리 페이지</h1>
      <p className="text-gray-500">
        {departmentInfo.name} 부서의 출석 현황과 통계를 관리할 수 있습니다.
      </p>

      {/* 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">전체 인원</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentInfo.totalMembers}명</div>
            <p className="text-xs text-gray-500">부서 전체 등록 인원</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">마을 수</CardTitle>
            <Building className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentInfo.totalVillages}개</div>
            <p className="text-xs text-gray-500">부서 내 전체 마을 수</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">GBS 그룹</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentInfo.totalGbsGroups}개</div>
            <p className="text-xs text-gray-500">부서 내 전체 GBS 그룹 수</p>
          </CardContent>
        </Card>
      </div>

      {/* 관리 탭 */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats">통계</TabsTrigger>
          <TabsTrigger value="villages">마을 관리</TabsTrigger>
          <TabsTrigger value="members">인원 관리</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>부서 통계</CardTitle>
              <CardDescription>부서의 출석 통계를 확인하고 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Button asChild className="flex items-center gap-2">
                  <Link href="/minister/statistics">
                    부서 통계 보기 <ChevronsRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex items-center gap-2">
                  <Link href="/minister/reports">
                    상세 리포트 보기 <BarChart className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="villages" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>마을 관리</CardTitle>
              <CardDescription>부서 내 마을들의 정보와 출석 현황을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Button asChild className="flex items-center gap-2">
                  <Link href="/minister/villages">
                    전체 마을 보기 <ChevronsRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex items-center gap-2">
                  <Link href="/minister/villages/leaders">
                    마을장 관리 <Users className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>인원 관리</CardTitle>
              <CardDescription>부서 내 모든 구성원들을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Button asChild className="flex items-center gap-2">
                  <Link href="/minister/members">
                    전체 인원 보기 <ChevronsRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex items-center gap-2">
                  <Link href="/minister/members/groups">
                    그룹 관리 <Users className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 