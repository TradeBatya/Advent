"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  userRole: string | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await checkAdminRole(session.user.id)
        }
      } catch (error) {
        console.error("[v0] Auth initialization error:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[v0] Auth state changed:", event)
      ;(async () => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await checkAdminRole(session.user.id)
        } else {
          setIsAdmin(false)
          setUserRole("member")
        }
      })()
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("user_roles").select("roles(name)").eq("user_id", userId)

      if (error || !data || data.length === 0) {
        setIsAdmin(false)
        setUserRole("member")
        return
      }

      const roles = data.map((item: any) => item.roles?.name).filter(Boolean)
      const role = roles[0] || "member"
      setUserRole(role)
      setIsAdmin(role === "admin" || role === "moderator" || role === "developer")
    } catch (err) {
      console.error("[v0] Failed to check admin role:", err)
      setIsAdmin(false)
      setUserRole("member")
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Logged in successfully",
      })
    }

    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/auth/callback`

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })

    if (error) {
      toast({
        title: "Registration Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Registration Successful",
        description: "Please check your email to confirm",
      })
    }

    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setIsAdmin(false)
    setUserRole(null)
    toast({
      title: "Logged Out",
      description: "You have been logged out",
    })
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, userRole, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
