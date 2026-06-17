import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch("https://api.msbteresult.online/fetch-html", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: text || "Failed to fetch HTML from backend API" },
        { status: response.status }
      );
    }

    // Backend returns JSON like: { "seat_no": "...", "html": "<html>...</html>" }
    // We must extract only the "html" field
    const contentType = response.headers.get("content-type") || "";
    let htmlContent: string;

    if (contentType.includes("application/json")) {
      const data = await response.json();
      htmlContent = data.html ?? data.content ?? "";
    } else {
      // Already raw HTML
      const raw = await response.text();
      try {
        const parsed = JSON.parse(raw);
        htmlContent = parsed.html ?? parsed.content ?? raw;
      } catch {
        htmlContent = raw;
      }
    }

    if (!htmlContent) {
      return NextResponse.json(
        { error: "No HTML content in backend response" },
        { status: 500 }
      );
    }

    // Unescape literal escape sequences left over from JSON-encoded strings
    // e.g. literal \n → real newline, \" → real quote
    htmlContent = htmlContent
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");

    return new Response(htmlContent, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("Error in fetch-html proxy:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
