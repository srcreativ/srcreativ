import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (
    request: Request,
    env: unknown,
    ctx: unknown,
  ) => Promise<Response> | Response;
};

type TelemetryPayload = {
  name?: unknown;
  path?: unknown;
  detail?: unknown;
};

async function handleTelemetry(request: Request): Promise<Response> {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  try {
    const payload = (await request.json()) as TelemetryPayload;
    const name =
      typeof payload.name === "string" ? payload.name.slice(0, 40) : "unknown";
    const path =
      typeof payload.path === "string" ? payload.path.slice(0, 200) : "/";
    const detail =
      typeof payload.detail === "string"
        ? payload.detail.slice(0, 240)
        : undefined;
    console.log(
      JSON.stringify({
        event: "client_telemetry",
        name,
        path,
        detail,
        at: new Date().toISOString(),
      }),
    );
  } catch {
    return new Response(null, { status: 400 });
  }
  return new Response(null, {
    status: 204,
    headers: { "cache-control": "no-store" },
  });
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(
  response: Response,
): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(
    consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`),
  );
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as {
      unhandled?: unknown;
      message?: unknown;
    };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      if (new URL(request.url).pathname === "/api/telemetry") {
        return handleTelemetry(request);
      }
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
