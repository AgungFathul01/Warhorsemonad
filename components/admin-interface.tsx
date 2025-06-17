"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  createNewContest,
  stopContestSubmissions,
  selectContestWinners,
} from "@/app/actions";
import type { Contest, Submission, Winner } from "@/lib/database";
import { logoutAction } from "@/app/actions";
import {
  Settings,
  LogOut,
  Trophy,
  Users,
  Crown,
  Gift,
  Target,
  AlertTriangle,
  StopCircle,
  Play,
} from "lucide-react";

interface AdminInterfaceProps {
  contest: Contest | null;
  submissions: Submission[];
  winners: (Winner & { contest: Contest })[];
}

export function AdminInterface({
  contest,
  submissions,
  winners,
}: AdminInterfaceProps) {
  const [monadAmount, setMonadAmount] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [contestType, setContestType] = useState<"duration" | "participants">(
    "duration"
  );
  const [durationMinutes, setDurationMinutes] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [winnerCount, setWinnerCount] = useState("1");
  const [isStoppingSubmissions, setIsStoppingSubmissions] = useState(false);
  const [isSelectingWinners, setIsSelectingWinners] = useState(false);

  const handleCreateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    // Add validation for duration
    const duration =
      contestType === "duration" ? Number.parseInt(durationMinutes) : undefined;
    const participants =
      contestType === "participants"
        ? Number.parseInt(maxParticipants)
        : undefined;
    const winners = Number.parseInt(winnerCount);

    // Validate inputs
    if (contestType === "duration" && (!duration || duration <= 0)) {
      alert("Please enter a valid duration in minutes (greater than 0)");
      setIsCreating(false);
      return;
    }

    if (
      contestType === "participants" &&
      (!participants || participants <= 0)
    ) {
      alert("Please enter a valid number of participants (greater than 0)");
      setIsCreating(false);
      return;
    }

    if (!winners || winners <= 0) {
      alert("Please enter a valid number of winners (greater than 0)");
      setIsCreating(false);
      return;
    }

    // Validate monad amount
    const monadAmountNum = Number.parseFloat(monadAmount);
    if (isNaN(monadAmountNum) || monadAmountNum <= 0) {
      alert("Please enter a valid Monad amount (greater than 0)");
      setIsCreating(false);
      return;
    }

    console.log("Creating contest with:", {
      monadAmount: monadAmount,
      contestType,
      duration,
      participants,
      winners,
    });

    try {
      await createNewContest(
        monadAmount,
        contestType,
        duration,
        participants,
        winners
      );

      setMonadAmount("");
      setDurationMinutes("");
      setMaxParticipants("");
      setWinnerCount("1");
    } catch (error) {
      console.error("Error creating contest:", error);
      alert("Failed to create contest. Please try again.");
    }

    setIsCreating(false);
  };

  const handleStopSubmissions = async () => {
    if (!contest) return;
    setIsStoppingSubmissions(true);
    try {
      await stopContestSubmissions(contest.id);
    } catch (error) {
      console.error("Error stopping submissions:", error);
      alert("Failed to stop submissions. Please try again.");
    }
    setIsStoppingSubmissions(false);
  };

  const handleSelectWinners = async () => {
    if (!contest) return;
    setIsSelectingWinners(true);
    try {
      await selectContestWinners(contest.id);
    } catch (error) {
      console.error("Error selecting winners:", error);
      alert("Failed to select winners. Please try again.");
    }
    setIsSelectingWinners(false);
  };

  // Check if contest has ended naturally (time/participants)
  const isContestNaturallyEnded = () => {
    if (!contest) return false;

    // Duration-based contest end check
    if (
      contest.contest_type === "duration" &&
      contest.end_time &&
      !contest.manually_stopped
    ) {
      const now = new Date().getTime();
      const endTime = new Date(contest.end_time).getTime();
      return now >= endTime;
    }

    // Participant-based contest end check
    if (
      contest.contest_type === "participants" &&
      contest.max_participants &&
      submissions.length >= contest.max_participants
    ) {
      return true;
    }

    return false;
  };

  // Format Monad amount to show exactly as admin typed
  const formatMonadAmount = (amount: string) => {
    const num = Number.parseFloat(amount);
    return num % 1 === 0 ? num.toString() : amount;
  };

  const contestNaturallyEnded = isContestNaturallyEnded();
  const submissionsStopped =
    contest?.submissions_stopped || contestNaturallyEnded;
  const canSelectWinners =
    contest && contest.status === "active" && submissions.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100">
      <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white/70 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg border border-white/50">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl">
              <Settings className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 text-sm md:text-base">
                Manage Warhorse Monad contests and winners
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => logoutAction()}
            className="flex items-center gap-2 border-slate-300 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Create Contest */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Gift className="h-5 w-5 md:h-6 md:w-6" />
                Create New Contest
              </CardTitle>
              <CardDescription className="text-indigo-100 text-sm md:text-base">
                Set up a new Monad raffle giveaway with multiple winners
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <form
                onSubmit={handleCreateContest}
                className="space-y-4 md:space-y-6"
              >
                <div>
                  <Label
                    htmlFor="monad-amount"
                    className="text-slate-700 font-medium"
                  >
                    Monad Amount (per winner)
                  </Label>
                  <Input
                    id="monad-amount"
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={monadAmount}
                    onChange={(e) => setMonadAmount(e.target.value)}
                    className="mt-2 bg-white border-slate-300 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <Label className="text-slate-700 font-medium">
                    Contest Type
                  </Label>
                  <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2">
                    <label className="flex items-center gap-2 p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors flex-1">
                      <input
                        type="radio"
                        value="duration"
                        checked={contestType === "duration"}
                        onChange={(e) =>
                          setContestType(
                            e.target.value as "duration" | "participants"
                          )
                        }
                        className="text-indigo-600"
                      />
                      <span className="text-slate-700 text-sm md:text-base">
                        Duration Based
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors flex-1">
                      <input
                        type="radio"
                        value="participants"
                        checked={contestType === "participants"}
                        onChange={(e) =>
                          setContestType(
                            e.target.value as "duration" | "participants"
                          )
                        }
                        className="text-indigo-600"
                      />
                      <span className="text-slate-700 text-sm md:text-base">
                        Participant Based
                      </span>
                    </label>
                  </div>
                </div>

                {contestType === "duration" && (
                  <div>
                    <Label
                      htmlFor="duration"
                      className="text-slate-700 font-medium"
                    >
                      Duration (minutes)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="60"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="mt-2 bg-white border-slate-300 focus:border-indigo-500"
                      required
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      Contest will run for {durationMinutes || "X"} minutes
                    </p>
                  </div>
                )}

                {contestType === "participants" && (
                  <div>
                    <Label
                      htmlFor="max-participants"
                      className="text-slate-700 font-medium"
                    >
                      Maximum Participants
                    </Label>
                    <Input
                      id="max-participants"
                      type="number"
                      placeholder="100"
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(e.target.value)}
                      className="mt-2 bg-white border-slate-300 focus:border-indigo-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <Label
                    htmlFor="winner-count"
                    className="text-slate-700 font-medium flex items-center gap-2"
                  >
                    <Crown className="h-4 w-4 text-yellow-500" />
                    Number of Winners
                  </Label>
                  <Input
                    id="winner-count"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={winnerCount}
                    onChange={(e) => setWinnerCount(e.target.value)}
                    className="mt-2 bg-white border-slate-300 focus:border-indigo-500"
                    required
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    Each winner will receive {monadAmount || "X"} MONAD
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create Contest"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Current Contest */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Target className="h-5 w-5 md:h-6 md:w-6" />
                Current Contest
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {contest ? (
                <div className="space-y-4">
                  {/* Contest Status Alerts */}
                  {contestNaturallyEnded && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-6 w-6 text-orange-500" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-orange-800">
                            Contest Time/Limit Reached!
                          </h3>
                          <p className="text-orange-600 text-sm">
                            {contest.contest_type === "duration"
                              ? "Time limit reached"
                              : "Participant limit reached"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {submissionsStopped && !contestNaturallyEnded && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <StopCircle className="h-6 w-6 text-red-500" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-red-800">
                            Submissions Stopped
                          </h3>
                          <p className="text-red-600 text-sm">
                            No more addresses can be submitted
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
                      <p className="text-sm text-emerald-600">
                        Prize per Winner
                      </p>
                      <p className="text-lg md:text-xl font-bold text-emerald-700">
                        {formatMonadAmount(contest.monad_amount)} MONAD
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-600">Total Winners</p>
                      <p className="text-lg md:text-xl font-bold text-yellow-700 flex items-center gap-1">
                        <Crown className="h-4 w-4 md:h-5 md:w-5" />
                        {contest.winner_count || 1}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-600">Total Prize Pool</p>
                    <p className="text-xl md:text-2xl font-bold text-blue-700">
                      {(
                        Number.parseFloat(contest.monad_amount) *
                        (contest.winner_count || 1)
                      ).toString()}{" "}
                      MONAD
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-sm text-slate-600">Status</p>
                      <Badge
                        variant={
                          contest.status === "active" ? "default" : "secondary"
                        }
                        className={`mt-1 ${
                          submissionsStopped ? "bg-orange-500 text-white" : ""
                        }`}
                      >
                        {contest.status === "completed"
                          ? "Completed"
                          : submissionsStopped
                          ? "Submissions Stopped"
                          : "Active"}
                      </Badge>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-sm text-slate-600">Participants</p>
                      <p className="text-xl md:text-2xl font-bold text-slate-700">
                        {submissions.length}
                      </p>
                    </div>
                  </div>

                  {contest.end_time && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-sm text-slate-600">End Time</p>
                      <p className="text-sm font-medium">
                        {new Date(contest.end_time).toLocaleString("id-ID", {
                          timeZone: "Asia/Jakarta",
                        })}
                      </p>
                    </div>
                  )}

                  {/* Admin Actions */}
                  {contest && contest.status === "active" && (
                    <div className="space-y-3">
                      {/* Stop Submissions Button */}
                      {!submissionsStopped && (
                        <Button
                          onClick={handleStopSubmissions}
                          disabled={isStoppingSubmissions}
                          variant="destructive"
                          className="w-full flex items-center gap-2"
                        >
                          <StopCircle className="h-5 w-5" />
                          {isStoppingSubmissions
                            ? "Stopping Submissions..."
                            : "🛑 Stop Submissions"}
                        </Button>
                      )}

                      {/* Select Winners Button */}
                      {canSelectWinners && (
                        <Button
                          onClick={handleSelectWinners}
                          disabled={isSelectingWinners}
                          className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white shadow-lg flex items-center gap-2"
                        >
                          <Play className="h-5 w-5" />
                          {isSelectingWinners
                            ? "Selecting Winners..."
                            : `🎰 Select ${
                                contest.winner_count || 1
                              } Winner(s)`}
                        </Button>
                      )}

                      {submissions.length === 0 && (
                        <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                          <p className="text-slate-500 text-sm">
                            No participants yet. Winners can only be selected
                            when there are participants.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-10 w-10 md:h-12 md:w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No active contest</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Current Submissions */}
        {submissions.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Users className="h-5 w-5 md:h-6 md:w-6" />
                Current Submissions ({submissions.length})
                {submissionsStopped && (
                  <Badge className="bg-red-500 text-white ml-2">
                    Submissions Stopped
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-3 max-h-60 md:max-h-80 overflow-y-auto">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex justify-between items-center p-3 md:p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <span className="font-mono text-slate-800 text-sm md:text-base break-all">
                      {submission.evm_address}
                    </span>
                    <div className="flex items-center gap-2 md:gap-4">
                      <Badge
                        variant="secondary"
                        className="font-semibold px-2 md:px-3 py-1 bg-emerald-100 text-emerald-700 text-xs md:text-sm"
                      >
                        {contest
                          ? formatMonadAmount(contest.monad_amount)
                          : "0"}{" "}
                        MONAD
                      </Badge>
                      <span className="text-xs md:text-sm text-slate-500 hidden md:inline">
                        {new Date(submission.submitted_at).toLocaleString(
                          "id-ID",
                          { timeZone: "Asia/Jakarta" }
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Winners History */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Trophy className="h-5 w-5 md:h-6 md:w-6" />
              Winners History
            </CardTitle>
            <CardDescription className="text-yellow-100 text-sm md:text-base">
              All past contest winners
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {winners.length > 0 ? (
              <div className="space-y-4 max-h-60 md:max-h-80 overflow-y-auto">
                {winners.map((winner) => (
                  <div
                    key={winner.id}
                    className="border border-yellow-200 rounded-lg p-3 md:p-4 bg-gradient-to-r from-yellow-50 to-orange-50"
                  >
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-slate-800 break-all">
                          {winner.evm_address}
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Won {formatMonadAmount(winner.monad_amount)} MONAD
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2 md:ml-4 text-xs">
                        {new Date(winner.won_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-10 w-10 md:h-12 md:w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No winners yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
