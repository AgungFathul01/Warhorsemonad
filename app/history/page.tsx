import { getAllWinners } from "@/lib/database"
import { HistoryClient } from "@/components/history-client"

export default async function HistoryPage() {
  try {
    const winners = await getAllWinners()
    return <HistoryClient winners={winners} />
  } catch (error) {
    console.error("Error in HistoryPage:", error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
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
