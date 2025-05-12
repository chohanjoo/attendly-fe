"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Home, Users } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { DepartmentManagement } from "./components/department-management"
import { VillageManagement } from "./components/village-management"
import { GbsGroupManagement } from "./components/gbs-group-management"
import { useState } from "react"

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState("departments")

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">관리자</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/organization">조직 관리</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <h1 className="text-3xl font-bold tracking-tight mt-2">조직 관리</h1>
        <p className="text-muted-foreground">
          부서, 마을, GBS 그룹 등의 조직 구조를 관리합니다.
        </p>
      </div>

      <Tabs defaultValue="departments" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>부서 관리</span>
          </TabsTrigger>
          <TabsTrigger value="villages" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>마을 관리</span>
          </TabsTrigger>
          <TabsTrigger value="gbs" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>GBS 그룹 관리</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="departments">
          <DepartmentManagement />
        </TabsContent>
        
        <TabsContent value="villages">
          <VillageManagement />
        </TabsContent>
        
        <TabsContent value="gbs">
          <GbsGroupManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
} 