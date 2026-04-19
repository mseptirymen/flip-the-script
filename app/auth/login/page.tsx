import { AuthLayout } from "../auth-layout"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome Back" description="Sign in to your account">
      <LoginForm />
    </AuthLayout>
  )
}
