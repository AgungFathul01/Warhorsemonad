"use server"

import {
  submitAddress,
  createContest,
  checkAndProcessExpiredContests,
  stopContest,
  stopSubmissions,
  selectWinners,
  markTaskCompleted,
  addContestTask,
} from "@/lib/database"
import { validateLogin, createSession, destroySession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function submitEVMAddress(contestId: number, address: string) {
  // Validate EVM address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return { success: false, error: "Invalid EVM address format" }
  }

  const result = await submitAddress(contestId, address)
  revalidatePath("/")
  return result
}

export async function markUserTaskCompleted(contestId: number, evmAddress: string, taskId: number) {
  const result = await markTaskCompleted(contestId, evmAddress, taskId)
  revalidatePath("/")
  return result
}

export async function createNewContest(
  contestName: string,
  monadAmount: number,
  contestType: "duration" | "participants",
  durationMinutes?: number,
  maxParticipants?: number,
  winnerCount?: number,
) {
  console.log("Server action createNewContest called with:", {
    contestName,
    monadAmount,
    contestType,
    durationMinutes,
    maxParticipants,
    winnerCount,
  })

  // Validate inputs on server side
  if (contestType === "duration" && (!durationMinutes || durationMinutes <= 0)) {
    throw new Error("Invalid duration: must be greater than 0 minutes")
  }

  if (contestType === "participants" && (!maxParticipants || maxParticipants <= 0)) {
    throw new Error("Invalid participant count: must be greater than 0")
  }

  await checkAndProcessExpiredContests()
  const contest = await createContest(
    contestName,
    monadAmount,
    contestType,
    durationMinutes,
    maxParticipants,
    winnerCount,
  )

  console.log("Contest created successfully:", contest)

  revalidatePath("/")
  revalidatePath("/admin")
  return contest
}

export async function addNewContestTask(
  contestId: number,
  taskType: string,
  taskDescription: string,
  taskUrl?: string,
  isRequired = true,
) {
  const task = await addContestTask(contestId, taskType, taskDescription, taskUrl, isRequired)
  revalidatePath("/")
  revalidatePath("/admin")
  return task
}

export async function stopContestSubmissions(contestId: number) {
  const result = await stopSubmissions(contestId)
  revalidatePath("/")
  revalidatePath("/admin")
  return result
}

export async function selectContestWinners(contestId: number) {
  const winners = await selectWinners(contestId)
  revalidatePath("/")
  revalidatePath("/admin")
  revalidatePath("/history")
  return winners
}

export async function stopContestManually(contestId: number) {
  const winners = await stopContest(contestId)
  revalidatePath("/")
  revalidatePath("/admin")
  revalidatePath("/history")
  return winners
}

// This action can be called manually when needed, but not during page render
export async function processExpiredContests() {
  await checkAndProcessExpiredContests()
  revalidatePath("/")
  revalidatePath("/history")
}

export async function loginAction(username: string, password: string) {
  const isValid = await validateLogin(username, password)

  if (isValid) {
    await createSession()
    redirect("/admin")
  }

  return { success: false, error: "Invalid credentials" }
}

export async function logoutAction() {
  await destroySession()
  redirect("/login")
}
