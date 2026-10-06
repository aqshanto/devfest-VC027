# Tender Document Package Builder · টেন্ডার প্যাকেজ বিল্ডার

A frontend-only web app that helps office staff turn a set of PDF files into **one complete, checked and correctly ordered tender package PDF**. Works fully in Bangla and English.

| | |
|---|---|
| **Name** | Md Abdul Quym Shanto |
| **Registration Number** | VC027 |
| **Live link (HTTPS)** | https://devfest-vc-027.vercel.app/ |
| **Repository** | https://github.com/aqshanto/devfest-VC027 |
| **License** | MIT (see [LICENSE](LICENSE)) |

![Document statuses](screenshots/02-status-problems-en.png)

## How to run

Live: open **https://devfest-vc-027.vercel.app/** in Google Chrome. Nothing to install, no login.

Locally (Node 18+):

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the build
npm test           # unit tests (status rules, duplicate guard, JSON parsing)
```

How to use:
1. **Tender:** load `requirements.json` (or click **Try sample**).
2. **Files:** drop/upload PDF files (many at once).
3. **Match & Check:** choose a file for each required document, enter expiry dates where asked. Statuses update instantly.
4. **Generate:** when nothing is blocking, click **Generate package**. `<tender_id>_Package.pdf` downloads.

Handy URL parameters: `?lang=bn|en`, `?theme=dark|light`, `?sample=1` (auto-load the sample pack), `&demo=problems|ready` (pre-filled matches used for screenshots).

## Main features (all done)

- **4.1 Load the list:** reads `requirements.json`, validates it, shows the tender details and the required documents sorted by `order`.
- **4.2 Upload files:** upload many PDFs at once (drag and drop or picker). Shows file name, page count (pdf.js) and size. A non-PDF is rejected with a clear message (both the extension and the `%PDF` header are checked). Any file can be removed. Limits: 30 files and 50 MB total.
- **4.3 Match files:** a dropdown per document. One file → one document, one document → one file. Change or undo (↺) at any time.
- **4.4 Expiry dates:** a date field appears when `has_expiry = true` and a file is matched. Changing the file clears the old date.
- **4.5 Check everything:** live status per document: **Missing**, **Expiry date needed**, **Expired**, **Not provided**, **OK**. Same day as the deadline counts as OK. There is a summary ring plus counts.
- **4.6 Duplicates:** SHA-256 of the file content finds identical files even with different names. They get a **Duplicate** badge and cannot be matched to different documents.
- **4.7 Make the package:** the Generate button stays disabled while any document is blocking. The reasons are listed, and clicking one scrolls to that document. The PDF has:
  - an English cover page with tender ID, title, procuring entity, bidder, deadline, generation date, and the included documents in order;
  - every page of each document after the cover, sorted by `order`, with optional documents that have no file skipped;
  - the footer `<tender_id> | Page X of Y` on every page, including the cover. Each page is scaled into a reserved bottom band, so the footer never covers content.
- **4.8 Download:** the file is named `<tender_id>_Package.pdf`.
- **4.9 Two languages:** a one-click EN/বাংলা toggle that is remembered in `localStorage`. Every label, button, status, error and instruction is translated, and numbers show as Bangla digits. Document names come from `title_bn` or `title_en`.
- Output: [`output/T-2026-0417_Package.pdf`](output/T-2026-0417_Package.pdf) is built from the sample pack after resolving its problems (16 pages).
- Polished UI: gradient and glass design, dark mode, 4-step stepper, toasts, mobile layout.

### Problems found in the sample pack
- `trade_license_2025.pdf` expired on 2025-06-30, so it shows **Expired**. Use `trade_license_2026.pdf` (valid to 2027-06-30).
- `experience_cert.pdf` and `experience_cert (1).pdf` have identical content, so they are marked **Duplicate**.
- `company_logo.png` is not a PDF, so it is rejected.
- `scan_0042.pdf` is the scanned **Signed Declaration**.
- The file numbers are misleading: `01_financial_proposal` goes at order 9 and `02_technical_proposal` at order 8.
- The optional Audited Financial Statement and Manufacturer's Authorization are not in the pack, so they show **Not provided**.

## Bonus features

- **Handle bad files safely:** damaged or password-protected PDFs show a clear bilingual message instead of crashing.
- _(More bonus features are listed here as they are added.)_

## Known issues

- The date picker shows the browser's own date format (for example mm/dd/yyyy). It is stored as YYYY-MM-DD.
- The PDF cover page is English only (the problem asks for English); Bangla on the cover is a bonus item.
- Each page is scaled to about 96% to make room for the footer, so page content is slightly smaller.
- Download-manager browser extensions (for example IDM) can intercept PDF requests and break **Try sample**. Uploading files by hand still works.

## AI tools used

- **Claude Code (Claude Opus 5.5)**: planning, code generation, testing, git commits and README.

## Most useful prompt

> "F3 from Plan.md: user matches each file to one document and can change/undo, expiry date when has_expiry, status per Section 5 updated instantly, duplicates cannot go to different documents"

This prompt, together with a written `Plan.md` that listed the exact status rules, produced the core checking logic and its unit tests in a single step.

## Tech

Vite + React, Tailwind CSS v4, lucide-react icons, **pdf-lib** (merge, cover, footer), **pdfjs-dist** (page count and bad-file detection), Web Crypto SHA-256, Vitest. Everything runs in the browser. There is no backend and no stored secrets.

## Screenshots

| | |
|---|---|
| ![](screenshots/01-home-en.png) | ![](screenshots/03-status-problems-bn.png) |
| ![](screenshots/04-ready-en.png) | ![](screenshots/05-ready-dark-bn.png) |

Mobile: [screenshots/06-mobile-bn.png](screenshots/06-mobile-bn.png). The screenshots are taken with `node scripts/screenshots.mjs` (headless Chrome).
