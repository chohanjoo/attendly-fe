"use client";

import { GbsMembersListResponse } from "@/types/attendance";
import { formatDate } from "@/lib/attendance-utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface GbsMembersTableProps {
  isLoading: boolean;
  error: any;
  gbsMembers: GbsMembersListResponse | undefined;
}

export default function GbsMembersTable({
  isLoading,
  error,
  gbsMembers,
}: GbsMembersTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 py-4">
        GBS 멤버 정보를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  if (gbsMembers && gbsMembers.members.length > 0) {
    return (
      <Table>
        <TableCaption>{gbsMembers.gbsName} 멤버 목록 (총 {gbsMembers.memberCount}명)</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead>생년월일</TableHead>
            <TableHead>가입일</TableHead>
            <TableHead>연락처</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gbsMembers.members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">{member.name}</TableCell>
              <TableCell>{member.email || '-'}</TableCell>
              <TableCell>{member.birthDate ? formatDate(member.birthDate) : '-'}</TableCell>
              <TableCell>{formatDate(member.joinDate)}</TableCell>
              <TableCell>{member.phoneNumber || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="text-gray-500 py-8 text-center">
      <p className="mb-4">현재 GBS에 등록된 멤버가 없습니다.</p>
    </div>
  );
} 