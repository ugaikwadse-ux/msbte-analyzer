"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Download, FileText, Users, TrendingUp, Trophy,
  AlertTriangle, Search, ChevronUp, ChevronDown, FileSpreadsheet,
  BarChart2, Lock, ChevronLeft, ChevronRight, Plus,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { getAnalysis, updateAnalysis, getUserProfile } from "@/lib/db";
import { exportToExcel } from "@/lib/exports";
import { isPassed, isFailed, isATKT, calculateStats, getSubjectToppers, getSubjectFailures, generateSeatRange } from "@/lib/utils";
import { fetchResultsBatch } from "@/lib/api";
import type { Analysis, StudentResult } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, Card, CardContent, CardHeader, CardTitle, Badge, Skeleton, Label, Progress, Alert } from "@/components/ui/elements";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toaster";
import Link from "next/link";

const COLORS = ["#2563EB", "#10B981", "#06B6D4", "#F59E0B", "#EF4444", "#8B5CF6"];
const ROWS_PER_PAGE = 25;

type SortDir = "asc" | "desc";

export default function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isPremium } = useAuth();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof StudentResult>("seatNo");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [activeTab, setActiveTab] = useState<"table" | "stats" | "charts">("table");

  // State for adding remaining/left-out students
  const [addStudentsOpen, setAddStudentsOpen] = useState(false);
  const [newSeatsInput, setNewSeatsInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [addProgress, setAddProgress] = useState({ current: 0, total: 0, status: "idle" });

  const handleAddStudents = async () => {
    if (!analysis || !user) return;

    const seats = newSeatsInput
      .split(/[\s,;\n\t]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (seats.length === 0) {
      toast({ title: "No seat numbers entered", description: "Please enter at least one seat number.", variant: "error" });
      return;
    }

    const existingSeats = new Set(analysis.students.map((s) => s.seatNo));
    const newSeats = seats.filter((s) => !existingSeats.has(s));

    if (newSeats.length === 0) {
      toast({ title: "No new seat numbers", description: "All entered seat numbers already exist in this analysis.", variant: "warning" });
      return;
    }

    // Fresh check to prevent bypass on long-running sessions
    const profile = await getUserProfile(user.uid);
    const plan = profile?.subscription || "free";
    const isPremiumUser = plan === "premium" || plan === "institute" || user.email === "master@msbteresult.online";

    const totalExpectedCount = analysis.students.length + newSeats.length;
    if (!isPremiumUser && totalExpectedCount > 20) {
      toast({
        title: "Upgrade Required",
        description: `Your Free plan allows up to 20 seats per batch. This action would increase the batch size to ${totalExpectedCount} seats. Please upgrade to the Institute plan.`,
        variant: "error",
      });
      return;
    }

    if (totalExpectedCount > 500) {
      toast({
        title: "Limit Exceeded",
        description: `Max 500 seats per analysis. This action would exceed that limit (current: ${analysis.students.length}, new: ${newSeats.length}).`,
        variant: "error",
      });
      return;
    }

    setAdding(true);
    setAddProgress({ current: 0, total: newSeats.length, status: "processing" });

    try {
      const { results, failed } = await fetchResultsBatch(
        newSeats,
        (current, seat, result) => {
          setAddProgress((p) => ({ ...p, current }));
        }
      );

      if (results.length === 0) {
        toast({
          title: "No students fetched",
          description: `Failed to fetch results for all ${newSeats.length} seat numbers. Please check if they are valid.`,
          variant: "error",
        });
        setAdding(false);
        setAddProgress({ current: 0, total: 0, status: "idle" });
        return;
      }

      const updatedStudents = [...analysis.students, ...results];
      const stats = calculateStats(updatedStudents);
      const subjectFailures = getSubjectFailures(updatedStudents);
      const toppers = [...updatedStudents]
        .filter((s) => isPassed(s.finalStatus))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 10);

      const updatedData = {
        students: updatedStudents,
        totalStudents: updatedStudents.length,
        processedStudents: updatedStudents.length,
        passCount: stats.passCount,
        failCount: stats.failCount,
        atktCount: stats.atktCount,
        passPercentage: stats.passPercentage,
        distinctionCount: stats.distinctionCount,
        firstClassCount: stats.firstClassCount,
        toppers,
        subjectFailures,
      };

      await updateAnalysis(analysis.id, updatedData);

      setAnalysis({
        ...analysis,
        ...stats,
        students: updatedStudents,
        toppers,
        subjectFailures,
      });

      setAddProgress({ current: newSeats.length, total: newSeats.length, status: "completed" });

      let message = `${results.length} students added successfully.`;
      if (failed.length > 0) {
        message += ` Failed to fetch ${failed.length} seat(s): ${failed.join(", ")}`;
      }

      toast({
        title: "Analysis updated",
        description: message,
        variant: failed.length > 0 ? "warning" : "success",
      });

      setTimeout(() => {
        setAddStudentsOpen(false);
        setAdding(false);
        setNewSeatsInput("");
        setAddProgress({ current: 0, total: 0, status: "idle" });
      }, 2000);

    } catch (err) {
      console.error(err);
      setAddProgress((p) => ({ ...p, status: "error" }));
      toast({ title: "Failed to add students", variant: "error" });
      setAdding(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    getAnalysis(id).then((a) => {
      if (a && a.students) {
        const freshStats = calculateStats(a.students);
        setAnalysis({ ...a, ...freshStats });
      } else {
        setAnalysis(a);
      }
      setLoading(false);
    });
  }, [id]);

  const allSubjects = useMemo(() => {
    if (!analysis?.students) return [];
    const seen = new Set<string>();
    const subjects: string[] = [];
    analysis.students.forEach((s) =>
      s.subjects.forEach((subj) => {
        if (!seen.has(subj.subjectName)) {
          seen.add(subj.subjectName);
          subjects.push(subj.subjectName);
        }
      })
    );
    return subjects;
  }, [analysis]);

  const missingSeats = useMemo(() => {
    if (!analysis) return [];
    try {
      const allSeats = generateSeatRange(analysis.startSeat, analysis.endSeat);
      const existingSeats = new Set(analysis.students.map((s) => s.seatNo));
      return allSeats.filter((seat) => !existingSeats.has(seat));
    } catch (e) {
      console.error("Error generating seat range", e);
      return [];
    }
  }, [analysis]);

  const filteredStudents = useMemo(() => {
    if (!analysis?.students) return [];
    let result = analysis.students.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.seatNo.includes(search)
    );
    result = [...result].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [analysis, search, sortKey, sortDir]);

  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filteredStudents.slice(start, start + ROWS_PER_PAGE);
  }, [filteredStudents, page]);

  const totalPages = Math.ceil(filteredStudents.length / ROWS_PER_PAGE);

  const handleSort = (key: keyof StudentResult) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleExportExcel = async () => {
    if (!analysis) return;
    await exportToExcel(analysis, { format: "csv", includeWatermark: !isPremium });
    toast({ title: "Excel file exported", variant: "success" });
  };

  const subjectToppers = useMemo(() => {
    if (!analysis?.students) return [];
    return getSubjectToppers(analysis.students);
  }, [analysis]);

  const pieData = analysis
    ? [
        { name: "Pass", value: analysis.passCount },
        { name: "A.T.K.T", value: analysis.atktCount ?? 0 },
        { name: "Fail", value: analysis.failCount },
      ]
    : [];

  const classData = analysis
    ? [
        { name: "Distinction\n(≥75%)", value: analysis.distinctionCount },
        { name: "First Class\n(60–74%)", value: analysis.firstClassCount },
        { name: "Second Class\n(45–59%)", value: analysis.passCount - analysis.distinctionCount - analysis.firstClassCount },
        { name: "A.T.K.T", value: analysis.atktCount ?? 0 },
        { name: "Fail", value: analysis.failCount },
      ]
    : [];

  const subjectChart = (analysis?.subjectFailures || []).slice(0, 10).map((s) => ({
    name: s.subjectName.length > 15 ? s.subjectName.slice(0, 15) + "…" : s.subjectName,
    failPct: s.failPercentage,
    fails: s.failCount,
  }));

  const SortIcon = ({ k }: { k: string }) =>
    sortKey === k ? (
      sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
    ) : (
      <div className="h-3 w-3 opacity-30"><ChevronDown className="h-3 w-3" /></div>
    );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Analysis not found</h2>
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <Badge variant="outline">Semester {analysis.semesterNumber}</Badge>
            <Badge variant={analysis.status === "completed" ? "success" : "warning"}>
              {analysis.status}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{analysis.departmentName}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Seats {analysis.startSeat} — {analysis.endSeat} · {analysis.totalStudents} students processed
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setAddStudentsOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Missing Students
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
          {!isPremium && (
            <Link href="/dashboard/subscription">
              <Button size="sm" className="gap-2">
                <Lock className="h-4 w-4" />
                Remove Watermark
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Students", value: analysis.totalStudents, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40" },
          { label: "Pass Count", value: analysis.passCount, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/40" },
          { label: "Fail Count", value: analysis.failCount, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/40" },
          { label: "Pass %", value: `${analysis.passPercentage.toFixed(1)}%`, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/40" },
          { label: "Distinction", value: analysis.distinctionCount, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/40" },
          { label: "ATKT Count", value: analysis.atktCount, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/40" },
        ].map((s) => (
          <Card key={s.label} className="text-center">
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {missingSeats.length > 0 && (
        <Alert variant="warning" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-amber-300 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <h4 className="font-semibold text-amber-800 dark:text-amber-200">Missing Student Records Detected</h4>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                {missingSeats.length} student result(s) in the seat range ({analysis.startSeat} — {analysis.endSeat}) are missing from this batch (possibly due to failed fetches during generation).
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setNewSeatsInput(missingSeats.join(", "));
              setAddStudentsOpen(true);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white border-0 shrink-0 self-start sm:self-center"
          >
            Fetch & Add {missingSeats.length} Missing Seat(s)
          </Button>
        </Alert>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {(["table", "stats", "charts"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "table" ? "Result Table" : tab === "stats" ? "Statistics" : "Charts"}
          </button>
        ))}
      </div>

      {/* Table tab */}
      {activeTab === "table" && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <CardTitle className="text-base">
                Student Results ({filteredStudents.length} students)
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search by name or seat..."
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full result-table">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-20 text-left min-w-[130px] bg-primary">
                      <button onClick={() => handleSort("seatNo")} className="flex items-center gap-1 hover:text-primary-foreground/80">
                        Seat No <SortIcon k="seatNo" />
                      </button>
                    </th>
                    <th className="sticky left-[130px] z-20 text-left min-w-[160px] bg-primary shadow-[1px_0_0_rgba(0,0,0,0.1)]">
                      <button onClick={() => handleSort("name")} className="flex items-center gap-1 hover:text-primary-foreground/80">
                        Name <SortIcon k="name" />
                      </button>
                    </th>
                    {allSubjects.map((subj) => (
                      <th key={subj} colSpan={6} className="text-center border-l border-primary-foreground/20 min-w-[300px]">
                        {subj}
                      </th>
                    ))}
                    <th className="text-center min-w-[80px]">Total</th>
                    <th className="text-center min-w-[70px]">
                      <button onClick={() => handleSort("percentage")} className="flex items-center gap-1 mx-auto hover:text-primary-foreground/80">
                        % <SortIcon k="percentage" />
                      </button>
                    </th>
                    <th className="text-center min-w-[60px]">Cr</th>
                    <th className="text-center min-w-[80px]">Remarks</th>
                    <th className="text-center min-w-[80px]">Status</th>
                  </tr>
                  <tr className="bg-primary/90">
                    <th className="sticky left-0 z-20 bg-primary border-t border-primary-foreground/10"></th>
                    <th className="sticky left-[130px] z-20 bg-primary border-t border-primary-foreground/10 shadow-[1px_0_0_rgba(0,0,0,0.1)]"></th>
                    {allSubjects.map((subj) => (
                      ["FA TH", "SA TH", "FA PR", "SA PR", "SLA", "CR"].map((col) => (
                        <th key={`${subj}-${col}`} className="text-center text-[10px] text-primary-foreground/80 px-2 py-1 border-l border-primary-foreground/10">
                          {col}
                        </th>
                      ))
                    ))}
                    <th></th><th></th><th></th><th></th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((student, idx) => {
                    const rowBg = idx % 2 === 0
                      ? "bg-white dark:bg-slate-950"
                      : "bg-slate-50 dark:bg-slate-900";
                    return (
                    <tr key={student.seatNo} className={`${rowBg} hover:bg-blue-50 dark:hover:bg-blue-950/40 group/row`}>
                      <td className={`sticky left-0 z-10 font-mono text-xs text-muted-foreground ${rowBg} group-hover/row:bg-blue-50 dark:group-hover/row:bg-blue-950/40`}>
                        {student.seatNo}
                      </td>
                      <td className={`sticky left-[130px] z-10 font-medium text-foreground shadow-[2px_0_4px_rgba(0,0,0,0.08)] ${rowBg} group-hover/row:bg-blue-50 dark:group-hover/row:bg-blue-950/40`}>
                        {student.name}
                      </td>
                      {allSubjects.map((subjName) => {
                        const subj = student.subjects.find((s) => s.subjectName === subjName);
                        return [
                          subj?.faTh, subj?.saTh, subj?.faPr, subj?.saPr, subj?.sla, subj?.credits
                        ].map((val, i) => (
                          <td key={`${subjName}-${i}`} className="text-center text-xs border-l border-border">
                            {val !== undefined ? String(val) : "—"}
                          </td>
                        ));
                      })}
                      <td className="text-center font-medium">{isNaN(student.totalMarks) ? "—" : student.totalMarks}</td>
                      <td className="text-center font-bold text-primary">{isNaN(student.percentage) ? "—" : `${student.percentage}%`}</td>
                      <td className="text-center text-muted-foreground">{isNaN(student.totalCredit) ? "—" : student.totalCredit}</td>
                      <td className="text-center text-xs">{student.remarks || "—"}</td>
                      <td className="text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isPassed(student.finalStatus)
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                            : isATKT(student.finalStatus)
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                              : isFailed(student.finalStatus)
                                ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300"
                        }`}>
                          {student.finalStatus}
                        </span>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{(page - 1) * ROWS_PER_PAGE + 1}</span>–
                  <span className="font-semibold text-foreground">{Math.min(page * ROWS_PER_PAGE, filteredStudents.length)}</span> of{" "}
                  <span className="font-semibold text-foreground">{filteredStudents.length}</span> students
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                  
                  <div className="hidden sm:flex items-center gap-1">
                    {(() => {
                      const pages = [];
                      const maxVisible = 5;
                      if (totalPages <= maxVisible) {
                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                      } else {
                        pages.push(1);
                        const start = Math.max(2, page - 1);
                        const end = Math.min(totalPages - 1, page + 1);
                        
                        if (start > 2) {
                          pages.push("...");
                        }
                        
                        for (let i = start; i <= end; i++) {
                          pages.push(i);
                        }
                        
                        if (end < totalPages - 1) {
                          pages.push("...");
                        }
                        
                        pages.push(totalPages);
                      }
                      
                      return pages.map((p, idx) => {
                        if (typeof p === "number") {
                          return (
                            <Button
                              key={idx}
                              variant={page === p ? "default" : "outline"}
                              size="sm"
                              className="h-8 w-8 p-0 text-xs"
                              onClick={() => setPage(p)}
                            >
                              {p}
                            </Button>
                          );
                        }
                        return (
                          <span key={idx} className="px-1.5 text-muted-foreground text-sm">
                            {p}
                          </span>
                        );
                      });
                    })()}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats tab */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          {/* Toppers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Department Toppers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {(analysis.toppers || []).slice(0, 10).map((student, idx) => (
                  <div key={student.seatNo} className="flex items-center gap-4 px-6 py-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      idx === 0 ? "bg-yellow-100 text-yellow-700" :
                      idx === 1 ? "bg-gray-100 text-gray-600" :
                      idx === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{student.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{student.seatNo}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{student.percentage}%</div>
                      <div className="text-xs text-muted-foreground">{student.totalMarks} marks</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subject-wise Toppers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-blue-500" />
                Subject-wise Toppers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Topper Name</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Seat No</th>
                      <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {subjectToppers.map((st, idx) => (
                      <tr key={st.subjectName} className={idx % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                        <td className="px-6 py-3 text-sm font-medium text-foreground">{st.subjectName}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                              <Trophy className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-sm font-medium text-foreground">{st.studentName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm font-mono text-muted-foreground">{st.seatNo}</td>
                        <td className="px-6 py-3 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            {st.totalMarks}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {subjectToppers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted-foreground">
                          No subject toppers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Subject failures */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Subject-wise Failure Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {(analysis.subjectFailures || []).map((subj) => (
                  <div key={subj.subjectName} className="flex items-center gap-4 px-6 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{subj.subjectName}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${subj.failPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {subj.failCount} failed ({subj.failPercentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts tab */}
      {activeTab === "charts" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pass / A.T.K.T / Fail</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={idx === 0 ? "#10B981" : idx === 1 ? "#F59E0B" : "#EF4444"} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Class Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={classData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {classData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Subject-wise Failure Rate (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={subjectChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip formatter={(v) => [`${v}%`, "Fail Rate"]} />
                  <Bar dataKey="failPct" fill="#EF4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Missing Students Dialog */}
      <Dialog open={addStudentsOpen} onOpenChange={(open) => { if (!adding) setAddStudentsOpen(open); }}>
        <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Add Missing Students</DialogTitle>
            <DialogDescription>
              Enter the seat numbers of the students who were missed or failed to fetch, separated by commas, spaces, or newlines.
            </DialogDescription>
          </DialogHeader>

          {addProgress.status === "processing" || addProgress.status === "completed" ? (
            <div className="py-4 space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-1">
                  {addProgress.current}
                  <span className="text-xl text-muted-foreground"> / {addProgress.total}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {addProgress.status === "completed" ? "Successfully processed!" : "Fetching student results..."}
                </p>
              </div>
              <Progress value={(addProgress.current / addProgress.total) * 100} />
              {addProgress.status === "completed" && (
                <Alert variant="success" className="text-center">
                  ✓ Batch analysis updated successfully
                </Alert>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="seats-input">Seat Numbers</Label>
                <textarea
                  id="seats-input"
                  value={newSeatsInput}
                  onChange={(e) => setNewSeatsInput(e.target.value)}
                  placeholder="e.g. 2200170012, 2200170015, 2200170018"
                  className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                />
              </div>

              {newSeatsInput.trim() && (() => {
                const parsedSeats = newSeatsInput
                  .split(/[\s,;\n\t]+/)
                  .map((s) => s.trim())
                  .filter((s) => s.length > 0);
                
                const existingSeats = new Set(analysis.students.map((s) => s.seatNo));
                const newSeats = parsedSeats.filter((s) => !existingSeats.has(s));
                const duplicatesCount = parsedSeats.length - newSeats.length;

                return (
                  <div className="text-xs rounded-lg p-2 bg-muted text-muted-foreground space-y-1">
                    <p className="font-medium">Entered: {parsedSeats.length} seat(s)</p>
                    <p className="text-primary font-medium">To fetch: {newSeats.length} new seat(s)</p>
                    {duplicatesCount > 0 && (
                      <p className="text-amber-600 dark:text-amber-400">{duplicatesCount} seat(s) already exist in this analysis and will be skipped.</p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {addProgress.status !== "processing" && addProgress.status !== "completed" && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddStudentsOpen(false)}>Cancel</Button>
              <Button
                onClick={handleAddStudents}
                disabled={!newSeatsInput.trim()}
                loading={adding}
              >
                Fetch & Add
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
