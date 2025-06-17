import { cookies } from "next/headers"

const ADMIN_USERNAME = "agungfathul"
const ADMIN_PASSWORD = "qt7htrq5y7o"

export async function validateLogin(username: string, password: string): Promise<boolean> {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

export async function createSession() {
  const cookieStore = await cookies()
  cookieStore.set("admin-session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
  })
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete("admin-session")
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin-session")
  return session?.value === "authenticated"
}
