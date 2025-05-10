"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

type Permission = {
  id: string
  name: string
  description: string
}

type Role = {
  id: string
  name: string
  description: string
  permissions: string[]
}

type RoleWithPermissions = Role & {
  permissionDetails: Permission[]
}

// 임시 데이터
const mockPermissions: Permission[] = [
  { id: "perm_1", name: "users:read", description: "사용자 정보 조회" },
  { id: "perm_2", name: "users:write", description: "사용자 정보 수정" },
  { id: "perm_3", name: "users:delete", description: "사용자 삭제" },
  { id: "perm_4", name: "attendance:read", description: "출석 정보 조회" },
  { id: "perm_5", name: "attendance:write", description: "출석 정보 수정" },
  { id: "perm_6", name: "reports:read", description: "리포트 조회" },
  { id: "perm_7", name: "reports:generate", description: "리포트 생성" },
  { id: "perm_8", name: "settings:read", description: "설정 조회" },
  { id: "perm_9", name: "settings:write", description: "설정 수정" },
]

const mockRoles: Role[] = [
  {
    id: "role_1",
    name: "관리자",
    description: "모든 권한",
    permissions: mockPermissions.map(p => p.id),
  },
  {
    id: "role_2",
    name: "매니저",
    description: "대부분의 권한",
    permissions: ["perm_1", "perm_2", "perm_4", "perm_5", "perm_6", "perm_7", "perm_8"],
  },
  {
    id: "role_3",
    name: "마을장",
    description: "출석 관리 권한",
    permissions: ["perm_1", "perm_4", "perm_5"],
  },
  {
    id: "role_4",
    name: "일반 사용자",
    description: "기본 권한",
    permissions: ["perm_1", "perm_4", "perm_6"],
  },
]

// API 호출 함수 (실제로는 백엔드와 통신)
const fetchRoles = async () => {
  // const response = await axios.get("/api/admin/roles")
  // return response.data
  
  // 임시로 데이터 반환
  return mockRoles.map(role => ({
    ...role,
    permissionDetails: role.permissions.map(
      permId => mockPermissions.find(p => p.id === permId)!
    )
  })) as RoleWithPermissions[]
}

const fetchPermissions = async () => {
  // const response = await axios.get("/api/admin/permissions")
  // return response.data
  
  // 임시로 데이터 반환
  return mockPermissions
}

export default function PermissionsPage() {
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null)
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false)
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  const queryClient = useQueryClient()

  const { data: roles = [], isLoading: isRolesLoading } = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: fetchRoles,
  })

  const { data: permissions = [], isLoading: isPermissionsLoading } = useQuery({
    queryKey: ["admin", "permissions"],
    queryFn: fetchPermissions,
  })

  const updateRoleMutation = useMutation({
    mutationFn: (role: Role) => {
      // return axios.put(`/api/admin/roles/${role.id}`, role)
      // 임시 성공 응답
      return Promise.resolve({ data: role })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] })
      setIsEditRoleDialogOpen(false)
      toast.success("역할이 업데이트되었습니다.")
    },
    onError: () => {
      toast.error("역할 업데이트에 실패했습니다.")
    },
  })

  const addRoleMutation = useMutation({
    mutationFn: (role: Omit<Role, "id">) => {
      // return axios.post("/api/admin/roles", role)
      // 임시 성공 응답
      return Promise.resolve({ data: { ...role, id: `role_${Date.now()}` } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] })
      setIsAddRoleDialogOpen(false)
      toast.success("새 역할이 추가되었습니다.")
    },
    onError: () => {
      toast.error("역할 추가에 실패했습니다.")
    },
  })

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: string) => {
      // return axios.delete(`/api/admin/roles/${roleId}`)
      // 임시 성공 응답
      return Promise.resolve({})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] })
      toast.success("역할이 삭제되었습니다.")
    },
    onError: () => {
      toast.error("역할 삭제에 실패했습니다.")
    },
  })

  const handleEditRole = (role: RoleWithPermissions) => {
    setSelectedRole(role)
    setIsEditRoleDialogOpen(true)
  }

  const handleDeleteRole = (roleId: string) => {
    if (window.confirm("정말 이 역할을 삭제하시겠습니까?")) {
      deleteRoleMutation.mutate(roleId)
    }
  }

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const selectedPermissions = permissions
      .filter(perm => formData.get(`perm-${perm.id}`) === "on")
      .map(perm => perm.id)

    addRoleMutation.mutate({
      name,
      description,
      permissions: selectedPermissions,
    })
  }

  const handleUpdateRole = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return

    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const selectedPermissions = permissions
      .filter(perm => formData.get(`perm-${perm.id}`) === "on")
      .map(perm => perm.id)

    updateRoleMutation.mutate({
      id: selectedRole.id,
      name,
      description,
      permissions: selectedPermissions,
    })
  }

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">권한 관리</h1>
          <p className="text-muted-foreground mt-2">
            역할과 권한을 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="역할 검색..."
              className="pl-8 w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                <span>역할 추가</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>새 역할 추가</DialogTitle>
                <DialogDescription>
                  새로운 역할 및 권한을 추가하세요.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddRole}>
                <div className="space-y-4 py-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">역할 이름</Label>
                      <Input id="name" name="name" placeholder="예: 총무" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">설명</Label>
                      <Input
                        id="description"
                        name="description"
                        placeholder="예: 출석 데이터 관리 담당자"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>권한</Label>
                    <Card>
                      <CardContent className="p-4 max-h-[200px] overflow-y-auto space-y-2">
                        {isPermissionsLoading ? (
                          <p>권한 정보를 불러오는 중...</p>
                        ) : (
                          permissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Checkbox id={`perm-${permission.id}`} name={`perm-${permission.id}`} />
                              <Label htmlFor={`perm-${permission.id}`} className="flex items-center gap-x-2">
                                <span className="font-medium">{permission.name}</span>
                                <span className="text-muted-foreground text-xs">
                                  {permission.description}
                                </span>
                              </Label>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={addRoleMutation.isPending}>
                    {addRoleMutation.isPending ? "추가 중..." : "역할 추가"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>역할 목록</CardTitle>
          <CardDescription>
            시스템 내 역할 및 권한 그룹을 관리합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isRolesLoading ? (
            <div className="py-10 text-center">
              데이터를 불러오고 있습니다...
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              검색 결과가 없습니다.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>역할 이름</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead>권한 수</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>{role.permissions.length}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditRole(role)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">수정</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">삭제</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 역할 수정 다이얼로그 */}
      <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>역할 수정</DialogTitle>
            <DialogDescription>
              역할 정보와 권한을 변경하세요.
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <form onSubmit={handleUpdateRole}>
              <div className="space-y-4 py-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">역할 이름</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      defaultValue={selectedRole.name}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">설명</Label>
                    <Input
                      id="edit-description"
                      name="description"
                      defaultValue={selectedRole.description}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>권한</Label>
                  <Card>
                    <CardContent className="p-4 max-h-[200px] overflow-y-auto space-y-2">
                      {isPermissionsLoading ? (
                        <p>권한 정보를 불러오는 중...</p>
                      ) : (
                        permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`perm-${permission.id}`}
                              name={`perm-${permission.id}`}
                              defaultChecked={selectedRole.permissions.includes(permission.id)}
                            />
                            <Label htmlFor={`perm-${permission.id}`} className="flex items-center gap-x-2">
                              <span className="font-medium">{permission.name}</span>
                              <span className="text-muted-foreground text-xs">
                                {permission.description}
                              </span>
                            </Label>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateRoleMutation.isPending}>
                  {updateRoleMutation.isPending ? "저장 중..." : "변경사항 저장"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 