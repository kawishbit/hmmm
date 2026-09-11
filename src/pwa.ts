import { registerSW } from "virtual:pwa-register";

const UPDATE_INTERVAL_MS = 5 * 60 * 1000;
const CHECK_DEBOUNCE_MS = 2_000;

/**
 * Register the service worker (prompt on update).
 * Emits window events so UI can show offline / update state.
 */
export function initPwa() {
  if (typeof window === "undefined") return;

  let registration: ServiceWorkerRegistration | undefined;
  let lastCheckAt = 0;

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      window.dispatchEvent(new CustomEvent("hmmm:pwa-need-refresh"));
    },
    onOfflineReady() {
      window.dispatchEvent(new CustomEvent("hmmm:pwa-offline-ready"));
    },
    onRegisteredSW(_url, reg) {
      registration = reg;
      if (!registration) return;

      const checkForUpdate = () => {
        const now = Date.now();
        if (now - lastCheckAt < CHECK_DEBOUNCE_MS) return;
        lastCheckAt = now;
        void registration?.update();
      };

      setInterval(checkForUpdate, UPDATE_INTERVAL_MS);

      const onVisible = () => {
        if (document.visibilityState === "visible") checkForUpdate();
      };

      document.addEventListener("visibilitychange", onVisible);
      window.addEventListener("focus", checkForUpdate);

      // Initial check shortly after registration (covers already-waiting SW)
      checkForUpdate();
    },
  });

  window.addEventListener("hmmm:pwa-apply-update", () => {
    void updateSW(true);
  });
}

// Auto-init when loaded as a module script from BaseLayout
initPwa();
