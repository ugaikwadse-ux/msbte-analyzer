import type { StudentResult, SubjectMark } from "@/types";

const API_BASE = "/api";

export async function fetchStudentResult(seatNo: string): Promise<StudentResult | null> {
  try {
    const response = await fetch(`${API_BASE}/fetch-result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seat_no: seatNo }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || data.error) return null;

    return parseApiResponse(seatNo, data);
  } catch (err) {
    if (err instanceof Error && err.message.includes("Aggregate marks/percentage")) {
      throw err;
    }
    return null;
  }
}

export async function fetchHtmlResult(seatNo: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/fetch-html`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seat_no: seatNo }),
    });

    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

function parseApiResponse(seatNo: string, data: Record<string, unknown>): StudentResult {
  const subjects: SubjectMark[] = [];
  const rawSubjects = data.subjects || [];

  if (Array.isArray(rawSubjects)) {
    rawSubjects.forEach((subj, index) => {
      if (typeof subj === "string") {
        // Parallel arrays format
        const faThArr = Array.isArray(data.faTh) ? data.faTh : [];
        const saThArr = Array.isArray(data.saTh) ? data.saTh : [];
        const faPrArr = Array.isArray(data.faPr) ? data.faPr : [];
        const saPrArr = Array.isArray(data.saPr) ? data.saPr : [];
        const slaArr = Array.isArray(data.sla) ? data.sla : [];
        const creditsArr = Array.isArray(data.credits) ? data.credits : [];

        subjects.push({
          subjectName: subj,
          subjectCode: "",
          faTh: faThArr[index] ?? "-",
          saTh: saThArr[index] ?? "-",
          faPr: faPrArr[index] ?? "-",
          saPr: saPrArr[index] ?? "-",
          sla: slaArr[index] ?? "-",
          credits: creditsArr[index] ?? "-",
          total: "-",
          grade: "",
        });
      } else if (subj && typeof subj === "object") {
        // Object format
        const s = subj as Record<string, unknown>;
        subjects.push({
          subjectName: String(s.subject || s.name || s.subject_name || "Unknown"),
          subjectCode: String(s.code || s.subject_code || ""),
          faTh: (s.fa_theory ?? s.fa_th ?? "-") as string | number,
          saTh: (s.sa_theory ?? s.sa_th ?? "-") as string | number,
          faPr: (s.fa_practical ?? s.fa_pr ?? "-") as string | number,
          saPr: (s.sa_practical ?? s.sa_pr ?? "-") as string | number,
          sla: (s.sla ?? "-") as string | number,
          credits: (s.credits ?? "-") as string | number,
          total: (s.total ?? "-") as string | number,
          grade: String(s.grade ?? ""),
        });
      }
    });
  }

  let totalMarksVal = Number(data.totalMarks ?? data.total_marks ?? 0);
  if (isNaN(totalMarksVal)) totalMarksVal = 0;

  let percentageVal = Number(data.percentage ?? data.percent ?? 0);
  if (isNaN(percentageVal)) percentageVal = 0;

  // Parse max marks from remarks (e.g. "2/0990/EE4K") to calculate percentage if empty
  if (!percentageVal && totalMarksVal > 0) {
    const match = String(data.remarks || "").match(/\d+\/(\d+)\//);
    if (match && match[1]) {
      const maxMarks = parseInt(match[1], 10);
      if (maxMarks > 0) {
        percentageVal = Number(((totalMarksVal / maxMarks) * 100).toFixed(2));
      }
    }
  }

  let totalCreditVal = Number(data.totalCredit ?? data.total_credit ?? 0);
  if (isNaN(totalCreditVal)) totalCreditVal = 0;

  const remarksStr = String(data.remarks ?? "");
  const isSixthSem = remarksStr.toLowerCase().includes("6k");

  const aggregateMarksVal = data.aggregateMarks ?? data.aggregate_marks;
  const aggregatePercentageVal = data.aggregatePercentage ?? data.aggregate_percentage;

  if (isSixthSem) {
    if (
      aggregateMarksVal === undefined ||
      aggregateMarksVal === null ||
      String(aggregateMarksVal).trim() === "" ||
      aggregatePercentageVal === undefined ||
      aggregatePercentageVal === null ||
      String(aggregatePercentageVal).trim() === ""
    ) {
      throw new Error(`Aggregate marks/percentage column not found in result for 6K student (Seat No: ${seatNo}).`);
    }
  }

  return {
    seatNo,
    name: String(data.name || data.student_name || "Unknown"),
    subjects,
    totalMarks: totalMarksVal,
    percentage: percentageVal,
    totalCredit: totalCreditVal,
    remarks: remarksStr,
    finalStatus: String(data.finalStatus ?? data.final_status ?? data.status ?? ""),
    aggregateMarks: aggregateMarksVal !== undefined ? String(aggregateMarksVal) : undefined,
    aggregatePercentage: aggregatePercentageVal !== undefined ? String(aggregatePercentageVal) : undefined,
  };
}

export async function fetchResultsBatch(
  seats: string[],
  onProgress: (current: number, seat: string, result: StudentResult | null) => void,
  signal?: AbortSignal,
  expectedSubjects?: string[]
): Promise<{ results: StudentResult[]; failed: string[]; abortedReason?: string }> {
  const results: StudentResult[] = [];
  const failed: string[] = [];
  
  let firstSubjectsKey: string | null = expectedSubjects && expectedSubjects.length > 0
    ? expectedSubjects.map(s => s.trim()).sort().join("|")
    : null;

  for (let i = 0; i < seats.length; i++) {
    if (signal?.aborted) break;

    const seat = seats[i];
    const result = await fetchStudentResult(seat);

    if (result) {
      if (!firstSubjectsKey) {
        firstSubjectsKey = result.subjects.map((s) => s.subjectName.trim()).sort().join("|");
      } else {
        const firstSet = new Set(firstSubjectsKey.split("|").map(s => s.toLowerCase().trim()));
        const currentSet = new Set(result.subjects.map(s => s.subjectName.toLowerCase().trim()));

        let intersectionSize = 0;
        currentSet.forEach((subj) => {
          if (firstSet.has(subj)) {
            intersectionSize++;
          }
        });

        // Abort if there is no subject overlap, or if they have >= 3 subjects but share less than 2
        const isDifferent = intersectionSize === 0 || 
          (firstSet.size >= 3 && currentSet.size >= 3 && intersectionSize < 2);

        if (isDifferent) {
          return {
            results,
            failed,
            abortedReason: "Different subject detected. Maybe another department. Analysis aborted."
          };
        }
      }
      results.push(result);
    } else {
      failed.push(seat);
    }

    onProgress(i + 1, seat, result);

    // Small delay to avoid hammering the API
    if (i < seats.length - 1) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  return { results, failed };
}
