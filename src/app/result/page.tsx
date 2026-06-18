"use client";

import { useState, useRef } from "react";
import { Search, Download, ExternalLink, User, Hash, BookOpen, Award, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input, Label, Card, CardContent, CardHeader, CardTitle, Badge, Skeleton, Alert } from "@/components/ui/elements";
import { fetchStudentResult, fetchHtmlResult } from "@/lib/api";
import { isPassed, isFailed } from "@/lib/utils";
import type { StudentResult } from "@/types";

export default function SingleResultPage() {
  const [seatNo, setSeatNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [htmlLoading, setHtmlLoading] = useState(false);
  const [result, setResult] = useState<StudentResult | null>(null);
  const [error, setError] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = seatNo.trim();
    if (!trimmed) { console.warn('[Result] Empty seat number, aborting.'); return; }
    console.log('[Result] Searching for seat:', trimmed);
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await fetchStudentResult(trimmed);
      console.log('[Result] API response:', data);
      if (!data) {
        setError("No result found for this seat number. Please check and try again.");
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error('[Result] Fetch error:', err);
      setError("Failed to fetch result. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setHtmlLoading(true);
    try {
      const html = await fetchHtmlResult(seatNo.trim());
      if (!html) {
        setError("Official result not available for this seat number.");
        return;
      }

      // Inject a floating "Export to PDF" button + print styles into the HTML
      const exportButton = `
        <style>
          #iq-export-btn {
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 99999;
            background: #2563eb;
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 10px 22px;
            font-size: 15px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(37,99,235,0.4);
            font-family: Arial, sans-serif;
          }
          #iq-export-btn:hover { background: #1d4ed8; }
          @media print {
            #iq-export-btn { display: none !important; }
            body { margin: 0 !important; }
          }
        </style>
        <button id="iq-export-btn" onclick="window.print()">🖨️ Export to PDF</button>
      `;

      // Insert the button just after <body> tag, or prepend if no body tag
      const styledHtml = html.includes("<body")
        ? html.replace(/(<body[^>]*>)/i, `$1${exportButton}`)
        : exportButton + html;

      // Create a temporary blob URL (acts like a .html file) and open in new window
      const blob = new Blob([styledHtml], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank", "width=1100,height=800,scrollbars=yes,resizable=yes");

      // Cleanup the blob URL after the window loads it
      if (win) {
        win.addEventListener("load", () => {
          URL.revokeObjectURL(url);
        });
      } else {
        // Popup blocked – fallback: direct download as .html file
        const a = document.createElement("a");
        a.href = url;
        a.download = `MSBTE-Result-${seatNo.trim()}.html`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    } catch {
      setError("Failed to fetch official result.");
    } finally {
      setHtmlLoading(false);
    }
  };

  const statusColor = (status: string) => {
    if (isPassed(status)) return "success";
    if (isFailed(status)) return "destructive";
    return "warning";
  };

  return (
    <>
      <div className="print:hidden">
        <Navbar />
      </div>
      <main className="min-h-screen bg-background py-10 print:py-0 print:min-h-0">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 print:max-w-none print:px-0">
          {/* Header */}
          <div className="text-center mb-10 print:hidden">
            <Badge variant="outline" className="mb-3">Free Access — No Login Required</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Single Result Search
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Enter any MSBTE seat number to instantly view the complete result with subject-wise marks.
            </p>
          </div>

          {/* Search form */}
          <Card className="mb-8 shadow-md print:hidden">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label htmlFor="seatNo" className="mb-1.5 block">MSBTE Seat Number</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="seatNo"
                      value={seatNo}
                      onChange={(e) => setSeatNo(e.target.value)}
                      placeholder="e.g. 2210124001"
                      className="pl-9 font-mono"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button type="submit" loading={loading} className="gap-2 h-10 px-6">
                    <Search className="h-4 w-4" />
                    Search Result
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {error && <Alert variant="destructive" className="mb-6">{error}</Alert>}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex gap-4 mb-4">
                    <Skeleton className="h-14 w-14 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="space-y-6 animate-fade-up print:space-y-4 print:animate-none">
              {/* Student info */}
              <Card className="shadow-md print:shadow-none print:border-border">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                        <User className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">{result.name}</h2>
                        <p className="text-muted-foreground font-mono text-sm">Seat No: {result.seatNo}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={statusColor(result.finalStatus) as "success" | "destructive" | "warning"}>
                            {result.finalStatus}
                          </Badge>
                          {result.remarks && (
                            <Badge variant="secondary">{result.remarks}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleDownloadPdf}
                      loading={htmlLoading}
                      variant="outline"
                      className="gap-2 flex-shrink-0 print:hidden"
                    >
                      <Download className="h-4 w-4" />
                      {htmlLoading ? "Fetching..." : "Download Result"}
                    </Button>
                  </div>

                  {/* Summary stats */}
                  <div className={`grid grid-cols-2 ${result.remarks?.toLowerCase().includes("6k") ? "sm:grid-cols-3 md:grid-cols-6" : "sm:grid-cols-4"} gap-4 mt-6`}>
                    {[
                      { label: "Total Marks", value: result.totalMarks, icon: BookOpen, color: "text-blue-600" },
                      { label: "Percentage", value: `${result.percentage}%`, icon: TrendingUp, color: "text-green-600" },
                      { label: "Total Credits", value: result.totalCredit, icon: Award, color: "text-purple-600" },
                      { label: "Final Status", value: result.finalStatus, icon: Award, color: isPassed(result.finalStatus) ? "text-green-600" : isFailed(result.finalStatus) ? "text-red-600" : "text-yellow-600" },
                      ...(result.remarks?.toLowerCase().includes("6k") ? [
                        { label: "Aggregate Marks", value: result.aggregateMarks || "—", icon: BookOpen, color: "text-amber-600" },
                        { label: "Aggregate %", value: result.aggregatePercentage ? `${result.aggregatePercentage}%` : "—", icon: TrendingUp, color: "text-amber-600" }
                      ] : [])
                    ].map((s) => {
                      const Icon = s.icon;
                      return (
                        <div key={s.label} className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                          <Icon className={`h-5 w-5 mx-auto mb-1.5 ${s.color}`} />
                          <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                          <div className="text-xs text-muted-foreground">{s.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Subject table */}
              <Card className="shadow-md print:shadow-none print:border-border">
                <CardHeader className="pb-3 print:pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Subject-wise Marks
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto scrollbar-thin print:overflow-visible">
                    <table className="w-full result-table">
                      <thead>
                        <tr>
                          <th className="text-left sticky left-0 z-20 bg-primary min-w-[200px] shadow-[1px_0_0_rgba(0,0,0,0.1)]">Subject</th>
                          <th className="text-center">FA Theory</th>
                          <th className="text-center">SA Theory</th>
                          <th className="text-center">FA Practical</th>
                          <th className="text-center">SA Practical</th>
                          <th className="text-center">SLA</th>
                          <th className="text-center">Credits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.subjects.map((subj, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                            <td className={`sticky left-0 z-10 font-medium text-foreground shadow-[1px_0_0_rgba(0,0,0,0.1)] ${idx % 2 === 0 ? "bg-background" : "bg-slate-50 dark:bg-slate-900"}`}>
                              {subj.subjectName}
                            </td>
                            <td className="text-center text-muted-foreground">{subj.faTh || "—"}</td>
                            <td className="text-center font-medium">{subj.saTh || "—"}</td>
                            <td className="text-center text-muted-foreground">{subj.faPr || "—"}</td>
                            <td className="text-center font-medium">{subj.saPr || "—"}</td>
                            <td className="text-center text-muted-foreground">{subj.sla || "—"}</td>
                            <td className="text-center">
                              <Badge variant="secondary">{subj.credits || "—"}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

            </div>
          )}
        </div>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </>
  );
}
