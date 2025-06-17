"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Lock, User, Sparkles, Crown } from "lucide-react"
import { loginAction } from "@/app/actions"

function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await loginAction(username, password)

      if (result && !result.success) {
        setError(result.error || "Login failed")
      }
    } catch (err) {
      setError("Login failed")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900">
        {/* Pattern Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-fuchsia-400 rounded-full blur opacity-75 animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-full p-4 border border-white/20">
                <Crown className="h-12 w-12 text-yellow-300" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <p className="text-purple-200 text-lg">Warhorse Monad Control Center</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
              <span className="text-purple-300 text-sm">Secure Access Required</span>
              <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
            </div>
          </div>

          {/* Login Card */}
          <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-purple-300" />
                Authenticate
              </CardTitle>
              <CardDescription className="text-purple-200">
                Enter your credentials to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-300" />
                    Username
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="relative bg-white/5 border-white/10 text-white placeholder:text-purple-300 focus:border-purple-400 focus:bg-white/10 transition-all h-12"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4 text-purple-300" />
                    Password
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="relative bg-white/5 border-white/10 text-white placeholder:text-purple-300 focus:border-purple-400 focus:bg-white/10 transition-all h-12"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/20 rounded-lg blur"></div>
                    <div className="relative p-4 bg-red-500/10 text-red-200 border border-red-500/20 rounded-lg text-sm backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        {error}
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white border-0 font-semibold text-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Authenticating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Access Dashboard
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-purple-200 text-sm">Secure Connection Established</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
