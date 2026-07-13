<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import Button from "../ui/Button.vue";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const mounted = ref(false);

function close() {
  emit("close");
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && props.open) close();
}

watch(
  () => props.open,
  (isOpen) => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = isOpen ? "hidden" : "";
  },
);

onMounted(() => {
  mounted.value = true;
  window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
  if (typeof document !== "undefined") {
    document.body.style.overflow = "";
  }
});

const steps = [
  {
    n: "01",
    title: "Write or open a link",
    body: "Text tab for quote + author, or open /create?q=…&author=… from a partner site.",
  },
  {
    n: "02",
    title: "Style with tabs",
    body: "Type, Bg, and Tpl (templates). Theme swatches in the toolbar change app chrome only.",
  },
  {
    n: "03",
    title: "Share & download",
    body: "Copy link shares a URL with quote + author prefilled. Download exports a PNG — all in your browser.",
  },
];
</script>

<template>
  <Teleport v-if="mounted" to="body">
    <div
      v-if="open"
      class="howto-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="howto-title"
    >
      <button type="button" class="howto-scrim" aria-label="Close how to use" @click="close" />

      <div class="howto-dialog">
        <div class="howto-header">
          <p class="type-label mb-1.5 text-ink">Hmmm</p>
          <h2 id="howto-title" class="type-modal-title text-ink">How to use</h2>
          <p class="type-body mt-1.5 text-ink/75">Full-screen workspace. Three steps.</p>
        </div>

        <ol class="howto-steps">
          <li v-for="step in steps" :key="step.n" class="howto-step">
            <span class="type-meta w-6 shrink-0 pt-0.5 text-ink/40">{{ step.n }}</span>
            <div class="min-w-0">
              <p class="type-body font-medium text-ink">{{ step.title }}</p>
              <p class="type-body-sm mt-0.5 text-ink/60">{{ step.body }}</p>
            </div>
          </li>
        </ol>

        <div class="howto-footer">
          <Button variant="primary" @click="close">Got it</Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/*
  Explicit layout for Teleport → body (avoids flex/Tailwind width collapse
  when the dialog is a flex item of a row container).
*/
.howto-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
}

.howto-scrim {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  border: none;
  background: rgb(0 0 0 / 0.55);
  cursor: pointer;
}

.howto-dialog {
  position: relative;
  z-index: 10;
  width: min(28rem, calc(100vw - 2rem));
  min-width: min(20rem, calc(100vw - 2rem));
  max-width: 28rem;
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid var(--color-hairline, #e6e6e6);
  background: var(--color-canvas, #fff);
  box-shadow: 0 12px 48px rgb(0 0 0 / 0.16);
  box-sizing: border-box;
}

.howto-header {
  padding: 1.25rem 1.5rem;
  background: var(--color-block-lime, #dceeb1);
}

.howto-steps {
  margin: 0;
  padding: 0.25rem 1.5rem;
  list-style: none;
}

.howto-step {
  display: flex;
  gap: 0.75rem;
  padding: 0.875rem 0;
  border-bottom: 1px solid var(--color-hairline-soft, #f1f1f1);
}

.howto-step:last-child {
  border-bottom: none;
}

.howto-footer {
  display: flex;
  justify-content: flex-end;
  padding: 0.875rem 1.5rem;
  border-top: 1px solid var(--color-hairline-soft, #f1f1f1);
}

@media (max-width: 480px) {
  .howto-overlay {
    justify-content: flex-end;
    padding: 0.75rem;
  }

  .howto-dialog {
    width: 100%;
    max-width: none;
    min-width: 0;
  }
}
</style>
