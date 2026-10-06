# Plan — Tender Document Package Builder (DevFest VC027)

Frontend-only web app: load `requirements.json` + many PDFs → match → check expiry/duplicates → generate one ordered PDF `<tender_id>_Package.pdf` (cover + footers). Bangla/English everywhere.

## Stack
- Vite + React (JS) + Tailwind CSS v4 — static build, deploy on Vercel (auto-deploy from GitHub `main`).
- `pdf-lib` — merge PDFs, cover/index page, footers, seal.
- `pdfjs-dist` — page count, damaged/password detection, thumbnails.
- `crypto.subtle.digest('SHA-256')` — duplicate detection by content.
- i18n: own `i18n.js` dictionary `{en, bn}` + `useT()` hook; language saved in `localStorage` (`lang`), also `?lang=bn` URL param.
- No backend, no secrets. AI key (bonus) typed by user, kept only in memory/sessionStorage.

## Data model (React state)
- `tender` + `requirements[]` (sorted by `order`)
- `files[]`: `{id, name, size, pages, hash, bytes, error, dupOf}`
- `matches`: `{reqId: fileId}` (1 file ↔ 1 req)
- `expiry`: `{reqId: 'YYYY-MM-DD'}`

## Status rules (Problem §5) — pure function `getStatus(req)`
1. no file → `mandatory ? MISSING (block) : NOT_PROVIDED`
2. `has_expiry` and no date → `EXPIRY_NEEDED` (block)
3. `has_expiry` and date < deadline → `EXPIRED` (block) (string compare YYYY-MM-DD; same day = OK)
4. else `OK`
Duplicates: same SHA-256 → badge "Duplicate" in file list; a file whose duplicate is already matched to another req cannot be matched.

## Package rules (Problem §6)
- Page 1 cover (English): tender ID, title, entity, bidder, deadline, generated date, ordered list of included docs.
- Then docs by `order`, all pages, original order; skip optional without file.
- Footer on every page `<tender_id> | Page X of Y`: each source page is embedded and scaled down ~4% into a same-size page, leaving a white bottom band for the footer → never covers content.

## Sample pack traps (found)
- `trade_license_2025.pdf` expires 2025-06-30 → Expired; use `trade_license_2026.pdf` (2027-06-30).
- `experience_cert.pdf` and `experience_cert (1).pdf` same content → duplicate.
- `company_logo.png` → not a PDF, reject (use as seal for bonus).
- `scan_0042.pdf` = image scan of Signed Declaration (R10).
- `01_financial_proposal` / `02_technical_proposal` numbered opposite to tender order (Tech = 8, Fin = 9).
- Bank solvency expires 2026-12-31 → OK. R06, R07 optional → Not provided.

## Features (one at a time, commit + push each, wait for "next")
| # | Feature | Covers |
|---|---------|--------|
| F0 | Scaffold, design system, header, i18n + remembered toggle, Vercel config | 4.9 |
| F1 | Load `requirements.json` (file picker + drag), tender card, sorted list, "Try sample" | 4.1 |
| F2 | Upload many PDFs, page count, non-PDF reject, remove, SHA-256 duplicates, 30 files/50 MB limit, bad-file safe | 4.2, 4.6 |
| F3 | Match UI (select per requirement), change/undo, expiry date input, live status badges + summary | 4.3–4.5 |
| F4 | Generate button (disabled + reasons), cover + footer PDF, download `<id>_Package.pdf` | 4.7, 4.8, §6 |
| F5 | `output/T-2026-0417_Package.pdf`, `screenshots/`, README §9.3 complete | §9 |

### Bonus (priority order)
1. Auto-match by file name
2. Bad files safe (damaged / password PDF message) — mostly in F2
3. Index page after cover (start page per doc)
4. Save & reopen (localStorage autosave + export/import project JSON)
5. Export checklist CSV
6. Bangla text on cover/index (render via canvas → PNG embed)
7. Seal/signature PNG on chosen pages
8. AI help with user's own API key (only if time left)

## Time budget (90 min)
F0 10 · F1 8 · F2 12 · F3 15 · F4 15 · F5 8 → ~70 min, buffer for bonus. Hard stop: final commit + Vercel check by T+85.
