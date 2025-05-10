"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { 
  AlertOctagon,
  Save,
  Mail,
  Bell,
  Smartphone,
  LayoutDashboard,
  ShieldCheck,
  RefreshCw,
  Clock,
} from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

// 폼 스키마 정의
const generalFormSchema = z.object({
  siteName: z.string().min(1, { message: "사이트 이름은 필수입니다." }),
  siteDescription: z.string(),
  logoUrl: z.string().url({ message: "유효한 URL을 입력해주세요." }).optional().or(z.literal("")),
  faviconUrl: z.string().url({ message: "유효한 URL을 입력해주세요." }).optional().or(z.literal("")),
  primaryColor: z.string(),
  dateFormat: z.string(),
  timeFormat: z.string(),
})

const emailFormSchema = z.object({
  smtpHost: z.string().min(1, { message: "SMTP 호스트는 필수입니다." }),
  smtpPort: z.string().min(1, { message: "SMTP 포트는 필수입니다." }),
  smtpUsername: z.string().min(1, { message: "SMTP 사용자 이름은 필수입니다." }),
  smtpPassword: z.string().min(1, { message: "SMTP 비밀번호는 필수입니다." }),
  senderEmail: z.string().email({ message: "유효한 이메일을 입력해주세요." }),
  senderName: z.string().min(1, { message: "발송자 이름은 필수입니다." }),
})

const notificationFormSchema = z.object({
  enableEmailNotifications: z.boolean(),
  enablePushNotifications: z.boolean(),
  enableSmsNotifications: z.boolean(),
  newUserNotification: z.boolean(),
  attendanceReminderDays: z.array(z.string()),
  reminderTime: z.string(),
})

// 임시 데이터
const mockSettings = {
  general: {
    siteName: "Attendly",
    siteDescription: "교회 출석 관리 시스템",
    logoUrl: "https://example.com/logo.png",
    faviconUrl: "https://example.com/favicon.ico",
    primaryColor: "#4F46E5",
    dateFormat: "yyyy-MM-dd",
    timeFormat: "HH:mm",
  },
  email: {
    smtpHost: "smtp.example.com",
    smtpPort: "587",
    smtpUsername: "noreply@example.com",
    smtpPassword: "password123",
    senderEmail: "noreply@example.com",
    senderName: "Attendly",
  },
  notification: {
    enableEmailNotifications: true,
    enablePushNotifications: false,
    enableSmsNotifications: false,
    newUserNotification: true,
    attendanceReminderDays: ["0", "6"], // 일요일, 토요일
    reminderTime: "09:00",
  }
}

