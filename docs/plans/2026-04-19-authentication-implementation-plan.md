# Authentication Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add email/password authentication so users can sign up, log in, and access their tournament data.

**Architecture:** Supabase Auth with email/password. AuthProvider context for React. Next.js middleware for route protection. Auth pages at `/auth/login` and `/auth/signup`.

**Tech Stack:** Next.js App Router, Supabase Auth, shadcn/ui components, TypeScript.

---

## Task 1: Create AuthProvider Context

**Files:**
- Create: `components/providers/auth-provider.tsx`

**Step 1: Write the AuthProvider component**

```tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
```

**Step 2: Run lint and typecheck**

Run: `pnpm lint && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add components/providers/auth-provider.tsx
git commit -m "feat(auth): add AuthProvider context"
```

---

## Task 2: Create AuthLayout

**Files:**
- Create: `app/auth/auth-layout.tsx`

**Step 1: Write the AuthLayout component**

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  description: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}
```

**Step 2: Run lint and typecheck**

Run: `pnpm lint && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add app/auth/auth-layout.tsx
git commit -m "feat(auth): add AuthLayout component"
```

---

## Task 3: Create LoginForm Component

**Files:**
- Create: `components/auth/login-form.tsx`

**Step 1: Write the LoginForm component**

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/providers/auth-provider"
import { supabase } from "@/lib/supabase"

export function LoginForm() {
  const router = useRouter()
  const { signOut } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      router.push("/tournaments")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  )
}
```

**Step 2: Run lint and typecheck**

Run: `pnpm lint && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add components/auth/login-form.tsx
git commit -m "feat(auth): add LoginForm component"
```

---

## Task 4: Create SignupForm Component

**Files:**
- Create: `components/auth/signup-form.tsx`

**Step 1: Write the SignupForm component**

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export function SignupForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      router.push("/tournaments")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
```

**Step 2: Run lint and typecheck**

Run: `pnpm lint && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add components/auth/signup-form.tsx
git commit -m "feat(auth): add SignupForm component"
```

---

## Task 5: Create Login Page

**Files:**
- Create: `app/auth/login/page.tsx`

**Step 1: Write the login page**

```tsx
import { AuthLayout } from "../auth-layout"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome Back" description="Sign in to your account">
      <LoginForm />
    </AuthLayout>
  )
}
```

**Step 2: Run lint and typecheck**

Run: `pnpm lint && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add app/auth/login/page.tsx
git commit -m "feat(auth): add login page"
```

---

## Task 6: Create Signup Page

**Files:**
- Create: `app/auth/signup/page.tsx`

**Step 1: Write the signup page**

```tsx
import { AuthLayout } from "../auth-layout"
import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <AuthLayout title="Create Account" description="Sign up to start logging tournaments">
      <SignupForm />
    </AuthLayout>
  )
}
```

**Step 2: Run lint and typecheck**

Run: `pnpm lint && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add app/auth/signup/page.tsx
git commit -m "feat(auth): add signup page"
```

---

## Task 7: Create Middleware for Route Protection

**Files:**
- Create: `middleware.ts`

**Step 1: Write the middleware**

```ts
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/auth/login") ||
    request.nextUrl.pathname.startsWith("/auth/signup")

  const isProtectedPage = request.nextUrl.pathname.startsWith("/tournaments")

  if (!user && isProtectedPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/tournaments"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
```

**Step 2: Run lint and typecheck**

Run: `pnpm lint && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat(auth): add middleware for route protection"
```

---

## Task 8: Add AuthProvider to App Layout

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Update layout to include AuthProvider**

```tsx
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/providers/auth-provider"

const geistSans = Geist({
  variable: "font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Flip the Script",
  description: "Track your Pokémon TCG tournament results",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Step 2: Run lint and typecheck**

Run: `pnpm lint && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(auth): add AuthProvider to root layout"
```

---

## Task 9: Add Loading UI for Auth State

**Files:**
- Create: `app/auth/loading.tsx`

**Step 1: Write the loading component**

```tsx
export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  )
}
```

**Step 2: Run lint and typecheck**

Run: `pnpm lint && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add app/auth/loading.tsx
git commit -m "feat(auth): add loading state for auth pages"
```

---

## Task 10: Update Environment Variables

**Files:**
- Create: `.env.local`

**Step 1: Create .env.local with Supabase keys**

```
NEXT_PUBLIC_SUPABASE_URL=https://bphivjwicrtcaoeqgefu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sbp_publishable_mDYNL5WjBNtR65SZYDXIOw_J-aLSOql
```

**Step 2: Update lib/supabase.ts to use environment variables**

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Step 3: Commit**

```bash
git add .env.local lib/supabase.ts
git commit -m "chore: use env vars for Supabase config"
```

---

## Task 11: Final Verification

**Step 1: Run lint and typecheck**

Run: `pnpm lint && pnpm typecheck`
Expected: No errors

**Step 2: Test the flow**
1. Start dev server: `pnpm dev`
2. Navigate to `/tournaments` - should redirect to `/auth/login`
3. Click "Sign up" - navigate to `/auth/signup`
4. Create account with test@example.com / password123
5. Should redirect to `/tournaments`
6. Sign out and test login works

**Step 3: Commit final**

```bash
git add . && git commit -m "feat(auth): complete authentication system"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Create AuthProvider context |
| 2 | Create AuthLayout component |
| 3 | Create LoginForm component |
| 4 | Create SignupForm component |
| 5 | Create login page |
| 6 | Create signup page |
| 7 | Create middleware for route protection |
| 8 | Add AuthProvider to app layout |
| 9 | Add loading UI for auth |
| 10 | Update environment variables |
| 11 | Final verification |