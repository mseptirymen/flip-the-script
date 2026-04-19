import { AuthLayout } from "../auth-layout"
import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <AuthLayout title="Create Account" description="Sign up to start logging tournaments">
      <SignupForm />
    </AuthLayout>
  )
}