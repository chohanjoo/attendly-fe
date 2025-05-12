"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCreateUser, UserCreateValues } from "@/hooks/use-users"
import { useDepartments } from "@/hooks/use-departments"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const userSchema = z.object({
  name: z.string().min(2, { message: "이름은 2글자 이상이어야 합니다." }),
  email: z.string().email({ message: "유효한 이메일 주소를 입력해주세요." }),
  password: z.string()
    .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." })
    .regex(/(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}/, { 
      message: "비밀번호는 하나 이상의 문자, 숫자, 특수문자를 포함해야 합니다." 
    }),
  phoneNumber: z.string().optional(),
  role: z.string({ required_error: "역할을 선택해주세요." }),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"], { 
    required_error: "상태를 선택해주세요." 
  }),
  birthDate: z.date().optional(),
  departmentId: z.number({ required_error: "부서를 선택해주세요." }),
})

export default function CreateUserPage() {
  const router = useRouter()
  const { mutate: createUser, isPending: isCreating } = useCreateUser(() => {
    router.push("/admin/users")
  })
  const { data: departmentsData, isLoading: isLoadingDepartments } = useDepartments()
  
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      role: "MEMBER",
      status: "ACTIVE",
    },
  })

  function onSubmit(values: z.infer<typeof userSchema>) {
    const userData: UserCreateValues = {
      ...values,
      departmentId: values.departmentId,
      birthDate: values.birthDate ? format(values.birthDate, "yyyy-MM-dd") : undefined
    }
    
    createUser(userData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>돌아가기</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">사용자 추가</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>새 사용자 정보</CardTitle>
          <CardDescription>
            교회 관리 시스템에 새로운 사용자를 등록합니다.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl>
                      <Input placeholder="홍길동" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input placeholder="example@church.org" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      비밀번호는 최소 8자 이상, 문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>전화번호 (선택)</FormLabel>
                    <FormControl>
                      <Input placeholder="010-1234-5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>역할</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="역할 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ADMIN">관리자</SelectItem>
                          <SelectItem value="MINISTER">목회자</SelectItem>
                          <SelectItem value="VILLAGE_LEADER">마을장</SelectItem>
                          <SelectItem value="LEADER">리더</SelectItem>
                          <SelectItem value="MEMBER">조원</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>상태</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="상태 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">활성</SelectItem>
                          <SelectItem value="INACTIVE">비활성</SelectItem>
                          <SelectItem value="PENDING">대기</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>생년월일 (선택)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "yyyy-MM-dd")
                              ) : (
                                <span>생년월일 선택</span>
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
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>부서</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="부서 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingDepartments ? (
                            <SelectItem value="loading" disabled>로딩 중...</SelectItem>
                          ) : (
                            departmentsData?.items.map((department) => (
                              <SelectItem key={department.id} value={department.id.toString()}>
                                {department.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
                취소
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "처리 중..." : "사용자 추가"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
} 