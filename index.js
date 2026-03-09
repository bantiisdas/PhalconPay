// Load Buffer (and other) polyfills before any app or Solana code runs.
import "./src/polyfills";

// Catch "Unable to activate keep awake" unhandled promise rejection (e.g. Android + expo-camera).
if (typeof globalThis !== "undefined") {
  const fn = (e) => {
    const msg = e?.reason?.message ?? e?.message ?? String(e);
    if (typeof msg === "string" && msg.includes("keep awake")) {
      e?.preventDefault?.();
      return true;
    }
    return false;
  };
  if (typeof globalThis.onunhandledrejection !== "undefined") {
    const prev = globalThis.onunhandledrejection;
    globalThis.onunhandledrejection = (e) => {
      if (fn(e)) return;
      prev?.(e);
    };
  }
}

import "@expo/metro-runtime";
import { App } from "expo-router/build/qualified-entry";
import { renderRootComponent } from "expo-router/build/renderRootComponent";

renderRootComponent(App);
