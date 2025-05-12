"use client"

import { useState, useEffect } from "react"
import { Plus, PencilIcon, Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

// 마을 타입 정의
interface Village {
  id: number
  name: string
  departmentId: number
  departmentName: string
  villageLeaderId?: number
  villageLeaderName?: string
  createdAt: string
  updatedAt: string
}

// 부서 타입 정의
interface Department {
  id: number
  name: string
}

// 사용자 타입 정의
interface User {
  id: number
  name: string
  role: string
}

// 모킹 데이터 - 마을
const mockVillages: Village[] = [
  {
    id: 1,
    name: "동문마을",
    departmentId: 1,
    departmentName: "청년부",
    villageLeaderId: 101,
    villageLeaderName: "김철수",
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    name: "서문마을",
    departmentId: 1,
    departmentName: "청년부",
    villageLeaderId: 102,
    villageLeaderName: "이영희",
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  },
  {
    id: 3,
    name: "남문마을",
    departmentId: 2,
    departmentName: "장년부",
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  },
]

// 모킹 데이터 - 부서
const mockDepartments: Department[] = [
  { id: 1, name: "청년부" },
  { id: 2, name: "장년부" },
  { id: 3, name: "학생부" },
]

// 모킹 데이터 - 사용자
const mockUsers: User[] = [
  { id: 101, name: "김철수", role: "MEMBER" },
  { id: 102, name: "이영희", role: "MEMBER" },
  { id: 103, name: "박지성", role: "MEMBER" },
  { id: 104, name: "최민수", role: "MEMBER" },
]

export function VillageManagement() {
  const { toast } = useToast()
  const [villages, setVillages] = useState<Village[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLeaderDialogOpen, setIsLeaderDialogOpen] = useState(false)
  
  // 새 마을 폼 상태
  const [newVillageName, setNewVillageName] = useState("")
  const [newVillageDepartmentId, setNewVillageDepartmentId] = useState<string>("")
  const [newVillageLeaderId, setNewVillageLeaderId] = useState<string>("")

  // 마을 수정 폼 상태
  const [editVillage, setEditVillage] = useState<Village | null>(null)
  const [editVillageName, setEditVillageName] = useState("")
  const [editVillageDepartmentId, setEditVillageDepartmentId] = useState<string>("")

  // 마을장 지정 폼 상태
  const [leaderVillage, setLeaderVillage] = useState<Village | null>(null)
  const [newLeaderId, setNewLeaderId] = useState<string>("")

  useEffect(() => {
    // API 호출을 모킹 - 실제 구현 시 API 호출로 대체
    setTimeout(() => {
      setVillages(mockVillages)
      setDepartments(mockDepartments)
      setUsers(mockUsers)
      setIsLoading(false)
    }, 500)
  }, [])

  // 마을 목록 필터링
  const filteredVillages = villages.filter((village) =>
    village.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    village.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (village.villageLeaderName && village.villageLeaderName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // 마을 추가
  const handleAddVillage = () => {
    if (!newVillageName.trim()) {
      toast({
        title: "오류",
        description: "마을 이름을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!newVillageDepartmentId) {
      toast({
        title: "오류",
        description: "소속 부서를 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    const departmentId = parseInt(newVillageDepartmentId)
    const departmentName = departments.find(d => d.id === departmentId)?.name || ""
    
    let villageLeaderId: number | undefined = undefined
    let villageLeaderName: string | undefined = undefined
    
    if (newVillageLeaderId) {
      villageLeaderId = parseInt(newVillageLeaderId)
      villageLeaderName = users.find(u => u.id === villageLeaderId)?.name
    }

    // 실제 구현 시 API 호출로 대체
    const newVillage: Village = {
      id: villages.length > 0 ? Math.max(...villages.map(v => v.id)) + 1 : 1,
      name: newVillageName,
      departmentId,
      departmentName,
      villageLeaderId,
      villageLeaderName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setVillages([...villages, newVillage])
    
    // 폼 초기화
    setNewVillageName("")
    setNewVillageDepartmentId("")
    setNewVillageLeaderId("")
    setIsAddDialogOpen(false)
    
    toast({
      title: "마을 추가 완료",
      description: `${newVillageName} 마을이 추가되었습니다.`,
    })
  }

  // 마을 수정 다이얼로그 열기
  const openEditDialog = (village: Village) => {
    setEditVillage(village)
    setEditVillageName(village.name)
    setEditVillageDepartmentId(village.departmentId.toString())
    setIsEditDialogOpen(true)
  }

  // 마을 수정
  const handleEditVillage = () => {
    if (!editVillage) return
    
    if (!editVillageName.trim()) {
      toast({
        title: "오류",
        description: "마을 이름을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!editVillageDepartmentId) {
      toast({
        title: "오류",
        description: "소속 부서를 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    const departmentId = parseInt(editVillageDepartmentId)
    const departmentName = departments.find(d => d.id === departmentId)?.name || ""

    // 실제 구현 시 API 호출로 대체
    const updatedVillages = villages.map(village => 
      village.id === editVillage.id 
        ? { 
            ...village, 
            name: editVillageName, 
            departmentId, 
            departmentName,
            updatedAt: new Date().toISOString() 
          } 
        : village
    )

    setVillages(updatedVillages)
    setIsEditDialogOpen(false)
    
    toast({
      title: "마을 수정 완료",
      description: `마을 정보가 수정되었습니다.`,
    })
  }

  // 마을 삭제
  const handleDeleteVillage = (id: number) => {
    // 실제 구현 시 API 호출로 대체
    const updatedVillages = villages.filter(village => village.id !== id)
    setVillages(updatedVillages)
    
    toast({
      title: "마을 삭제 완료",
      description: "마을이 삭제되었습니다.",
    })
  }

  // 마을장 지정 다이얼로그 열기
  const openLeaderDialog = (village: Village) => {
    setLeaderVillage(village)
    setNewLeaderId(village.villageLeaderId?.toString() || "")
    setIsLeaderDialogOpen(true)
  }

  // 마을장 지정
  const handleAssignLeader = () => {
    if (!leaderVillage) return
    
    if (!newLeaderId) {
      // 마을장 해제
      const updatedVillages = villages.map(village => 
        village.id === leaderVillage.id 
          ? { 
              ...village, 
              villageLeaderId: undefined, 
              villageLeaderName: undefined,
              updatedAt: new Date().toISOString() 
            } 
          : village
      )

      setVillages(updatedVillages)
      setIsLeaderDialogOpen(false)
      
      toast({
        title: "마을장 해제 완료",
        description: `마을장이 해제되었습니다.`,
      })
      return
    }

    const userId = parseInt(newLeaderId)
    const userName = users.find(u => u.id === userId)?.name || ""

    // 실제 구현 시 API 호출로 대체
    const updatedVillages = villages.map(village => 
      village.id === leaderVillage.id 
        ? { 
            ...village, 
            villageLeaderId: userId, 
            villageLeaderName: userName,
            updatedAt: new Date().toISOString() 
          } 
        : village
    )

    setVillages(updatedVillages)
    setIsLeaderDialogOpen(false)
    
    toast({
      title: "마을장 지정 완료",
      description: `${userName}님이 ${leaderVillage.name}의 마을장으로 지정되었습니다.`,
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>마을 관리</CardTitle>
        <CardDescription>
          교회 내 마을 조직을 관리하고 운영합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="w-1/3">
            <Input
              placeholder="마을 이름, 부서, 마을장 검색"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> 마을 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 마을 추가</DialogTitle>
                <DialogDescription>
                  새로운 마을을 추가합니다. 마을 정보를 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    마을 이름
                  </Label>
                  <Input
                    id="name"
                    className="col-span-3"
                    value={newVillageName}
                    onChange={e => setNewVillageName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="department" className="text-right">
                    소속 부서
                  </Label>
                  <Select 
                    value={newVillageDepartmentId} 
                    onValueChange={setNewVillageDepartmentId}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="부서 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(department => (
                        <SelectItem key={department.id} value={department.id.toString()}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="leader" className="text-right">
                    마을장 (선택)
                  </Label>
                  <Select 
                    value={newVillageLeaderId} 
                    onValueChange={setNewVillageLeaderId}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="마을장 선택 (선택사항)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">미지정</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddVillage}>추가</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">로딩 중...</div>
        ) : filteredVillages.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            {searchTerm ? "검색 결과가 없습니다." : "등록된 마을이 없습니다."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>마을 이름</TableHead>
                <TableHead>소속 부서</TableHead>
                <TableHead>마을장</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVillages.map((village) => (
                <TableRow key={village.id}>
                  <TableCell>{village.id}</TableCell>
                  <TableCell className="font-medium">{village.name}</TableCell>
                  <TableCell>{village.departmentName}</TableCell>
                  <TableCell>
                    {village.villageLeaderName || (
                      <span className="text-muted-foreground">미지정</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(village.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openLeaderDialog(village)}
                        title="마을장 지정"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span className="sr-only">마을장 지정</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(village)}
                        title="마을 정보 수정"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span className="sr-only">수정</span>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="마을 삭제">
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">삭제</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>마을 삭제</AlertDialogTitle>
                            <AlertDialogDescription>
                              정말로 '{village.name}' 마을을 삭제하시겠습니까?
                              이 작업은 되돌릴 수 없습니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteVillage(village.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* 마을 수정 다이얼로그 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>마을 정보 수정</DialogTitle>
              <DialogDescription>
                마을 정보를 수정합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  마을 이름
                </Label>
                <Input
                  id="edit-name"
                  className="col-span-3"
                  value={editVillageName}
                  onChange={e => setEditVillageName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-department" className="text-right">
                  소속 부서
                </Label>
                <Select 
                  value={editVillageDepartmentId} 
                  onValueChange={setEditVillageDepartmentId}
                >
                  <SelectTrigger className="col-span-3" id="edit-department">
                    <SelectValue placeholder="부서 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(department => (
                      <SelectItem key={department.id} value={department.id.toString()}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleEditVillage}>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 마을장 지정 다이얼로그 */}
        <Dialog open={isLeaderDialogOpen} onOpenChange={setIsLeaderDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>마을장 지정</DialogTitle>
              <DialogDescription>
                {leaderVillage?.name} 마을의 마을장을 지정합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="leader" className="text-right">
                  마을장
                </Label>
                <Select 
                  value={newLeaderId} 
                  onValueChange={setNewLeaderId}
                >
                  <SelectTrigger className="col-span-3" id="leader">
                    <SelectValue placeholder="마을장 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">마을장 해제</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAssignLeader}>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
} 