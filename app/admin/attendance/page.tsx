"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CalendarIcon, Download, Edit, Filter, Search } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useAdminAttendance, useAdminAttendanceStatistics } from "@/hooks/use-admin-attendance"
import CustomPagination from "@/components/ui/custom-pagination"

type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

type AttendanceRecord = {
  id: number
  userId: number
  userName: string
  date: string
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  eventType: string
  note?: string
}

export default function AttendancePage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  })
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)

  const { data, isLoading, isError } = useAdminAttendance(
    page, 
    limit, 
    debouncedSearch, 
    dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    statusFilter
  );

  const { data: statistics, isLoading: statsLoading } = useAdminAttendanceStatistics();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setDebouncedSearch(search)
    setPage(1)
  }

  const handleResetFilters = () => {
    setDateRange({ from: undefined, to: undefined })
    setStatusFilter(undefined)
    setSearch("")
    setDebouncedSearch("")
    setPage(1)
  }

  const renderStatus = (status: AttendanceRecord["status"]) => {
    switch (status) {
      case "PRESENT":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">출석</span>
      case "ABSENT":
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">결석</span>
      case "LATE":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">지각</span>
      case "EXCUSED":
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">사유</span>
      default:
        return null
    }
  }

  const renderAttendanceTable = () => {
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
            출석 데이터를 불러오는 중 오류가 발생했습니다.
          </TableCell>
        </TableRow>
      )
    }

    if (data?.items?.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-10">
            출석 데이터가 없습니다.
          </TableCell>
        </TableRow>
      )
    }

    return data?.items?.map((record: AttendanceRecord) => (
      <TableRow key={record.id}>
        <TableCell>{record.id}</TableCell>
        <TableCell>
          <Link
            href={`/admin/users/${record.userId}`}
            className="font-medium hover:underline"
          >
            {record.userName}
          </Link>
        </TableCell>
        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
        <TableCell>{record.eventType}</TableCell>
        <TableCell>{renderStatus(record.status)}</TableCell>
        <TableCell className="text-right">
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link href={`/admin/attendance/${record.id}`}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">수정</span>
            </Link>
          </Button>
        </TableCell>
      </TableRow>
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">출석 관리</h1>
          <p className="text-muted-foreground mt-2">
            출석 데이터를 조회하고 수정합니다.
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          <span>출석 데이터 내보내기</span>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 출석률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "로딩중..." : `${statistics?.attendanceRate?.toFixed(1) || '0.0'}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statsLoading ? "" : 
                `전월 대비 ${statistics?.attendanceRateDifference && statistics.attendanceRateDifference > 0 ? '+' : ''}${statistics?.attendanceRateDifference?.toFixed(1) || '0.0'}%`
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 출석 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "로딩중..." : statistics?.totalAttendanceCount?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              이번 달 기준
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">결석률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "로딩중..." : `${statistics?.absentRate?.toFixed(1) || '0.0'}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statsLoading ? "" : 
                `전월 대비 ${statistics?.absentRateDifference && statistics.absentRateDifference > 0 ? '+' : ''}${statistics?.absentRateDifference?.toFixed(1) || '0.0'}%`
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">지각률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "로딩중..." : `${statistics?.lateRate?.toFixed(1) || '0.0'}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statsLoading ? "" : 
                `전월 대비 ${statistics?.lateRateDifference && statistics.lateRateDifference > 0 ? '+' : ''}${statistics?.lateRateDifference?.toFixed(1) || '0.0'}%`
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="이름 검색..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit">검색</Button>
        </form>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !dateRange.from && !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "PPP", { locale: ko })} -{" "}
                        {format(dateRange.to, "PPP", { locale: ko })}
                      </>
                    ) : (
                      format(dateRange.from, "PPP", { locale: ko })
                    )
                  ) : (
                    "날짜 선택"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={new Date()}
                  selected={dateRange}
                  onSelect={(range) => {
                    if (range) setDateRange({
                      from: range.from,
                      to: range.to
                    });
                  }}
                  numberOfMonths={2}
                  locale={ko}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="상태 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRESENT">출석</SelectItem>
              <SelectItem value="ABSENT">결석</SelectItem>
              <SelectItem value="LATE">지각</SelectItem>
              <SelectItem value="EXCUSED">사유</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="ghost" onClick={handleResetFilters}>
            필터 초기화
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>날짜</TableHead>
              <TableHead>이벤트 유형</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderAttendanceTable()}</TableBody>
        </Table>
      </div>

      <CustomPagination
        page={page}
        size={limit}
        totalCount={data?.totalCount || 0}
        hasMore={!!data?.hasMore}
        onPageChange={setPage}
        onSizeChange={setLimit}
      />
    </div>
  )
} 