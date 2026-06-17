import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg flex-col justify-between p-12 text-white">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">MSBTE Result Analyzer</span>
        </Link>

        <div>
          <blockquote className="text-3xl font-semibold leading-tight mb-6">
            &ldquo;What used to take 3 days now takes 20 minutes. The analyzer is transformative.&rdquo;
          </blockquote>
          <div>
            <div className="font-medium">Prof. Ramesh Patil</div>
            <div className="text-blue-100 text-sm">HOD, Computer Engineering · Government Polytechnic, Pune</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "2.4L+", label: "Students" },
            { value: "180+", label: "Institutes" },
            { value: "99.8%", label: "Uptime" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-blue-100 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - auth form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-bg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">MSBTE Result Analyzer</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
