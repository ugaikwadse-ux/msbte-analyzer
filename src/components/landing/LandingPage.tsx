"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  FileSpreadsheet,
  Zap,
  BarChart3,
  Download,
  Shield,
  Clock,
  Building2,
  Star,
  Users,
  TrendingUp,
  ChevronDown,
  Play,
  FileText,
  Trophy,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, Badge } from "@/components/ui/elements";

const features = [
  {
    icon: FileSpreadsheet,
    title: "No Excel Required",
    desc: "Skip the manual data entry. Just enter seat number range and we handle everything.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    icon: Zap,
    title: "Auto Result Extraction",
    desc: "Automatically fetches and processes MSBTE results for entire batches.",
    color: "text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-950/40",
  },
  {
    icon: TrendingUp,
    title: "Pass % Calculation",
    desc: "Instant pass percentage, distinction count, and class-wise breakdowns.",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950/40",
  },
  {
    icon: Trophy,
    title: "Topper List",
    desc: "Auto-generate department toppers sorted by marks and percentage.",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/40",
  },
  {
    icon: FileText,
    title: "CSV Export",
    desc: "Export complete result data to CSV for further analysis or record keeping.",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/40",
  },
  {
    icon: Download,
    title: "PDF Export",
    desc: "Professional PDF reports with institute branding and detailed analytics.",
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/40",
  },
  {
    icon: Search,
    title: "Mobile Friendly",
    desc: "Full-featured responsive design works perfectly on tablets and mobiles.",
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
  },
  {
    icon: Building2,
    title: "Institute Ready",
    desc: "Multi-department support with custom branding for professional use.",
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
  },
];

const testimonials = [
  {
    name: "Prof. Ramesh Patil",
    role: "HOD, Computer Engineering",
    institute: "Government Polytechnic, Pune",
    text: "This platform has transformed how we handle result analysis. What used to take our staff 3 days now takes 20 minutes. The department-wise reports are incredibly detailed.",
    rating: 5,
    avatar: "RP",
  },
  {
    name: "Dr. Sunita Kulkarni",
    role: "Principal",
    institute: "Kolhapur Polytechnic Institute",
    text: "We process results for 6 departments across 6 semesters every year. The system handles everything automatically. The PDF reports with our institute logo look very professional.",
    rating: 5,
    avatar: "SK",
  },
  {
    name: "Mr. Vikas Shinde",
    role: "Director",
    institute: "TechVision Coaching Center, Nashik",
    text: "As a coaching center, we need quick results to counsel students. The analyzer gives us the full picture instantly. Our students love the transparent subject-wise analysis.",
    rating: 5,
    avatar: "VS",
  },
];

const stats = [
  { value: "2.4L+", label: "Students Processed", icon: Users },
  { value: "180+", label: "Institutes Using our Platform", icon: Building2 },
  { value: "42+", label: "Departments Managed", icon: BarChart3 },
  { value: "99.8%", label: "Uptime Reliability", icon: Shield },
];

const faqs = [
  {
    q: "Do I need to download any Excel file or Gazette PDF?",
    a: "No. The system directly fetches results from MSBTE servers. Just enter the start and end seat numbers for your batch.",
  },
  {
    q: "How long does it take to process 100 students?",
    a: "Typically 2-5 minutes for 100 students on our Premium plan. Free plan processes one student at a time.",
  },
  {
    q: "Can I add my institute logo to PDF reports?",
    a: "Yes, Institute plan members can upload their institute logo which appears on all exported PDF reports.",
  },
  {
    q: "Is student data stored securely?",
    a: "Analysis data is stored securely in your private account on Firebase. We never share data with third parties.",
  },
  {
    q: "Can I create multiple departments?",
    a: "Yes. You can create as many departments as needed. Each department automatically contains Semester 1–6.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept PayPal for Premium and Institute plan subscriptions. Free plan requires no payment.",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full bg-blue-300/10 blur-3xl" />
        </div>

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="default" className="mb-6 inline-flex gap-1.5 px-3 py-1">
            <Zap className="h-3 w-3" />
            Trusted by 180+ Institutes across Maharashtra
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
            MSBTE Result Analysis
            <br />
            <span className="gradient-text">Made Simple</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Generate complete department-wise result analysis in minutes — no Excel sheets, 
            no Gazette PDFs, no manual work. Just enter a seat number range.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/25">
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/result">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                <Play className="h-4 w-4" />
                Try Single Result
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
            {["No credit card required", "Free plan forever", "Setup in 2 minutes"].map((text) => (
              <div key={text} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Demo preview */}
          <div className="mt-14 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/50">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-muted-foreground">MSBTE Result Analyzer</span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {[
                    { label: "Total Students", val: "120", color: "text-blue-600" },
                    { label: "Pass Count", val: "98", color: "text-green-600" },
                    { label: "Pass %", val: "81.67%", color: "text-purple-600" },
                    { label: "Distinction", val: "23", color: "text-orange-600" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-border bg-background p-4 text-center">
                      <div className={`text-2xl font-bold ${stat.color}`}>{stat.val}</div>
                      <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-primary text-primary-foreground">
                        <th className="px-3 py-2 text-left">Seat No</th>
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2">Total</th>
                        <th className="px-3 py-2">%</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { seat: "2210124001", name: "Aarav Sharma", total: 892, pct: "87.5%", status: "PASS", dist: true },
                        { seat: "2210124002", name: "Priya Patil", total: 834, pct: "81.8%", status: "PASS", dist: true },
                        { seat: "2210124003", name: "Rohan Kulkarni", total: 756, pct: "74.2%", status: "PASS", dist: false },
                      ].map((row) => (
                        <tr key={row.seat} className="border-t border-border">
                          <td className="px-3 py-2 font-mono text-muted-foreground">{row.seat}</td>
                          <td className="px-3 py-2 font-medium">{row.name}</td>
                          <td className="px-3 py-2 text-center">{row.total}</td>
                          <td className="px-3 py-2 text-center font-medium text-primary">{row.pct}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              row.dist
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                                : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                            }`}>
                              {row.dist ? "DIST" : row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="p-2.5 rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need for result analysis
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From basic single result lookup to full department-wide batch analysis with exports — all in one place.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="card-hover">
                  <CardContent className="p-5">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", feature.bg)}>
                      <Icon className={cn("h-5 w-5", feature.color)} />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1.5">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              From seat range to full report in 3 steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {[
              {
                step: "1",
                title: "Create a Department",
                desc: "Set up your department (e.g., Computer Engineering). Each department auto-includes all 6 semesters.",
                icon: Building2,
              },
              {
                step: "2",
                title: "Enter Seat Range",
                desc: "Select department and semester, then enter start and end seat numbers for your batch.",
                icon: Search,
              },
              {
                step: "3",
                title: "Get Full Analysis",
                desc: "View instant statistics, topper lists, subject-wise analysis, and export as PDF or CSV.",
                icon: BarChart3,
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative text-center">
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-border to-transparent z-0 -translate-x-8" />
                  )}
                  <div className="relative z-10">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl gradient-bg shadow-lg shadow-primary/25">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 ml-8 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {step.step}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Trusted by educators across Maharashtra
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                      <div className="text-xs text-primary">{t.institute}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing CTA ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Start analyzing results today
          </h2>
          <p className="text-muted-foreground mb-8">
            Free plan available. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">View All Plans</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">Frequently asked questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <Card key={idx} className="overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span className="text-sm font-medium text-foreground pr-4">{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200",
                      openFaq === idx && "rotate-180"
                    )}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
