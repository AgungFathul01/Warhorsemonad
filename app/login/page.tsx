import LoginForm from "@/components/login-form"
import { isAuthenticated } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const authenticated = await isAuthenticated()

  if (authenticated) {
    redirect("/admin")
  }

  return <LoginForm />
}
