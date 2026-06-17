import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[API] fetch-result called with body:', body);
    
    const response = await fetch("https://api.msbteresult.online/fetch-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log('[API] Backend response status:', response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error('[API] Backend error:', text);
      return NextResponse.json(
        { error: text || "Failed to fetch from backend API" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[API] Backend data keys:', Object.keys(data));
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in fetch-result proxy:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
