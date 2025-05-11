import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClientProvider } from "@/components/query-client-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { ToastContainer } from "@/components/ui/toast-container"
import { cn } from "@/lib/utils"
import AdminLayoutWrapper from "@/components/admin/client-wrapper"

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
      <body className={cn(inter.className, "min-h-screen")} suppressHydrationWarning>
        <QueryClientProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <AdminLayoutWrapper>
                {children}
              </AdminLayoutWrapper>
              <ToastContainer />
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
} 