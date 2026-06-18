import type { Analysis, StudentResult, ExportOptions } from "@/types";
import { isPassed, isFailed } from "@/lib/utils";

// ─── Excel Export (styled, same format as result table) ───────────────────────

export async function exportToExcel(analysis: Analysis, options: ExportOptions) {
  const { students } = analysis;
  if (!students || students.length === 0) return;

  // Dynamic import so the bundle stays small for non-export pages
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "MSBTE Result Analyzer";
  workbook.created = new Date();

  const ws = workbook.addWorksheet("Results", {
    views: [{ state: "frozen", xSplit: 2, ySplit: 3 }],
  });

  const allSubjects = getUniqueSubjects(students);
  const subCols = ["FA TH", "SA TH", "FA PR", "SA PR", "SLA", "CR"];

  // ── Colours matching the result-table in the app ──────────────────────────
  const PRIMARY_BG = "1E3A5F"; // deep blue header
  const PRIMARY_FG = "FFFFFF";
  const SUB_HEADER_BG = "2B4F7E"; // slightly lighter for sub-row
  const GREEN_BG = "D1FAE5";
  const GREEN_FG = "065F46";
  const RED_BG = "FEE2E2";
  const RED_FG = "991B1B";
  const YELLOW_BG = "FEF3C7";
  const YELLOW_FG = "92400E";
  const ALT_ROW = "F8FAFC";
  const BORDER_COLOR = "CBD5E1";

  const thinBorder: Partial<import("exceljs").Border> = { style: "thin", color: { argb: BORDER_COLOR } };
  const allBorders: Partial<import("exceljs").Borders> = {
    top: thinBorder,
    bottom: thinBorder,
    left: thinBorder,
    right: thinBorder,
  };

  const showAggregateCols = students.some((s) => String(s.remarks || "").toLowerCase().includes("6k"));

  // ── Title row ─────────────────────────────────────────────────────────────
  const titleRow = ws.addRow([
    `${analysis.departmentName} — Semester ${analysis.semesterNumber}  |  Generated: ${new Date().toLocaleString()}`,
  ]);
  const totalCols = 2 + allSubjects.length * subCols.length + 5 + (showAggregateCols ? 2 : 0); // seatNo + name + subjects*6 + total + % + (aggMarks + aggPct) + cr + remark + status
  ws.mergeCells(1, 1, 1, totalCols);
  titleRow.height = 28;
  titleRow.font = { bold: true, size: 13, color: { argb: PRIMARY_FG } };
  titleRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRIMARY_BG } };
  titleRow.alignment = { horizontal: "center", vertical: "middle" };

  // ── Header row 1: Seat No | Name | Subject names (merged over 6 cols) | Total | % | Cr | Remarks | Status
  const headerRow1: string[] = ["Seat No", "Name"];
  allSubjects.forEach((subj) => {
    headerRow1.push(subj);
    for (let i = 1; i < subCols.length; i++) headerRow1.push(""); // placeholders for merge
  });
  headerRow1.push("Total", "%");
  if (showAggregateCols) {
    headerRow1.push("Agg. Marks", "Agg. %");
  }
  headerRow1.push("Cr", "Remarks", "Status");

  const h1 = ws.addRow(headerRow1);
  h1.height = 26;

  // Style the header row 1
  for (let c = 1; c <= totalCols; c++) {
    const cell = h1.getCell(c);
    cell.font = { bold: true, size: 11, color: { argb: PRIMARY_FG } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRIMARY_BG } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = allBorders;
  }

  // Merge subject header cells
  allSubjects.forEach((_, sIdx) => {
    const startCol = 3 + sIdx * subCols.length;
    const endCol = startCol + subCols.length - 1;
    ws.mergeCells(2, startCol, 2, endCol);
  });

  // ── Header row 2: empty | empty | FA TH | SA TH | FA PR | SA PR | SLA | CR (repeated) | ... trailing empties
  const headerRow2: string[] = ["", ""];
  allSubjects.forEach(() => {
    subCols.forEach((col) => headerRow2.push(col));
  });
  headerRow2.push("", ""); // Total, %
  if (showAggregateCols) {
    headerRow2.push("", ""); // Agg. Marks, Agg. %
  }
  headerRow2.push("", "", ""); // Cr, Remarks, Status

  const h2 = ws.addRow(headerRow2);
  h2.height = 20;

  for (let c = 1; c <= totalCols; c++) {
    const cell = h2.getCell(c);
    cell.font = { bold: true, size: 9, color: { argb: PRIMARY_FG } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SUB_HEADER_BG } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = allBorders;
  }

  // ── Data rows ─────────────────────────────────────────────────────────────
  students.forEach((student, idx) => {
    const row: (string | number)[] = [student.seatNo, student.name];

    allSubjects.forEach((subjName) => {
      const subj = student.subjects.find((s) => s.subjectName === subjName);
      row.push(
        subj?.faTh !== undefined ? subj.faTh : "—",
        subj?.saTh !== undefined ? subj.saTh : "—",
        subj?.faPr !== undefined ? subj.faPr : "—",
        subj?.saPr !== undefined ? subj.saPr : "—",
        subj?.sla !== undefined ? subj.sla : "—",
        subj?.credits !== undefined ? subj.credits : "—"
      );
    });

    row.push(
      isNaN(student.totalMarks) ? "—" : student.totalMarks,
      isPassed(student.finalStatus) && !isNaN(student.percentage) ? `${student.percentage}%` : "—"
    );
    if (showAggregateCols) {
      row.push(
        student.aggregateMarks || "—",
        student.aggregatePercentage ? `${student.aggregatePercentage}%` : "—"
      );
    }
    row.push(
      isNaN(student.totalCredit) ? "—" : student.totalCredit,
      student.remarks || "—",
      student.finalStatus
    );

    const dataRow = ws.addRow(row);
    dataRow.height = 20;

    // Alternating row colour
    const bgColor = idx % 2 === 0 ? "FFFFFF" : ALT_ROW;

    for (let c = 1; c <= totalCols; c++) {
      const cell = dataRow.getCell(c);
      cell.font = { size: 10 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = allBorders;
    }

    // Seat No column – mono font, left aligned
    dataRow.getCell(1).font = { size: 9, name: "Consolas" };
    dataRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    // Name column – bold, left aligned
    dataRow.getCell(2).font = { size: 10, bold: true };
    dataRow.getCell(2).alignment = { horizontal: "left", vertical: "middle" };

    // % column – bold primary blue
    const pctCol = 2 + allSubjects.length * subCols.length + 2;
    dataRow.getCell(pctCol).font = { size: 10, bold: true, color: { argb: "2563EB" } };

    if (showAggregateCols) {
      const aggMarksCol = pctCol + 1;
      const aggPctCol = pctCol + 2;
      dataRow.getCell(aggMarksCol).font = { size: 10, color: { argb: "D97706" } }; // Amber-600
      dataRow.getCell(aggPctCol).font = { size: 10, bold: true, color: { argb: "D97706" } };
    }

    // Status column – coloured badge
    const statusCol = totalCols;
    const statusCell = dataRow.getCell(statusCol);
    if (isPassed(student.finalStatus)) {
      statusCell.font = { size: 10, bold: true, color: { argb: GREEN_FG } };
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN_BG } };
    } else if (isFailed(student.finalStatus)) {
      statusCell.font = { size: 10, bold: true, color: { argb: RED_FG } };
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: RED_BG } };
    } else {
      statusCell.font = { size: 10, bold: true, color: { argb: YELLOW_FG } };
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: YELLOW_BG } };
    }
  });

  // ── Watermark row (free plan) ─────────────────────────────────────────────
  if (options.includeWatermark) {
    ws.addRow([]);
    const wmRow = ws.addRow(["Generated by MSBTE Result Analyzer — Upgrade to remove watermark"]);
    ws.mergeCells(wmRow.number, 1, wmRow.number, totalCols);
    wmRow.font = { italic: true, size: 10, color: { argb: "94A3B8" } };
    wmRow.alignment = { horizontal: "center", vertical: "middle" };
  }

  // ── Column widths ─────────────────────────────────────────────────────────
  ws.getColumn(1).width = 16; // Seat No
  ws.getColumn(2).width = 22; // Name
  for (let s = 0; s < allSubjects.length; s++) {
    for (let c = 0; c < subCols.length; c++) {
      ws.getColumn(3 + s * subCols.length + c).width = 7;
    }
  }
  const trailingStart = 3 + allSubjects.length * subCols.length;
  ws.getColumn(trailingStart).width = 8;     // Total
  ws.getColumn(trailingStart + 1).width = 8; // %
  let currentIdx = trailingStart + 2;
  if (showAggregateCols) {
    ws.getColumn(currentIdx).width = 12; // Agg. Marks
    ws.getColumn(currentIdx + 1).width = 10; // Agg. %
    currentIdx += 2;
  }
  ws.getColumn(currentIdx).width = 6; // Cr
  ws.getColumn(currentIdx + 1).width = 12; // Remarks
  ws.getColumn(currentIdx + 2).width = 10; // Status

  // ── Download ──────────────────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const safeDeptName = analysis.departmentName.replace(/[^a-z0-9]/gi, "_");
  downloadBlob(
    buffer as ArrayBuffer,
    `${safeDeptName}-Sem${analysis.semesterNumber}-${Date.now()}.xlsx`,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
}

