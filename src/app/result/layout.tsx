import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check MSBTE Result Online | MSBTE Result Checker",
  description:
    "Check your MSBTE diploma exam results online. Enter your seat number to search for Summer or Winter results instantly with detailed subject-wise marks.",
  keywords: [
    "msbteresult",
    "check msbte result",
    "msbte summer result",
    "msbte winter result",
    "msbte result checker",
    "msbte result by seat number",
    "msbte diploma result online",
    "msbte result search",
  ],
  alternates: {
    canonical: "/result",
  },
  openGraph: {
    title: "Check MSBTE Result Online | MSBTE Result Checker",
    description:
      "Check your MSBTE diploma exam results online. Enter your seat number to search for Summer or Winter results instantly with detailed subject-wise marks.",
    url: "https://msbteresult.online/result",
    type: "website",
  },
};

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
