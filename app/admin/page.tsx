import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Calendar, BarChart3, Shield, Settings } from "lucide-react"

const featureCards = [
  {
    title: "사용자 관리",
    description: "사용자 계정, 프로필, 권한을 관리합니다",
    icon: Users,
    href: "/admin/users",
    color: "bg-blue-100 dark:bg-blue-900",
    textColor: "text-blue-600 dark:text-blue-100",
  },
  {
    title: "출석 관리",
    description: "출석 기록을 조회하고 수정합니다",
    icon: Calendar,
    href: "/admin/attendance",
    color: "bg-green-100 dark:bg-green-900",
    textColor: "text-green-600 dark:text-green-100",
  },
  {
    title: "통계 및 리포트",
    description: "출석 데이터 통계와 리포트를 확인합니다",
    icon: BarChart3,
    href: "/admin/statistics",
    color: "bg-purple-100 dark:bg-purple-900",
    textColor: "text-purple-600 dark:text-purple-100",
  },
  {
    title: "권한 관리",
    description: "역할별 권한을 설정합니다",
    icon: Shield,
    href: "/admin/permissions",
    color: "bg-yellow-100 dark:bg-yellow-900",
    textColor: "text-yellow-600 dark:text-yellow-100",
  },
  {
    title: "시스템 설정",
    description: "시스템 환경 설정을 관리합니다",
    icon: Settings,
    href: "/admin/settings",
    color: "bg-red-100 dark:bg-red-900",
    textColor: "text-red-600 dark:text-red-100",
  },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">관리자 대시보드</h1>
        <p className="text-muted-foreground mt-2">
          Attendly 교회 출석 관리 시스템의 관리자 기능을 사용하실 수 있습니다.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {featureCards.map((card) => (
          <Card key={card.href} className="overflow-hidden">
            <CardHeader className="p-4 pb-0">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${card.color}`}>
                  <card.icon className={`h-5 w-5 ${card.textColor}`} />
                </div>
                <CardTitle className="text-xl">{card.title}</CardTitle>
              </div>
              <CardDescription className="mt-2">{card.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <Button asChild className="w-full mt-2">
                <Link href={card.href}>이동하기</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 