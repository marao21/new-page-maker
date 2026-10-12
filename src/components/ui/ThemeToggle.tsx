import React, { useEffect, useState } from "react";
import { Toggle } from "./toggle";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <Toggle
      aria-label="Toggle theme"
      pressed={isDark}
      onPressedChange={setIsDark}
      size="sm"
      className="ml-auto"
    >
      {isDark ? "Dark" : "Light"}
    </Toggle>
  );
}
