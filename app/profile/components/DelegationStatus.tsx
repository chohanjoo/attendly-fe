import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { useActiveDelegations } from "@/hooks/use-delegation";

interface DelegationStatusProps {
  userId: number | null;
}

export const DelegationStatus = ({ userId }: DelegationStatusProps) => {
  const [showDelegationSection, setShowDelegationSection] = useState(false);
  const { data: activeDelegations, isLoading: isDelegationsLoading } = 
    useActiveDelegations(userId);

  return (
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
  );
}; 