// ─── CSV Export (kept as fallback) ────────────────────────────────────────────

export function exportToCSV(analysis: Analysis, options: ExportOptions) {
  const { students } = analysis;
  if (!students || students.length === 0) return;

  const allSubjects = getUniqueSubjects(students);
  const showAggregateCols = students.some((s) => String(s.remarks || "").toLowerCase().includes("6k"));

  // Build headers
  const headers = ["Seat No", "Name"];
  allSubjects.forEach((subj) => {
    headers.push(
      `${subj}[faTh]`,
      `${subj}[saTh]`,
      `${subj}[faPr]`,
      `${subj}[saPr]`,
      `${subj}[sla]`,
      `${subj}[credits]`
    );
  });
  headers.push("totalmarks", "percentage");
  if (showAggregateCols) {
    headers.push("aggregatemarks", "aggregatepercentage");
  }
  headers.push("totalcredits", "remark", "final status");

  // Build rows
  const rows = students.map((student) => {
    const row: (string | number)[] = [student.seatNo, student.name];
    allSubjects.forEach((subjName) => {
      const subj = student.subjects.find((s) => s.subjectName === subjName);
      row.push(
        subj?.faTh ?? "",
        subj?.saTh ?? "",
        subj?.faPr ?? "",
        subj?.saPr ?? "",
        subj?.sla ?? "",
        subj?.credits ?? ""
      );
    });
    row.push(
      student.totalMarks,
      isPassed(student.finalStatus) && !isNaN(student.percentage) ? student.percentage : ""
    );
    if (showAggregateCols) {
      row.push(student.aggregateMarks ?? "", student.aggregatePercentage ?? "");
    }
    row.push(
      student.totalCredit,
      student.remarks,
      student.finalStatus
    );
    return row;
  });

  // Add watermark row if free
  if (options.includeWatermark) {
    rows.push(["", "Generated by MSBTE Result Analyzer"]);
  }

  const csvContent = [
    `# ${analysis.departmentName} — Semester ${analysis.semesterNumber}`,
    `# Generated: ${new Date().toLocaleString()}`,
    "",
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const str = String(cell);
          return str.includes(",") ? `"${str}"` : str;
        })
        .join(",")
    ),
  ].join("\n");

  const safeDeptName = analysis.departmentName.replace(/[^a-z0-9]/gi, '_');

  downloadFile(
    csvContent,
    `${safeDeptName}-Sem${analysis.semesterNumber}-${Date.now()}.csv`,
    "text/csv;charset=utf-8;"
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getUniqueSubjects(students: StudentResult[]): string[] {
  const seen = new Set<string>();
  const subjects: string[] = [];
  students.forEach((s) => {
    s.subjects.forEach((subj) => {
      if (!seen.has(subj.subjectName)) {
        seen.add(subj.subjectName);
        subjects.push(subj.subjectName);
      }
    });
  });
  return subjects;
}

function downloadFile(content: string, filename: string, type: string) {
  // Add BOM for Excel compatibility
  const blob = new Blob(["\uFEFF" + content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadBlob(buffer: ArrayBuffer, filename: string, type: string) {
  const blob = new Blob([buffer], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
