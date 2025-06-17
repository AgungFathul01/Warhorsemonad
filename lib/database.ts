import { neon } from "@neondatabase/serverless"

// Use the available environment variables from your workspace
const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING

if (!databaseUrl) {
  console.error("Available environment variables:", {
    DATABASE_URL: !!process.env.DATABASE_URL,
    POSTGRES_URL: !!process.env.POSTGRES_URL,
    NEON_DATABASE_URL: !!process.env.NEON_DATABASE_URL,
    POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
    POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
  })
  throw new Error(
    "Database connection string not found. Please ensure one of the database environment variables is properly set.",
  )
}

const sql = neon(databaseUrl)

export interface Contest {
  id: number
  monad_amount: string
  duration_hours: number
  duration_minutes: number
  start_time: string
  end_time: string
  status: string
  created_at: string
  contest_type: "duration" | "participants"
  max_participants?: number
  manually_stopped: boolean
  submissions_stopped: boolean
  winner_count: number
}

export interface Submission {
  id: number
  contest_id: number
  evm_address: string
  submitted_at: string
}

export interface Winner {
  id: number
  contest_id: number
  evm_address: string
  monad_amount: string
  won_at: string
}

export interface ContestTask {
  id: number
  contest_id: number
  task_type: string
  task_description: string
  task_url?: string
  is_required: boolean
  created_at: string
}

export interface UserTaskCompletion {
  id: number
  contest_id: number
  evm_address: string
  task_id: number
  completed_at: string
}

export async function getCurrentContest(): Promise<Contest | null> {
  try {
    const result = await sql`
      SELECT * FROM contests 
      WHERE status = 'active' 
      ORDER BY created_at DESC 
      LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error fetching current contest:", error)
    return null
  }
}

export async function getLastCompletedContest(): Promise<Contest | null> {
  try {
    const result = await sql`
      SELECT * FROM contests 
      WHERE status = 'completed' 
      ORDER BY created_at DESC 
      LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error fetching last completed contest:", error)
    return null
  }
}

export async function getContestSubmissions(contestId: number): Promise<Submission[]> {
  try {
    const result = await sql`
      SELECT * FROM submissions 
      WHERE contest_id = ${contestId}
      ORDER BY submitted_at ASC
    `
    return result as Submission[]
  } catch (error) {
    console.error("Error fetching contest submissions:", error)
    return []
  }
}

export async function getContestTasks(contestId: number): Promise<ContestTask[]> {
  try {
    const result = await sql`
      SELECT * FROM contest_tasks 
      WHERE contest_id = ${contestId}
      ORDER BY created_at ASC
    `
    return result as ContestTask[]
  } catch (error) {
    console.error("Error fetching contest tasks:", error)
    return []
  }
}

export async function getUserTaskCompletions(contestId: number, evmAddress: string): Promise<UserTaskCompletion[]> {
  try {
    const result = await sql`
      SELECT * FROM user_task_completions 
      WHERE contest_id = ${contestId} AND evm_address = ${evmAddress}
    `
    return result as UserTaskCompletion[]
  } catch (error) {
    console.error("Error fetching user task completions:", error)
    return []
  }
}

export async function markTaskCompleted(contestId: number, evmAddress: string, taskId: number) {
  try {
    await sql`
      INSERT INTO user_task_completions (contest_id, evm_address, task_id)
      VALUES (${contestId}, ${evmAddress}, ${taskId})
      ON CONFLICT (contest_id, evm_address, task_id) DO NOTHING
    `
    return { success: true }
  } catch (error) {
    console.error("Error marking task completed:", error)
    return { success: false, error: "Failed to mark task as completed" }
  }
}

