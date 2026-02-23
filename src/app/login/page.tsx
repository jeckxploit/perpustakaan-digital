'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()

  // Redirect if already authenticated
  if (isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password)
      toast({
        title: 'Login berhasil',
        description: 'Selamat datang di Sistem Perpustakaan Digital',
      })
      // Redirect will happen automatically via AuthContext
    } catch (error: any) {
      toast({
        title: 'Login gagal',
        description: error.message || 'Email atau password salah',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 sm:p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-center space-x-2">
            <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-center">Perpustakaan Digital</CardTitle>
              <CardDescription className="text-center">Sistem Manajemen Perpustakaan</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@library.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="email"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="current-password"
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-start space-x-2">
              <Lock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Akun Default:</p>
                <p className="text-sm text-muted-foreground break-all">
                  Email: admin@library.com
                </p>
                <p className="text-sm text-muted-foreground">
                  Password: Admin123!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
