import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { SITE } from "./lib/site-config";

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

function seoResponse(request: Request): Response | undefined {
  const url = new URL(request.url);
  const origin = url.origin;
  if (url.pathname === "/robots.txt") {
    return new Response(
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /auth\n\nSitemap: ${origin}/sitemap.xml\n`,
      {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "public, max-age=3600",
        },
      },
    );
  }
  if (url.pathname === "/sitemap.xml") {
    const lastModified = new Date().toISOString().slice(0, 10);
    const urls = [
      { path: "/", priority: "1.0", changefreq: "weekly" },
      {
        path: "/vulnerability-disclosure",
        priority: "0.4",
        changefreq: "monthly",
      },
    ];
    const entries = urls
      .map(
        ({ path, priority, changefreq }) =>
          `  <url>\n    <loc>${origin}${path}</loc>\n    <lastmod>${lastModified}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
      )
      .join("\n");
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
      {
        headers: {
          "content-type": "application/xml; charset=utf-8",
          "cache-control": "public, max-age=3600",
        },
      },
    );
  }
  if (url.pathname === "/.well-known/security.txt") {
    return new Response(
      `Contact: mailto:${SITE.email}\nPolicy: ${origin}/vulnerability-disclosure\nPreferred-Languages: en\n`,
      {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "public, max-age=3600",
        },
      },
    );
  }
}

function secureResponse(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "DENY");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set(
    "permissions-policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  headers.set("cross-origin-resource-policy", "same-origin");
  headers.set(
    "content-security-policy",
    "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'unsafe-inline' https://translate.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://translate.google.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*.supabase.co https://*.google.com https://*.gstatic.com; media-src 'self' https://*.supabase.co; connect-src 'self' https://*.supabase.co https://translate.googleapis.com https://translate.google.com; frame-src 'self' blob: https://translate.google.com;",
  );
  if (/^\/(admin|auth)(?:\/|$)/.test(new URL(request.url).pathname)) {
    headers.set("cache-control", "no-store, private");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function handleTelemetry(request: Request): Promise<Response> {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  if (!request.headers.get("content-type")?.includes("application/json"))
    return new Response(null, { status: 415 });
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 2048) return new Response(null, { status: 413 });
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
      const seo = seoResponse(request);
      if (seo) return secureResponse(request, seo);
      if (new URL(request.url).pathname === "/api/telemetry") {
        return secureResponse(request, await handleTelemetry(request));
      }
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return secureResponse(
        request,
        await normalizeCatastrophicSsrResponse(response),
      );
    } catch (error) {
      console.error(error);
      return secureResponse(
        request,
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
    }
  },
};