export async function submitAddress(contestId: number, evmAddress: string) {
  try {
    // Check if contest allows submissions
    const contest = await sql`
      SELECT submissions_stopped, status FROM contests 
      WHERE id = ${contestId}
    `

    if (!contest[0] || contest[0].status !== "active") {
      return { success: false, error: "Contest is not active" }
    }

    if (contest[0].submissions_stopped) {
      return { success: false, error: "Submissions have been stopped by admin" }
    }

    // Check if all required tasks are completed
    const requiredTasks = await sql`
      SELECT id FROM contest_tasks 
      WHERE contest_id = ${contestId} AND is_required = true
    `

    const completedTasks = await sql`
      SELECT task_id FROM user_task_completions 
      WHERE contest_id = ${contestId} AND evm_address = ${evmAddress}
    `

    const completedTaskIds = completedTasks.map((ct) => ct.task_id)
    const uncompletedRequiredTasks = requiredTasks.filter((rt) => !completedTaskIds.includes(rt.id))

    if (uncompletedRequiredTasks.length > 0) {
      return { success: false, error: "Please complete all required tasks before submitting" }
    }

    await sql`
      INSERT INTO submissions (contest_id, evm_address)
      VALUES (${contestId}, ${evmAddress})
    `
    return { success: true }
  } catch (error: any) {
    console.error("Error submitting address:", error)
    if (error.message?.includes("duplicate") || error.code === "23505") {
      return { success: false, error: "Address already submitted" }
    }
    return { success: false, error: "Failed to submit address" }
  }
}

export async function createContest(
  monadAmount: number,
  contestType: "duration" | "participants",
  durationMinutes?: number,
  maxParticipants?: number,
  winnerCount = 1,
) {
  try {
    console.log("Database createContest called with:", {
      monadAmount,
      contestType,
      durationMinutes,
      maxParticipants,
      winnerCount,
    })

    // End current contest
    await sql`
      UPDATE contests 
      SET status = 'ended' 
      WHERE status = 'active'
    `

    let endTime = null
    let durationHours = null

    if (contestType === "duration" && durationMinutes) {
      // Validate duration
      if (durationMinutes <= 0) {
        throw new Error(`Invalid duration: ${durationMinutes} minutes`)
      }

      // Use UTC time consistently - get current UTC time from database
      const dbTimeResult = await sql`SELECT NOW() as current_time`
      const dbCurrentTime = new Date(dbTimeResult[0].current_time)

      // Add duration to database time (both in UTC)
      endTime = new Date(dbCurrentTime.getTime() + durationMinutes * 60 * 1000)
      durationHours = Math.ceil(durationMinutes / 60)

      console.log("Duration contest timing (UTC):", {
        dbCurrentTime: dbCurrentTime.toISOString(),
        endTime: endTime.toISOString(),
        durationMinutes,
        durationHours,
        timeDifferenceMs: endTime.getTime() - dbCurrentTime.getTime(),
        timeDifferenceMinutes: (endTime.getTime() - dbCurrentTime.getTime()) / (1000 * 60),
        localTime: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
        utcTime: new Date().toISOString(),
      })
    } else {
      // For participant-based contests, set a default duration_hours value
      durationHours = 24 // Default to 24 hours for participant-based contests
      console.log("Participant contest created with default 24h duration")
    }

    const result = await sql`
      INSERT INTO contests (
        monad_amount, 
        contest_type, 
        duration_minutes, 
        duration_hours,
        max_participants, 
        end_time,
        winner_count,
        status,
        manually_stopped,
        submissions_stopped
      )
      VALUES (
        ${monadAmount}, 
        ${contestType}, 
        ${durationMinutes || null}, 
        ${durationHours}, 
        ${maxParticipants || null}, 
        ${endTime ? endTime.toISOString() : null},
        ${winnerCount},
        'active',
        false,
        false
      )
      RETURNING *
    `

    const createdContest = result[0] as Contest

    // Create default follow task for the contest
    await sql`
      INSERT INTO contest_tasks (contest_id, task_type, task_description, task_url, is_required)
      VALUES (
        ${createdContest.id},
        'follow_twitter',
        'Follow @agungfathul on X (Twitter)',
        'https://x.com/agungfathul',
        true
      )
    `

    console.log("Contest successfully created in database:", {
      id: createdContest.id,
      status: createdContest.status,
      end_time: createdContest.end_time,
      duration_minutes: createdContest.duration_minutes,
      contest_type: createdContest.contest_type,
      start_time: createdContest.start_time,
      submissions_stopped: createdContest.submissions_stopped,
    })

    return createdContest
  } catch (error) {
    console.error("Error creating contest:", error)
    throw error
  }
}

export async function addContestTask(
  contestId: number,
  taskType: string,
  taskDescription: string,
  taskUrl?: string,
  isRequired = true,
) {
  try {
    const result = await sql`
      INSERT INTO contest_tasks (contest_id, task_type, task_description, task_url, is_required)
      VALUES (${contestId}, ${taskType}, ${taskDescription}, ${taskUrl || null}, ${isRequired})
      RETURNING *
    `
    return result[0] as ContestTask
  } catch (error) {
    console.error("Error adding contest task:", error)
    throw error
  }
}

