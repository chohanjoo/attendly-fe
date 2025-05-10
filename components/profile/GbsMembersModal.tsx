import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, User, Phone } from "lucide-react";
import { useGbsMembers } from "@/hooks/use-attendance";
import { GbsMembersListResponse } from "@/types/attendance";

interface GbsMembersModalProps {
  leaderHistory: any; // 타입 설정이 필요합니다
}

export const GbsMembersModal = ({ leaderHistory }: GbsMembersModalProps) => {
  const [isGbsDialogOpen, setIsGbsDialogOpen] = useState(false);
  const [selectedGbsId, setSelectedGbsId] = useState<number | null>(null);
  const [gbsMembers, setGbsMembers] = useState<GbsMembersListResponse | null>(null);
  
  // GBS 멤버 데이터 로딩 상태
  const { data, isLoading: isGbsLoading } = useGbsMembers(selectedGbsId);
  
  // GBS 선택 시 멤버 정보 가져오기
  const handleGbsSelect = (gbsId: number) => {
    setSelectedGbsId(gbsId);
  };

  // GBS 모달 열기
  const handleOpenGbsModal = () => {
    setIsGbsDialogOpen(true);
    
    // 활성 GBS가 있으면 첫 번째 GBS 선택
    if (leaderHistory && leaderHistory.histories && leaderHistory.histories.length > 0) {
      const activeGbs = leaderHistory.histories.find((history: any) => history.isActive);
      if (activeGbs) {
        handleGbsSelect(activeGbs.gbsId);
      }
    }
  };
  
  // 데이터가 로딩되면 상태에 저장
  useEffect(() => {
    if (data) {
      setGbsMembers(data);
    }
  }, [data]);

  return (
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
        {leaderHistory && leaderHistory.histories && leaderHistory.histories.filter((h: any) => h.isActive).length > 1 && (
          <div className="mb-4">
            <TabsList className="w-full">
              {leaderHistory.histories
                .filter((history: any) => history.isActive)
                .map((gbs: any) => (
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
                            <User className="h-3 w-3 mr-1" />
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
  );
}; 