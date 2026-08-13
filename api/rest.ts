const g = globalThis as unknown as { __rest?: number };

function total(): number {
  if (typeof g.__rest !== "number") {
    g.__rest = 4000 + Math.floor(Date.now() / 86_400_000) * 13;
  }
  return g.__rest;
}

export async function GET(): Promise<Response> {
  return Response.json({ total: total() });
}

export async function POST(): Promise<Response> {
  g.__rest = total() + 1;
  return Response.json({ total: g.__rest });
}