export async function stopSubmissions(contestId: number) {
  try {
    await sql`
      UPDATE contests 
      SET submissions_stopped = TRUE
      WHERE id = ${contestId}
    `
    console.log("Submissions stopped for contest:", contestId)
    return { success: true }
  } catch (error) {
    console.error("Error stopping submissions:", error)
    throw error
  }
}

export async function stopContest(contestId: number) {
  try {
    await sql`
      UPDATE contests 
      SET manually_stopped = TRUE, status = 'ended'
      WHERE id = ${contestId}
    `

    return await selectWinners(contestId)
  } catch (error) {
    console.error("Error stopping contest:", error)
    throw error
  }
}

export async function selectWinners(contestId: number) {
  try {
    const submissions = await getContestSubmissions(contestId)
    if (submissions.length === 0) return []

    const contest = await sql`
      SELECT * FROM contests WHERE id = ${contestId}
    `

    const winnerCount = contest[0].winner_count || 1
    const actualWinnerCount = Math.min(winnerCount, submissions.length)

    // Shuffle submissions and select winners
    const shuffled = [...submissions].sort(() => Math.random() - 0.5)
    const selectedWinners = shuffled.slice(0, actualWinnerCount)

    // Insert winners into database
    for (const winner of selectedWinners) {
      await sql`
        INSERT INTO winners (contest_id, evm_address, monad_amount)
        VALUES (${contestId}, ${winner.evm_address}, ${contest[0].monad_amount})
      `
    }

    await sql`
      UPDATE contests 
      SET status = 'completed' 
      WHERE id = ${contestId}
    `

    return selectedWinners
  } catch (error) {
    console.error("Error selecting winners:", error)
    throw error
  }
}

export async function getAllWinners(): Promise<(Winner & { contest: Contest })[]> {
  try {
    const result = await sql`
      SELECT w.*, c.start_time, c.end_time, c.duration_minutes, c.contest_type, c.max_participants, c.winner_count
      FROM winners w
      JOIN contests c ON w.contest_id = c.id
      ORDER BY w.won_at DESC
    `
    return result as (Winner & { contest: Contest })[]
  } catch (error) {
    console.error("Error fetching all winners:", error)
    return []
  }
}

export async function getWinnersByContest(contestId: number): Promise<Winner[]> {
  try {
    const result = await sql`
      SELECT * FROM winners 
      WHERE contest_id = ${contestId}
      ORDER BY won_at DESC
    `
    return result as Winner[]
  } catch (error) {
    console.error("Error fetching winners by contest:", error)
    return []
  }
}

export async function checkAndProcessExpiredContests() {
  try {
    // Use database time for consistency - check duration-based contests that have naturally expired
    const expiredContests = await sql`
      SELECT * FROM contests 
      WHERE status = 'active' 
      AND contest_type = 'duration'
      AND end_time < NOW()
      AND manually_stopped = false
    `

    console.log("Found expired contests:", expiredContests.length)

    for (const contest of expiredContests) {
      console.log("Processing expired contest:", contest.id, "ended at:", contest.end_time)
      // Stop submissions for expired contests
      await sql`
        UPDATE contests 
        SET submissions_stopped = TRUE
        WHERE id = ${contest.id}
      `
    }

    // Check participant-based contests that have reached their limit
    const participantContests = await sql`
      SELECT c.*, COUNT(s.id) as participant_count
      FROM contests c
      LEFT JOIN submissions s ON c.id = s.contest_id
      WHERE c.status = 'active' 
      AND c.contest_type = 'participants'
      AND c.manually_stopped = false
      GROUP BY c.id
      HAVING COUNT(s.id) >= c.max_participants
    `

    console.log("Found full participant contests:", participantContests.length)

    for (const contest of participantContests) {
      console.log("Processing full participant contest:", contest.id)
      // Stop submissions for full participant contests
      await sql`
        UPDATE contests 
        SET submissions_stopped = TRUE
        WHERE id = ${contest.id}
      `
    }
  } catch (error) {
    console.error("Error processing expired contests:", error)
  }
}
