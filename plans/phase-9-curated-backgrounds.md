# Phase 9 — Curated backgrounds (zero backend)

**Goal:** Richer, offline-friendly backgrounds **without any stock API, proxy, or URL paste**. Expand local assets and polish **upload** only.

**Depends on:** Phase 2 (Bg panel, gallery, upload, blur, filters)  
**Status:** Complete

**Replaces:** Earlier Unsplash draft. **No** remote search. **No** paste-image-URL (CORS breaks PNG export).

---

## Product principles

| Do | Don’t |
|----|--------|
| Ship photos + SVGs in `public/backgrounds/` | Call Unsplash / Pexels / any stock API |
| Keep upload client-side (blob URLs) | Paste external image URLs |
| Work offline after first visit (PWA precache) | Require a server key or proxy |
| Document licenses in `CREDITS.md` | Rely on hotlinking |

---

## Delivered

### Photo pack
- 12 local JPEGs (nature, texture, urban, dark, paper) + 12 SVG abstracts
- Credits in `public/backgrounds/CREDITS.md`

### Gallery model
- `GalleryItem.pack` + chips: All | Abstract | Nature | Texture | Urban | Dark | Paper
- Last pack remembered in `sessionStorage`

### Upload polish
- Drag-and-drop zone + click to browse
- Filename chip + **Remove** when upload is active
- Clear copy: stays on device; no server upload
- Max 15 MB / max edge 2000px (unchanged)

### Templates
- Editorial serif → paper photo  
- Ocean calm → ocean waves photo  
- New **Summit** template → mountains photo  

### Docs
- README backgrounds section  
- Phase 2 cross-link  

---

## Acceptance criteria

1. [x] Browse abstract SVGs and photo JPGs offline after cache  
2. [x] Pack chips filter without network  
3. [x] Upload works; no URL input  
4. [x] Export works for gallery photos and uploads (same-origin / blob)  
5. [x] `CREDITS.md` documents third-party photos  
6. [x] Zero backend / no API keys  

---

## Out of scope (still)

- Stock APIs  
- Paste image URL  
- Server-side storage  
- Procedural mesh generators  
- WebP thumb variants (optional later if PWA size becomes an issue)  
