"use client";

import { useEffect, useState } from "react";

const TEXT_SIZES = [
  { value: "normal", shortLabel: "A", label: "Use normal text size" },
  { value: "large", shortLabel: "A+", label: "Use large text size" },
  { value: "extra-large", shortLabel: "A++", label: "Use extra large text size" }
] as const;

type TextSize = (typeof TEXT_SIZES)[number]["value"];
const STORAGE_KEY = "plantmind.text-size";

function isTextSize(value: string | null): value is TextSize {
  return TEXT_SIZES.some((size) => size.value === value);
}

export function TextSizeSwitcher() {
  const [textSize, setTextSize] = useState<TextSize>("normal");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial = isTextSize(stored) ? stored : "normal";
    queueMicrotask(() => setTextSize(initial));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-text-size", textSize);
  }, [textSize]);

  const selectTextSize = (next: TextSize) => {
    setTextSize(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <div className="text-size-switcher" role="group" aria-label="Interface text size">
      {TEXT_SIZES.map((size) => (
        <button
          type="button"
          key={size.value}
          aria-label={size.label}
          aria-pressed={textSize === size.value}
          onClick={() => selectTextSize(size.value)}
        >
          {size.shortLabel}
        </button>
      ))}
    </div>
  );
}
