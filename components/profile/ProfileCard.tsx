import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, User as UserIcon, Calendar, Shield, UserCircle } from "lucide-react";
import { UserDetails, getRoleColor, roleTranslations } from "../../types/profile";

interface ProfileCardProps {
  userDetails: UserDetails;
}

export const ProfileCard = ({ userDetails }: ProfileCardProps) => {
  return (
    <Card className="md:col-span-1">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails.name)}&background=6366f1&color=fff`} />
            <AvatarFallback>
              <UserCircle className="h-20 w-20 text-gray-400" />
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-xl">{userDetails.name}</CardTitle>
        <div className="flex justify-center mt-2">
          <Badge variant="outline" className={`${getRoleColor(userDetails.role)} text-black`}>
            {roleTranslations[userDetails.role] || userDetails.role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-4">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-gray-500 mr-3" />
            <span className="text-sm">{userDetails.email}</span>
          </div>
          
          <div className="flex items-center">
            <UserIcon className="h-5 w-5 text-gray-500 mr-3" />
            <span className="text-sm">{userDetails.departmentName}</span>
          </div>
          
          {userDetails.birthDate && (
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-500 mr-3" />
              <span className="text-sm">{new Date(userDetails.birthDate).toLocaleDateString('ko-KR')}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-gray-500 mr-3" />
            <span className="text-sm">가입일: {new Date(userDetails.createdAt).toLocaleDateString('ko-KR')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 