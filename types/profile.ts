export interface UserDetails {
  id: number;
  name: string;
  email: string;
  role: string;
  departmentId: number;
  departmentName: string;
  birthDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DelegationFormValues {
  delegateId: string;
  gbsGroupId: string;
  startDate: Date;
  endDate: Date;
}

export interface LeaderInfo {
  id: number;
  name: string;
}

export interface GbsInfo {
  id: number;
  name: string;
}

export const roleTranslations: Record<string, string> = {
  ADMIN: "관리자",
  MINISTER: "교역자",
  VILLAGE_LEADER: "마을장",
  LEADER: "리더",
  MEMBER: "멤버"
};

export const getRoleColor = (role: string): string => {
  switch (role) {
    case "ADMIN":
      return "bg-red-500";
    case "MINISTER":
      return "bg-yellow-500";
    case "VILLAGE_LEADER":
      return "bg-green-500";
    case "LEADER":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
}; 