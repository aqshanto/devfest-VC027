# CLAUDE.md

Contest project (AI DevFest Vibe Coding, 90 min). Read `Plan.md` first.

## Rules (never break)
- Frontend only. No backend, serverless, Firebase/Supabase. All PDF processing in browser.
- No secrets/API keys in repo or live site, ever.
- Every UI string (label, button, status, error, instruction) goes through `t()` with both `en` and `bn` in `src/i18n.js`. No hard-coded user text.
- Commit message format:
  ```
  <type>: <short change summary>

  Prompt: "<prompt the user gave for this change>"
  ```
  NO `Co-Authored-By` trailer (user does not want the Claude avatar on commits).
  Use `Manual edit` instead of the prompt if no AI was used. Never force push / rebase / amend pushed commits.
- One feature per commit, push after each. Commit at least every 30 min.
- Work stops at T+90.

## Commands
- `npm install` · `npm run dev` · `npm run build` · `npm run preview`

## Style
- React function components, hooks, plain JS. Tailwind utility classes. Keep components small in `src/components/`.
- Pure logic (status, duplicates, package build) in `src/lib/` so it can be tested quickly.
- Gorgeous, clean UI: soft gradients, cards, clear status colors (red Missing/Expired, amber Expiry needed, gray Not provided, green OK). Mobile friendly. Bangla font: Hind Siliguri / Noto Sans Bengali (Google Fonts).

## Working with the user
- Reply in Bangla, short. After each feature: 5 lines (what was added, bugs?, ok to go next?). Wait for "next".
