"use client"

import { useState, useEffect } from "react"
import { Plus, PencilIcon, Trash2 } from "lucide-react"
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
import { useToast } from "@/components/ui/use-toast"

// 부서 타입 정의
interface Department {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

// 모킹 데이터
const mockDepartments: Department[] = [
  {
    id: 1,
    name: "청년부",
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    name: "장년부",
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  },
  {
    id: 3,
    name: "학생부",
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  },
]

export function DepartmentManagement() {
  const { toast } = useToast()
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newDepartmentName, setNewDepartmentName] = useState("")
  const [editDepartment, setEditDepartment] = useState<Department | null>(null)
  const [editDepartmentName, setEditDepartmentName] = useState("")

  useEffect(() => {
    // API 호출을 모킹 - 실제 구현 시 API 호출로 대체
    setTimeout(() => {
      setDepartments(mockDepartments)
      setIsLoading(false)
    }, 500)
  }, [])

  // 부서 목록 필터링
  const filteredDepartments = departments.filter((department) =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 부서 추가
  const handleAddDepartment = () => {
    if (!newDepartmentName.trim()) {
      toast({
        title: "오류",
        description: "부서 이름을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    // 실제 구현 시 API 호출로 대체
    const newDepartment: Department = {
      id: departments.length > 0 ? Math.max(...departments.map(d => d.id)) + 1 : 1,
      name: newDepartmentName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setDepartments([...departments, newDepartment])
    setNewDepartmentName("")
    setIsAddDialogOpen(false)
    
    toast({
      title: "부서 추가 완료",
      description: `${newDepartmentName} 부서가 추가되었습니다.`,
    })
  }

  // 부서 수정 다이얼로그 열기
  const openEditDialog = (department: Department) => {
    setEditDepartment(department)
    setEditDepartmentName(department.name)
    setIsEditDialogOpen(true)
  }

  // 부서 수정
  const handleEditDepartment = () => {
    if (!editDepartment) return
    if (!editDepartmentName.trim()) {
      toast({
        title: "오류",
        description: "부서 이름을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    // 실제 구현 시 API 호출로 대체
    const updatedDepartments = departments.map(department => 
      department.id === editDepartment.id 
        ? { ...department, name: editDepartmentName, updatedAt: new Date().toISOString() } 
        : department
    )

    setDepartments(updatedDepartments)
    setIsEditDialogOpen(false)
    
    toast({
      title: "부서 수정 완료",
      description: `부서 이름이 ${editDepartmentName}(으)로 수정되었습니다.`,
    })
  }

  // 부서 삭제
  const handleDeleteDepartment = (id: number) => {
    // 실제 구현 시 API 호출로 대체
    const updatedDepartments = departments.filter(department => department.id !== id)
    setDepartments(updatedDepartments)
    
    toast({
      title: "부서 삭제 완료",
      description: "부서가 삭제되었습니다.",
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>부서 관리</CardTitle>
        <CardDescription>
          교회 내 부서를 관리하고 운영합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="w-1/3">
            <Input
              placeholder="부서 이름으로 검색"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> 부서 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 부서 추가</DialogTitle>
                <DialogDescription>
                  새로운 부서를 추가합니다. 부서 이름을 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    부서 이름
                  </Label>
                  <Input
                    id="name"
                    className="col-span-3"
                    value={newDepartmentName}
                    onChange={e => setNewDepartmentName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddDepartment}>추가</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">로딩 중...</div>
        ) : filteredDepartments.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            {searchTerm ? "검색 결과가 없습니다." : "등록된 부서가 없습니다."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>부서 이름</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead>수정일</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>{department.id}</TableCell>
                  <TableCell className="font-medium">{department.name}</TableCell>
                  <TableCell>{new Date(department.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(department.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(department)}
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span className="sr-only">수정</span>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">삭제</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>부서 삭제</AlertDialogTitle>
                            <AlertDialogDescription>
                              정말로 '{department.name}' 부서를 삭제하시겠습니까?
                              이 작업은 되돌릴 수 없습니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteDepartment(department.id)}
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

        {/* 수정 다이얼로그 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>부서 수정</DialogTitle>
              <DialogDescription>
                부서 정보를 수정합니다. 새로운 부서 이름을 입력해주세요.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  부서 이름
                </Label>
                <Input
                  id="edit-name"
                  className="col-span-3"
                  value={editDepartmentName}
                  onChange={e => setEditDepartmentName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleEditDepartment}>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
} 