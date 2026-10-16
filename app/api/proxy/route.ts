import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  try {
    const payload = await req.json();
    const { url, method = "GET", headers = {}, body } = payload;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing 'url' parameter" },
        { status: 400 }
      );
    }

    // Build headers object, filtering out restricted browser headers
    const requestHeaders: Record<string, string> = {};
    for (const [k, v] of Object.entries(headers)) {
      if (k && v && typeof v === "string") {
        const lower = k.toLowerCase();
        // Skip host or content-length which should be calculated by fetch
        if (lower !== "host" && lower !== "content-length") {
          requestHeaders[k] = v;
        }
      }
    }

    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      redirect: "follow",
    };

    if (method !== "GET" && method !== "HEAD" && body) {
      fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    // Use AbortController for 30s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    fetchOptions.signal = controller.signal;

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    const endTime = performance.now();
    const timeMs = Math.round(endTime - startTime);

    // Read response headers
    const resHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      resHeaders[key] = value;
    });

    const rawText = await response.text();
    const sizeBytes = new Blob([rawText]).size;

    let parsedData = null;
    let isJson = false;

    try {
      parsedData = JSON.parse(rawText);
      isJson = true;
    } catch {
      isJson = false;
    }

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText || (response.ok ? "OK" : "Error"),
      timeMs,
      sizeBytes,
      headers: resHeaders,
      data: parsedData,
      rawBody: rawText,
      isJson,
      isProxy: true,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    const endTime = performance.now();
    const isTimeout = err?.name === "AbortError";
    return NextResponse.json(
      {
        error: isTimeout
          ? "Request timed out after 30 seconds"
          : err.message || "Failed to proxy request",
        errorCategory: isTimeout ? "timeout" : "network",
        status: 0,
        statusText: isTimeout ? "Gateway Timeout" : "Proxy Fetch Error",
        timeMs: Math.round(endTime - startTime),
        sizeBytes: 0,
        headers: {},
        data: null,
        rawBody: "",
        isJson: false,
        isProxy: true,
        timestamp: Date.now(),
      },
      { status: 502 }
    );
  }
}
