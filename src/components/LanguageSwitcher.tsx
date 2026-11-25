import { useEffect, useMemo, useState } from "react";
import { Globe, Search, X } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          options: Record<string, unknown>,
          element: string,
        ) => void;
      };
    };
  }
}

const languages = [
  ["en", "English"],
  ["hi", "Hindi"],
  ["bn", "Bengali"],
  ["gu", "Gujarati"],
  ["kn", "Kannada"],
  ["ml", "Malayalam"],
  ["mr", "Marathi"],
  ["ne", "Nepali"],
  ["or", "Odia"],
  ["pa", "Punjabi"],
  ["ta", "Tamil"],
  ["te", "Telugu"],
  ["ur", "Urdu"],
  ["ar", "Arabic"],
  ["zh-CN", "Chinese"],
  ["fr", "French"],
  ["de", "German"],
  ["it", "Italian"],
  ["ja", "Japanese"],
  ["ko", "Korean"],
  ["pt", "Portuguese"],
  ["ru", "Russian"],
  ["es", "Spanish"],
] as const;

let translatorPromise: Promise<void> | undefined;

function loadTranslator() {
  if (translatorPromise) return translatorPromise;
  translatorPromise = new Promise((resolve, reject) => {
    const initialise = () => {
      const host = document.getElementById("google_translate_element");
      if (!host || !window.google?.translate?.TranslateElement) return;
      if (!host.querySelector("select.goog-te-combo")) {
        new window.google.translate.TranslateElement(
          { pageLanguage: "en", autoDisplay: false },
          "google_translate_element",
        );
      }
      resolve();
    };
    if (window.google?.translate) {
      initialise();
      return;
    }
    window.googleTranslateElementInit = initialise;
    if (document.getElementById("gt-script")) return;
    const script = document.createElement("script");
    script.id = "gt-script";
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onerror = () =>
      reject(new Error("Translation service could not be loaded"));
    document.body.appendChild(script);
  });
  return translatorPromise;
}

/** A compact, searchable control for the site-wide Google Translate widget. */
export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadTranslator()
      .then(() => setReady(true))
      .catch(() => setReady(false));
  }, []);

  const filtered = useMemo(
    () =>
      languages.filter(([, label]) =>
        label.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  const changeLanguage = async (code: string) => {
    try {
      await loadTranslator();
      const select = document.querySelector<HTMLSelectElement>(
        "#google_translate_element select.goog-te-combo",
      );
      if (!select) throw new Error("Translator is still loading");
      select.value = code;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      setOpen(false);
      setQuery("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Translation is unavailable",
      );
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Change language"
        title="Change language"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-primary text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        <Globe className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-60 w-64 rounded-2xl border border-border bg-card p-3 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Search className="h-4 w-4 text-primary" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search language"
              className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close language menu"
              className="text-muted-foreground hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {ready ? "Choose a language" : "Loading translator…"}
          </p>
          <div className="mt-2 max-h-64 overflow-y-auto">
            {filtered.map(([code, label]) => (
              <button
                key={code}
                type="button"
                onClick={() => changeLanguage(code)}
                disabled={!ready}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-secondary hover:text-primary disabled:cursor-wait disabled:opacity-50"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
