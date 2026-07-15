# Task: Integrate Hmmm quote-framer into this app

## Goal
In the relevant section of this app (quotes / quote detail / translation UI — wherever primary quote, optional second line/translation, and author are available), add a **double-quotation-mark** control. On click, open the **Hmmm** quote image tool in a **new browser tab**, prefilled with that content.

## Product being linked
- **Hmmm** — PWA for framing quotes as shareable images
- Open path: `/create` (or `/` — both host the editor)
- Prefill via query string (client-side; no API key)

## Deep-link contract (Hmmm)

| Param    | Maps to in Hmmm         | Meaning                                   | Cap        |
|----------|-------------------------|-------------------------------------------|------------|
| `q`      | primary quote           | Main quote text                           | 1300 chars |
| `q2`     | secondary / translation | Optional second line (omit if empty)      | 1300 chars |
| `author` | author                  | Attribution (omit if empty)               | 100 chars  |

**Notes for integrators:**
- Param names are **`q`**, **`q2`**, **`author`** — not `q1`. Primary is always `q`.
- Values may be **plain URL-encoded text** or Hmmm’s share encoding: `b64.` + base64url (no padding). Plain text is fine for partners.
- Markup is treated as plain text (not executed). Do not inject HTML.
- Long strings are clamped on Hmmm’s side; prefer sending already-trimmed text.
- After load, Hmmm strips these params from the address bar (history replace).

### URL shape
```
{HMMM_ORIGIN}/create?q={encodeURIComponent(primary)}&q2={encodeURIComponent(secondary)}&author={encodeURIComponent(author)}
```
- Include `q2` / `author` only when non-empty after trim.
- Always open with `target="_blank"` and `rel="noopener noreferrer"`.

### Config
- Base URL must be configurable (env / config), e.g.:
  - local: `http://localhost:4321`
  - prod: `https://<your-hmmm-host>`
- Do **not** hardcode a single host in multiple places; one constant or env key (e.g. `HMMM_URL` / `VITE_HMMM_ORIGIN`).

## UI requirements

1. **Icon**
   - Add an accessible control (button or link-styled button) with a **double quotation marks** SVG icon in the section that shows the quote (list item actions, detail header, share row, etc.).
   - Prefer an inline SVG (or existing icon set if it has “quote” / `format_quote` / similar). Suggested minimal SVG (24×24, `currentColor`):

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M7.17 6C5.42 6 4 7.42 4 9.17V14h5.5V9.17C9.5 7.42 8.08 6 6.33 6H7.17zm9.66 0C15.08 6 13.66 7.42 13.66 9.17V14H19.16V9.17C19.16 7.42 17.74 6 16 6h.83z"/>
</svg>
```
   (Feel free to use a cleaner double-quote glyph from the design system if one exists.)

2. **Placement**
   - Same section / card / toolbar as the quote content so users understand “frame this quote”.
   - Match existing icon-button size, spacing, hover/focus styles.

3. **Accessibility**
   - Visible or `aria-label`: e.g. “Open in Hmmm” or “Create quote image”.
   - Keyboard focusable; works with Enter/Space if it’s a `<button>`.

4. **Click behavior**
   - Read from the current entity/state (not hard-coded sample text):
     - primary quote → `q`
     - second line / translation (if present) → `q2`
     - author / source name (if present) → `author`
   - Build URL as above; open new tab via `window.open(url, "_blank", "noopener,noreferrer")` **or** `<a href="..." target="_blank" rel="noopener noreferrer">`.
   - If primary quote is empty/whitespace-only: do not open; optionally toast/disable the control.

## Implementation checklist

- [ ] Config for Hmmm origin
- [ ] Small pure helper: `buildHmmmCreateUrl({ q, q2?, author? }) → string`
- [ ] Unit test for helper (encoding, omitting empty `q2`/`author`, empty `q` guard)
- [ ] Icon control wired to real quote data in the UI
- [ ] New tab + `noopener`
- [ ] No secrets / no server proxy required

## Example helper (TypeScript)

```ts
export function buildHmmmCreateUrl(
  origin: string,
  fields: { q: string; q2?: string; author?: string },
): string | null {
  const q = fields.q.trim();
  if (!q) return null;
  const base = origin.replace(/\/$/, "");
  const params = new URLSearchParams();
  params.set("q", q);
  const q2 = fields.q2?.trim();
  if (q2) params.set("q2", q2);
  const author = fields.author?.trim();
  if (author) params.set("author", author);
  return `${base}/create?${params.toString()}`;
}

// usage
const url = buildHmmmCreateUrl(import.meta.env.VITE_HMMM_ORIGIN, {
  q: quote.primaryText, // map from this app’s fields
  q2: quote.translation, // optional
  author: quote.authorName, // optional
});
if (url) window.open(url, "_blank", "noopener,noreferrer");
```

## Out of scope
- Embedding Hmmm in an iframe
- Passing layout/theme/template (Hmmm deep link is text-only for now)
- Uploading images or posting back to this app

## Acceptance criteria
1. Quote section shows a double-quote icon control.
2. Click opens Hmmm `/create` in a new tab with correct `q` / `q2` / `author`.
3. Empty translation or author → param omitted.
4. Empty primary quote → no navigation (control disabled or no-op).
5. Origin comes from config/env, not scattered literals.
