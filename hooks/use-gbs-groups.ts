import { useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/axios'

// GBS 그룹 타입 정의 (API 스펙에 맞춤)
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
  memberCount: number  // API 스펙에 포함됨
}

// GBS 그룹 멤버 타입 정의
interface GbsMember {
  id: number
  name: string
  email?: string
  birthDate?: string
  joinDate: string
  phoneNumber?: string
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

// GBS 그룹 추가 요청 타입
interface CreateGbsGroupRequest {
  name: string
  villageId: number
  termStartDate: string
  termEndDate: string
  leaderId?: number
}

// GBS 그룹 수정 요청 타입
interface UpdateGbsGroupRequest {
  name: string
  villageId: number
  termStartDate: string
  termEndDate: string
}

// 리더 지정 요청 타입
interface AssignLeaderRequest {
  leaderId: number
  startDate: string
}

export const useGbsGroups = () => {
  const { toast } = useToast()
  const [gbsGroups, setGbsGroups] = useState<GbsGroup[]>([])
  const [villages, setVillages] = useState<Village[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [groupMembers, setGroupMembers] = useState<{ [key: number]: GbsMember[] }>({})
  const [isLoading, setIsLoading] = useState(false)
  // 페이지네이션 상태 추가
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalCount: 0,
    hasMore: false
  })

