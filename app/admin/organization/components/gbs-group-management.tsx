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

// GBS 그룹 타입 정의
interface GbsGroup {
  id: number
  name: string
  villageId: number
  villageName: string
  termStartDate: string
  termEndDate: string
  leaderId?: number
  leaderName?: string
  createdAt: string
  updatedAt: string
  memberCount: number
}

// 마을 타입 정의
interface Village {
  id: number
  name: string
}

// 사용자 타입 정의
interface User {
  id: number
  name: string
  role: string
}

// 모킹 데이터 - GBS 그룹
const mockGbsGroups: GbsGroup[] = [
  {
    id: 1,
    name: "동문마을 1조",
    villageId: 1,
    villageName: "동문마을",
    termStartDate: "2023-01-01",
    termEndDate: "2023-06-30",
    leaderId: 101,
    leaderName: "김철수",
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
    memberCount: 5
  },
  {
    id: 2,
    name: "동문마을 2조",
    villageId: 1,
    villageName: "동문마을",
    termStartDate: "2023-01-01",
    termEndDate: "2023-06-30",
    leaderId: 102,
    leaderName: "이영희",
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
    memberCount: 4
  },
  {
    id: 3,
    name: "서문마을 1조",
    villageId: 2,
    villageName: "서문마을",
    termStartDate: "2023-01-01",
    termEndDate: "2023-06-30",
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
    memberCount: 0
  },
]

// 모킹 데이터 - 마을
const mockVillages: Village[] = [
  { id: 1, name: "동문마을" },
  { id: 2, name: "서문마을" },
  { id: 3, name: "남문마을" },
]

// 모킹 데이터 - 사용자
const mockUsers: User[] = [
  { id: 101, name: "김철수", role: "LEADER" },
  { id: 102, name: "이영희", role: "LEADER" },
  { id: 103, name: "박지성", role: "LEADER" },
  { id: 104, name: "최민수", role: "LEADER" },
]

