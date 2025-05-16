"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
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
  Users,
  Edit,
  BarChart,
  Trello,
  Calendar,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { UserVillageResponse } from "@/types/user";

export default function VillageDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const villageId = parseInt(params.id);
  
  const [village, setVillage] = useState<UserVillageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVillageData = async () => {
      setIsLoading(true);
      try {
        // 실제 API 연동
        const response = await fetch(`/api/village/${villageId}`);
        if (!response.ok) throw new Error('마을 정보를 불러오는데 실패했습니다.');
        
        const data = await response.json();
        setVillage(data.data);
      } catch (error) {
        console.error("마을 데이터 조회 실패:", error);
        toast({
          title: '오류',
          description: '마을 정보를 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (villageId) {
      fetchVillageData();
    }
  }, [villageId, toast]);

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
          <Link href="/village">마을 목록으로 돌아가기</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
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
            <h1 className="text-3xl font-bold">{village.villageName}</h1>
            <p className="text-gray-500">
              {village.departmentName} {village.isVillageLeader ? '| 마을장 권한' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push(`/village/${village.villageId}/attendance`)}
          >
            <Calendar className="h-4 w-4" /> 출석 현황
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push(`/village/${village.villageId}/statistics`)}
          >
            <BarChart className="h-4 w-4" /> 통계
          </Button>
          
          <Button
            className="flex items-center gap-2"
            onClick={() => router.push(`/village/${villageId}/gbs-assignment`)}
          >
            <Trello className="h-4 w-4" /> GBS 배치
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>마을 정보</CardTitle>
            <CardDescription>마을의 기본 정보입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">마을명</span>
                <span className="font-medium">{village.villageName}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">부서</span>
                <span className="font-medium">{village.departmentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">권한</span>
                <span className="font-medium">
                  {village.isVillageLeader ? '마을장' : '조회자'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GBS 관리</CardTitle>
            <CardDescription>
              GBS 그룹 관리 및 조편성 작업을 수행할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm">
              6개월마다 재편성되는 GBS 그룹을 칸반 보드를 통해 손쉽게 관리하세요.
              드래그 앤 드롭으로 조원을 배치하고, 리더에게 할당할 수 있습니다.
            </p>
            <Button 
              className="flex items-center gap-2 w-full"
              onClick={() => router.push(`/village/${villageId}/gbs-assignment`)}
            >
              <Trello className="h-4 w-4" /> GBS 배치 바로가기
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 