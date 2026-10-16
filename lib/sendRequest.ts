import { RequestConfig, ResponseData } from "@/types";

/**
 * Builds full URL by combining base URL and enabled query parameters
 */
export function buildUrlWithParams(baseUrl: string, queryParams: RequestConfig["queryParams"]): string {
  if (!baseUrl.trim()) return "";
  try {
    const url = new URL(baseUrl);
    const enabledParams = queryParams.filter((p) => p.enabled && p.key.trim().length > 0);

    for (const p of enabledParams) {
      url.searchParams.append(p.key.trim(), p.value);
    }
    return url.toString();
  } catch {
    // If not a valid URL yet, do a simple manual append
    const enabledParams = queryParams.filter((p) => p.enabled && p.key.trim().length > 0);
    if (enabledParams.length === 0) return baseUrl;
    const queryString = enabledParams
      .map((p) => `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(p.value)}`)
      .join("&");
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}${queryString}`;
  }
}

/**
 * Combines manual headers with auth headers
 */
export function resolveHeaders(config: RequestConfig): Record<string, string> {
  const headers: Record<string, string> = {};

  // Custom user headers
  for (const h of config.headers) {
    if (h.enabled && h.key.trim()) {
      headers[h.key.trim()] = h.value;
    }
  }

  // Auth headers
  if (config.auth.type === "bearer" && config.auth.token?.trim()) {
    headers["Authorization"] = `Bearer ${config.auth.token.trim()}`;
  } else if (
    config.auth.type === "basic" &&
    (config.auth.username || config.auth.password)
  ) {
    const credentials = btoa(`${config.auth.username || ""}:${config.auth.password || ""}`);
    headers["Authorization"] = `Basic ${credentials}`;
  }

  // Default content-type for POST/PUT/PATCH with body if not already set
  if (
    ["POST", "PUT", "PATCH"].includes(config.method) &&
    config.bodyContent &&
    !Object.keys(headers).some((k) => k.toLowerCase() === "content-type")
  ) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

/**
 * Executes the HTTP request either directly from the browser or via the Next.js CORS proxy
 */
export async function executeRequest(config: RequestConfig): Promise<ResponseData> {
  const fullUrl = buildUrlWithParams(config.url, config.queryParams);

  if (!fullUrl) {
    throw new Error("URL cannot be empty");
  }

  // Validate URL format
  try {
    new URL(fullUrl);
  } catch {
    throw new Error("Please enter a valid URL (including https:// or http://)");
  }

  const resolvedHeaders = resolveHeaders(config);

  // If proxy mode is enabled, dispatch to our server route
  if (config.useProxy) {
    const startTime = performance.now();
    try {
      const proxyRes = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: fullUrl,
          method: config.method,
          headers: resolvedHeaders,
          body: ["POST", "PUT", "PATCH"].includes(config.method) ? config.bodyContent : undefined,
        }),
      });

      const proxyData = await proxyRes.json();
      return {
        ...proxyData,
        isProxy: true,
      };
    } catch (err: any) {
      const timeMs = Math.round(performance.now() - startTime);
      return {
        status: 0,
        statusText: "Proxy Error",
        timeMs,
        sizeBytes: 0,
        headers: {},
        data: null,
        rawBody: "",
        isJson: false,
        isProxy: true,
        error: err.message || "Failed to reach internal proxy server",
        errorCategory: "network",
        timestamp: Date.now(),
      };
    }
  }

  // Direct client-side fetch
  const startTime = performance.now();
  const fetchOptions: RequestInit = {
    method: config.method,
    headers: resolvedHeaders,
  };

  if (["POST", "PUT", "PATCH"].includes(config.method) && config.bodyContent?.trim()) {
    fetchOptions.body = config.bodyContent;
  }

  try {
    const response = await fetch(fullUrl, fetchOptions);
    const endTime = performance.now();
    const timeMs = Math.round(endTime - startTime);

    // Extract headers
    const headers: Record<string, string> = {};
    response.headers.forEach((val, key) => {
      headers[key] = val;
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

    return {
      status: response.status,
      statusText: response.statusText || (response.ok ? "OK" : "Error"),
      timeMs,
      sizeBytes,
      headers,
      data: parsedData,
      rawBody: rawText,
      isJson,
      isProxy: false,
      timestamp: Date.now(),
    };
  } catch (err: any) {
    const endTime = performance.now();
    const timeMs = Math.round(endTime - startTime);

    const isCorsLikely =
      err instanceof TypeError &&
      (err.message.includes("Failed to fetch") ||
        err.message.includes("NetworkError") ||
        err.message.includes("Load failed"));

    return {
      status: 0,
      statusText: isCorsLikely ? "CORS / Network Error" : "Client Fetch Error",
      timeMs,
      sizeBytes: 0,
      headers: {},
      data: null,
      rawBody: "",
      isJson: false,
      isProxy: false,
      error: isCorsLikely
        ? "Network Error or CORS Restriction. The remote server does not allow direct browser calls from this origin. Try switching on 'Server Proxy' in Settings or click 'Retry with Proxy'."
        : err.message || "Request failed",
      errorCategory: isCorsLikely ? "cors" : "network",
      timestamp: Date.now(),
    };
  }
}
