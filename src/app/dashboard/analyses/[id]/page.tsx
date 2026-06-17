"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Download, FileText, Users, TrendingUp, Trophy,
  AlertTriangle, Search, ChevronUp, ChevronDown, FileSpreadsheet,
  BarChart2, Lock, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { getAnalysis } from "@/lib/db";
import { exportToCSV } from "@/lib/exports";
import { isPassed, isFailed, calculateStats } from "@/lib/utils";
import type { Analysis, StudentResult } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, Card, CardContent, CardHeader, CardTitle, Badge, Skeleton } from "@/components/ui/elements";
import { toast } from "@/components/ui/toaster";
import Link from "next/link";

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];
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

  const handleExportCSV = () => {
    if (!analysis) return;
    exportToCSV(analysis, { format: "csv", includeWatermark: !isPremium });
    toast({ title: "CSV exported", variant: "success" });
  };

  const pieData = analysis
    ? [
        { name: "Pass", value: analysis.passCount },
        { name: "Fail", value: analysis.failCount },
      ]
    : [];

  const classData = analysis
    ? [
        { name: "Distinction\n(≥75%)", value: analysis.distinctionCount },
        { name: "First Class\n(60–74%)", value: analysis.firstClassCount },
        { name: "Second Class\n(45–59%)", value: analysis.passCount - analysis.distinctionCount - analysis.firstClassCount },
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
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
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
          { label: "First Class", value: analysis.firstClassCount, color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-950/40" },
        ].map((s) => (
          <Card key={s.label} className="text-center">
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                  {paginatedStudents.map((student, idx) => (
                    <tr key={student.seatNo} className={idx % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                      <td className={`sticky left-0 z-10 font-mono text-xs text-muted-foreground ${idx % 2 === 0 ? "bg-background" : "bg-slate-50 dark:bg-slate-900"}`}>
                        {student.seatNo}
                      </td>
                      <td className={`sticky left-[130px] z-10 font-medium text-foreground shadow-[1px_0_0_rgba(0,0,0,0.1)] ${idx % 2 === 0 ? "bg-background" : "bg-slate-50 dark:bg-slate-900"}`}>
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
                            : isFailed(student.finalStatus)
                              ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                        }`}>
                          {student.finalStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
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
              <CardTitle>Pass vs Fail</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={idx === 0 ? "#10B981" : "#EF4444"} />
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
    </div>
  );
}
