export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FASTAPI_ORIGIN = process.env.FASTAPI_INTERNAL_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  const body = await request.text();
  const authorization = request.headers.get("authorization");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180000);

  try {
    const response = await fetch(`${FASTAPI_ORIGIN}/api/ai-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body,
      cache: "no-store",
      signal: controller.signal,
    });
    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown error";
    return Response.json(
      {
        reply: "AI 请求超时或代理失败。请稍后再试，或先使用疼痛替换、训练计划和饮食记录模块继续排查。",
        provider: "next_proxy_error",
        model: "unavailable",
        used_api: false,
        warning: detail,
      },
      { status: 200 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
