<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const offline = ref(false);
const offlineReady = ref(false);
const needRefresh = ref(false);

function syncOnline() {
  offline.value = !navigator.onLine;
}

function onOfflineReady() {
  offlineReady.value = true;
  window.setTimeout(() => {
    offlineReady.value = false;
  }, 4000);
}

function onNeedRefresh() {
  needRefresh.value = true;
}

function applyUpdate() {
  window.dispatchEvent(new Event("hmmm:pwa-apply-update"));
  needRefresh.value = false;
}

function dismissRefresh() {
  needRefresh.value = false;
}

onMounted(() => {
  syncOnline();
  window.addEventListener("online", syncOnline);
  window.addEventListener("offline", syncOnline);
  window.addEventListener("hmmm:pwa-offline-ready", onOfflineReady);
  window.addEventListener("hmmm:pwa-need-refresh", onNeedRefresh);
});

onUnmounted(() => {
  window.removeEventListener("online", syncOnline);
  window.removeEventListener("offline", syncOnline);
  window.removeEventListener("hmmm:pwa-offline-ready", onOfflineReady);
  window.removeEventListener("hmmm:pwa-need-refresh", onNeedRefresh);
});
</script>

<template>
  <div class="pointer-events-none fixed top-14 right-0 left-0 z-[60] flex flex-col items-center gap-2 px-3">
    <div
      v-if="offline"
      class="pointer-events-auto rounded-pill border border-hairline bg-canvas px-3 py-1.5 shadow-md"
      role="status"
    >
      <p class="type-body-sm text-ink">You’re offline — editor and cached assets still work.</p>
    </div>

    <div
      v-else-if="offlineReady"
      class="pointer-events-auto rounded-pill border border-hairline bg-canvas px-3 py-1.5 shadow-md"
      role="status"
    >
      <p class="type-body-sm text-ink">Ready for offline use.</p>
    </div>

    <div
      v-if="needRefresh"
      class="pointer-events-auto flex items-center gap-2 rounded-pill border border-hairline bg-canvas px-3 py-1.5 shadow-md"
      role="status"
    >
      <p class="type-body-sm text-ink">Update available.</p>
      <button
        type="button"
        class="type-meta rounded-pill bg-primary px-2.5 py-1 text-on-primary"
        @click="applyUpdate"
      >
        Reload
      </button>
      <button type="button" class="type-meta text-ink/50 hover:text-ink" @click="dismissRefresh">
        Later
      </button>
    </div>
  </div>
</template>
