import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClientProvider } from "@/components/query-client-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { ToastContainer } from "@/components/ui/toast-container"
import AdminSidebar from "@/components/admin/sidebar"
import AdminHeader from "@/components/admin/header"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Attendly 관리자 - 교회 출석 관리 시스템",
  description: "교인 모임 출석 관리를 위한 관리자 웹 애플리케이션",
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen")}>
        <QueryClientProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <div className="flex h-screen overflow-hidden">
                <AdminSidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                  <AdminHeader />
                  <main className="flex-1 overflow-auto p-6">
                    {children}
                  </main>
                </div>
              </div>
              <ToastContainer />
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
} 