export function GbsGroupManagement() {
  const { toast } = useToast()
  const [gbsGroups, setGbsGroups] = useState<GbsGroup[]>([])
  const [villages, setVillages] = useState<Village[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVillage, setSelectedVillage] = useState<string>("all")
  
  // 다이얼로그 상태
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLeaderDialogOpen, setIsLeaderDialogOpen] = useState(false)
  
  // 새 GBS 그룹 폼 상태
  const [newGbsName, setNewGbsName] = useState("")
  const [newGbsVillageId, setNewGbsVillageId] = useState<string>("")
  const [newGbsTermStart, setNewGbsTermStart] = useState<string>("")
  const [newGbsTermEnd, setNewGbsTermEnd] = useState<string>("")
  const [newGbsLeaderId, setNewGbsLeaderId] = useState<string>("")

  // GBS 그룹 수정 폼 상태
  const [editGbs, setEditGbs] = useState<GbsGroup | null>(null)
  const [editGbsName, setEditGbsName] = useState("")
  const [editGbsVillageId, setEditGbsVillageId] = useState<string>("")
  const [editGbsTermStart, setEditGbsTermStart] = useState<string>("")
  const [editGbsTermEnd, setEditGbsTermEnd] = useState<string>("")

  // GBS 리더 지정 폼 상태
  const [leaderGbs, setLeaderGbs] = useState<GbsGroup | null>(null)
  const [newLeaderId, setNewLeaderId] = useState<string>("")

  useEffect(() => {
    // API 호출을 모킹 - 실제 구현 시 API 호출로 대체
    setTimeout(() => {
      setGbsGroups(mockGbsGroups)
      setVillages(mockVillages)
      setUsers(mockUsers)
      setIsLoading(false)
    }, 500)
  }, [])

  // GBS 그룹 목록 필터링
  const filteredGbsGroups = gbsGroups.filter((group) => {
    // 마을 필터링
    const villageFilter = selectedVillage === "all" || group.villageId.toString() === selectedVillage
    
    // 검색어 필터링
    const searchFilter = 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.villageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.leaderName && group.leaderName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return villageFilter && searchFilter
  })

  // GBS 그룹 추가
  const handleAddGbs = () => {
    if (!newGbsName.trim()) {
      toast({
        title: "오류",
        description: "GBS 그룹 이름을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!newGbsVillageId) {
      toast({
        title: "오류",
        description: "소속 마을을 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!newGbsTermStart || !newGbsTermEnd) {
      toast({
        title: "오류",
        description: "활동 기간을 모두 설정해주세요.",
        variant: "destructive",
      })
      return
    }

    const villageId = parseInt(newGbsVillageId)
    const villageName = villages.find(v => v.id === villageId)?.name || ""
    
    let leaderId: number | undefined = undefined
    let leaderName: string | undefined = undefined
    
    if (newGbsLeaderId) {
      leaderId = parseInt(newGbsLeaderId)
      leaderName = users.find(u => u.id === leaderId)?.name
    }

    // 실제 구현 시 API 호출로 대체
    const newGbsGroup: GbsGroup = {
      id: gbsGroups.length > 0 ? Math.max(...gbsGroups.map(g => g.id)) + 1 : 1,
      name: newGbsName,
      villageId,
      villageName,
      termStartDate: newGbsTermStart,
      termEndDate: newGbsTermEnd,
      leaderId,
      leaderName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      memberCount: 0
    }

    setGbsGroups([...gbsGroups, newGbsGroup])
    
    // 폼 초기화
    setNewGbsName("")
    setNewGbsVillageId("")
    setNewGbsTermStart("")
    setNewGbsTermEnd("")
    setNewGbsLeaderId("")
    setIsAddDialogOpen(false)
    
    toast({
      title: "GBS 그룹 추가 완료",
      description: `${newGbsName} 그룹이 추가되었습니다.`,
    })
  }

  // GBS 그룹 수정 다이얼로그 열기
  const openEditDialog = (group: GbsGroup) => {
    setEditGbs(group)
    setEditGbsName(group.name)
    setEditGbsVillageId(group.villageId.toString())
    setEditGbsTermStart(group.termStartDate)
    setEditGbsTermEnd(group.termEndDate)
    setIsEditDialogOpen(true)
  }

  // GBS 그룹 수정
  const handleEditGbs = () => {
    if (!editGbs) return
    
    if (!editGbsName.trim()) {
      toast({
        title: "오류",
        description: "GBS 그룹 이름을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!editGbsVillageId) {
      toast({
        title: "오류",
        description: "소속 마을을 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!editGbsTermStart || !editGbsTermEnd) {
      toast({
        title: "오류",
        description: "활동 기간을 모두 설정해주세요.",
        variant: "destructive",
      })
      return
    }

    const villageId = parseInt(editGbsVillageId)
    const villageName = villages.find(v => v.id === villageId)?.name || ""

    // 실제 구현 시 API 호출로 대체
    const updatedGbsGroups = gbsGroups.map(group => 
      group.id === editGbs.id 
        ? { 
            ...group, 
            name: editGbsName, 
            villageId, 
            villageName,
            termStartDate: editGbsTermStart,
            termEndDate: editGbsTermEnd,
            updatedAt: new Date().toISOString() 
          } 
        : group
    )

    setGbsGroups(updatedGbsGroups)
    setIsEditDialogOpen(false)
    
    toast({
      title: "GBS 그룹 수정 완료",
      description: `GBS 그룹 정보가 수정되었습니다.`,
    })
  }

  // GBS 그룹 삭제
  const handleDeleteGbs = (id: number) => {
    // 실제 구현 시 API 호출로 대체
    const updatedGbsGroups = gbsGroups.filter(group => group.id !== id)
    setGbsGroups(updatedGbsGroups)
    
    toast({
      title: "GBS 그룹 삭제 완료",
      description: "GBS 그룹이 삭제되었습니다.",
    })
  }

  // GBS 리더 지정 다이얼로그 열기
  const openLeaderDialog = (group: GbsGroup) => {
    setLeaderGbs(group)
    setNewLeaderId(group.leaderId?.toString() || "")
    setIsLeaderDialogOpen(true)
  }

  // GBS 리더 지정
  const handleAssignLeader = () => {
    if (!leaderGbs) return
    
    if (!newLeaderId) {
      // 리더 해제
      const updatedGbsGroups = gbsGroups.map(group => 
        group.id === leaderGbs.id 
          ? { 
              ...group, 
              leaderId: undefined, 
              leaderName: undefined,
              updatedAt: new Date().toISOString() 
            } 
          : group
      )

      setGbsGroups(updatedGbsGroups)
      setIsLeaderDialogOpen(false)
      
      toast({
        title: "리더 해제 완료",
        description: `리더가 해제되었습니다.`,
      })
      return
    }

    const userId = parseInt(newLeaderId)
    const userName = users.find(u => u.id === userId)?.name || ""

    // 실제 구현 시 API 호출로 대체
    const updatedGbsGroups = gbsGroups.map(group => 
      group.id === leaderGbs.id 
        ? { 
            ...group, 
            leaderId: userId, 
            leaderName: userName,
            updatedAt: new Date().toISOString() 
          } 
        : group
    )

    setGbsGroups(updatedGbsGroups)
    setIsLeaderDialogOpen(false)
    
    toast({
      title: "리더 지정 완료",
      description: `${userName}님이 ${leaderGbs.name}의 리더로 지정되었습니다.`,
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>GBS 그룹 관리</CardTitle>
        <CardDescription>
          마을 내 GBS 그룹을 관리하고 운영합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2 w-2/3">
            <Select 
              value={selectedVillage} 
              onValueChange={setSelectedVillage}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="마을 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 마을</SelectItem>
                {villages.map(village => (
                  <SelectItem key={village.id} value={village.id.toString()}>
                    {village.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="그룹 이름, 마을, 리더 검색"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> GBS 그룹 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 GBS 그룹 추가</DialogTitle>
                <DialogDescription>
                  새로운 GBS 그룹을 추가합니다. 그룹 정보를 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    그룹 이름
                  </Label>
                  <Input
                    id="name"
                    className="col-span-3"
                    value={newGbsName}
                    onChange={e => setNewGbsName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="village" className="text-right">
                    소속 마을
                  </Label>
                  <Select 
                    value={newGbsVillageId} 
                    onValueChange={setNewGbsVillageId}
                  >
                    <SelectTrigger className="col-span-3" id="village">
                      <SelectValue placeholder="마을 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {villages.map(village => (
                        <SelectItem key={village.id} value={village.id.toString()}>
                          {village.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="term-start" className="text-right">
                    활동 시작일
                  </Label>
                  <Input
                    id="term-start"
                    type="date"
                    className="col-span-3"
                    value={newGbsTermStart}
                    onChange={e => setNewGbsTermStart(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="term-end" className="text-right">
                    활동 종료일
                  </Label>
                  <Input
                    id="term-end"
                    type="date"
                    className="col-span-3"
                    value={newGbsTermEnd}
                    onChange={e => setNewGbsTermEnd(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="leader" className="text-right">
                    리더 (선택)
                  </Label>
                  <Select 
                    value={newGbsLeaderId} 
                    onValueChange={setNewGbsLeaderId}
                  >
                    <SelectTrigger className="col-span-3" id="leader">
                      <SelectValue placeholder="리더 선택 (선택사항)" />
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
                <Button type="submit" onClick={handleAddGbs}>추가</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">로딩 중...</div>
        ) : filteredGbsGroups.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            {searchTerm || selectedVillage !== "all" ? "검색 결과가 없습니다." : "등록된 GBS 그룹이 없습니다."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>그룹 이름</TableHead>
                <TableHead>소속 마을</TableHead>
                <TableHead>활동 기간</TableHead>
                <TableHead>리더</TableHead>
                <TableHead>조원 수</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGbsGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell>{group.id}</TableCell>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>{group.villageName}</TableCell>
                  <TableCell>
                    {new Date(group.termStartDate).toLocaleDateString()} ~ 
                    {new Date(group.termEndDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {group.leaderName || (
                      <span className="text-muted-foreground">미지정</span>
                    )}
                  </TableCell>
                  <TableCell>{group.memberCount}명</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openLeaderDialog(group)}
                        title="리더 지정"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span className="sr-only">리더 지정</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(group)}
                        title="그룹 정보 수정"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span className="sr-only">수정</span>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="그룹 삭제">
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">삭제</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>GBS 그룹 삭제</AlertDialogTitle>
                            <AlertDialogDescription>
                              정말로 '{group.name}' 그룹을 삭제하시겠습니까?
                              이 작업은 되돌릴 수 없습니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteGbs(group.id)}
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

        {/* GBS 그룹 수정 다이얼로그 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>GBS 그룹 정보 수정</DialogTitle>
              <DialogDescription>
                GBS 그룹 정보를 수정합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  그룹 이름
                </Label>
                <Input
                  id="edit-name"
                  className="col-span-3"
                  value={editGbsName}
                  onChange={e => setEditGbsName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-village" className="text-right">
                  소속 마을
                </Label>
                <Select 
                  value={editGbsVillageId} 
                  onValueChange={setEditGbsVillageId}
                >
                  <SelectTrigger className="col-span-3" id="edit-village">
                    <SelectValue placeholder="마을 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {villages.map(village => (
                      <SelectItem key={village.id} value={village.id.toString()}>
                        {village.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-term-start" className="text-right">
                  활동 시작일
                </Label>
                <Input
                  id="edit-term-start"
                  type="date"
                  className="col-span-3"
                  value={editGbsTermStart}
                  onChange={e => setEditGbsTermStart(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-term-end" className="text-right">
                  활동 종료일
                </Label>
                <Input
                  id="edit-term-end"
                  type="date"
                  className="col-span-3"
                  value={editGbsTermEnd}
                  onChange={e => setEditGbsTermEnd(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleEditGbs}>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* GBS 리더 지정 다이얼로그 */}
        <Dialog open={isLeaderDialogOpen} onOpenChange={setIsLeaderDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>GBS 리더 지정</DialogTitle>
              <DialogDescription>
                {leaderGbs?.name} 그룹의, 리더를 지정합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-leader" className="text-right">
                  리더
                </Label>
                <Select 
                  value={newLeaderId} 
                  onValueChange={setNewLeaderId}
                >
                  <SelectTrigger className="col-span-3" id="new-leader">
                    <SelectValue placeholder="리더 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">리더 해제</SelectItem>
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