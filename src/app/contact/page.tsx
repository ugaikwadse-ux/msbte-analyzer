import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, Shield } from "lucide-react";
import { Badge } from "@/components/ui/elements";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3">Legal</Badge>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              Contact Us
            </h1>
            <p className="text-muted-foreground text-sm">We'd love to hear from you.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/80 p-8 sm:p-10 space-y-6 text-slate-700 dark:text-slate-300 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary flex-shrink-0" />
              <span>support@msbteresult.online</span>
            </div>
            <p className="mt-4 text-muted-foreground text-xs">
              Our team is available Monday‑Friday, 9am‑6pm IST. We aim to respond within 24 hours.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
