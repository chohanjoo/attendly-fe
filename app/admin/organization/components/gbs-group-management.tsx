"use client"

import { useState, useEffect } from "react"
import { Plus, PencilIcon, Trash2, UserPlus, ChevronLeft, ChevronRight } from "lucide-react"
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
import { useGbsGroups, type GbsGroup } from "@/hooks/use-gbs-groups"

export function GbsGroupManagement() {
  const {
    gbsGroups,
    villages,
    users,
    groupMembers,
    isLoading,
    pagination,
    fetchGroupMembers,
    loadAllData,
    createGbsGroup,
    updateGbsGroup,
    deleteGbsGroup,
    assignLeader,
    removeLeader
  } = useGbsGroups()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVillage, setSelectedVillage] = useState<string>("all")
  
  // 다이얼로그 상태
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLeaderDialogOpen, setIsLeaderDialogOpen] = useState(false)
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<GbsGroup | null>(null)
  
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

  // 초기 데이터 로딩
  useEffect(() => {
    loadAllData(0, 20)
  }, [loadAllData])
  
  // GBS 그룹 로드 후 각 그룹의 멤버 데이터도 로드
  useEffect(() => {
    if (gbsGroups.length > 0) {
      gbsGroups.forEach(group => {
        fetchGroupMembers(group.id)
      })
    }
  }, [gbsGroups, fetchGroupMembers])

  // 페이지 변경 핸들러
  const handlePageChange = async (newPage: number) => {
    if (newPage >= 0 && (pagination.hasMore || newPage < Math.ceil(pagination.totalCount / pagination.size))) {
      await loadAllData(newPage, pagination.size)
    }
  }

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = async (newSize: number) => {
    await loadAllData(0, newSize)
  }

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
  const handleAddGbs = async () => {
    if (!newGbsName.trim()) {
      return
    }

    if (!newGbsVillageId) {
      return
    }

    if (!newGbsTermStart || !newGbsTermEnd) {
      return
    }

    const requestData = {
      name: newGbsName,
      villageId: parseInt(newGbsVillageId),
      termStartDate: newGbsTermStart,
      termEndDate: newGbsTermEnd,
      ...(newGbsLeaderId && { leaderId: parseInt(newGbsLeaderId) })
    }

    try {
      await createGbsGroup(requestData)
      
      // 폼 초기화
      setNewGbsName("")
      setNewGbsVillageId("")
      setNewGbsTermStart("")
      setNewGbsTermEnd("")
      setNewGbsLeaderId("")
      setIsAddDialogOpen(false)
    } catch (error) {
      // 에러는 훅에서 처리됨
    }
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
  const handleEditGbs = async () => {
    if (!editGbs) return
    
    if (!editGbsName.trim()) {
      return
    }

    if (!editGbsVillageId) {
      return
    }

    if (!editGbsTermStart || !editGbsTermEnd) {
      return
    }

    const requestData = {
      name: editGbsName,
      villageId: parseInt(editGbsVillageId),
      termStartDate: editGbsTermStart,
      termEndDate: editGbsTermEnd,
    }

    try {
      await updateGbsGroup(editGbs.id, requestData)
      setIsEditDialogOpen(false)
    } catch (error) {
      // 에러는 훅에서 처리됨
    }
  }

  // GBS 그룹 삭제
  const handleDeleteGbs = async (id: number) => {
    try {
      await deleteGbsGroup(id)
    } catch (error) {
      // 에러는 훅에서 처리됨
    }
  }

  // GBS 리더 지정 다이얼로그 열기
  const openLeaderDialog = (group: GbsGroup) => {
    setLeaderGbs(group)
    setNewLeaderId(group.leaderId?.toString() || "")
    setIsLeaderDialogOpen(true)
  }

  // GBS 리더 지정/해제
  const handleAssignLeader = async () => {
    if (!leaderGbs) return
    
    try {
      if (!newLeaderId) {
        // 리더 해제
        await removeLeader(leaderGbs.id)
      } else {
        // 리더 지정
        await assignLeader(leaderGbs.id, {
          leaderId: parseInt(newLeaderId),
          startDate: new Date().toISOString().split('T')[0], // 현재 날짜
        })
      }
      
      setIsLeaderDialogOpen(false)
    } catch (error) {
      // 에러는 훅에서 처리됨
    }
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
                  <TableCell>
                    {group.memberCount}명
                    {groupMembers[group.id] && groupMembers[group.id].length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1 cursor-pointer hover:underline" 
                        onClick={() => {
                          setSelectedGroup(group)
                          setIsMembersDialogOpen(true)
                        }}>
                        {groupMembers[group.id].slice(0, 3).map(member => member.name).join(', ')}
                        {groupMembers[group.id].length > 3 && ` 외 ${groupMembers[group.id].length - 3}명`}
                      </div>
                    )}
                  </TableCell>
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

        {/* 페이지네이션 */}
        {!isLoading && gbsGroups.length > 0 && (
          <div className="flex items-center justify-between px-2 py-4">
            {/* 왼쪽: 결과 정보 */}
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">페이지당 행 수</p>
                <Select
                  value={pagination.size.toString()}
                  onValueChange={(value) => handlePageSizeChange(parseInt(value))}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={pagination.size.toString()} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 50, 100].map((pageSize) => (
                      <SelectItem key={pageSize} value={pageSize.toString()}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                총 {pagination.totalCount}개 중 {Math.min(pagination.page * pagination.size + 1, pagination.totalCount)}-
                {Math.min((pagination.page + 1) * pagination.size, pagination.totalCount)}개 표시
              </div>
            </div>

            {/* 오른쪽: 페이지 네비게이션 */}
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium">
                페이지 {pagination.page + 1} / {Math.max(1, Math.ceil(pagination.totalCount / pagination.size))}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => handlePageChange(0)}
                  disabled={pagination.page === 0}
                >
                  <span className="sr-only">첫 페이지로</span>
                  <ChevronLeft className="h-4 w-4" />
                  <ChevronLeft className="h-4 w-4 -ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 0}
                >
                  <span className="sr-only">이전 페이지</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasMore && pagination.page >= Math.ceil(pagination.totalCount / pagination.size) - 1}
                >
                  <span className="sr-only">다음 페이지</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => handlePageChange(Math.ceil(pagination.totalCount / pagination.size) - 1)}
                  disabled={!pagination.hasMore && pagination.page >= Math.ceil(pagination.totalCount / pagination.size) - 1}
                >
                  <span className="sr-only">마지막 페이지로</span>
                  <ChevronRight className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4 -ml-2" />
                </Button>
              </div>
            </div>
          </div>
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
                {leaderGbs?.name} 그룹의 리더를 지정합니다.
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

        {/* GBS 멤버 목록 다이얼로그 */}
        <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>GBS 그룹 조원 목록</DialogTitle>
              <DialogDescription>
                {selectedGroup?.name} 그룹의 조원 목록입니다.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[400px] overflow-y-auto">
              {selectedGroup && groupMembers[selectedGroup.id] && groupMembers[selectedGroup.id].length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>생년월일</TableHead>
                      <TableHead>연락처</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupMembers[selectedGroup.id].map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.birthDate ? new Date(member.birthDate).toLocaleDateString() : 
                            <span className="text-muted-foreground">미설정</span>}</TableCell>
                        <TableCell>{member.phoneNumber}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  조원이 없습니다.
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setIsMembersDialogOpen(false)}>닫기</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
} 