"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserPlus, Search, Filter } from "lucide-react"
import Link from "next/link"
import { useUsers, User } from "@/hooks/use-users"

export default function UsersPage() {
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [name, setName] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  const { data, isLoading, isError } = useUsers(page, size, debouncedSearch)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setDebouncedSearch(name)
    setPage(0)
  }

  const renderStatus = (status: User["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">활성</span>
      case "INACTIVE":
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">비활성</span>
      case "PENDING":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">대기</span>
      default:
        return null
    }
  }

  const renderRole = (role: User["role"]) => {
    switch(role) {
      case "ADMIN":
        return "관리자"
      case "MINISTER":
        return "목회자"
      case "VILLAGE_LEADER":
        return "마을장"
      case "LEADER":
        return "리더"
      case "MEMBER":
        return "조원"
      default:
        return role
    }
  }

  const filteredUsers = () => {
    if (!data?.items) return []
    
    if (statusFilter === "ALL") return data.items
    
    return data.items.filter((user: User) => {
      if (statusFilter === "ACTIVE" && user.status === "ACTIVE") return true
      if (statusFilter === "INACTIVE" && user.status === "INACTIVE") return true
      if (statusFilter === "PENDING" && user.status === "PENDING") return true
      return false
    })
  }

  const renderUserTable = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-10">
            데이터를 불러오고 있습니다...
          </TableCell>
        </TableRow>
      )
    }

    if (isError) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-10 text-red-500">
            사용자 데이터를 불러오는 중 오류가 발생했습니다.
          </TableCell>
        </TableRow>
      )
    }

    const users = filteredUsers()
    
    if (users.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-10">
            {data?.items?.length === 0 ? "사용자 데이터가 없습니다." : "필터 조건에 맞는 사용자가 없습니다."}
          </TableCell>
        </TableRow>
      )
    }

    return users.map((user: User) => (
      <TableRow key={user.id}>
        <TableCell>{user.id}</TableCell>
        <TableCell>
          <Link
            href={`/admin/users/${user.id}`}
            className="font-medium hover:underline"
          >
            {user.name}
          </Link>
        </TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{renderRole(user.role)}</TableCell>
        <TableCell>{renderStatus(user.status)}</TableCell>
        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
      </TableRow>
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">사용자 관리</h1>
          <p className="text-muted-foreground mt-2">
            시스템 사용자 계정을 관리합니다.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/users/create">
            <UserPlus className="h-4 w-4 mr-2" />
            <span>사용자 추가</span>
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="이름 또는 이메일 검색..."
              className="pl-8"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button type="submit">검색</Button>
        </form>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground hidden sm:inline">필터:</span>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value)
              setPage(0)
            }}
          >
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="모든 상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">모든 상태</SelectItem>
              <SelectItem value="ACTIVE">활성</SelectItem>
              <SelectItem value="INACTIVE">비활성</SelectItem>
              <SelectItem value="PENDING">대기</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>역할</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>생성일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderUserTable()}</TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            페이지당 표시:
          </p>
          <Select
            value={String(size)}
            onValueChange={(value) => {
              setSize(Number(value))
              setPage(0)
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={size} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (page > 0) setPage(page - 1)
                }}
                aria-disabled={page === 0}
                tabIndex={page === 0 ? -1 : 0}
                className={page === 0 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {(() => {
              // API에서 제공하는 totalCount 사용
              const totalCount = data?.totalCount || 0
              const totalPages = Math.ceil(totalCount / size)
              
              // 현재 페이지 (1부터 시작하는 표시용)
              const currentPage = page + 1
              
              // 최소 1페이지는 항상 표시
              if (totalPages <= 1) {
                return (
                  <PaginationItem key={1}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setPage(0)
                      }}
                      isActive={true}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                )
              }

              // 표시할 페이지 범위 계산 (최대 5개)
              let startPage = Math.max(1, currentPage - 2)
              let endPage = Math.min(startPage + 4, totalPages)
              
              // 5개 페이지를 채우기 위한 조정
              if (endPage - startPage < 4 && startPage > 1) {
                startPage = Math.max(1, endPage - 4)
              }
              
              // 페이지 버튼 배열 생성
              return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                const pageNumber = startPage + i
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setPage(pageNumber - 1) // 내부 상태는 0부터 시작
                      }}
                      isActive={pageNumber === currentPage}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                )
              })
            })()}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  // data.hasMore 정보 활용
                  if (data?.hasMore) setPage(page + 1)
                }}
                aria-disabled={!data?.hasMore}
                tabIndex={!data?.hasMore ? -1 : 0}
                className={!data?.hasMore ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
} 