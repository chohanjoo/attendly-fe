import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PaginationOptions = {
  page: number;
  size: number;
  totalCount: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  showSizeOptions?: boolean;
  sizeOptions?: number[];
  isPageZeroIndexed?: boolean;
};

export default function CustomPagination({
  page,
  size,
  totalCount,
  hasMore,
  onPageChange,
  onSizeChange,
  showSizeOptions = true,
  sizeOptions = [5, 10, 20, 50],
  isPageZeroIndexed = false,
}: PaginationOptions) {
  // 내부 페이지 표시용 값 (외부 API에 따라 0 또는 1부터 시작할 수 있음)
  const displayPage = isPageZeroIndexed ? page + 1 : page;
  
  // 내부 함수에서 사용할 page 값 (API 호출용)
  const getApiPage = (pageNum: number) => isPageZeroIndexed ? pageNum - 1 : pageNum;
  
  // 총 페이지 수 계산
  const totalPages = Math.max(1, Math.ceil(totalCount / size));
  
  // 표시할 페이지 범위 계산 (최대 5개)
  let startPage = Math.max(1, displayPage - 2);
  let endPage = Math.min(startPage + 4, totalPages);
  
  // 5개 페이지를 채우기 위한 조정
  if (endPage - startPage < 4 && startPage > 1) {
    startPage = Math.max(1, endPage - 4);
  }
  
  return (
    <div className="flex items-center justify-between">
      {showSizeOptions && (
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            페이지당 표시:
          </p>
          <Select
            value={String(size)}
            onValueChange={(value) => {
              onSizeChange(Number(value));
              onPageChange(getApiPage(1)); // 사이즈 변경 시 첫 페이지로
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={size} />
            </SelectTrigger>
            <SelectContent>
              {sizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (displayPage > 1) {
                  onPageChange(getApiPage(displayPage - 1));
                }
              }}
              aria-disabled={displayPage === 1}
              tabIndex={displayPage === 1 ? -1 : 0}
              className={displayPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
            const pageNumber = startPage + i;
            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(getApiPage(pageNumber));
                  }}
                  isActive={pageNumber === displayPage}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (hasMore) {
                  onPageChange(getApiPage(displayPage + 1));
                }
              }}
              aria-disabled={!hasMore}
              tabIndex={!hasMore ? -1 : 0}
              className={!hasMore ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
} 