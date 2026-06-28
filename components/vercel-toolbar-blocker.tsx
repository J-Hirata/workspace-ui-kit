"use client";

import { useEffect } from "react";

/**
 * Ctrl+Space がVercelツールバーを開くのを防ぐ。
 * 音声入力など、Ctrl+Spaceを使うアプリとの競合を避けるため。
 */
export function VercelToolbarBlocker() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Space") {
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, []);

  return null;
}
