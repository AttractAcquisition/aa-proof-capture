import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Service worker: only register in production AND outside Lovable preview iframes.
const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();
const isPreviewHost =
  typeof window !== "undefined" &&
  (window.location.hostname.includes("id-preview--") ||
    window.location.hostname.includes("lovableproject.com") ||
    window.location.hostname.includes("lovable.app"));

if (isPreviewHost || isInIframe) {
  // Make sure no stale SW lingers in preview contexts.
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
  }
} else if (import.meta.env.PROD) {
  import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({ immediate: true });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