  // GBS 그룹 목록 가져오기 (페이지네이션 지원)
  const fetchGbsGroups = useCallback(async (page: number = 0, size: number = 20) => {
    try {
      const response = await api.get<ApiResponse<PageResponse<GbsGroup>>>(
        `/api/admin/organization/gbs-groups?page=${page}&size=${size}`
      )
      
      // 🔍 디버깅: 실제 API 응답 확인
      console.log('=== GBS 그룹 목록 API 응답 ===')
      console.log('Full response:', response.data)
      console.log('Success:', response.data.success)
      console.log('Data:', response.data.data)
      
      if (response.data.success) {
        const items = response.data.data.items
        console.log('Items:', items)
        console.log('Items length:', items?.length)
        
        setGbsGroups(items)
        setPagination({
          page,
          size,
          totalCount: response.data.data.totalCount,
          hasMore: response.data.data.hasMore
        })
        return items
      } else {
        throw new Error(response.data.message || 'GBS 그룹 데이터를 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      console.error('GBS 그룹 데이터 로딩 실패:', error)
      console.log('Error response:', error.response?.data)
      toast({
        title: '오류',
        description: '데이터를 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
      throw error
    }
  }, [toast])

  // 마을 목록 가져오기
  const fetchVillages = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<PageResponse<Village>>>('/api/admin/organization/villages')
      
      if (response.data.success) {
        setVillages(response.data.data.items)
        return response.data.data.items
      } else {
        throw new Error(response.data.message || '마을 데이터를 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      console.error('마을 데이터 로딩 실패:', error)
      toast({
        title: '오류',
        description: '마을 데이터를 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
      throw error
    }
  }, [toast])

  // 리더 사용자 목록 가져오기
  const fetchLeaders = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<PageResponse<User>>>('/api/admin/users?roles=LEADER')
      
      if (response.data.success) {
        setUsers(response.data.data.items)
        return response.data.data.items
      } else {
        throw new Error(response.data.message || '리더 데이터를 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      console.error('리더 데이터 로딩 실패:', error)
      toast({
        title: '오류',
        description: '리더 데이터를 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
      throw error
    }
  }, [toast])

  // GBS 그룹 멤버 가져오기
  const fetchGroupMembers = useCallback(async (groupId: number) => {
    try {
      // API 스펙에 따르면 직접 배열을 반환
      const response = await api.get<ApiResponse<GbsMember[]>>(`/api/admin/organization/gbs-groups/${groupId}/members`)
      
      // 🔍 디버깅: 실제 API 응답 확인
      console.log(`=== GBS 그룹 ${groupId} 멤버 목록 API 응답 ===`)
      console.log('Full response:', response.data)
      console.log('Success:', response.data.success)
      console.log('Data:', response.data.data)
      
      if (response.data.success) {
        setGroupMembers(prev => ({
          ...prev,
          [groupId]: response.data.data
        }))
        return response.data.data
      } else {
        throw new Error(response.data.message || 'GBS 그룹 멤버 데이터를 불러오는데 실패했습니다.')
      }
    } catch (error: any) {
      console.error(`그룹 ${groupId}의 멤버 데이터 로딩 실패:`, error)
      console.log('Error response:', error.response?.data)
      // 실패해도 UI에는 영향이 없으므로 토스트 표시하지 않음
      throw error
    }
  }, [])

  // 모든 데이터 로딩
  const loadAllData = useCallback(async (page: number = 0, size: number = 20) => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchGbsGroups(page, size),
        fetchVillages(),
        fetchLeaders()
      ])
    } catch (error) {
      console.error('데이터 로딩 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchGbsGroups, fetchVillages, fetchLeaders])

  // GBS 그룹 추가
  const createGbsGroup = useCallback(async (data: CreateGbsGroupRequest) => {
    try {
      setIsLoading(true)
      const response = await api.post<ApiResponse<GbsGroup>>('/api/admin/organization/gbs-groups', data)
      
      if (response.data.success) {
        await loadAllData()
        toast({
          title: 'GBS 그룹 추가 완료',
          description: `${data.name} 그룹이 추가되었습니다.`,
        })
        return response.data.data
      } else {
        throw new Error(response.data.message || 'GBS 그룹 추가에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('GBS 그룹 추가 실패:', error)
      toast({
        title: '오류',
        description: 'GBS 그룹 추가에 실패했습니다.',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [loadAllData, toast])

  // GBS 그룹 수정
  const updateGbsGroup = useCallback(async (id: number, data: UpdateGbsGroupRequest) => {
    try {
      setIsLoading(true)
      const response = await api.put<ApiResponse<GbsGroup>>(`/api/admin/organization/gbs-groups/${id}`, data)
      
      if (response.data.success) {
        await loadAllData()
        toast({
          title: 'GBS 그룹 수정 완료',
          description: 'GBS 그룹 정보가 수정되었습니다.',
        })
        return response.data.data
      } else {
        throw new Error(response.data.message || 'GBS 그룹 수정에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('GBS 그룹 수정 실패:', error)
      toast({
        title: '오류',
        description: 'GBS 그룹 수정에 실패했습니다.',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [loadAllData, toast])

  // GBS 그룹 삭제
  const deleteGbsGroup = useCallback(async (id: number) => {
    try {
      setIsLoading(true)
      const response = await api.delete<ApiResponse<void>>(`/api/admin/organization/gbs-groups/${id}`)
      
      if (response.data.success) {
        await loadAllData()
        toast({
          title: 'GBS 그룹 삭제 완료',
          description: 'GBS 그룹이 삭제되었습니다.',
        })
      } else {
        throw new Error(response.data.message || 'GBS 그룹 삭제에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('GBS 그룹 삭제 실패:', error)
      toast({
        title: '오류',
        description: 'GBS 그룹 삭제에 실패했습니다.',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [loadAllData, toast])

  // GBS 리더 지정
  const assignLeader = useCallback(async (groupId: number, data: AssignLeaderRequest) => {
    try {
      setIsLoading(true)
      const response = await api.post<ApiResponse<void>>(`/api/admin/organization/gbs-groups/${groupId}/leaders`, data)
      
      if (response.data.success) {
        await loadAllData()
        toast({
          title: '리더 지정 완료',
          description: '리더가 지정되었습니다.',
        })
      } else {
        throw new Error(response.data.message || '리더 지정에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('리더 지정 실패:', error)
      toast({
        title: '오류',
        description: '리더 지정에 실패했습니다.',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [loadAllData, toast])

  // GBS 리더 해제
  const removeLeader = useCallback(async (groupId: number) => {
    try {
      setIsLoading(true)
      const response = await api.delete<ApiResponse<void>>(`/api/admin/organization/gbs-groups/${groupId}/leaders`)
      
      if (response.data.success) {
        await loadAllData()
        toast({
          title: '리더 해제 완료',
          description: '리더가 해제되었습니다.',
        })
      } else {
        throw new Error(response.data.message || '리더 해제에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('리더 해제 실패:', error)
      toast({
        title: '오류',
        description: '리더 해제에 실패했습니다.',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [loadAllData, toast])

  return {
    // State
    gbsGroups,
    villages,
    users,
    groupMembers,
    isLoading,
    pagination, // 페이지네이션 상태 추가
    
    // Actions
    fetchGbsGroups,
    fetchVillages,
    fetchLeaders,
    fetchGroupMembers,
    loadAllData,
    createGbsGroup,
    updateGbsGroup,
    deleteGbsGroup,
    assignLeader,
    removeLeader
  }
}

export type {
  GbsGroup,
  GbsMember,
  Village,
  User,
  CreateGbsGroupRequest,
  UpdateGbsGroupRequest,
  AssignLeaderRequest
} 