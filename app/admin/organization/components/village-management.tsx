"use client"

import { useState } from "react"
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
import { useDepartments } from "@/hooks/use-departments"
import { useUsers, UserResponse } from "@/hooks/use-users"
import { 
  useVillages, 
  useCreateVillage, 
  useUpdateVillage, 
  useAssignVillageLeader, 
  useTerminateVillageLeader,
  Village
} from "@/hooks/use-villages"

// API 응답 타입 정의
interface ApiResponse<T> {
  success: boolean
  timestamp: string
  data: T
  message: string
  code: number
}

interface PageResponse<T> {
  items: T[]
  totalCount: number
  hasMore: boolean
}

const API_BASE_URL = "/api"

// API 요청 헤더 설정
const API_HEADERS = {
  'Content-Type': 'application/json',
  'X-Request-ID': crypto.randomUUID(),
}

export function VillageManagement() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<number>()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLeaderDialogOpen, setIsLeaderDialogOpen] = useState(false)
  
  // 새 마을 폼 상태
  const [newVillageName, setNewVillageName] = useState("")
  const [newVillageDepartmentId, setNewVillageDepartmentId] = useState<string>("")
  const [newVillageLeaderId, setNewVillageLeaderId] = useState<string>("")

  // 마을 수정 폼 상태
  const [editVillageId, setEditVillageId] = useState<number | null>(null)
  const [editVillageName, setEditVillageName] = useState("")
  const [editVillageDepartmentId, setEditVillageDepartmentId] = useState<string>("")

  // 마을장 지정 폼 상태
  const [leaderVillageId, setLeaderVillageId] = useState<number | null>(null)
  const [leaderVillageName, setLeaderVillageName] = useState<string>("")
  const [newLeaderId, setNewLeaderId] = useState<string>("")
  
  // 마을장 검색 필터 추가
  const [leaderSearchTerm, setLeaderSearchTerm] = useState<string>("")
  const [newLeaderSearchTerm, setNewLeaderSearchTerm] = useState<string>("")

  // 데이터 가져오기
  const { data: villagesData, isLoading: isVillagesLoading } = useVillages(departmentFilter)
  const { data: departmentsData } = useDepartments()
  const { data: usersData } = useUsers(0, 100, "", newVillageDepartmentId ? parseInt(newVillageDepartmentId) : undefined, newVillageDepartmentId ? ["LEADER"] : undefined)
  const { data: leaderUsersData } = useUsers(
    0, 
    100, 
    "", 
    leaderVillageId ? 
      // 마을 데이터에서 부서 ID 찾기
      villagesData?.items.find(v => v.id === leaderVillageId)?.departmentId : 
      undefined, 
    leaderVillageId ? ["LEADER"] : undefined
  )

  // 마을 목록 필터링
  const filteredVillages = villagesData?.items.filter((village) =>
    village.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    village.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (village.villageLeaderName && village.villageLeaderName.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || []

  // API 훅
  const createVillageMutation = useCreateVillage(() => {
    setIsAddDialogOpen(false)
    resetAddForm()
  })
  
  const updateVillageMutation = useUpdateVillage(editVillageId || 0, () => {
    setIsEditDialogOpen(false)
    resetEditForm()
  })
  
  const assignVillageLeaderMutation = useAssignVillageLeader(() => {
    setIsLeaderDialogOpen(false)
    resetLeaderForm()
  })
  
  const terminateVillageLeaderMutation = useTerminateVillageLeader(() => {
    setIsLeaderDialogOpen(false)
    resetLeaderForm()
  })

  // 폼 초기화 함수
  const resetAddForm = () => {
    setNewVillageName("")
    setNewVillageDepartmentId("")
    setNewVillageLeaderId("")
  }

  const resetEditForm = () => {
    setEditVillageId(null)
    setEditVillageName("")
    setEditVillageDepartmentId("")
  }

  const resetLeaderForm = () => {
    setLeaderVillageId(null)
    setLeaderVillageName("")
    setNewLeaderId("")
  }

  // 마을 추가
  const handleAddVillage = async () => {
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
    const villageLeaderId = newVillageLeaderId && newVillageLeaderId !== "unassigned" ? parseInt(newVillageLeaderId) : undefined
    
    createVillageMutation.mutate({
      name: newVillageName,
      departmentId,
      villageLeaderId
    })
  }

  // 마을 수정 다이얼로그 열기
  const openEditDialog = (village: Village) => {
    setEditVillageId(village.id)
    setEditVillageName(village.name)
    setEditVillageDepartmentId(village.departmentId.toString())
    setIsEditDialogOpen(true)
  }

  // 마을 수정
  const handleEditVillage = async () => {
    if (!editVillageId) return
    
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
    
    updateVillageMutation.mutate({
      name: editVillageName,
      departmentId
    })
  }

  // 마을 삭제
  const handleDeleteVillage = (id: number) => {
    // 마을 삭제 API는 admin-api-docs.json에 정의되어 있지 않음
    toast({
      title: "기능 지원 예정",
      description: "현재 마을 삭제 기능은 지원되지 않습니다.",
      variant: "destructive",
    })
  }

  // 마을장 지정 다이얼로그 열기
  const openLeaderDialog = (village: Village) => {
    setLeaderVillageId(village.id)
    setLeaderVillageName(village.name)
    setNewLeaderId(village.villageLeaderId?.toString() || "")
    setIsLeaderDialogOpen(true)
  }

  // 마을장 지정
  const handleAssignLeader = async () => {
    if (!leaderVillageId) return
    
    if (!newLeaderId || newLeaderId === "unassigned") {
      // 마을장 해제
      terminateVillageLeaderMutation.mutate(leaderVillageId)
    } else {
      // 마을장 지정
      const userId = parseInt(newLeaderId)
      
      assignVillageLeaderMutation.mutate({
        userId,
        villageId: leaderVillageId,
        startDate: new Date().toISOString().split('T')[0] // 오늘 날짜
      })
    }
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
                      {departmentsData?.items.map(department => (
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
                  <div className="col-span-3 space-y-2">
                    <Input
                      placeholder={newVillageDepartmentId ? "마을장 이름 검색" : "부서를 먼저 선택해주세요"}
                      value={newLeaderSearchTerm}
                      onChange={e => setNewLeaderSearchTerm(e.target.value)}
                      disabled={!newVillageDepartmentId}
                    />
                    {newVillageDepartmentId && newLeaderSearchTerm && (
                      <div className="border rounded-md max-h-40 overflow-y-auto">
                        <div 
                          className="p-2 hover:bg-accent cursor-pointer"
                          onClick={() => {
                            setNewVillageLeaderId("unassigned");
                            setNewLeaderSearchTerm("");
                          }}
                        >
                          미지정
                        </div>
                        {usersData?.items
                          .filter((user: UserResponse) => 
                            user.name.toLowerCase().includes(newLeaderSearchTerm.toLowerCase()))
                          .map((user: UserResponse) => (
                            <div 
                              key={user.id} 
                              className="p-2 hover:bg-accent cursor-pointer"
                              onClick={() => {
                                setNewVillageLeaderId(user.id.toString());
                                setNewLeaderSearchTerm(user.name);
                              }}
                            >
                              {user.name}
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleAddVillage}
                  disabled={createVillageMutation.isPending}
                >
                  {createVillageMutation.isPending ? "처리 중..." : "추가"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isVillagesLoading ? (
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
                    {departmentsData?.items.map(department => (
                      <SelectItem key={department.id} value={department.id.toString()}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handleEditVillage}
                disabled={updateVillageMutation.isPending}
              >
                {updateVillageMutation.isPending ? "처리 중..." : "저장"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 마을장 지정 다이얼로그 */}
        <Dialog open={isLeaderDialogOpen} onOpenChange={setIsLeaderDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>마을장 지정</DialogTitle>
              <DialogDescription>
                {leaderVillageName} 마을의 마을장을 지정합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="leader" className="text-right">
                  마을장
                </Label>
                <div className="col-span-3 space-y-2">
                  <Input
                    placeholder="마을장 이름 검색"
                    value={leaderSearchTerm}
                    onChange={e => setLeaderSearchTerm(e.target.value)}
                  />
                  {leaderSearchTerm && (
                    <div className="border rounded-md max-h-40 overflow-y-auto">
                      <div 
                        className="p-2 hover:bg-accent cursor-pointer"
                        onClick={() => {
                          setNewLeaderId("unassigned");
                          setLeaderSearchTerm("마을장 해제");
                        }}
                      >
                        마을장 해제
                      </div>
                      {leaderUsersData?.items
                        .filter((user: UserResponse) => 
                          user.name.toLowerCase().includes(leaderSearchTerm.toLowerCase()))
                        .map((user: UserResponse) => (
                          <div 
                            key={user.id} 
                            className="p-2 hover:bg-accent cursor-pointer"
                            onClick={() => {
                              setNewLeaderId(user.id.toString());
                              setLeaderSearchTerm(user.name);
                            }}
                          >
                            {user.name}
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handleAssignLeader}
                disabled={assignVillageLeaderMutation.isPending || terminateVillageLeaderMutation.isPending}
              >
                {(assignVillageLeaderMutation.isPending || terminateVillageLeaderMutation.isPending) 
                  ? "처리 중..." 
                  : "저장"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
} 