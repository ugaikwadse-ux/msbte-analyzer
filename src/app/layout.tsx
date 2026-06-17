import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: {
    default: "MSBTE Result Analyzer | MSBTE Summer Result Analysis",
    template: "%s | MSBTE Result Analyzer",
  },
  description:
    "Check your MSBTE result, check MSBTE Summer Result, and generate comprehensive department-wise diploma result analysis, toppers list, and charts in minutes.",
  keywords: [
    "msbteresult",
    "msbte summer result",
    "msbte result",
    "msbte result analysis",
    "msbte topper list",
    "msbte diploma result",
    "msbte result checker",
    "msbte online result",
    "msbte result 2026",
    "polytechnic result",
    "Maharashtra polytechnic result",
    "MSBTE board result",
    "MSBTE",
    "result analysis",
    "polytechnic",
    "Maharashtra",
    "engineering",
  ],
  metadataBase: new URL("https://www.msbteresult.online"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MSBTE Result Analyzer | MSBTE Summer Result Analysis",
    description:
      "Check your MSBTE result & generate comprehensive department-wise diploma result analysis, toppers list, and charts in minutes.",
    url: "https://www.msbteresult.online",
    siteName: "MSBTE Result Analyzer",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MSBTE Result Analyzer | MSBTE Summer & Winter Result Analysis",
    description:
      "Check your MSBTE result & generate comprehensive department-wise diploma result analysis, toppers list, and charts in minutes.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-placeholder-code-to-be-replaced",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MSBTE Result Analyzer",
  "url": "https://www.msbteresult.online",
  "description": "Automatically analyze MSBTE diploma results, check MSBTE Summer & Winter results, generate department-wise stats, toppers list, and pass percentage charts.",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "browserRequirements": "Requires HTML5, Javascript, and CSS support.",
  "featureList": [
    "No Excel Sheets Required - Auto result extraction by entering seat range",
    "Pass percentage & distinction calculation",
    "Department topper list generation",
    "CSV and PDF export with custom institute branding"
  ],
  "creator": {
    "@type": "Organization",
    "name": "MSBTE Result Analyzer",
    "url": "https://www.msbteresult.online"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

