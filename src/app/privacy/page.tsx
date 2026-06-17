import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, Lock, Eye, FileText } from "lucide-react";
import { Badge } from "@/components/ui/elements";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3">Legal</Badge>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-sm">
              Last updated: June 16, 2026
            </p>
          </div>

          {/* Card Wrapper */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/80 p-8 sm:p-10 space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                1. Introduction
              </h2>
              <p>
                Welcome to <strong>MSBTE Result Analyzer</strong>. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
              </p>
              <p>
                When you visit our website and use our services, you trust us with your personal information. We take your privacy very seriously. In this privacy notice, we describe our privacy policy. We seek to explain to you in the clearest way possible what information we collect, how we use it, and what rights you have in relation to it.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                2. Information We Collect
              </h2>
              <p>
                We collect personal information that you voluntarily provide to us when registering on the platform, expressing an interest in obtaining information about us or our products, or otherwise contacting us.
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Personal Data:</strong> Name, email address, password, billing credentials, and subscription details.</li>
                <li><strong>Result Search Data:</strong> To perform result analyses, we process student seat numbers provided by you. We do not store or use this data for any marketing purposes.</li>
                <li><strong>Device & Usage Information:</strong> We automatically collect certain information when you visit, use or navigate our website (like IP address, browser and device characteristics, operating system, and log statistics).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                3. How We Use Your Information
              </h2>
              <p>
                We use personal information collected via our website for a variety of business purposes described below:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>To facilitate account creation and logon process.</li>
                <li>To process your subscription payments and prevent payment frauds.</li>
                <li>To deliver the result analysis service and export tools.</li>
                <li>To send administrative information, updates, and product support messages.</li>
                <li>To enforce our terms, conditions, and policies.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                4. Sharing Your Information
              </h2>
              <p>
                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. This includes third-party processors like Firebase (Google Cloud for authentication and storage) and Paytm (for secure payment checkouts).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                5. Security of Your Information
              </h2>
              <p>
                We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our website is at your own risk.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                6. Your Privacy Rights
              </h2>
              <p>
                You may review, change, or terminate your account at any time. Under certain data protection laws, you also have the right to request access to and obtain copies of your personal information, request rectification or erasure of your data, or restrict the processing of your data.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                7. Contact Us
              </h2>
              <p>
                If you have questions or comments about this policy, you may email us at <strong>support@msbteresult.online</strong>.
              </p>
            </section>
            
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
