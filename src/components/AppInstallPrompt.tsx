import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** Install control for the Android-ready progressive web app. */
export function AppInstallPrompt() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") setPrompt(null);
  };

  if (installed)
    return <span className="text-xs text-primary">App installed</span>;

  return prompt ? (
    <button
      type="button"
      onClick={install}
      className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      <Download className="h-4 w-4" /> Install Android app
    </button>
  ) : (
    <p className="text-xs text-muted-foreground">
      Android: open this page in Chrome, then choose{" "}
      <strong>Install app</strong> from the browser menu.
    </p>
  );
}
