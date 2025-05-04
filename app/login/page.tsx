"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Lock, ArrowRight, Church } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
// import { useLogin } from "@/hooks/use-login"
import { AuthLayout } from "@/components/layouts/auth-layout"
import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  console.log("로그인 페이지 렌더링");
  
  return (
    <AuthLayout requireAuth={false}>
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Church className="h-12 w-12 text-indigo-600" />
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">Attendly</h2>
          <LoginForm />
        </div>
      </div>
    </AuthLayout>
  )
}
