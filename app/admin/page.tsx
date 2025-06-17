import { getCurrentContest, getContestSubmissions, getAllWinners } from "@/lib/database"
import { AdminInterface } from "@/components/admin-interface"
import { isAuthenticated } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    redirect("/login")
  }

  try {
    const contest = await getCurrentContest()
    const submissions = contest ? await getContestSubmissions(contest.id) : []
    const winners = await getAllWinners()

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <AdminInterface contest={contest} submissions={submissions} winners={winners} />
      </div>
    )
  } catch (error) {
    console.error("Error in AdminPage:", error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Database Connection Error</h1>
          <p className="text-slate-600 mb-4">Unable to connect to the database. Please check your configuration.</p>
          <p className="text-sm text-slate-500">
            Make sure your database is set up and environment variables are configured.
          </p>
        </div>
      </div>
    )
  }
}
