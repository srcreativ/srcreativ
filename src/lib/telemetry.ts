type TelemetryEvent = {
  name: "page_view" | "client_error" | "unhandled_rejection";
  path: string;
  detail?: string;
};

function sanitizeDetail(value: unknown) {
  const message = value instanceof Error ? value.message : String(value ?? "");
  return message.replace(/[\r\n]+/g, " ").slice(0, 240);
}

function send(event: TelemetryEvent) {
  const body = JSON.stringify(event);
  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/telemetry",
      new Blob([body], { type: "application/json" }),
    );
    return;
  }
  void fetch("/api/telemetry", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

/** Records only route and short error messages—never form data or credentials. */
export function startTelemetry() {
  const page = () => window.location.pathname.slice(0, 200);
  send({ name: "page_view", path: page() });
  window.addEventListener("error", (event) =>
    send({
      name: "client_error",
      path: page(),
      detail: sanitizeDetail(event.error ?? event.message),
    }),
  );
  window.addEventListener("unhandledrejection", (event) =>
    send({
      name: "unhandled_rejection",
      path: page(),
      detail: sanitizeDetail(event.reason),
    }),
  );
}
