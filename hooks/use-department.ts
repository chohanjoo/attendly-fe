import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import api from "@/lib/axios"

// API 응답 타입 정의
export interface ApiResponse<T> {
  success: boolean
  timestamp: string
  data: T
  message: string
  code: number
}

export interface PageResponse<T> {
  items: T[]
  totalCount: number
  hasMore: boolean
}

// 부서 타입 정의
export interface Department {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export function useDepartment() {
  const { toast } = useToast()
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 부서 목록 조회
  const fetchDepartments = async () => {
    setIsLoading(true)
    try {
      const response = await api.get<ApiResponse<PageResponse<Department>>>("/api/admin/organization/departments")
      if (response.data.success) {
        setDepartments(response.data.data.items)
      } else {
        toast({
          title: "오류",
          description: response.data.message || "부서 목록을 불러오는데 실패했습니다.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("부서 목록 조회 에러:", error)
      toast({
        title: "오류",
        description: "부서 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 부서 추가
  const addDepartment = async (departmentName: string) => {
    if (!departmentName.trim()) {
      toast({
        title: "오류",
        description: "부서 이름을 입력해주세요.",
        variant: "destructive",
      })
      return false
    }

    try {
      const response = await api.post<ApiResponse<Department>>("/api/admin/organization/departments", {
        name: departmentName
      })

      if (response.data.success) {
        setDepartments([...departments, response.data.data])
        
        toast({
          title: "부서 추가 완료",
          description: `${departmentName} 부서가 추가되었습니다.`,
        })
        return true
      } else {
        toast({
          title: "오류",
          description: response.data.message || "부서 추가에 실패했습니다.",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("부서 추가 에러:", error)
      toast({
        title: "오류",
        description: "부서 추가에 실패했습니다.",
        variant: "destructive",
      })
      return false
    }
  }

  // 부서 수정
  const editDepartment = async (departmentId: number, departmentName: string) => {
    if (!departmentName.trim()) {
      toast({
        title: "오류",
        description: "부서 이름을 입력해주세요.",
        variant: "destructive",
      })
      return false
    }

    try {
      const response = await api.put<ApiResponse<Department>>(
        `/api/admin/organization/departments/${departmentId}`, 
        { name: departmentName }
      )

      if (response.data.success) {
        const updatedDepartment = response.data.data
        setDepartments(
          departments.map(department => 
            department.id === updatedDepartment.id ? updatedDepartment : department
          )
        )
        
        toast({
          title: "부서 수정 완료",
          description: `부서 이름이 ${departmentName}(으)로 수정되었습니다.`,
        })
        return true
      } else {
        toast({
          title: "오류",
          description: response.data.message || "부서 수정에 실패했습니다.",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("부서 수정 에러:", error)
      toast({
        title: "오류",
        description: "부서 수정에 실패했습니다.",
        variant: "destructive",
      })
      return false
    }
  }

  // 부서 삭제
  const deleteDepartment = async (id: number) => {
    try {
      const response = await api.delete<ApiResponse<void>>(
        `/api/admin/organization/departments/${id}`
      )

      if (response.data.success) {
        setDepartments(departments.filter(department => department.id !== id))
        
        toast({
          title: "부서 삭제 완료",
          description: "부서가 삭제되었습니다.",
        })
        return true
      } else {
        toast({
          title: "오류",
          description: response.data.message || "부서 삭제에 실패했습니다.",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("부서 삭제 에러:", error)
      toast({
        title: "오류",
        description: "부서 삭제에 실패했습니다.",
        variant: "destructive",
      })
      return false
    }
  }

  return {
    departments,
    isLoading,
    fetchDepartments,
    addDepartment,
    editDepartment,
    deleteDepartment
  }
} 