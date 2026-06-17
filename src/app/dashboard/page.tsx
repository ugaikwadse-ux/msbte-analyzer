"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Building2, Plus, ArrowRight, Clock, Users, TrendingUp, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAnalyses, getDepartments } from "@/lib/db";
import type { Analysis, Department } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Badge, Skeleton } from "@/components/ui/elements";
import { formatDate, calculateStats } from "@/lib/utils";

export default function DashboardPage() {
  const { user, subscriptionPlan } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([getAnalyses(user.uid), getDepartments(user.uid)])
      .then(([a, d]) => {
        const fixedAnalyses = a.map((analysis) => {
          if (analysis.students && analysis.students.length > 0) {
            const freshStats = calculateStats(analysis.students);
            return { ...analysis, ...freshStats };
          }
          return analysis;
        });
        setAnalyses(fixedAnalyses);
        setDepartments(d);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const recentAnalyses = analyses.slice(0, 5);
  const totalStudents = analyses.reduce((acc, a) => acc + (a.totalStudents || 0), 0);
  const avgPass =
    analyses.length > 0
      ? analyses.reduce((acc, a) => acc + (a.passPercentage || 0), 0) / analyses.length
      : 0;

  const planBadge = {
    free: { label: "Free Plan", variant: "secondary" as const },
    premium: { label: "Premium", variant: "default" as const },
    institute: { label: "Institute", variant: "success" as const },
  }[subscriptionPlan];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Good {getGreeting()}, {user?.displayName?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s an overview of your result analyses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={planBadge.variant}>{planBadge.label}</Badge>
          <Link href="/dashboard/departments">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Analysis
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))
        ) : (
          <>
            <StatCard
              icon={FileText}
              label="Total Analyses"
              value={analyses.length}
              color="text-blue-600"
              bg="bg-blue-50 dark:bg-blue-950/40"
            />
            <StatCard
              icon={Users}
              label="Students Processed"
              value={totalStudents.toLocaleString()}
              color="text-green-600"
              bg="bg-green-50 dark:bg-green-950/40"
            />
            <StatCard
              icon={Building2}
              label="Departments"
              value={departments.length}
              color="text-purple-600"
              bg="bg-purple-50 dark:bg-purple-950/40"
            />
            <StatCard
              icon={TrendingUp}
              label="Avg Pass %"
              value={`${avgPass.toFixed(1)}%`}
              color="text-orange-600"
              bg="bg-orange-50 dark:bg-orange-950/40"
            />
          </>
        )}
      </div>

      {/* Quick actions */}
      {departments.length === 0 && !loading && (
        <Card className="border-dashed border-2">
          <CardContent className="p-10 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Set up your first department</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              Create a department to start running batch result analyses. Each department includes all 6 semesters automatically.
            </p>
            <Link href="/dashboard/departments">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Department
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Recent analyses */}
      {(loading || recentAnalyses.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Recent Analyses
              </CardTitle>
              <Link href="/dashboard/analyses">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentAnalyses.map((analysis) => (
                  <Link
                    key={analysis.id}
                    href={`/dashboard/analyses/${analysis.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {analysis.departmentName}
                        </p>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          Sem {analysis.semesterNumber}
                        </Badge>
                        <Badge
                          variant={analysis.status === "completed" ? "success" : analysis.status === "processing" ? "warning" : "destructive"}
                          className="text-xs flex-shrink-0"
                        >
                          {analysis.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {analysis.totalStudents} students
                        </span>
                        {analysis.passPercentage > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {analysis.passPercentage.toFixed(1)}% pass
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(analysis.createdAt)}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  bg: string;
}) {
  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl mb-3 ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
      </CardContent>
    </Card>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
