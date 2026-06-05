import { and, eq } from "drizzle-orm"
import { auth } from "@/auth"
import { db, applications, activityLog } from "@/lib/db"
import {
  STATUS_OPTIONS,
  STATUS_CONFIG,
  type ApplicationStatus,
} from "@/features/applications/types"
import {
  differenceInDays,
  format,
  startOfWeek,
  subWeeks,
} from "date-fns"
import { STATUS_COLORS } from "../types"

// Types

export type StatusCount = {
  status: ApplicationStatus
  label: string
  count: number
  color: string
}

export type StageTime = {
  status: ApplicationStatus
  label: string
  avgDays: number
  sampleSize: number
}

export type WeeklyCount = {
  week: string
  count: number
}

export type FunnelStage = {
  label: string
  count: number
  rate: number | null  // null for top of funnel
}

export type AnalyticsData = {
  totalApplications: number
  activeApplications: number
  responseRate: number      // % that reached interviewing
  offerRate: number         // % that reached offered
  byStatus: StatusCount[]
  avgTimePerStage: StageTime[]
  applicationsOverTime: WeeklyCount[]
  funnel: FunnelStage[]
  hasData: boolean
}



// Empty state 

const EMPTY: AnalyticsData = {
  totalApplications: 0,
  activeApplications: 0,
  responseRate: 0,
  offerRate: 0,
  byStatus: [],
  avgTimePerStage: [],
  applicationsOverTime: [],
  funnel: [],
  hasData: false,
}

//  Main export 

