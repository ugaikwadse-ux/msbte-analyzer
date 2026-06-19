"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BarChart3, Plus, Clock, Users, TrendingUp, Trash2, ArrowRight,
  Search, ChevronDown, Building2, BookOpen, Crown,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAnalyses, getDepartments, deleteAnalysis, getUserProfile } from "@/lib/db";
import { fetchResultsBatch } from "@/lib/api";
import { saveAnalysis, updateAnalysis } from "@/lib/db";
import { calculateStats, getSubjectFailures, generateSeatRange, formatDate, isPassed } from "@/lib/utils";
import type { Analysis, Department } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, Label, Card, CardContent, Badge, Skeleton, Progress, Alert } from "@/components/ui/elements";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toaster";

export default function AnalysesPage() {
  const { user, subscriptionPlan, isPremium } = useAuth();
  const searchParams = useSearchParams();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Analysis | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Generate form state
  const [selectedDept, setSelectedDept] = useState(searchParams.get("dept") || "");
  const [selectedSem, setSelectedSem] = useState(searchParams.get("sem") || "");
  const [startSeat, setStartSeat] = useState("");
  const [endSeat, setEndSeat] = useState("");
  const [progress, setProgress] = useState({ current: 0, total: 0, status: "idle" as string });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([getAnalyses(user.uid), getDepartments(user.uid)])
      .then(([a, d]) => {
        // Dynamically fix old stats
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

  useEffect(() => {
    if (searchParams.get("dept") || searchParams.get("sem")) {
      setGenerateOpen(true);
    }
  }, [searchParams]);

  const handleGenerate = useCallback(async () => {
    if (!user || !selectedDept || !selectedSem || !startSeat || !endSeat) return;
    const dept = departments.find((d) => d.id === selectedDept);
    if (!dept) return;

    const seats = generateSeatRange(startSeat.trim(), endSeat.trim());
    if (seats.length === 0 || seats.length > 500) {
      toast({ title: "Invalid seat range", description: "Max 500 seats per analysis.", variant: "error" });
      return;
    }

    // Fresh check to prevent bypass on long-running sessions
    const profile = await getUserProfile(user.uid);
    const plan = profile?.subscription || "free";
    const isPremium = plan === "premium" || plan === "institute" || user.email === "master@msbteresult.online";

    if (!isPremium && seats.length > 20) {
      toast({
        title: "Upgrade Required",
        description: `Your Free plan allows up to 20 seats per batch. This range has ${seats.length} seats. Please upgrade to the Institute plan for unlimited seats.`,
        variant: "error",
      });
      return;
    }

    setGenerating(true);
    setProgress({ current: 0, total: seats.length, status: "processing" });

    const studentResults: Analysis["students"] = [];

    try {
      // Create placeholder
      const analysisId = await saveAnalysis({
        userId: user.uid,
        departmentId: dept.id,
        departmentName: dept.name,
        semesterNumber: parseInt(selectedSem),
        startSeat,
        endSeat,
        totalStudents: 0,
        processedStudents: 0,
        passCount: 0,
        failCount: 0,
        atktCount: 0,
        passPercentage: 0,
        distinctionCount: 0,
        firstClassCount: 0,
        students: [],
        toppers: [],
        subjectFailures: [],
        status: "processing",
        createdAt: new Date(),
      });

      const { results, failed, abortedReason } = await fetchResultsBatch(
        seats,
        (current, seat, result) => {
          setProgress((p) => ({ ...p, current }));
        }
      );

      if (abortedReason) {
        await updateAnalysis(analysisId, { status: "failed" });
        toast({
          title: "Generation aborted",
          description: abortedReason,
          variant: "error",
        });
        setProgress((p) => ({ ...p, status: "error" }));
        setGenerating(false);
        return;
      }

      // Compute stats
      const stats = calculateStats(results);
      const subjectFailures = getSubjectFailures(results);
      const toppers = [...results]
        .filter((s) => isPassed(s.finalStatus))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 10);

      await updateAnalysis(analysisId, {
        students: results,
        totalStudents: results.length,
        processedStudents: results.length,
        passCount: stats.passCount,
        failCount: stats.failCount,
        atktCount: stats.atktCount,
        passPercentage: stats.passPercentage,
        distinctionCount: stats.distinctionCount,
        firstClassCount: stats.firstClassCount,
        toppers,
        subjectFailures,
        status: "completed",
      });

      const newAnalysis: Analysis = {
        id: analysisId,
        userId: user.uid,
        departmentId: dept.id,
        departmentName: dept.name,
        semesterNumber: parseInt(selectedSem),
        startSeat,
        endSeat,
        ...stats,
        totalStudents: results.length,
        processedStudents: results.length,
        students: results,
        toppers,
        subjectFailures,
        status: "completed",
        createdAt: new Date(),
      };

      setAnalyses((prev) => [newAnalysis, ...prev]);
      setProgress({ current: seats.length, total: seats.length, status: "completed" });
      toast({ title: `Analysis complete — ${results.length} students processed`, variant: "success" });
      setTimeout(() => {
        setGenerateOpen(false);
        setGenerating(false);
        setProgress({ current: 0, total: 0, status: "idle" });
      }, 1500);
    } catch (err: any) {
      setProgress((p) => ({ ...p, status: "error" }));
      toast({
        title: "Analysis failed",
        description: err?.message || "An unknown error occurred",
        variant: "error",
      });
      setGenerating(false);
    }
  }, [user, selectedDept, selectedSem, startSeat, endSeat, departments]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAnalysis(deleteTarget.id);
      setAnalyses((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast({ title: "Analysis deleted", variant: "success" });
    } catch {
      toast({ title: "Failed to delete", variant: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const filtered = analyses.filter(
    (a) =>
      a.departmentName.toLowerCase().includes(search.toLowerCase()) ||
      `sem ${a.semesterNumber}`.includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analyses</h1>
          <p className="text-muted-foreground mt-1">
            All your batch result analyses in one place.
          </p>
        </div>
        <Button onClick={() => setGenerateOpen(true)} className="gap-2 flex-shrink-0">
          <Plus className="h-4 w-4" />
          Generate Analysis
        </Button>
      </div>

      {/* Special Launch Offer Promo Banner */}
      {!isPremium && (
        <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-background shadow-md">
          {/* Decorative glowing background elements */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30 shadow-inner animate-pulse">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-primary uppercase tracking-wider">Special Launch Offer</span>
                  <Badge variant="destructive" className="text-[10px] px-2 py-0.5 animate-bounce">Expiring Soon</Badge>
                </div>
                <h3 className="text-lg font-bold text-foreground flex flex-wrap items-baseline gap-2">
                  Upgrade to Institute Plan for just <span className="text-primary font-extrabold text-xl">₹199</span>/month
                  <span className="text-sm text-muted-foreground line-through font-normal">₹2999/month</span>
                </h3>
                <p className="text-sm text-muted-foreground max-w-2xl">
                  Unlock unlimited batch analyses, unlimited departments, PDF/CSV downloads without watermark, custom branding, topper lists, and complete analytics for the whole university!
                </p>
              </div>
            </div>
            <Link href="/dashboard/subscription" className="w-full md:w-auto flex-shrink-0">
              <Button size="lg" className="w-full md:w-auto gap-2 bg-gradient-to-r from-primary to-primary/95 hover:from-primary/95 hover:to-primary shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:-translate-y-0.5">
                Upgrade Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      {analyses.length > 0 && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search analyses..."
            className="pl-9"
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {analyses.length === 0 ? "No analyses yet" : "No results found"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              {analyses.length === 0
                ? "Generate your first batch analysis by selecting a department and entering a seat range."
                : "Try different search terms."}
            </p>
            {analyses.length === 0 && (
              <Button onClick={() => setGenerateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Generate First Analysis
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((analysis) => (
            <Card key={analysis.id} className="card-hover group">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{analysis.departmentName}</h3>
                      <Badge variant="outline">Semester {analysis.semesterNumber}</Badge>
                      <Badge variant={analysis.status === "completed" ? "success" : "warning"}>
                        {analysis.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {analysis.totalStudents} students
                      </span>
                      {analysis.passPercentage > 0 && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> {analysis.passPercentage.toFixed(1)}% pass
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> Seats: {analysis.startSeat}–{analysis.endSeat}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatDate(analysis.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setDeleteTarget(analysis)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link href={`/dashboard/analyses/${analysis.id}`}>
                      <Button size="sm" variant="outline" className="gap-1.5">
                        View <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Generate dialog */}
      <Dialog open={generateOpen} onOpenChange={(open) => { if (!generating) setGenerateOpen(open); }}>
        <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Generate Batch Analysis</DialogTitle>
            <DialogDescription>
              Select a department, semester, and seat range to begin.
            </DialogDescription>
          </DialogHeader>

          {progress.status === "processing" || progress.status === "completed" ? (
            <div className="py-4 space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-1">
                  {progress.current}
                  <span className="text-xl text-muted-foreground"> / {progress.total}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {progress.status === "completed" ? "Analysis complete!" : "Processing students..."}
                </p>
              </div>
              <Progress value={(progress.current / progress.total) * 100} />
              {progress.status === "completed" && (
                <Alert variant="success" className="text-center">
                  ✓ Analysis saved successfully
                </Alert>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {departments.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No departments yet.{" "}
                    <Link href="/dashboard/departments" className="text-primary hover:underline">
                      Create one first.
                    </Link>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Semester</Label>
                <Select value={selectedSem} onValueChange={setSelectedSem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <SelectItem key={n} value={String(n)}>Semester {n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Start Seat No.</Label>
                  <Input
                    value={startSeat}
                    onChange={(e) => setStartSeat(e.target.value)}
                    placeholder="e.g. 2210124001"
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>End Seat No.</Label>
                  <Input
                    value={endSeat}
                    onChange={(e) => setEndSeat(e.target.value)}
                    placeholder="e.g. 2210124120"
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              {startSeat && endSeat && (() => {
                const count = generateSeatRange(startSeat, endSeat).length;
                const isPremium = subscriptionPlan === "premium" || subscriptionPlan === "institute";
                const exceeds = !isPremium && count > 20;
                return (
                  <div className={`text-xs rounded-lg p-2 ${exceeds ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-muted text-muted-foreground"}`}>
                    <p className="font-medium">Estimated: {count} seats to process</p>
                    {exceeds && (
                      <p className="mt-1 font-semibold text-destructive">⚠️ Free plan is limited to 20 seats. Please upgrade to the Institute plan.</p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {progress.status !== "processing" && progress.status !== "completed" && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setGenerateOpen(false)}>Cancel</Button>
              <Button
                onClick={handleGenerate}
                disabled={!selectedDept || !selectedSem || !startSeat || !endSeat}
                loading={generating}
              >
                Generate Analysis
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Analysis</DialogTitle>
            <DialogDescription>
              This will permanently delete the analysis for <strong>{deleteTarget?.departmentName}</strong> Sem {deleteTarget?.semesterNumber}. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} loading={deleting}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
