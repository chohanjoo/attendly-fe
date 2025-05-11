"use client"

import dynamic from "next/dynamic"

const AdminSidebar = dynamic(() => import("./sidebar"), { 
  ssr: false 
})

const AdminHeader = dynamic(() => import("./header"), { 
  ssr: false 
})

interface AdminLayoutWrapperProps {
  children: React.ReactNode
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 