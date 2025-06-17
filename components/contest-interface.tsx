"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Coins,
  Clock,
  Users,
  Trophy,
  Gift,
  Share,
  DollarSign,
  Crown,
  Target,
  ExternalLink,
  Twitter,
  Calendar,
  AlertCircle,
  StopCircle,
} from "lucide-react"
import { submitEVMAddress } from "@/app/actions"
import type { Contest, Submission } from "@/lib/database"

interface ContestInterfaceProps {
  contest: Contest
  submissions: Submission[]
  isExpired: boolean
}

export function ContestInterface({ contest, submissions, isExpired }: ContestInterfaceProps) {
  const [address, setAddress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [timeLeft, setTimeLeft] = useState("")
  const [hasFollowed, setHasFollowed] = useState(false)
  const [showFollowPrompt, setShowFollowPrompt] = useState(false)

  // Check if contest has ended naturally (duration or participant limit)
  const checkContestEnd = () => {
    let ended = false

    // Duration-based contest end check - only check if not manually stopped
    if (contest.contest_type === "duration" && contest.end_time && !contest.manually_stopped) {
      // Use current time consistently
      const now = new Date().getTime()
      const endTime = new Date(contest.end_time).getTime()
      ended = now >= endTime

      // Debug logging with timezone info
      if (contest.contest_type === "duration") {
        console.log("Duration contest check:", {
          now: new Date(now).toISOString(),
          nowLocal: new Date(now).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
          endTime: new Date(endTime).toISOString(),
          endTimeLocal: new Date(endTime).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
          ended,
          manually_stopped: contest.manually_stopped,
          status: contest.status,
          timeDifferenceMinutes: (endTime - now) / (1000 * 60),
        })
      }
    }

    // Participant-based contest end check
    if (
      contest.contest_type === "participants" &&
      contest.max_participants &&
      submissions.length >= contest.max_participants
    ) {
      ended = true
    }

    return ended
  }

  useEffect(() => {
    if (contest.contest_type === "duration" && contest.end_time && !contest.manually_stopped) {
      const updateTimer = () => {
        const now = new Date().getTime()
        const endTime = new Date(contest.end_time).getTime()
        const difference = endTime - now

        if (difference > 0) {
          const hours = Math.floor(difference / (1000 * 60 * 60))
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((difference % (1000 * 60)) / 1000)
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
        } else {
          setTimeLeft("Contest Ended")
        }
      }

      updateTimer()
      const timer = setInterval(updateTimer, 1000)
      return () => clearInterval(timer)
    }
  }, [contest.end_time, contest.contest_type, contest.manually_stopped])

  const handleFollowCheck = () => {
    setShowFollowPrompt(true)
  }

  const confirmFollow = () => {
    setHasFollowed(true)
    setShowFollowPrompt(false)
  }

  const openTwitter = () => {
    window.open("https://x.com/agungfathul", "_blank")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasFollowed) {
      handleFollowCheck()
      return
    }

    setIsSubmitting(true)
    setMessage("")

    const result = await submitEVMAddress(contest.id, address)

    if (result.success) {
      setMessage("Address submitted successfully! 🎉")
      setAddress("")
    } else {
      setMessage(result.error || "Failed to submit address")
    }

    setIsSubmitting(false)
  }

  const shareToTwitter = () => {
    const text = `🎉 Monadhorse Raffle Giveaway 🐎
Hosted by @agungfathul

Join the fun, win cool stuff, and stay updated on giveaways, art, and exclusive info!
Follow for more 👉 @agungfathul

#MonadGiveaway #Crypto #Raffle`

    const url = window.location.href
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, "_blank")
  }

  // Format Monad amount to show exactly as admin typed
  const formatMonadAmount = (amount: string) => {
    const num = Number.parseFloat(amount)
    return num % 1 === 0 ? num.toString() : amount
  }

  // Format date and time with timezone awareness
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString("id-ID", {
        month: "short",
        day: "numeric",
        timeZone: "Asia/Jakarta",
      }),
      time: date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      }),
    }
  }

  const totalPrizePool = Number.parseFloat(contest.monad_amount) * (contest.winner_count || 1)
  const isContestNaturallyEnded = checkContestEnd()
  const submissionsBlocked = contest.submissions_stopped || isContestNaturallyEnded || contest.status !== "active"

  // Debug logging for contest state with timezone info
  console.log("Contest state (with timezone):", {
    id: contest.id,
    type: contest.contest_type,
    status: contest.status,
    manually_stopped: contest.manually_stopped,
    submissions_stopped: contest.submissions_stopped,
    end_time: contest.end_time,
    end_time_local: contest.end_time
      ? new Date(contest.end_time).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
      : null,
    current_time_utc: new Date().toISOString(),
    current_time_local: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
    isContestNaturallyEnded,
    submissionsBlocked,
    timeLeft,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Follow Prompt Modal */}
        {showFollowPrompt && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="bg-white shadow-2xl border-0 max-w-md w-full mx-4">
              <CardContent className="p-6 md:p-8 text-center">
                <Twitter className="h-12 w-12 md:h-16 md:w-16 text-blue-500 mx-auto mb-4" />
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">Follow Required!</h2>
                <p className="text-slate-600 mb-6 text-sm md:text-base">
                  You need to follow @agungfathul on X (Twitter) before submitting your wallet address.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={openTwitter}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Follow @agungfathul
                  </Button>
                  <Button onClick={confirmFollow} variant="outline" className="w-full">
                    I've followed, continue
                  </Button>
                  <Button onClick={() => setShowFollowPrompt(false)} variant="ghost" className="w-full text-slate-500">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Gift className="h-8 w-8 md:h-10 md:w-10 text-indigo-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">Warhorse Monad</h1>
          </div>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-3 md:mb-4 px-4">
            Join our exclusive raffle giveaway! Submit your EVM address for a chance to win Monad tokens.
          </p>

          {/* Social Share Button */}
          <Button
            onClick={shareToTwitter}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 mx-auto shadow-lg text-sm md:text-base"
          >
            <Share className="h-4 w-4" />
            Share on X
          </Button>
        </div>

        {/* Compact Prize & Schedule Info */}
        <div className="max-w-4xl mx-auto mb-4 md:mb-6">
          <Card className="bg-gradient-to-r from-emerald-500 to-blue-600 border-0 shadow-lg">
            <CardContent className="p-3 md:p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-center text-white text-xs md:text-sm">
                <div className="flex flex-col items-center">
                  <DollarSign className="h-5 w-5 md:h-6 md:w-6 mb-1" />
                  <p className="text-base md:text-lg font-bold">{formatMonadAmount(contest.monad_amount)} MONAD</p>
                  <p className="text-xs opacity-90">per winner</p>
                </div>
                <div className="flex flex-col items-center">
                  <Crown className="h-5 w-5 md:h-6 md:w-6 mb-1" />
                  <p className="text-base md:text-lg font-bold">{contest.winner_count || 1}</p>
                  <p className="text-xs opacity-90">winners</p>
                </div>
                <div className="flex flex-col items-center">
                  <Target className="h-5 w-5 md:h-6 md:w-6 mb-1" />
                  <p className="text-base md:text-lg font-bold">{totalPrizePool.toString()} MONAD</p>
                  <p className="text-xs opacity-90">total pool</p>
                </div>
                <div className="flex flex-col items-center">
                  {contest.contest_type === "duration" ? (
                    <>
                      <Clock className="h-5 w-5 md:h-6 md:w-6 mb-1" />
                      <p className="text-base md:text-lg font-bold">{isContestNaturallyEnded ? "Ended" : timeLeft}</p>
                      <p className="text-xs opacity-90">
                        {contest.end_time ? `ends ${formatDateTime(contest.end_time).date}` : "duration"}
                      </p>
                    </>
                  ) : (
                    <>
                      <Users className="h-5 w-5 md:h-6 md:w-6 mb-1" />
                      <p className="text-base md:text-lg font-bold">
                        {submissions.length}/{contest.max_participants}
                      </p>
                      <p className="text-xs opacity-90">participants</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contest Status Messages */}
        {submissionsBlocked && (
          <div className="max-w-4xl mx-auto mb-4 md:mb-6">
            <Card className="bg-gradient-to-r from-orange-500 to-red-500 border-0 shadow-lg">
              <CardContent className="p-4 md:p-6 text-center text-white">
                {contest.status === "completed" ? (
                  <>
                    <Trophy className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-3 md:mb-4" />
                    <h3 className="text-lg md:text-2xl font-bold mb-2">Contest Completed!</h3>
                    <p className="text-sm md:text-base mb-2">Winners have been selected and announced.</p>
                    <p className="text-xs md:text-sm opacity-90">🎉 Check the history page to see if you won!</p>
                  </>
                ) : contest.submissions_stopped ? (
                  <>
                    <StopCircle className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-3 md:mb-4" />
                    <h3 className="text-lg md:text-2xl font-bold mb-2">Submissions Stopped!</h3>
                    <p className="text-sm md:text-base mb-2">The admin has stopped accepting new submissions.</p>
                    <p className="text-xs md:text-sm opacity-90">🎰 Winners will be selected soon. Stay tuned!</p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-3 md:mb-4" />
                    <h3 className="text-lg md:text-2xl font-bold mb-2">Contest Time/Limit Reached!</h3>
                    <p className="text-sm md:text-base mb-2">
                      {contest.contest_type === "duration"
                        ? "The time limit has been reached."
                        : "The participant limit has been reached."}
                    </p>
                    <p className="text-xs md:text-sm opacity-90">
                      🔒 No more submissions accepted. Winners will be announced soon.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content - Focus on Submission */}
        <div className="grid lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          {/* Contest Details - Smaller */}
          <Card className="lg:col-span-1 bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg p-3 md:p-4">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Trophy className="h-4 w-4 md:h-5 md:w-5" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 space-y-3">
              <div className="text-center">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-3">
                  <Coins className="h-5 w-5 md:h-6 md:w-6 text-emerald-600 mx-auto mb-1" />
                  <p className="text-lg md:text-xl font-bold text-emerald-700">
                    {formatMonadAmount(contest.monad_amount)}
                  </p>
                  <p className="text-emerald-600 text-xs md:text-sm">MONAD each</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded text-xs md:text-sm">
                  <span className="flex items-center gap-1 text-slate-700">
                    <Users className="h-3 w-3 md:h-4 md:w-4" />
                    Joined
                  </span>
                  <Badge variant="outline" className="text-xs border-indigo-300 text-indigo-600">
                    {submissions.length}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded text-xs md:text-sm">
                  <span className="flex items-center gap-1 text-yellow-700">
                    <Crown className="h-3 w-3 md:h-4 md:w-4" />
                    Winners
                  </span>
                  <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-600">
                    {contest.winner_count || 1}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded text-xs md:text-sm">
                  <span className="flex items-center gap-1 text-blue-700">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                    Started
                  </span>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-blue-700">{formatDateTime(contest.start_time).date}</p>
                    <p className="text-xs text-blue-600">{formatDateTime(contest.start_time).time}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Form - Larger Focus */}
          <Card className="lg:col-span-3 bg-white/70 backdrop-blur-sm border-slate-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">🎯 Submit Your EVM Address</CardTitle>
              <CardDescription className="text-indigo-100 text-sm md:text-base">
                Follow @agungfathul first, then enter your EVM address to participate in the raffle
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {!submissionsBlocked ? (
                <div className="space-y-4 md:space-y-6">
                  {/* Follow Requirement */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Twitter className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-blue-800 text-sm md:text-base">Follow Required</h3>
                        <p className="text-blue-600 text-xs md:text-sm">
                          You must follow @agungfathul on X (Twitter) to participate
                        </p>
                      </div>
                      {!hasFollowed && (
                        <Button
                          onClick={openTwitter}
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm"
                        >
                          Follow
                        </Button>
                      )}
                      {hasFollowed && (
                        <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">✓ Followed</Badge>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    <div>
                      <label
                        htmlFor="address"
                        className="block text-base md:text-lg font-medium text-slate-700 mb-2 md:mb-3"
                      >
                        Your EVM Address
                      </label>
                      <Input
                        id="address"
                        type="text"
                        placeholder="0x..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="h-12 md:h-14 text-base md:text-lg font-mono bg-white border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        disabled={isSubmitting}
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-12 md:h-14 text-base md:text-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg font-semibold"
                      disabled={isSubmitting || !address}
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : hasFollowed
                          ? "🚀 Submit & Join Raffle"
                          : "Follow First to Submit"}
                    </Button>
                    {message && (
                      <div
                        className={`p-3 md:p-4 rounded-lg border text-center font-medium text-sm md:text-base ${
                          message.includes("successfully")
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {message}
                      </div>
                    )}
                  </form>
                </div>
              ) : (
                <div className="text-center py-6 md:py-8">
                  {contest.status === "completed" ? (
                    <>
                      <Trophy className="h-12 w-12 md:h-16 md:w-16 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Contest Completed!</h3>
                      <p className="text-slate-600 mb-4 md:mb-6 text-sm md:text-base px-4">
                        Winners have been selected! Check the history page to see if you won.
                      </p>
                    </>
                  ) : (
                    <>
                      <StopCircle className="h-12 w-12 md:h-16 md:w-16 text-red-500 mx-auto mb-4" />
                      <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Submissions Closed!</h3>
                      <p className="text-slate-600 mb-4 md:mb-6 text-sm md:text-base px-4">
                        {contest.submissions_stopped
                          ? "The admin has stopped accepting new submissions. Winners will be announced soon!"
                          : "The contest time/limit has been reached. No more submissions are accepted."}
                      </p>
                    </>
                  )}
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm md:text-base"
                    onClick={() => (window.location.href = "/history")}
                  >
                    View Winners History
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Submissions - Compact */}
        {submissions.length > 0 && (
          <Card className="max-w-6xl mx-auto mt-4 md:mt-6 bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-t-lg p-3">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                Recent Participants ({submissions.length})
                {submissionsBlocked && <Badge className="bg-red-500 text-white text-xs">Submissions Closed</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4">
              <div className="grid gap-2 max-h-48 md:max-h-60 overflow-y-auto">
                {submissions
                  .slice(-8)
                  .reverse()
                  .map((submission, index) => (
                    <div
                      key={submission.id}
                      className="flex justify-between items-center p-2 md:p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <span className="font-mono text-slate-800 text-xs md:text-sm break-all">
                        {window.innerWidth < 768
                          ? `${submission.evm_address.slice(0, 8)}...${submission.evm_address.slice(-6)}`
                          : submission.evm_address}
                      </span>
                      <div className="flex items-center gap-2 md:gap-3">
                        <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                          {formatMonadAmount(contest.monad_amount)} MONAD
                        </Badge>
                        <span className="text-xs text-slate-500 hidden md:inline">
                          {new Date(submission.submitted_at).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" })}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
