import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format as dateFormat } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useCreateDelegation } from "@/hooks/use-delegation";
import { LeaderInfo, GbsInfo, DelegationFormValues } from "../types";

// 위임 폼 스키마 정의
const delegationFormSchema = z.object({
  delegateId: z.string().min(1, { message: "위임 받을 리더를 선택해주세요" }),
  gbsGroupId: z.string().min(1, { message: "위임할 GBS를 선택해주세요" }),
  startDate: z.date({ required_error: "시작일을 선택해주세요" }),
  endDate: z.date({ required_error: "종료일을 선택해주세요" }),
}).refine(data => data.startDate < data.endDate, {
  message: "종료일은 시작일 이후여야 합니다",
  path: ["endDate"],
});

interface DelegationFormProps {
  userId: number;
  availableLeaders: LeaderInfo[];
  userGbsList: GbsInfo[];
  isLeadersLoading: boolean;
  onSuccess: () => void;
}

export const DelegationForm = ({ 
  userId, 
  availableLeaders, 
  userGbsList, 
  isLeadersLoading, 
  onSuccess 
}: DelegationFormProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { mutate: createDelegation, isPending: isCreatingDelegation } = useCreateDelegation();

  const form = useForm<DelegationFormValues>({
    resolver: zodResolver(delegationFormSchema),
    defaultValues: {
      delegateId: "",
      gbsGroupId: "",
    },
  });

  const onSubmit = (values: DelegationFormValues) => {
    createDelegation({
      delegatorId: userId,
      delegateId: parseInt(values.delegateId),
      gbsGroupId: parseInt(values.gbsGroupId),
      startDate: dateFormat(values.startDate, 'yyyy-MM-dd'),
      endDate: dateFormat(values.endDate, 'yyyy-MM-dd'),
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
        onSuccess();
      }
    });
  };

  return (
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
                        <Calendar
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
                        <Calendar
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
  );
}; 