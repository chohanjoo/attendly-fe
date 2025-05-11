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
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const { data, isLoading, isError } = useUsers(page, limit, debouncedSearch)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setDebouncedSearch(search)
    setPage(1)
  }

  const renderStatus = (status: User["status"]) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">활성</span>
      case "inactive":
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">비활성</span>
      case "pending":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">대기</span>
      default:
        return null
    }
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

    if (data?.users?.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-10">
            사용자 데이터가 없습니다.
          </TableCell>
        </TableRow>
      )
    }

    return data?.users?.map((user: User) => (
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
        <TableCell>{user.role}</TableCell>
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
          <Link href="/admin/users/new">
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit">검색</Button>
        </form>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground hidden sm:inline">필터:</span>
          <Select
            defaultValue="all"
            onValueChange={(value) => {
              // 필터 구현
            }}
          >
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="모든 상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="active">활성</SelectItem>
              <SelectItem value="inactive">비활성</SelectItem>
              <SelectItem value="pending">대기</SelectItem>
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
            value={String(limit)}
            onValueChange={(value) => {
              setLimit(Number(value))
              setPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={limit} />
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
                  if (page > 1) setPage(page - 1)
                }}
                aria-disabled={page === 1}
                tabIndex={page === 1 ? -1 : 0}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {[...Array(Math.min(5, data?.totalPages || 1))].map((_, i) => {
              const pageNumber = page - 2 + i
              if (pageNumber < 1 || pageNumber > (data?.totalPages || 1)) return null
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(pageNumber)
                    }}
                    isActive={pageNumber === page}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (page < (data?.totalPages || 1)) setPage(page + 1)
                }}
                aria-disabled={page >= (data?.totalPages || 1)}
                tabIndex={page >= (data?.totalPages || 1) ? -1 : 0}
                className={
                  page >= (data?.totalPages || 1)
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
} 