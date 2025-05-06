import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { History, ChevronUp, ChevronDown, Mail } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLeaderGbsHistory } from "@/hooks/use-attendance";

interface GbsHistoryProps {
  userId: number | null;
}

export const GbsHistory = ({ userId }: GbsHistoryProps) => {
  const [showHistorySection, setShowHistorySection] = useState(false);
  const { data: leaderHistory, isLoading: isHistoryLoading } = useLeaderGbsHistory(userId);

  return (
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
  );
}; 