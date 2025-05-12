"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon, Users, Calendar, BarChart3, Shield, Settings, Building2 } from "lucide-react"

type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  {
    title: "사용자 관리",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "조직 관리",
    href: "/admin/organization",
    icon: Building2,
  },
  {
    title: "출석 관리",
    href: "/admin/attendance",
    icon: Calendar,
  },
  {
    title: "통계 및 리포트",
    href: "/admin/statistics",
    icon: BarChart3,
  },
  {
    title: "권한 관리",
    href: "/admin/permissions",
    icon: Shield,
  },
  {
    title: "시스템 설정",
    href: "/admin/settings",
    icon: Settings,
  },
]

const AdminSidebar = () => {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r">
      <div className="flex h-14 items-center border-b px-4">
        <Link
          href="/admin"
          className="flex items-center font-semibold text-lg text-sidebar-foreground"
        >
          <span>Attendly 관리자</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
              pathname === item.href || pathname.startsWith(`${item.href}/`)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default AdminSidebar 