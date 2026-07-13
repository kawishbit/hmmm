import { registerSW } from "virtual:pwa-register";

/**
 * Register the service worker (auto-update).
 * Emits window events so UI can show offline / update state.
 */
export function initPwa() {
  if (typeof window === "undefined") return;

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      window.dispatchEvent(new CustomEvent("hmmm:pwa-need-refresh"));
    },
    onOfflineReady() {
      window.dispatchEvent(new CustomEvent("hmmm:pwa-offline-ready"));
    },
    onRegisteredSW(_url, registration) {
      // Periodic update check while tab is open
      if (registration) {
        setInterval(
          () => {
            void registration.update();
          },
          60 * 60 * 1000,
        );
      }
    },
  });

  window.addEventListener("hmmm:pwa-apply-update", () => {
    void updateSW(true);
  });
}

// Auto-init when loaded as a module script from BaseLayout
initPwa();
