# agent.md — Agent workflow

1. Read `CLAUDE.md` + `Plan.md`.
2. Take the next unchecked feature from `Plan.md`.
3. Implement only that feature. All strings via i18n (en + bn).
4. Minimal test: `npm run build` passes; quick check of the feature logic (sample pack in `public/sample/`).
5. Commit with the format in `CLAUDE.md` (include the user's prompt) and `git push`.
6. Report to user in Bangla in 5 lines; wait for "next".

## Final checklist (before T+90)
- [ ] `npm run build` OK, Vercel live = latest commit
- [ ] README has all §9.3 fields
- [ ] LICENSE = MIT, Md Abdul Quym Shanto
- [ ] `output/T-2026-0417_Package.pdf` present
- [ ] `screenshots/` has status screenshot
- [ ] All commit messages contain prompt
- [ ] Bangla/English toggle works and is remembered
- [ ] No secrets (`git grep -i "key\|token\|secret"`)
