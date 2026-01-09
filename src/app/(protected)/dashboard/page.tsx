import { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { 
  Calendar, 
  Activity, 
  Bell, 
  Pill, 
  BookOpen, 
  TrendingUp,
  Sparkles,
  ArrowRight,
  Plus,
  Zap
} from "lucide-react";
import { verifySessionToken } from "@/lib/session";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { SESSION_COOKIE_NAME, ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { TodaySchedule, type GroupedDoseEntries, type ScheduleTime } from "@/components/dashboard/today-schedule";
import { getDoseLogTakenEntryIds } from "./actions";

export const metadata: Metadata = {
  title: "Dashboard | Fortify.me",
};

type ScheduledSupplement = {
  supplementId: string;
  entryId: string;
  time: ScheduleTime;
  name: string;
  dosage?: string;
  frequency?: string;
};

async function getSupplementCount(userId: string): Promise<number> {
  try {
    const snapshot = await adminDb
      .collection("supplements")
      .where("userId", "==", userId)
      .count()
      .get();
    return snapshot.data().count;
  } catch {
    return 0;
  }
}

function getUtcDateId(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

async function getTodaysSchedule(userId: string): Promise<GroupedDoseEntries> {
  const grouped: GroupedDoseEntries = {
    morning: [],
    midday: [],
    evening: [],
    bedtime: [],
    anytime: [],
  };

  try {
    const snapshot = await adminDb
      .collection("supplements")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const supplements = snapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        id: doc.id,
        name: typeof data.name === "string" ? data.name : "Untitled",
        dosage: typeof data.dosage === "string" ? data.dosage : undefined,
        frequency: typeof data.frequency === "string" ? data.frequency : undefined,
        scheduleTimes: Array.isArray(data.scheduleTimes)
          ? (data.scheduleTimes.filter((t) => typeof t === "string") as string[])
          : undefined,
      };
    });

    for (const supplement of supplements) {
      const times = supplement.scheduleTimes?.length
        ? supplement.scheduleTimes
        : ["anytime"];

      for (const time of times) {
        const normalized: ScheduleTime =
          time === "morning" ||
          time === "midday" ||
          time === "evening" ||
          time === "bedtime"
            ? time
            : "anytime";

        const entryId = `${supplement.id}:${normalized}`;

        grouped[normalized].push({
          supplementId: supplement.id,
          entryId,
          time: normalized,
          name: supplement.name,
          dosage: supplement.dosage,
          frequency: supplement.frequency,
        });
      }
    }

    return grouped;
  } catch {
    return grouped;
  }
}

async function getSearchCount(userId: string): Promise<number> {
  try {
    const snapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("searches")
      .count()
      .get();
    return snapshot.data().count;
  } catch {
    return 0;
  }
}

