# Plan — Tender Document Package Builder (DevFest VC027)

Frontend-only web app: load `requirements.json` + many PDFs → match → check expiry/duplicates → generate one ordered PDF `<tender_id>_Package.pdf` (cover + footers). Bangla/English everywhere.

## Stack
- Vite + React (JS) + Tailwind CSS v4 + `lucide-react` icons — static build, Vercel auto-deploy from GitHub `main`.
- `pdf-lib` — merge, cover/index page, footers, seal. `pdfjs-dist` — page count, damaged/password detection, thumbnails.
- `crypto.subtle` SHA-256 — duplicate detection by content.
- `vitest` — small unit tests for pure logic in `src/lib/`.
- i18n: `src/i18n.js` `{en, bn}` + `useT()`; language in `localStorage` + `?lang=bn` URL param.
- No backend, no secrets.

## Design system (gorgeous + low text)
- **Theme:** indigo → violet → fuchsia gradient hero; white glass cards (`backdrop-blur`, soft shadow, rounded-2xl) on a light slate background with subtle blurred color blobs. Dark mode toggle (remembered).
- **Fonts:** Inter (EN) + Hind Siliguri (BN) from Google Fonts.
- **Status colors:** OK = emerald · Missing = rose · Expired = red · Expiry needed = amber · Not provided = slate · Duplicate = violet. Each chip = icon + 1-2 words.
- **Layout:** sticky top bar (logo, tender ID pill, 🌐 EN/বাং toggle, 🌙 theme) → 4-step **stepper**: ① Tender ② Files ③ Match & Check ④ Generate. Desktop: requirements list (left, wide) + files panel (right). Mobile: stacked.
- **Less text:** icons + short labels, tooltips (`title`) for help, empty states with one-line hint + illustration icon, toasts for errors/success (auto-hide).
- **Feedback:** progress ring "7/10 ready", smooth transitions, hover lift, disabled Generate shows a short reason list.

## Data model (React state, `useReducer`)
- `tender`, `requirements[]` (sorted by `order`)
- `files[]`: `{id, name, size, pages, hash, bytes, dupGroup, error}`
- `matches`: `{reqId: fileId}` · `expiry`: `{reqId: 'YYYY-MM-DD'}`

## Status rules (Problem §5) — pure `getStatus(req, matches, expiry, deadline)`
1. no file → `mandatory ? MISSING (block) : NOT_PROVIDED`
2. `has_expiry` && no date → `EXPIRY_NEEDED` (block)
3. `has_expiry` && date < deadline → `EXPIRED` (block) — YYYY-MM-DD string compare; same day = OK
4. else `OK`

## Features (one at a time → test → commit + push → wait for "next")

### F0 — Scaffold, design, i18n
- Vite React app, Tailwind, fonts, color tokens, dark mode.
- Top bar: app name + icon, EN/বাং toggle, theme toggle; both remembered in `localStorage`; `?lang=` / `?theme=` URL params.
- `i18n.js` with every string in en + bn; `<html lang>` updates.
- Stepper skeleton (4 steps), footer "Frontend only · files never leave your browser".
- `vercel.json` not needed (Vite auto-detected).
- **Test:** `npm run build` OK; toggle EN/BN + reload keeps language.

### F1 — Load tender (4.1)
- Drop zone / button for `requirements.json`; "Try sample" button (loads `public/sample/`).
- Validate JSON: missing `tender` / `requirements` / bad fields → friendly bilingual error toast.
- Tender card: ID, title, entity, bidder, deadline (with "N days left" chip).
- Requirements list sorted by `order`: order number badge, `title_bn`/`title_en` by language, chips "Mandatory/Optional", "⏱ Expiry".
- **Test:** sample loads, 10 items in order; broken JSON shows error.

### F2 — Upload files (4.2, 4.6)
- Multi-file drop zone + picker (`accept=.pdf`), add more any time.
- Each file row: PDF icon, name, size, page count (pdf.js), remove ✕.
- Non-PDF (by type + `%PDF` header) → rejected with clear message (toast + red row note).
- Damaged / password PDF → clear message, not crash (bonus).
- Limits: max 30 files, 50 MB total → message.
- SHA-256 hash → files with same content get violet "Duplicate" badge + "same as <name>".
- **Test:** sample docs: 9 PDFs accepted, PNG rejected, experience_cert pair marked duplicate, page counts right.

### F3 — Match, expiry, status (4.3–4.5)
- Each requirement row: dropdown of uploaded files (shows name + pages); file already used elsewhere is disabled; ↺ undo/clear button.
- Duplicate guard: a file whose duplicate is matched to another document can't be selected (disabled + reason).
- If `has_expiry` and matched → date input appears inline.
- Status chip per row, updates instantly. Summary bar: counts per status + progress ring.
- Files panel shows "→ R05" link chip for matched files.
- **Test:** vitest for `getStatus` (all 5 cases + same-day OK) and duplicate guard; manual: sample → expected statuses.

### F4 — Generate & download (4.7, 4.8, §6)
- Generate button disabled while any blocking status; below it a short list "✖ Trade License — Expired" (click scrolls to row).
- PDF: Page 1 English cover (tender ID, title, entity, bidder, deadline, generated date, ordered list of included docs with page count).
- Docs after cover by `order`, all pages in original order; optional without file skipped.
- Footer every page `<tender_id> | Page X of Y`: each page embedded & scaled ~95% into same-size page with white bottom band → footer never covers content.
- Download `<tender_id>_Package.pdf`; success toast with page total.
- **Test:** generate from sample → open PDF, check order, cover, footer, total pages (1 + 15).

### F5 — Deliverables
- `output/T-2026-0417_Package.pdf` from sample pack.
- `screenshots/` via headless Chrome (status view EN + BN, generate view).
- README complete per Rulebook §9.3.
- **Test:** files exist; Vercel live = latest commit.

### Bonus (priority order, one commit each)
1. **Auto-match** — "✨ Auto-match" button: score file name vs `title_en` keywords (e.g. trade, tin, vat, solvency, experience, technical, financial, declaration); prefers non-expired, skips duplicates; user can undo.
2. **Bad files safe** — finish edge cases from F2 (password/damaged).
3. **Index page** after cover: document → start page.
4. **Save & reopen** — autosave matches/expiry to `localStorage`; export/import project `.json` (files re-attached by hash).
5. **Export checklist CSV** — document, file name, pages, expiry date, status (UTF-8 BOM for Bangla in Excel).
6. **Bangla on cover/index** — render Bangla lines via canvas → PNG embed (correct shaping).
7. **Seal/signature** — upload PNG, choose pages (all / last of each doc / custom), position corner.
8. **AI help** — user's own key, explains statuses (only if time left).

## Time budget (90 min)
F0 12 · F1 8 · F2 12 · F3 15 · F4 15 · F5 8 → ~70 min, rest for bonus. Hard stop: final commit + Vercel check by T+85.
