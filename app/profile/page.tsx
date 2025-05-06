"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppShellLayout } from "@/components/layouts/app-shell-layout";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, User as UserIcon, UserCircle, Info, Shield, Users, BarChart3, History, ChevronDown, ChevronUp, UserPlus, Clock, Phone } from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format as dateFormat } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import logger from "@/lib/logger";
import { useLeaderGbsHistory, useGbsMembers } from "@/hooks/use-attendance";
import { useActiveDelegations, useCreateDelegation } from "@/hooks/use-delegation";
import Link from "next/link";
import { GbsMembersListResponse, GbsMemberResponse } from "@/types/attendance";

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

// 새 위임 폼 스키마 정의
const delegationFormSchema = z.object({
  delegateId: z.string().min(1, { message: "위임 받을 리더를 선택해주세요" }),
  gbsGroupId: z.string().min(1, { message: "위임할 GBS를 선택해주세요" }),
  startDate: z.date({ required_error: "시작일을 선택해주세요" }),
  endDate: z.date({ required_error: "종료일을 선택해주세요" }),
}).refine(data => data.startDate < data.endDate, {
  message: "종료일은 시작일 이후여야 합니다",
  path: ["endDate"],
});

type DelegationFormValues = z.infer<typeof delegationFormSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistorySection, setShowHistorySection] = useState(false);
  const [showDelegationSection, setShowDelegationSection] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableLeaders, setAvailableLeaders] = useState<Array<{ id: number, name: string }>>([]);
  const [userGbsList, setUserGbsList] = useState<Array<{ id: number, name: string }>>([]);
  const [isLeadersLoading, setIsLeadersLoading] = useState(false);
  
  // GBS 멤버 모달 관련 상태
  const [isGbsDialogOpen, setIsGbsDialogOpen] = useState(false);
  const [selectedGbsId, setSelectedGbsId] = useState<number | null>(null);
  const [isGbsLoading, setIsGbsLoading] = useState(false);
  const [gbsMembers, setGbsMembers] = useState<GbsMembersListResponse | null>(null);
  
  // 현재 위임 상태 가져오기
  const { data: activeDelegations, isLoading: isDelegationsLoading, refetch: refetchDelegations } = 
    useActiveDelegations(userDetails?.id || null);
  
  // 리더 히스토리 데이터 가져오기
  const { data: leaderHistory, isLoading: isHistoryLoading } = useLeaderGbsHistory(
    userDetails?.id && (userDetails.role === "LEADER" || userDetails.role === "VILLAGE_LEADER" || userDetails.role === "MINISTER" || userDetails.role === "ADMIN") 
      ? userDetails.id 
      : null
  );
  
  // 위임 생성 뮤테이션 훅
  const { mutate: createDelegation, isPending: isCreatingDelegation } = useCreateDelegation();

  // 위임 생성 폼
  const form = useForm<DelegationFormValues>({
    resolver: zodResolver(delegationFormSchema),
    defaultValues: {
      delegateId: "",
      gbsGroupId: "",
    },
  });

  // 위임 생성 제출 핸들러
  const onSubmit = (values: DelegationFormValues) => {
    if (!userDetails) return;
    
    createDelegation({
      delegatorId: userDetails.id,
      delegateId: parseInt(values.delegateId),
      gbsGroupId: parseInt(values.gbsGroupId),
      startDate: dateFormat(values.startDate, 'yyyy-MM-dd'),
      endDate: dateFormat(values.endDate, 'yyyy-MM-dd'),
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
        refetchDelegations();
      }
    });
  };

  // 사용자 세부 정보 가져오기
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const response = await api.get("/auth/me");
        setUserDetails(response.data);
      } catch (err) {
        console.error("사용자 정보를 가져오는 중 오류가 발생했습니다:", err);
        setError("사용자 정보를 가져오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [user]);

  // 리더 목록 및 GBS 목록 가져오기
  useEffect(() => {
    const fetchLeadersAndGbs = async () => {
      if (!userDetails) return;
      if (!(userDetails.role === "LEADER" || userDetails.role === "VILLAGE_LEADER" || userDetails.role === "MINISTER" || userDetails.role === "ADMIN")) return;

      try {
        setIsLeadersLoading(true);
        
        // 리더 목록 가져오기
        const leadersResponse = await api.post("/api/users/by-roles", {
          roles: ["LEADER"]
        });
        
        const leaders = leadersResponse.data.users
          .filter((leader: any) => leader.id !== userDetails.id)
          .map((leader: any) => ({
            id: leader.id,
            name: leader.name
          }));
        
        setAvailableLeaders(leaders);
        
        // 리더의 GBS 목록 가져오기
        if (leaderHistory && leaderHistory.histories) {
          const activeGbsList = leaderHistory.histories
            .filter(history => history.isActive)
            .map(history => ({
              id: history.gbsId,
              name: history.gbsName
            }));
          
          setUserGbsList(activeGbsList);
        }
      } catch (err) {
        console.error("리더 및 GBS 정보를 가져오는 중 오류가 발생했습니다:", err);
      } finally {
        setIsLeadersLoading(false);
      }
    };

    fetchLeadersAndGbs();
  }, [userDetails, leaderHistory]);

  // GBS 멤버 가져오기
  const fetchGbsMembers = async (gbsId: number) => {
    if (!gbsId) return;
    
    try {
      setIsGbsLoading(true);
      const response = await api.get(`/api/v1/gbs-members/${gbsId}`);
      setGbsMembers(response.data);
    } catch (err) {
      console.error("GBS 멤버 정보를 가져오는 중 오류가 발생했습니다:", err);
    } finally {
      setIsGbsLoading(false);
    }
  };

  // GBS 선택 시 멤버 정보 가져오기
  const handleGbsSelect = (gbsId: number) => {
    setSelectedGbsId(gbsId);
    fetchGbsMembers(gbsId);
  };

  // GBS 모달 열기
  const handleOpenGbsModal = () => {
    setIsGbsDialogOpen(true);
    
    // 활성 GBS가 있으면 첫 번째 GBS 선택
    if (leaderHistory && leaderHistory.histories && leaderHistory.histories.length > 0) {
      const activeGbs = leaderHistory.histories.find(history => history.isActive);
      if (activeGbs) {
        handleGbsSelect(activeGbs.gbsId);
      }
    }
  };

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center">
                    <Users className="h-12 w-12 text-indigo-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">담당 GBS 관리</h3>
                    <p className="text-gray-500 text-center mb-4">담당하고 있는 GBS의 멤버와 출석 정보를 확인하세요.</p>
                    <Dialog open={isGbsDialogOpen} onOpenChange={setIsGbsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full" onClick={handleOpenGbsModal}>내 GBS 보기</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[700px]">
                        <DialogHeader>
                          <DialogTitle>내 GBS 멤버</DialogTitle>
                          <DialogDescription>
                            담당하고 있는 GBS의 멤버 정보를 확인하세요.
                          </DialogDescription>
                        </DialogHeader>
                        
                        {/* GBS 선택 탭 (활성 GBS가 여러 개인 경우) */}
                        {leaderHistory && leaderHistory.histories && leaderHistory.histories.filter(h => h.isActive).length > 1 && (
                          <div className="mb-4">
                            <TabsList className="w-full">
                              {leaderHistory.histories
                                .filter(history => history.isActive)
                                .map(gbs => (
                                  <TabsTrigger 
                                    key={gbs.gbsId} 
                                    value={gbs.gbsId.toString()}
                                    className={selectedGbsId === gbs.gbsId ? "bg-indigo-100" : ""}
                                    onClick={() => handleGbsSelect(gbs.gbsId)}
                                  >
                                    {gbs.gbsName}
                                  </TabsTrigger>
                                ))
                              }
                            </TabsList>
                          </div>
                        )}
                        
                        {/* GBS 멤버 목록 */}
                        {isGbsLoading ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                          </div>
                        ) : !gbsMembers ? (
                          <p className="text-center text-gray-500 py-6">GBS 정보를 불러올 수 없습니다.</p>
                        ) : (
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium">{gbsMembers.gbsName}</h3>
                              <Badge variant="outline" className="bg-indigo-100 text-indigo-800">
                                총 {gbsMembers.memberCount}명
                              </Badge>
                            </div>
                            
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                              {gbsMembers.members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50">
                                  <div className="flex items-center">
                                    <Avatar className="h-10 w-10 mr-3">
                                      <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=6366f1&color=fff`} />
                                      <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{member.name}</p>
                                      <div className="flex flex-col space-y-1 text-xs text-gray-500 mt-1">
                                        <div className="flex items-center">
                                          <Calendar className="h-3 w-3 mr-1" />
                                          <span>{member.joinDate && `가입일: ${new Date(member.joinDate).toLocaleDateString('ko-KR')}`}</span>
                                        </div>
                                        {member.birthDate && (
                                          <div className="flex items-center">
                                            <UserIcon className="h-3 w-3 mr-1" />
                                            <span>생일: {new Date(member.birthDate).toLocaleDateString('ko-KR')}</span>
                                          </div>
                                        )}
                                        {member.phoneNumber && (
                                          <div className="flex items-center">
                                            <Phone className="h-3 w-3 mr-1" />
                                            <span>{member.phoneNumber}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    {member.phoneNumber && (
                                      <a 
                                        href={`tel:${member.phoneNumber}`} 
                                        className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                                        title="전화 걸기"
                                      >
                                        <Phone className="h-4 w-4" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex justify-end mt-6">
                              <Button 
                                variant="outline" 
                                onClick={() => setIsGbsDialogOpen(false)}
                              >
                                닫기
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center">
                    <BarChart3 className="h-12 w-12 text-indigo-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">출석 통계</h3>
                    <p className="text-gray-500 text-center mb-4">담당 GBS의 출석 통계와 추이를 확인하세요.</p>
                    <Link href="/gbs/statistics">
                      <Button variant="outline" className="w-full">출석 통계 확인</Button>
                    </Link>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center">
                    <UserPlus className="h-12 w-12 text-indigo-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">리더 위임 관리</h3>
                    <p className="text-gray-500 text-center mb-4">출석 입력을 다른 리더에게 위임하세요.</p>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">위임 관리</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>리더 위임 생성</DialogTitle>
                          <DialogDescription>
                            GBS 출석 입력을 다른 리더에게 위임할 수 있습니다. 위임 기간을 설정하세요.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="delegateId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>위임 받을 리더</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="리더 선택하기" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {isLeadersLoading ? (
                                        <SelectItem value="loading" disabled>로딩중...</SelectItem>
                                      ) : availableLeaders.length === 0 ? (
                                        <SelectItem value="empty" disabled>가능한 리더가 없습니다</SelectItem>
                                      ) : (
                                        availableLeaders.map((leader) => (
                                          <SelectItem key={leader.id} value={leader.id.toString()}>
                                            {leader.name}
                                          </SelectItem>
                                        ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="gbsGroupId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>위임할 GBS</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="GBS 선택하기" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {isLeadersLoading ? (
                                        <SelectItem value="loading" disabled>로딩중...</SelectItem>
                                      ) : userGbsList.length === 0 ? (
                                        <SelectItem value="empty" disabled>담당 GBS가 없습니다</SelectItem>
                                      ) : (
                                        userGbsList.map((gbs) => (
                                          <SelectItem key={gbs.id} value={gbs.id.toString()}>
                                            {gbs.name}
                                          </SelectItem>
                                        ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel>시작일</FormLabel>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <FormControl>
                                          <Button
                                            variant={"outline"}
                                            className={cn(
                                              "pl-3 text-left font-normal",
                                              !field.value && "text-muted-foreground"
                                            )}
                                          >
                                            {field.value ? (
                                              dateFormat(field.value, "yyyy년 MM월 dd일", { locale: ko })
                                            ) : (
                                              <span>날짜 선택</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                          </Button>
                                        </FormControl>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                          mode="single"
                                          selected={field.value}
                                          onSelect={field.onChange}
                                          initialFocus
                                          locale={ko}
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel>종료일</FormLabel>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <FormControl>
                                          <Button
                                            variant={"outline"}
                                            className={cn(
                                              "pl-3 text-left font-normal",
                                              !field.value && "text-muted-foreground"
                                            )}
                                          >
                                            {field.value ? (
                                              dateFormat(field.value, "yyyy년 MM월 dd일", { locale: ko })
                                            ) : (
                                              <span>날짜 선택</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                          </Button>
                                        </FormControl>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                          mode="single"
                                          selected={field.value}
                                          onSelect={field.onChange}
                                          initialFocus
                                          locale={ko}
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <DialogFooter>
                              <Button type="submit" disabled={isCreatingDelegation}>
                                {isCreatingDelegation ? "처리 중..." : "위임 생성"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* 리더 위임 섹션 */}
                <div className="mt-8">
                  <div className="flex items-center justify-between border-b pb-2 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-indigo-500 mr-2" />
                      <h3 className="text-lg font-medium">리더 위임 현황</h3>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowDelegationSection(!showDelegationSection)}
                    >
                      {showDelegationSection ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  
                  {showDelegationSection && (
                    <>
                      {isDelegationsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                      ) : !activeDelegations || activeDelegations.length === 0 ? (
                        <p className="text-center text-gray-500 py-6">현재 활성화된 위임이 없습니다.</p>
                      ) : (
                        <div className="space-y-4">
                          {activeDelegations.map((delegation) => (
                            <div key={delegation.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{delegation.gbsGroupName}</h4>
                                  <p className="text-sm text-gray-500">
                                    위임자: {delegation.delegatorName} → 대리자: {delegation.delegateeName}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(delegation.startDate).toLocaleDateString('ko-KR')} ~ 
                                    {delegation.endDate ? new Date(delegation.endDate).toLocaleDateString('ko-KR') : '무기한'}
                                  </p>
                                </div>
                                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                                  활성화
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* GBS 히스토리 섹션 */}
                <div className="mt-8">
                  <div className="flex items-center justify-between border-b pb-2 mb-4">
                    <div className="flex items-center">
                      <History className="h-5 w-5 text-indigo-500 mr-2" />
                      <h3 className="text-lg font-medium">내 GBS 히스토리</h3>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowHistorySection(!showHistorySection)}
                    >
                      {showHistorySection ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  
                  {showHistorySection && (
                    <>
                      {isHistoryLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                      ) : !leaderHistory ? (
                        <p className="text-center text-gray-500 py-6">히스토리 정보를 불러올 수 없습니다.</p>
                      ) : leaderHistory.historyCount === 0 ? (
                        <p className="text-center text-gray-500 py-6">아직 GBS 히스토리가 없습니다.</p>
                      ) : (
                        <Accordion type="single" collapsible className="w-full">
                          {leaderHistory.histories.map((history) => (
                            <AccordionItem key={history.historyId} value={`history-${history.historyId}`}>
                              <AccordionTrigger className="hover:bg-gray-50 px-4 py-3 rounded-lg">
                                <div className="flex flex-col items-start text-left">
                                  <div className="flex items-center mb-1">
                                    <span className="font-medium">{history.gbsName}</span>
                                    {history.isActive && (
                                      <Badge className="ml-2 bg-green-500 text-white">현재 진행중</Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {history.villageName} · 
                                    {history.startDate && new Date(history.startDate).toLocaleDateString('ko-KR')} ~ 
                                    {history.endDate ? new Date(history.endDate).toLocaleDateString('ko-KR') : '현재'}
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4">
                                <div className="rounded-lg border p-4 bg-white">
                                  <h4 className="font-medium mb-2">GBS 멤버 ({history.members.length}명)</h4>
                                  <div className="space-y-3">
                                    {history.members.map((member) => (
                                      <div key={member.id} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                          <Avatar className="h-8 w-8 mr-2">
                                            <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=6366f1&color=fff`} />
                                            <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <p className="font-medium">{member.name}</p>
                                            <p className="text-xs text-gray-500">
                                              {member.joinDate && `가입일: ${new Date(member.joinDate).toLocaleDateString('ko-KR')}`}
                                            </p>
                                          </div>
                                        </div>
                                        {member.email && (
                                          <a 
                                            href={`mailto:${member.email}`} 
                                            className="text-xs text-indigo-500 hover:text-indigo-600"
                                          >
                                            <Mail className="h-4 w-4" />
                                          </a>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShellLayout>
  );
} 