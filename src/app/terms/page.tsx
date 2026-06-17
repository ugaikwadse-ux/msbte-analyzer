import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookOpen, AlertTriangle, ShieldCheck, Scale } from "lucide-react";
import { Badge } from "@/components/ui/elements";

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3">Legal</Badge>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-sm">
              Last updated: June 16, 2026
            </p>
          </div>

          {/* Card Wrapper */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/80 p-8 sm:p-10 space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                1. Agreement to Terms
              </h2>
              <p>
                By accessing or using our website, <strong>MSBTE Result Analyzer</strong>, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you are prohibited from using the site and services, and must discontinue use immediately.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                2. User Account Registration
              </h2>
              <p>
                You may be required to register with the site. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                3. Subscriptions & Payments
              </h2>
              <p>
                Our services are provided on a subscription basis. By subscribing, you agree to pay the specified fees (e.g. ₹2,999 per month for the Institute plan).
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Billing Cycle:</strong> Subscriptions are billed on a monthly basis. Access will automatically expire 30 days after the purchase date unless a renewal payment is processed.</li>
                <li><strong>Payment Methods:</strong> Payments are processed securely via our Paytm checkout page. You agree to provide current, complete, and accurate purchase and account information for all purchases.</li>
                <li><strong>Fee Changes:</strong> We reserve the right to modify pricing or plan structures at any time with prior notice.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                4. Prohibited Activities
              </h2>
              <p>
                You may not access or use the site for any purpose other than that for which we make the site available. The site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
              </p>
              <p>
                Specifically, you agree not to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Systematically retrieve data or other content from the site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission.</li>
                <li>Circumvent, disable, or otherwise interfere with security-related features of the site.</li>
                <li>Use the service to scrape, crawl, or mass-download official board materials for illegal commercial use.</li>
                <li>Use the platform in any manner that could disable, overburden, damage, or impair the site or interfere with any other party&apos;s use of the site.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                5. Intellectual Property Rights
              </h2>
              <p>
                Unless otherwise indicated, the site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the site (collectively, the &quot;Content&quot;) and the trademarks, service marks, and logos contained therein are owned or controlled by us, and are protected by copyright and trademark laws.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                6. Limitation of Liability
              </h2>
              <p>
                In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                7. Contact Us
              </h2>
              <p>
                In order to resolve a complaint regarding the site or to receive further information regarding use of the site, please contact us at <strong>support@msbteresult.online</strong>.
              </p>
            </section>
            
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
