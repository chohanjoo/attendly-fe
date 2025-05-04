"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppShellLayout } from "@/components/layouts/app-shell-layout";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, User as UserIcon, UserCircle, Info, Shield, Users, BarChart3 } from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/axios";
import logger from "@/lib/logger";

interface UserDetails {
  id: number;
  name: string;
  email: string;
  role: string;
  departmentId: number;
  departmentName: string;
  birthDate?: string;
  createdAt: string;
  updatedAt: string;
}

const roleTranslations: Record<string, string> = {
  ADMIN: "관리자",
  MINISTER: "교역자",
  VILLAGE_LEADER: "마을장",
  LEADER: "리더",
  MEMBER: "멤버"
};

const getRoleColor = (role: string): string => {
  switch (role) {
    case "ADMIN":
      return "bg-red-500";
    case "MINISTER":
      return "bg-yellow-500";
    case "VILLAGE_LEADER":
      return "bg-green-500";
    case "LEADER":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const response = await api.get("/auth/me");
        setUserDetails(response.data);
        
        // 로깅 시 User 객체 타입 변환 (string id → number id)
        const logUser = {
          ...response.data,
          id: String(response.data.id) // id를 string으로 변환
        };
        logger.logUserInfo(logUser);
      } catch (err) {
        console.error("사용자 정보를 가져오는 중 오류가 발생했습니다:", err);
        setError("사용자 정보를 가져오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [user]);

  if (isLoading) {
    return (
      <AppShellLayout>
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </AppShellLayout>
    );
  }

  if (error || !userDetails) {
    return (
      <AppShellLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
          <Info className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">정보를 불러올 수 없습니다</h2>
          <p className="text-gray-600">{error || "사용자 정보를 찾을 수 없습니다."}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            다시 시도
          </Button>
        </div>
      </AppShellLayout>
    );
  }

  return (
    <AppShellLayout>
      <div className="space-y-6 max-w-4xl mx-auto py-6">
        <div>
          <h1 className="text-3xl font-bold">내 프로필</h1>
          <p className="text-gray-500 mt-1">내 계정 정보와 활동 내역을 확인하세요.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 프로필 요약 카드 */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails.name)}&background=6366f1&color=fff`} />
                  <AvatarFallback>
                    <UserCircle className="h-20 w-20 text-gray-400" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{userDetails.name}</CardTitle>
              <div className="flex justify-center mt-2">
                <Badge variant="outline" className={`${getRoleColor(userDetails.role)} text-white`}>
                  {roleTranslations[userDetails.role] || userDetails.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-sm">{userDetails.email}</span>
                </div>
                
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-sm">{userDetails.departmentName}</span>
                </div>
                
                {userDetails.birthDate && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                    <span className="text-sm">{new Date(userDetails.birthDate).toLocaleDateString('ko-KR')}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-sm">가입일: {new Date(userDetails.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* 상세 정보 탭 */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>상세 정보</CardTitle>
              <CardDescription>계정과 관련된 상세 정보를 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="info">
                <TabsList className="mb-4">
                  <TabsTrigger value="info">기본 정보</TabsTrigger>
                  <TabsTrigger value="activity">활동 내역</TabsTrigger>
                  <TabsTrigger value="security">보안 설정</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">이름</h3>
                      <p className="mt-1">{userDetails.name}</p>
                      <Separator className="my-3" />
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">이메일</h3>
                      <p className="mt-1">{userDetails.email}</p>
                      <Separator className="my-3" />
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">소속 부서</h3>
                      <p className="mt-1">{userDetails.departmentName}</p>
                      <Separator className="my-3" />
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">권한</h3>
                      <p className="mt-1">{roleTranslations[userDetails.role] || userDetails.role}</p>
                      <Separator className="my-3" />
                    </div>
                    
                    {userDetails.birthDate && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">생년월일</h3>
                        <p className="mt-1">{new Date(userDetails.birthDate).toLocaleDateString('ko-KR')}</p>
                        <Separator className="my-3" />
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">계정 생성일</h3>
                      <p className="mt-1">{new Date(userDetails.createdAt).toLocaleDateString('ko-KR')} {new Date(userDetails.createdAt).toLocaleTimeString('ko-KR')}</p>
                      <Separator className="my-3" />
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">최근 업데이트</h3>
                      <p className="mt-1">{new Date(userDetails.updatedAt).toLocaleDateString('ko-KR')} {new Date(userDetails.updatedAt).toLocaleTimeString('ko-KR')}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="activity">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-center text-gray-500">이 기능은 아직 개발 중입니다.</p>
                      <p className="text-center text-gray-500 text-sm mt-2">향후 업데이트를 통해 출석 입력 기록, 시스템 활동 등의 정보를 제공할 예정입니다.</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="security">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">비밀번호 변경</h3>
                      <p className="text-sm text-gray-500 mb-4">주기적으로 비밀번호를 변경하여 계정을 보호하세요.</p>
                      <Button>비밀번호 변경</Button>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium mb-2">로그인 이력</h3>
                      <p className="text-sm text-gray-500 mb-4">계정 보안을 위해 최근 로그인 활동을 확인하세요.</p>
                      <Button variant="outline">로그인 이력 보기</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* 리더 정보 카드 (리더인 경우만 표시) */}
          {(userDetails.role === "LEADER" || userDetails.role === "VILLAGE_LEADER" || userDetails.role === "MINISTER" || userDetails.role === "ADMIN") && (
            <Card className="md:col-span-3 mt-6">
              <CardHeader>
                <CardTitle>리더 활동 정보</CardTitle>
                <CardDescription>리더로서의 활동 및 담당 GBS 정보</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center">
                    <Users className="h-12 w-12 text-indigo-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">담당 GBS 관리</h3>
                    <p className="text-gray-500 text-center mb-4">담당하고 있는 GBS의 멤버와 출석 정보를 확인하세요.</p>
                    <Button variant="outline" className="w-full">내 GBS 보기</Button>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center">
                    <BarChart3 className="h-12 w-12 text-indigo-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">출석 통계</h3>
                    <p className="text-gray-500 text-center mb-4">담당 GBS의 출석 통계와 추이를 확인하세요.</p>
                    <Button variant="outline" className="w-full">출석 통계 확인</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShellLayout>
  );
} 