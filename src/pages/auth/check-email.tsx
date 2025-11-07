"use client"

import { Button } from "../../components/ui/button"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"

export default function CheckEmailPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl text-white">Check Your Email</CardTitle>
            <CardDescription className="text-slate-400">We've sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-slate-300">
              Please check your email and click the confirmation link to complete your signup.
            </p>
            <Button onClick={() => navigate("/auth/login")} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
