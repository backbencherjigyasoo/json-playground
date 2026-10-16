import { NextRequest, NextResponse } from "next/server";
import { setMockStore, getMockStore } from "../[...slug]/route";

export async function POST(req: NextRequest) {
  try {
    const { mocks } = await req.json();
    if (Array.isArray(mocks)) {
      setMockStore(mocks);
      return NextResponse.json({ success: true, count: mocks.length });
    }
    return NextResponse.json({ error: "Invalid mocks payload" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const current = getMockStore();
  return NextResponse.json({ mocks: current });
}
