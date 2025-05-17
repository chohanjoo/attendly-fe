import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/axios";
import { UserVillageResponse } from "@/types/user";

export const useVillage = (villageId: number) => {
  const { toast } = useToast();
  const [village, setVillage] = useState<UserVillageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVillageData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/api/village/${villageId}`);
        setVillage(response.data.data);
        setError(null);
      } catch (error) {
        console.error("마을 데이터 조회 실패:", error);
        setError("마을 정보를 불러오는데 실패했습니다.");
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

  return {
    village,
    isLoading,
    error
  };
}; 