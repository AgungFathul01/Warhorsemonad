import {
  getCurrentContest,
  getContestSubmissions,
  getLastCompletedContest,
  getWinnersByContest,
  getContestTasks,
} from "@/lib/database"
import { ContestInterface } from "@/components/contest-interface"
import { NoActiveContest } from "@/components/no-active-contest"

export default async function HomePage() {
  const contest = await getCurrentContest()
  const submissions = contest ? await getContestSubmissions(contest.id) : []

  if (!contest) {
    const lastContest = await getLastCompletedContest()
    const lastWinners = lastContest ? await getWinnersByContest(lastContest.id) : []

    return <NoActiveContest lastContest={lastContest} lastWinners={lastWinners} />
  }

  // Get contest tasks and user task completions (empty for now since we don't have user address yet)
  const tasks = await getContestTasks(contest.id)
  const userTaskCompletions: any[] = [] // Will be populated when user enters address

  // Check if contest has ended naturally (without calling server actions)
  const isExpired = contest.contest_type === "duration" && contest.end_time && new Date() > new Date(contest.end_time)
  const isParticipantLimitReached =
    contest.contest_type === "participants" &&
    contest.max_participants &&
    submissions.length >= contest.max_participants

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <ContestInterface
        contest={contest}
        submissions={submissions}
        tasks={tasks}
        userTaskCompletions={userTaskCompletions}
        isExpired={isExpired || isParticipantLimitReached}
      />
    </div>
  )
}
