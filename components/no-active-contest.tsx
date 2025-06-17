"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Calendar, Users, Coins, Gift, Share } from "lucide-react"
import type { Contest, Winner } from "@/lib/database"

interface NoActiveContestProps {
  lastContest: Contest | null
  lastWinners: Winner[]
}

export function NoActiveContest({ lastContest, lastWinners }: NoActiveContestProps) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gift className="h-12 w-12 text-slate-400" />
            <h1 className="text-5xl font-bold text-slate-800">Warhorse Monad</h1>
          </div>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-6 max-w-2xl mx-auto mb-6 shadow-lg">
            <p className="text-xl font-semibold mb-2">No Event Active</p>
            <p className="text-yellow-100">Check back later for the next Monad raffle giveaway!</p>
          </div>

          {/* Social Share Button */}
          <Button
            onClick={shareToTwitter}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 mx-auto shadow-lg"
          >
            <Share className="h-5 w-5" />
            Share on X (Twitter)
          </Button>
        </div>

        {lastContest && lastWinners.length > 0 && (
          <div className="max-w-4xl mx-auto">
            {/* Last Event Summary */}
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200 shadow-xl mb-8">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-300" />
                  Last Event Results
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
                    <Coins className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
                    <p className="text-2xl font-bold text-emerald-700">{formatMonadAmount(lastContest.monad_amount)}</p>
                    <p className="text-emerald-600 font-medium">MONAD Prize</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <Users className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                    <p className="text-2xl font-bold text-blue-700">
                      {lastContest.contest_type === "duration" ? "Duration" : "Participants"}
                    </p>
                    <p className="text-blue-600 font-medium">
                      {lastContest.contest_type === "duration"
                        ? `${lastContest.duration_minutes} minutes`
                        : `${lastContest.max_participants} max`}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                    <Calendar className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                    <p className="text-2xl font-bold text-purple-700">
                      {new Date(lastContest.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-purple-600 font-medium">Event Date</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Winners */}
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6" />
                  Winners from Last Event
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {lastWinners.map((winner, index) => (
                    <div
                      key={winner.id}
                      className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Trophy className="h-8 w-8 text-yellow-500" />
                          <div>
                            <p className="text-lg font-mono text-slate-800 break-all">{winner.evm_address}</p>
                            <p className="text-yellow-700 font-medium">
                              Won on {new Date(winner.won_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-lg font-bold bg-yellow-400 text-yellow-900 px-4 py-2"
                        >
                          {formatMonadAmount(winner.monad_amount)} MONAD
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="text-center mt-8">
          <Button
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
            onClick={() => (window.location.href = "/history")}
          >
            View All Winners History
          </Button>
        </div>
      </div>
    </div>
  )
}
