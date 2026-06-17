import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HelpCircle, RefreshCcw, FileText, Ban } from "lucide-react";
import { Badge } from "@/components/ui/elements";

export default function RefundPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3">Legal</Badge>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              Refund & Cancellation Policy
            </h1>
            <p className="text-muted-foreground text-sm">
              Last updated: June 16, 2026
            </p>
          </div>

          {/* Card Wrapper */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/80 p-8 sm:p-10 space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Ban className="h-5 w-5 text-primary" />
                1. Cancellations
              </h2>
              <p>
                You can cancel your subscription plan at any time. Your cancellation will take effect at the end of the current paid billing period (monthly).
              </p>
              <p>
                To cancel your subscription, simply go to your <strong>Dashboard → Subscription</strong> page and click on the &quot;Downgrade to Free&quot; option. Upon downgrade:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Your premium/institute privileges (such as watermark removal and custom logo branding) will remain active until the end of your current 30-day billing cycle.</li>
                <li>At the end of the cycle, your plan will automatically revert to the Free tier, and you will not be billed further.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RefreshCcw className="h-5 w-5 text-primary" />
                2. Refund Policy
              </h2>
              <p>
                Since <strong>MSBTE Result Analyzer</strong> offers immediate, digital access to result data extraction, PDF generation, CSV exports, and topper calculations, we operate under a strict refund policy.
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>No Refunds:</strong> We generally do not offer refunds or credits for any partially used subscription periods or once reports have been generated using the platform.</li>
                <li><strong>Technical Issues:</strong> If you experience severe, prolonged technical issues (such as platform downtime or complete failure to fetch student results due to API outages) that make the service unusable for more than 48 consecutive hours, you may request a partial refund.</li>
                <li><strong>Double Payments:</strong> In the event of duplicate charges or billing errors processed via Paytm, we will refund the duplicate payment in full upon verification. Please report these errors immediately.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                3. Refund Processing
              </h2>
              <p>
                Approved refunds will be processed back to the original payment source (Paytm wallet, bank account, card, or UPI ID used during checkout) within <strong>5 to 7 business days</strong>, in accordance with standard gateway settlement guidelines.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                4. Questions & Support
              </h2>
              <p>
                If you have any billing issues, duplicate transaction notices, or refund requests, please reach out to us at <strong>support@msbteresult.online</strong>.
              </p>
            </section>
            
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
