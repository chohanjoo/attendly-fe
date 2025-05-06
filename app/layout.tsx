import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClientProvider } from "@/components/query-client-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { ToastContainer } from "@/components/ui/toast-container"
import { DiscordLoggerProvider } from "@/components/discord-logger-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Attendly - 교회 출석 관리 시스템",
  description: "교인 모임 출석 관리를 위한 웹 애플리케이션",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryClientProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <DiscordLoggerProvider />
              {children}
              <ToastContainer />
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
