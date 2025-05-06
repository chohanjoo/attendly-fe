import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { UserDetails, roleTranslations } from "../types";

interface ProfileDetailTabsProps {
  userDetails: UserDetails;
}

export const ProfileDetailTabs = ({ userDetails }: ProfileDetailTabsProps) => {
  return (
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
  );
}; 