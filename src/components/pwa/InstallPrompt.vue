<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const DISMISS_KEY = "hmmm-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const deferred = ref<BeforeInstallPromptEvent | null>(null);
const visible = ref(false);

function onBeforeInstall(e: Event) {
  e.preventDefault();
  try {
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
  } catch {
    /* ignore */
  }
  deferred.value = e as BeforeInstallPromptEvent;
  visible.value = true;
}

async function install() {
  const ev = deferred.value;
  if (!ev) return;
  await ev.prompt();
  try {
    await ev.userChoice;
  } catch {
    /* ignore */
  }
  deferred.value = null;
  visible.value = false;
}

function dismiss() {
  visible.value = false;
  deferred.value = null;
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* ignore */
  }
}

onMounted(() => {
  window.addEventListener("beforeinstallprompt", onBeforeInstall);
});

onUnmounted(() => {
  window.removeEventListener("beforeinstallprompt", onBeforeInstall);
});
</script>

<template>
  <div
    v-if="visible"
    class="install-prompt"
    role="dialog"
    aria-label="Install Hmmm"
  >
    <div class="flex items-start gap-3">
      <img
        src="/icons/icon-192.png"
        alt=""
        width="40"
        height="40"
        class="size-10 shrink-0 rounded-lg"
        decoding="async"
      />
      <div class="min-w-0 flex-1">
        <p class="type-body font-medium text-ink">Install Hmmm</p>
        <p class="type-body-sm mt-1 text-ink/60">
          Add to your home screen for a full-screen, offline-friendly workspace.
        </p>
      </div>
    </div>
    <div class="mt-3 flex items-center justify-end gap-2">
      <button type="button" class="type-meta px-2 py-1 text-ink/50 hover:text-ink" @click="dismiss">
        Not now
      </button>
      <button
        type="button"
        class="type-meta rounded-pill bg-primary px-3 py-1.5 text-on-primary hover:opacity-90"
        @click="install"
      >
        Install
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Explicit sizing — max-w utilities alone can collapse under some theme/layout combos */
.install-prompt {
  position: fixed;
  z-index: 60;
  right: 0.75rem;
  bottom: 1rem;
  box-sizing: border-box;
  width: min(20rem, calc(100vw - 1.5rem));
  min-width: min(16rem, calc(100vw - 1.5rem));
  max-width: 20rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-hairline, #e6e6e6);
  background: var(--color-canvas, #fff);
  box-shadow: 0 8px 32px rgb(0 0 0 / 0.12);
}

@media (min-width: 640px) {
  .install-prompt {
    right: 1rem;
    bottom: 1.5rem;
  }
}
</style>
