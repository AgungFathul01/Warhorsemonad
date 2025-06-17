"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, Coins, Share } from "lucide-react"
import type { Winner, Contest } from "@/lib/database"

interface HistoryClientProps {
  winners: (Winner & { contest: Contest })[]
}

export function HistoryClient({ winners }: HistoryClientProps) {
  // Format Monad amount to show exactly as admin typed
  const formatMonadAmount = (amount: string) => {
    const num = Number.parseFloat(amount)
    return num % 1 === 0 ? num.toString() : amount
  }

  const shareToTwitter = () => {
    const text = `🎉 Monadhorse Raffle Giveaway 🐎
Hosted by @agungfathul

Join the fun, win cool stuff, and stay updated on giveaways, art, and exclusive info!
Follow for more 👉 @agungfathul

#MonadGiveaway #Crypto #Raffle`

    const url = typeof window !== "undefined" ? window.location.href : ""
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    if (typeof window !== "undefined") {
      window.open(twitterUrl, "_blank")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-12 w-12 text-yellow-500" />
            <h1 className="text-5xl font-bold text-slate-800">Hall of Fame</h1>
          </div>
          <p className="text-xl text-slate-600 mb-6">Immortalized winners of Warhorse Monad raffle giveaways</p>

          {/* Social Share Button */}
          <Button
            onClick={shareToTwitter}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 mx-auto shadow-lg"
          >
            <Share className="h-5 w-5" />
            Share on X (Twitter)
          </Button>
        </div>

        {winners.length > 0 ? (
          <div className="grid gap-6 max-w-4xl mx-auto">
            {winners.map((winner, index) => (
              <Card key={winner.id} className="bg-white/70 backdrop-blur-sm border-slate-200 shadow-xl">
                <CardHeader
                  className={`rounded-t-lg ${
                    index === 0
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                      : index === 1
                        ? "bg-gradient-to-r from-slate-400 to-slate-500 text-white"
                        : index === 2
                          ? "bg-gradient-to-r from-orange-400 to-red-500 text-white"
                          : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy
                        className={`h-6 w-6 ${
                          index === 0
                            ? "text-yellow-200"
                            : index === 1
                              ? "text-slate-200"
                              : index === 2
                                ? "text-orange-200"
                                : "text-purple-200"
                        }`}
                      />
                      Winner #{winners.length - index}
                    </CardTitle>
                    <Badge variant="secondary" className="text-lg font-bold px-4 py-2 bg-white/20 text-white">
                      {formatMonadAmount(winner.monad_amount)} MONAD
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-slate-800 font-mono text-lg break-all">{winner.evm_address}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="flex items-center gap-2 text-slate-700">
                        <Calendar className="h-4 w-4" />
                        Won on:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {new Date(winner.won_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
                      <span className="flex items-center gap-2 text-emerald-700">
                        <Coins className="h-4 w-4" />
                        Prize:
                      </span>
                      <span className="font-bold text-emerald-700">{formatMonadAmount(winner.monad_amount)} MONAD</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto bg-white/70 backdrop-blur-sm border-slate-200 shadow-xl">
            <CardContent className="text-center py-12">
              <Trophy className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 mb-2">No Winners Yet</h3>
              <p className="text-slate-600">Be the first to win and get immortalized in the hall of fame!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
