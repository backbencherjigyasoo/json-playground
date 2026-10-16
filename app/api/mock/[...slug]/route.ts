import { NextRequest, NextResponse } from "next/server";
import { MockEndpoint } from "@/types";

// Server-side in-memory mock registry (persists across hot-reloads and requests)
declare global {
  var _mockEndpoints: MockEndpoint[] | undefined;
}

const DEFAULT_SERVER_MOCKS: MockEndpoint[] = [
  {
    id: "mock-users-sample",
    name: "Get Users List",
    method: "GET",
    path: "users",
    statusCode: 200,
    delayMs: 300,
    headers: [{ id: "h1", key: "Content-Type", value: "application/json", enabled: true }],
    enabled: true,
    createdAt: Date.now(),
    responseBody: JSON.stringify(
      {
        status: "success",
        total: 3,
        users: [
          { id: 1, name: "Aarav Sharma", email: "aarav@example.com", role: "Frontend Lead" },
          { id: 2, name: "Priya Patel", email: "priya@example.com", role: "Product Designer" },
          { id: 3, name: "Rohan Verma", email: "rohan@example.com", role: "DevOps Engineer" },
        ],
      },
      null,
      2
    ),
  },
  {
    id: "mock-auth-login",
    name: "User Login",
    method: "POST",
    path: "auth/login",
    statusCode: 200,
    delayMs: 600,
    headers: [{ id: "h1", key: "Content-Type", value: "application/json", enabled: true }],
    enabled: true,
    createdAt: Date.now(),
    responseBody: JSON.stringify(
      {
        success: true,
        message: "Authentication successful",
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.api_lens_mock_token_sample",
        user: { id: 1, name: "Aarav Sharma", email: "aarav@example.com" },
      },
      null,
      2
    ),
  },
  {
    id: "mock-checkout-error",
    name: "Checkout 500 Error",
    method: "POST",
    path: "cart/checkout",
    statusCode: 500,
    delayMs: 1200,
    headers: [{ id: "h1", key: "Content-Type", value: "application/json", enabled: true }],
    enabled: true,
    createdAt: Date.now(),
    responseBody: JSON.stringify(
      {
        error: "Internal Server Error",
        code: "PAYMENT_GATEWAY_TIMEOUT",
        message: "Simulated payment service timeout for error-state UI testing.",
      },
      null,
      2
    ),
  },
];

export function getMockStore(): MockEndpoint[] {
  if (!globalThis._mockEndpoints) {
    globalThis._mockEndpoints = [...DEFAULT_SERVER_MOCKS];
  }
  return globalThis._mockEndpoints;
}

export function setMockStore(mocks: MockEndpoint[]) {
  globalThis._mockEndpoints = mocks;
}

async function handleMockRequest(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const path = slug.join("/").toLowerCase();
  const method = req.method.toUpperCase();

  const mocks = getMockStore();
  const mock = mocks.find(
    (m) =>
      m.enabled &&
      m.method.toUpperCase() === method &&
      m.path.replace(/^\/+/, "").toLowerCase() === path
  );

  if (!mock) {
    const availablePaths = mocks
      .filter((m) => m.enabled)
      .map((m) => `[${m.method}] /api/mock/${m.path.replace(/^\/+/, "")}`);

    return NextResponse.json(
      {
        error: `No mock route matched for ${method} /api/mock/${path}`,
        availableMockRoutes: availablePaths,
        hint: "Create or enable this mock endpoint in the API Lens Mock Server panel.",
      },
      {
        status: 404,
        headers: {
          "X-Mock-Engine": "API-Lens",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  // Simulate network latency delay
  if (mock.delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, mock.delayMs));
  }

  // Parse custom headers
  const responseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Mock-Engine": "API-Lens",
    "X-Mock-Delay": `${mock.delayMs}ms`,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };

  for (const h of mock.headers || []) {
    if (h.enabled && h.key.trim()) {
      responseHeaders[h.key.trim()] = h.value;
    }
  }

  // Return parsed JSON or raw string
  try {
    const parsed = JSON.parse(mock.responseBody);
    return NextResponse.json(parsed, {
      status: mock.statusCode || 200,
      headers: responseHeaders,
    });
  } catch {
    return new NextResponse(mock.responseBody || "", {
      status: mock.statusCode || 200,
      headers: responseHeaders,
    });
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string[] }> }) {
  return handleMockRequest(req, ctx);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string[] }> }) {
  return handleMockRequest(req, ctx);
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ slug: string[] }> }) {
  return handleMockRequest(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ slug: string[] }> }) {
  return handleMockRequest(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ slug: string[] }> }) {
  return handleMockRequest(req, ctx);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}