// API 호출 함수
const fetchSettings = async () => {
  // const response = await axios.get("/api/admin/settings")
  // return response.data
  
  // 임시로 데이터 반환
  return mockSettings
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: fetchSettings,
  })

  // 폼 초기화
  const generalForm = useForm<z.infer<typeof generalFormSchema>>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: settings?.general || {
      siteName: "",
      siteDescription: "",
      logoUrl: "",
      faviconUrl: "",
      primaryColor: "#000000",
      dateFormat: "yyyy-MM-dd",
      timeFormat: "HH:mm",
    },
  })

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: settings?.email || {
      smtpHost: "",
      smtpPort: "",
      smtpUsername: "",
      smtpPassword: "",
      senderEmail: "",
      senderName: "",
    },
  })

  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: settings?.notification || {
      enableEmailNotifications: false,
      enablePushNotifications: false,
      enableSmsNotifications: false,
      newUserNotification: false,
      attendanceReminderDays: [],
      reminderTime: "09:00",
    },
  })

  // 설정값 업데이트
  React.useEffect(() => {
    if (settings) {
      generalForm.reset(settings.general)
      emailForm.reset(settings.email)
      notificationForm.reset(settings.notification)
    }
  }, [settings, generalForm, emailForm, notificationForm])

  // 업데이트 뮤테이션
  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => {
      // return axios.put("/api/admin/settings", data)
      // 임시 성공 응답
      return Promise.resolve({ data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] })
      toast.success("설정이 저장되었습니다.")
    },
    onError: () => {
      toast.error("설정 저장에 실패했습니다.")
    },
  })

  // 폼 제출 핸들러
  const onSubmitGeneral = (data: z.infer<typeof generalFormSchema>) => {
    updateSettingsMutation.mutate({ 
      type: "general", 
      data 
    })
  }

  const onSubmitEmail = (data: z.infer<typeof emailFormSchema>) => {
    updateSettingsMutation.mutate({ 
      type: "email", 
      data 
    })
  }

  const onSubmitNotification = (data: z.infer<typeof notificationFormSchema>) => {
    updateSettingsMutation.mutate({ 
      type: "notification", 
      data 
    })
  }

  const testEmailConnection = () => {
    // 실제로는 API 호출
    // const data = emailForm.getValues()
    // axios.post("/api/admin/settings/test-email", data)
    
    toast.success("이메일 설정이 테스트 됐습니다. 메일이 발송되었습니다.")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">시스템 설정</h1>
        <p className="text-muted-foreground mt-2">
          시스템 환경 설정을 관리합니다.
        </p>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span>일반</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>이메일</span>
          </TabsTrigger>
          <TabsTrigger value="notification" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>알림</span>
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="py-10 text-center">설정을 불러오고 있습니다...</div>
        ) : (
          <>
            <TabsContent value="general" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>일반 설정</CardTitle>
                  <CardDescription>
                    사이트 기본 정보 및 시스템 설정을 관리합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...generalForm}>
                    <form
                      id="general-form"
                      onSubmit={generalForm.handleSubmit(onSubmitGeneral)}
                      className="space-y-6"
                    >
                      <FormField
                        control={generalForm.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>사이트 이름</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              브라우저 탭과 사이트 상단에 표시되는 이름입니다.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="siteDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>사이트 설명</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="사이트에 대한 간략한 설명을 입력하세요."
                                className="resize-none"
                              />
                            </FormControl>
                            <FormDescription>
                              SEO 및 메타 태그에 사용됩니다.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                          control={generalForm.control}
                          name="logoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>로고 URL</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://" />
                              </FormControl>
                              <FormDescription>
                                사이트 로고 이미지 URL
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={generalForm.control}
                          name="faviconUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>파비콘 URL</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://" />
                              </FormControl>
                              <FormDescription>
                                브라우저 탭에 표시되는 아이콘 URL
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={generalForm.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>기본 색상</FormLabel>
                            <div className="flex items-center gap-2">
                              <FormControl>
                                <Input
                                  type="color"
                                  {...field}
                                  className="w-12 h-10 p-1"
                                />
                              </FormControl>
                              <Input
                                value={field.value}
                                onChange={field.onChange}
                                className="w-32"
                              />
                            </div>
                            <FormDescription>
                              사이트의 주요 색상을 설정합니다.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                          control={generalForm.control}
                          name="dateFormat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>날짜 형식</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="날짜 형식 선택" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="yyyy-MM-dd">
                                    YYYY-MM-DD (2023-01-31)
                                  </SelectItem>
                                  <SelectItem value="dd/MM/yyyy">
                                    DD/MM/YYYY (31/01/2023)
                                  </SelectItem>
                                  <SelectItem value="MM/dd/yyyy">
                                    MM/DD/YYYY (01/31/2023)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                시스템에서 표시되는 날짜 형식입니다.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={generalForm.control}
                          name="timeFormat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>시간 형식</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="시간 형식 선택" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="HH:mm">
                                    24시간제 (14:30)
                                  </SelectItem>
                                  <SelectItem value="hh:mm a">
                                    12시간제 (02:30 PM)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                시스템에서 표시되는 시간 형식입니다.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    type="submit"
                    form="general-form"
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? (
                      <>저장 중...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        <span>설정 저장</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>이메일 설정</CardTitle>
                  <CardDescription>
                    시스템 이메일 발송을 위한 SMTP 설정을 관리합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...emailForm}>
                    <form
                      id="email-form"
                      onSubmit={emailForm.handleSubmit(onSubmitEmail)}
                      className="space-y-6"
                    >
                      <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                          control={emailForm.control}
                          name="smtpHost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP 호스트</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="smtp.example.com" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={emailForm.control}
                          name="smtpPort"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP 포트</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="587" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                          control={emailForm.control}
                          name="smtpUsername"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP 사용자 이름</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="username" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={emailForm.control}
                          name="smtpPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP 비밀번호</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  placeholder="••••••••"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                          control={emailForm.control}
                          name="senderEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>발송자 이메일</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="noreply@example.com"
                                />
                              </FormControl>
                              <FormDescription>
                                이메일 발송시 보내는 사람 주소
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={emailForm.control}
                          name="senderName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>발송자 이름</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Attendly" />
                              </FormControl>
                              <FormDescription>
                                이메일 발송시 보내는 사람 이름
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={testEmailConnection}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    <span>이메일 연결 테스트</span>
                  </Button>
                  <Button
                    type="submit"
                    form="email-form"
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? (
                      <>저장 중...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        <span>설정 저장</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notification" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>알림 설정</CardTitle>
                  <CardDescription>
                    사용자 알림 및 자동화 설정을 관리합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationForm}>
                    <form
                      id="notification-form"
                      onSubmit={notificationForm.handleSubmit(onSubmitNotification)}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">알림 채널</h3>
                        <div className="grid gap-4 md:grid-cols-3">
                          <FormField
                            control={notificationForm.control}
                            name="enableEmailNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base flex items-center">
                                    <Mail className="h-4 w-4 mr-2" />
                                    이메일 알림
                                  </FormLabel>
                                  <FormDescription>
                                    이메일을 통한 알림 발송
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={notificationForm.control}
                            name="enablePushNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base flex items-center">
                                    <Bell className="h-4 w-4 mr-2" />
                                    웹 푸시 알림
                                  </FormLabel>
                                  <FormDescription>
                                    브라우저 푸시 알림
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={notificationForm.control}
                            name="enableSmsNotifications"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base flex items-center">
                                    <Smartphone className="h-4 w-4 mr-2" />
                                    SMS 알림
                                  </FormLabel>
                                  <FormDescription>
                                    문자 메시지 알림
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">알림 이벤트</h3>
                        <FormField
                          control={notificationForm.control}
                          name="newUserNotification"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">새 사용자 등록 알림</FormLabel>
                                <FormDescription>
                                  새로운 사용자가 등록될 때 관리자에게 알림
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4">
                          <h4 className="text-base font-medium">출석 알림 설정</h4>
                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={notificationForm.control}
                              name="attendanceReminderDays"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>알림 요일</FormLabel>
                                  <Select
                                    onValueChange={(value) => {
                                      // 요일 선택 로직 (실제로는 다중 선택 컴포넌트 사용)
                                      // 여기서는 배열 조작으로 간단히 구현
                                      const selected = field.value || []
                                      if (selected.includes(value)) {
                                        field.onChange(selected.filter(day => day !== value))
                                      } else {
                                        field.onChange([...selected, value])
                                      }
                                    }}
                                    value={field.value?.[0] || ""}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="알림 전송 요일" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="0">일요일</SelectItem>
                                      <SelectItem value="1">월요일</SelectItem>
                                      <SelectItem value="2">화요일</SelectItem>
                                      <SelectItem value="3">수요일</SelectItem>
                                      <SelectItem value="4">목요일</SelectItem>
                                      <SelectItem value="5">금요일</SelectItem>
                                      <SelectItem value="6">토요일</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    출석 알림이 전송될 요일 (현재 선택: {field.value?.map(day => {
                                      const days = ["일", "월", "화", "수", "목", "금", "토"]
                                      return days[parseInt(day)]
                                    }).join(", ")})
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={notificationForm.control}
                              name="reminderTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>알림 시간</FormLabel>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <FormControl>
                                      <Input
                                        type="time"
                                        {...field}
                                      />
                                    </FormControl>
                                  </div>
                                  <FormDescription>
                                    출석 알림이 전송될 시간
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    type="submit"
                    form="notification-form"
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? (
                      <>저장 중...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        <span>설정 저장</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
} 