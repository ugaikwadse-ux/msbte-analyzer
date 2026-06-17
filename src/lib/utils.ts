import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

export function getGrade(percentage: number): string {
  if (percentage >= 75) return "Distinction";
  if (percentage >= 60) return "First Class";
  if (percentage >= 45) return "Second Class";
  if (percentage >= 40) return "Pass";
  return "Fail";
}

export function isPassed(status: string | undefined): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s.includes("pass") || s.includes("first class") || s.includes("second class") || s.includes("distinction");
}

export function isFailed(status: string | undefined): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s.includes("fail") || s === "f.f." || s.includes("atkt");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateSeatRange(start: string, end: string): string[] {
  const seats: string[] = [];
  const prefix = start.replace(/\d+$/, "");
  const startNum = parseInt(start.replace(/^\D+/, ""), 10);
  const endNum = parseInt(end.replace(/^\D+/, ""), 10);

  for (let i = startNum; i <= endNum; i++) {
    seats.push(prefix + i.toString().padStart(start.replace(/^\D+/, "").length, "0"));
  }

  return seats;
}

export function calculateStats(students: import("@/types").StudentResult[]) {
  if (students.length === 0) {
    return {
      totalStudents: 0,
      passCount: 0,
      failCount: 0,
      passPercentage: 0,
      distinctionCount: 0,
      firstClassCount: 0,
      avgMarks: 0,
      avgPercentage: 0,
    };
  }

  const passCount = students.filter((s) => isPassed(s.finalStatus)).length;
  const failCount = students.length - passCount;
  const passPercentage = (passCount / students.length) * 100;
  const distinctionCount = students.filter((s) => (isNaN(s.percentage) ? 0 : s.percentage) >= 75).length;
  const firstClassCount = students.filter(
    (s) => {
      const pct = isNaN(s.percentage) ? 0 : s.percentage;
      return pct >= 60 && pct < 75;
    }
  ).length;
  const avgMarks =
    students.reduce((acc, s) => acc + (isNaN(s.totalMarks) ? 0 : s.totalMarks), 0) / students.length;
  const avgPercentage =
    students.reduce((acc, s) => acc + (isNaN(s.percentage) ? 0 : s.percentage), 0) / students.length;

  return {
    totalStudents: students.length,
    passCount,
    failCount,
    passPercentage: Math.round(passPercentage * 100) / 100,
    distinctionCount,
    firstClassCount,
    avgMarks: Math.round(avgMarks * 100) / 100,
    avgPercentage: Math.round(avgPercentage * 100) / 100,
  };
}

export function getSubjectFailures(students: import("@/types").StudentResult[]) {
  const subjectMap = new Map<string, { fail: number; pass: number }>();

  students.forEach((student) => {
    student.subjects.forEach((subject) => {
      if (!subjectMap.has(subject.subjectName)) {
        subjectMap.set(subject.subjectName, { fail: 0, pass: 0 });
      }
      const entry = subjectMap.get(subject.subjectName)!;
      const saTh = Number(subject.saTh) || 0;
      if (saTh < 40 || saTh === 0) {
        entry.fail++;
      } else {
        entry.pass++;
      }
    });
  });

  return Array.from(subjectMap.entries())
    .map(([name, counts]) => ({
      subjectName: name,
      failCount: counts.fail,
      passCount: counts.pass,
      failPercentage:
        counts.fail + counts.pass > 0
          ? Math.round((counts.fail / (counts.fail + counts.pass)) * 100 * 100) / 100
          : 0,
    }))
    .sort((a, b) => b.failPercentage - a.failPercentage);
}