export default async function Dashboard() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const dateId = getUtcDateId();
  const last7DateIds = Array.from({ length: 7 }).map((_, i) =>
    getUtcDateId(new Date(Date.now() - i * 24 * 60 * 60 * 1000))
  );
  
  let userName = "User";
  let userEmail = "";
  let supplementCount = 0;
  let searchCount = 0;
  let todaysSchedule: GroupedDoseEntries = {
    morning: [],
    midday: [],
    evening: [],
    bedtime: [],
    anytime: [],
  };
  let takenEntryIds: string[] = [];
  let daysActiveLast7 = 0;
  
  if (sessionToken) {
    const payload = await verifySessionToken(sessionToken);
    if (payload) {
      try {
        const userRecord = await adminAuth.getUser(payload.uid as string);
        userEmail = userRecord.email || "";
        userName = userRecord.displayName || userEmail.split("@")[0];
        
        // Get counts
        supplementCount = await getSupplementCount(payload.uid as string);
        searchCount = await getSearchCount(payload.uid as string);
        todaysSchedule = await getTodaysSchedule(payload.uid as string);
        takenEntryIds = await getDoseLogTakenEntryIds(dateId);

        // Days active (last 7 days) = any dose marked taken that day
        const logs = await Promise.all(
          last7DateIds.map((d) => getDoseLogTakenEntryIds(d).catch(() => []))
        );
        daysActiveLast7 = logs.filter((ids) => ids.length > 0).length;
      } catch (e) {
        console.error("Error fetching user", e);
      }
    }
  }

  const quickActions = [
    {
      title: "Add Supplement",
      description: "Track a new supplement",
      href: ROUTES.supplements,
      icon: Plus,
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Research",
      description: "AI-powered insights",
      href: ROUTES.research,
      icon: BookOpen,
      color: "from-violet-500 to-purple-500",
    },
  ];

  const stats = [
    {
      title: "Supplements",
      value: supplementCount,
      icon: Pill,
      color: "text-emerald-400",
      bgColor: "from-emerald-500/20 to-teal-500/20",
    },
    {
      title: "Research Queries",
      value: searchCount,
      icon: BookOpen,
      color: "text-violet-400",
      bgColor: "from-violet-500/20 to-purple-500/20",
    },
    {
      title: "Days Active",
      value: daysActiveLast7,
      icon: Activity,
      color: "text-amber-400",
      bgColor: "from-amber-500/20 to-orange-500/20",
    },
    {
      title: "Health Score",
      value: "—",
      icon: TrendingUp,
      color: "text-sky-400",
      bgColor: "from-sky-500/20 to-cyan-500/20",
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 page-transition">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb floating-orb-1" />
        <div className="floating-orb floating-orb-2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {userName}!
          </h1>
          <p className="text-slate-400">
            Here&apos;s an overview of your supplement journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="glass-card p-6 stagger-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl bg-linear-to-br ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.title}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Schedule */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-linear-to-br from-emerald-500/20 to-teal-500/20">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Today&apos;s Schedule</h2>
                  <p className="text-sm text-slate-400">Your supplement routine for today</p>
                </div>
              </div>

              {supplementCount === 0 ? (
                <div className="text-center py-8 rounded-xl bg-slate-800/30 border border-slate-700/50">
                  <Pill className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 mb-4">No supplements scheduled for today</p>
                  <Link href={ROUTES.supplements}>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Your First Supplement
                    </Button>
                  </Link>
                </div>
              ) : (
                <TodaySchedule
                  dateId={dateId}
                  groups={todaysSchedule}
                  initialTakenEntryIds={takenEntryIds}
                />
              )}
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-linear-to-br from-violet-500/20 to-purple-500/20">
                  <Activity className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                  <p className="text-sm text-slate-400">Your latest actions</p>
                </div>
              </div>

              {searchCount === 0 && supplementCount === 0 ? (
                <div className="text-center py-8 rounded-xl bg-slate-800/30 border border-slate-700/50">
                  <Zap className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 mb-2">No recent activity</p>
                  <p className="text-sm text-slate-500">Start by adding supplements or researching</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchCount > 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                      <div className="p-2 rounded-lg bg-violet-500/20">
                        <BookOpen className="h-4 w-4 text-violet-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Research activity</p>
                        <p className="text-sm text-slate-400">{searchCount} research queries</p>
                      </div>
                      <Link href={ROUTES.research}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          View <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  )}
                  {supplementCount > 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <Pill className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Supplements tracked</p>
                        <p className="text-sm text-slate-400">{supplementCount} supplements</p>
                      </div>
                      <Link href={ROUTES.supplements}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          View <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link key={index} href={action.href}>
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 
                        border border-slate-700/50 hover:border-slate-600/50 
                        hover:bg-slate-800/50 transition-all cursor-pointer group">
                        <div className={`p-2.5 rounded-xl bg-linear-to-br ${action.color} 
                          group-hover:scale-110 transition-transform`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{action.title}</p>
                          <p className="text-sm text-slate-400">{action.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-white 
                          group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Reminders */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-linear-to-br from-amber-500/20 to-orange-500/20">
                  <Bell className="h-5 w-5 text-amber-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Reminders</h2>
              </div>

              <div className="text-center py-6 rounded-xl bg-slate-800/30 border border-slate-700/50">
                <Bell className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400 mb-3">No active reminders</p>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Set Reminder
                </Button>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="glass-card p-6 bg-linear-to-br from-emerald-500/5 to-teal-500/5 
              border-emerald-500/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 shrink-0">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Pro Tip</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Use the AI Research feature to check for potential interactions 
                    between your supplements.
                  </p>
                  <Link href={ROUTES.research}>
                    <Button variant="link" size="sm" className="px-0 mt-2 gap-1">
                      Try it now <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
