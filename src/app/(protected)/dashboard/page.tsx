import { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Calendar, Activity, Bell } from "lucide-react";
import { verifySessionToken } from "@/lib/session";
import { adminAuth } from "@/lib/firebase-admin";
import { SESSION_COOKIE_NAME, ROUTES } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard | Fortify.me",
};

export default async function Dashboard() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  let userEmail = "";
  if (sessionToken) {
    const payload = await verifySessionToken(sessionToken);
    if (payload) {
      try {
        const userRecord = await adminAuth.getUser(payload.uid as string);
        userEmail = userRecord.email || "";
      } catch (e) {
        console.error("Error fetching user", e);
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userEmail.split("@")[0]}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s an overview of your supplement routine
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Calendar className="h-4 w-4 text-blue-600 mr-2" />
            <CardTitle className="text-lg font-semibold">Today&apos;s Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 pt-4">
              <p className="text-muted-foreground">No supplements scheduled for today</p>
              <Button variant="link" className="p-0 h-auto text-blue-600" asChild>
                <Link href={ROUTES.supplements}>Add supplements →</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
           <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Activity className="h-4 w-4 text-purple-600 mr-2" />
            <CardTitle className="text-lg font-semibold">Progress Tracking</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-3 pt-4">
              <p className="text-muted-foreground">Start tracking your supplements</p>
               <Button variant="link" className="p-0 h-auto text-purple-600">
                View progress →
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
           <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Bell className="h-4 w-4 text-green-600 mr-2" />
            <CardTitle className="text-lg font-semibold">Reminders</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-3 pt-4">
              <p className="text-muted-foreground">No active reminders</p>
               <Button variant="link" className="p-0 h-auto text-green-600">
                Set reminders →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="text-muted-foreground">
            <p>No recent activity to show</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