export async function getAnalytics(): Promise<AnalyticsData> {
  const session = await auth()
  if (!session?.user?.id) return EMPTY

  const userId = session.user.id

  // Two queries in parallel — applications + all status changes
  const [apps, statusChanges] = await Promise.all([
    db
      .select({
        id: applications.id,
        status: applications.status,
        createdAt: applications.createdAt,
      })
      .from(applications)
      .where(eq(applications.userId, userId)),

    db
      .select({
        applicationId: activityLog.applicationId,
        oldValue: activityLog.oldValue,
        newValue: activityLog.newValue,
        updatedAt: activityLog.updatedAt,
      })
      .from(activityLog)
      .innerJoin(
        applications,
        eq(activityLog.applicationId, applications.id)
      )
      .where(
        and(
          eq(applications.userId, userId),
          eq(activityLog.fieldChanged, "status")
        )
      )
      .orderBy(activityLog.updatedAt), // ascending — required for time calculation
  ])

  if (apps.length === 0) return EMPTY

  // 1. Status distribution 

  const countByStatus = new Map<ApplicationStatus, number>()
  for (const app of apps) {
    countByStatus.set(app.status, (countByStatus.get(app.status) ?? 0) + 1)
  }

  const byStatus: StatusCount[] = STATUS_OPTIONS
    .map((status) => ({
      status,
      label: STATUS_CONFIG[status].label,
      count: countByStatus.get(status) ?? 0,
      color: STATUS_COLORS[status],
    }))
    .filter((s) => s.count > 0)

  // ── 2. Historical status set (for response/offer rate) 
  // An application's history = its current status + every newValue in the log

  const historyByApp = new Map<string, Set<string>>()

  for (const app of apps) {
    historyByApp.set(app.id, new Set([app.status]))
  }
  for (const change of statusChanges) {
    const set = historyByApp.get(change.applicationId!)
    if (!set) continue
    if (change.oldValue) set.add(change.oldValue)
    if (change.newValue) set.add(change.newValue)
  }

  const APPLIED_STATUSES = new Set([
    "applied", "interviewing", "offered", "rejected", "withdrawn",
  ])
  const INTERVIEW_STATUSES = new Set(["interviewing", "offered"])
  const OFFER_STATUSES = new Set(["offered"])

  const everApplied = apps.filter((a) => {
    const h = historyByApp.get(a.id)!
    return [...APPLIED_STATUSES].some((s) => h.has(s))
  }).length

  const everInterviewed = apps.filter((a) => {
    const h = historyByApp.get(a.id)!
    return [...INTERVIEW_STATUSES].some((s) => h.has(s))
  }).length

  const everOffered = apps.filter((a) => {
    const h = historyByApp.get(a.id)!
    return [...OFFER_STATUSES].some((s) => h.has(s))
  }).length

  const responseRate = everApplied > 0
    ? Math.round((everInterviewed / everApplied) * 100)
    : 0

  const offerRate = everApplied > 0
    ? Math.round((everOffered / everApplied) * 100)
    : 0

  const activeApplications = apps.filter(
    (a) => a.status !== "rejected" && a.status !== "withdrawn"
  ).length

  // ── 3. Avg time per stage 
  // For each app, compute how long it spent in each status before moving on.
  // Entry point: application.createdAt → initial status.
  // Exit point: next status change timestamp.
  // The last/current status has no exit → excluded (still in progress).

  const changesByApp = new Map
    <string,
    Array<{ oldValue: string | null; newValue: string | null; updatedAt: Date }>
  >()

  for (const change of statusChanges) {
    if (!changesByApp.has(change.applicationId!)) {
      changesByApp.set(change.applicationId!, [])
    }
    changesByApp
      .get(change.applicationId!)!
      .push({ ...change, updatedAt: new Date(change.updatedAt) })
  }

  const stageTimings = new Map<ApplicationStatus, number[]>()

  for (const app of apps) {
    const changes = changesByApp.get(app.id)
    if (!changes || changes.length === 0) continue

    // Time in the initial status (createdAt → first change)
    const initialStatus = changes[0].oldValue as ApplicationStatus | null
    if (initialStatus && STATUS_OPTIONS.includes(initialStatus)) {
      const days = differenceInDays(
        changes[0].updatedAt,
        new Date(app.createdAt)
      )
      if (days > 0) {
        if (!stageTimings.has(initialStatus)) stageTimings.set(initialStatus, [])
        stageTimings.get(initialStatus)!.push(days)
      }
    }

    // Time in each subsequent status (change[i].newValue until change[i+1])
    for (let i = 0; i < changes.length - 1; i++) {
      const status = changes[i].newValue as ApplicationStatus | null
      if (!status || !STATUS_OPTIONS.includes(status)) continue

      const days = differenceInDays(
        changes[i + 1].updatedAt,
        changes[i].updatedAt
      )
      if (days > 0) {
        if (!stageTimings.has(status)) stageTimings.set(status, [])
        stageTimings.get(status)!.push(days)
      }
    }
  }

  const avgTimePerStage: StageTime[] = STATUS_OPTIONS
    .map((status) => {
      const timings = stageTimings.get(status) ?? []
      if (timings.length < 2) return null // need at least 2 data points

      const avg = timings.reduce((a, b) => a + b, 0) / timings.length
      return {
        status,
        label: STATUS_CONFIG[status].label,
        avgDays: Math.round(avg * 10) / 10,
        sampleSize: timings.length,
      }
    })
    .filter((s): s is StageTime => s !== null)

  // 4. Applications over time (last 12 weeks)

  const now = new Date()
  const buckets: { label: string; start: Date; end: Date; count: number }[] =
    Array.from({ length: 12 }, (_, i) => {
      const start = startOfWeek(subWeeks(now, 11 - i))
      const end = startOfWeek(subWeeks(now, 10 - i))
      return { label: format(start, "MMM d"), start, end, count: 0 }
    })

  for (const app of apps) {
    const created = new Date(app.createdAt)
    const bucket = buckets.find(
      (b) => created >= b.start && created < b.end
    )
    if (bucket) bucket.count++
  }

  const applicationsOverTime: WeeklyCount[] = buckets.map(
    ({ label, count }) => ({ week: label, count })
  )

  // ── 5. Conversion funnel 
  // Pipeline stages in order — each stage count = apps that EVER reached it

  const FUNNEL_STAGES: Array<{
    label: string
    statuses: string[]
  }> = [
    { label: "Bookmarked", statuses: ["bookmarked", "applying", "applied", "interviewing", "offered", "rejected", "withdrawn"] },
    { label: "Applied",    statuses: ["applied", "interviewing", "offered", "rejected", "withdrawn"] },
    { label: "Responded",  statuses: ["interviewing", "offered"] },
    { label: "Offered",    statuses: ["offered"] },
  ]

  const funnelCounts = FUNNEL_STAGES.map(({ label, statuses }) => ({
    label,
    count: apps.filter((a) => {
      const h = historyByApp.get(a.id)!
      return statuses.some((s) => h.has(s))
    }).length,
  }))

  const funnel: FunnelStage[] = funnelCounts.map((stage, i) => ({
    label: stage.label,
    count: stage.count,
    rate:
      i === 0
        ? null
        : funnelCounts[i - 1].count > 0
        ? Math.round((stage.count / funnelCounts[i - 1].count) * 100)
        : 0,
  }))

  return {
    totalApplications: apps.length,
    activeApplications,
    responseRate,
    offerRate,
    byStatus,
    avgTimePerStage,
    applicationsOverTime,
    funnel,
    hasData: true,
  }
}