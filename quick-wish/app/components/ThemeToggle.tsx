"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

const STORAGE_KEY = "quickwish_theme";
const SYNC_EVENT = "quickwish:theme";

type ThemeChoice = "light" | "dark" | "system";

const isThemeChoice = (value: string | null): value is ThemeChoice =>
  value === "light" || value === "dark" || value === "system";

const applyTheme = (choice: ThemeChoice) => {
  const dark =
    choice === "dark" ||
    (choice === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
};

const OPTIONS: { value: ThemeChoice; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light mode" },
  { value: "dark", icon: Moon, label: "Dark mode" },
  { value: "system", icon: Monitor, label: "Use system theme" },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeChoice | null>(null);

  useEffect(() => {
    let stored: ThemeChoice = "system";
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      stored = isThemeChoice(raw) ? raw : "system";
    } catch {
      // Storage unavailable — default to system.
    }

    setTheme(stored);
    applyTheme(stored);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      const current = localStorage.getItem(STORAGE_KEY);
      if (!isThemeChoice(current) || current === "system") {
        applyTheme("system");
      }
    };
    media.addEventListener("change", onSystemChange);

    // Keep multiple toggles (desktop + mobile) in sync.
    const onSync = (event: Event) => {
      const detail = (event as CustomEvent<{ theme?: ThemeChoice }>).detail;
      if (detail?.theme && isThemeChoice(detail.theme)) {
        setTheme(detail.theme);
      }
    };
    window.addEventListener(SYNC_EVENT, onSync);

    return () => {
      media.removeEventListener("change", onSystemChange);
      window.removeEventListener(SYNC_EVENT, onSync);
    };
  }, []);

  const choose = (next: ThemeChoice) => {
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable — theme still applies for this session.
    }
    window.dispatchEvent(
      new CustomEvent(SYNC_EVENT, { detail: { theme: next } })
    );
  };

  return (
    <div
      className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] p-0.5"
      role="group"
      aria-label="Theme"
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => choose(value)}
          aria-pressed={theme === value}
          aria-label={label}
          title={label}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 ${
            theme === value
              ? "bg-[color:var(--wine)] text-[color:var(--ivory)]"
              : "text-[color:var(--muted)] hover:text-[color:var(--plum)]"
          }`}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}
