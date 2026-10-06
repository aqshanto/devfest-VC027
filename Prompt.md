# Prompt.md — prompts used (for commits & README)

| # | Step | Prompt |
|---|------|--------|
| P0 | Setup | "Brief the problem in Bangla, then make Plan.md, CLAUDE.md, Prompt.md, agent.md as I described earlier." |
| F0 | Scaffold + i18n | "next" (build F0 from Plan.md: scaffold, gorgeous design system, EN/BN toggle remembered, theme toggle, stepper) |
| F1 | Tender load | "পরের feature F1 (Tender load) suru koro" |
| F2 | Upload + duplicates | "next" (F2 from Plan.md: multi PDF upload, page count, reject non-PDF, remove, SHA-256 duplicates, limits) |
| F3 | Match + expiry + status | "next" (F3 from Plan.md: match files to documents, expiry dates, live statuses, duplicate guard, summary ring, unit tests) |
| F4 | Generate + download | "next" (F4 from Plan.md: Generate disabled with reasons, English cover page, docs in order, footer "<tender_id> | Page X of Y" not covering content, download <tender_id>_Package.pdf) |
| F5 | Deliverables | "next" (F5: screenshots with headless Chrome into screenshots/, output PDF, full README per Rulebook 9.3) |
| B1 | Auto-match | "next" (Bonus 1: auto-match files to documents from file names, with undo) |
| B1b | Wrong-file warning | "ami jokhon TIN certificate e onno kono document dissilam eta seta ke thik ase dhore nissilo. eta ki ekta problem na ?" |
| B2 | Index page | "next" (Bonus 2: index page after the cover showing the page number where each document starts) |
| B3 | CSV export | "ami save/reopen chassi na. sudhu CSV checklist export feature ta add koro" |
| UX | Preview + Download | "generate package option e click korlei duita option show kore ekta holo preview, arekta download ... ar generate package er onno kono icon use kora jabe na ?" |
| B4 | Smart Read | "ami chassi 1 number ta korte" (Smart Read: read PDF text to detect document type and expiry date, used by auto-match and one-click date suggestions) |
| B5 | Thumbnails | "tmi add koro" (page-1 thumbnails in the file list) |
| B6 | Bangla on PDF | "next" (Bangla text shown correctly on the PDF cover/index page) |
| B7 | Seal / signature | "next" (Bonus: seal or signature - user uploads a PNG image and places it on chosen pages) |
| B8 | Save & reopen | "as save and reopen feature is in the official page then lets add this too. and check the gitignore." |

Most useful prompt (for README): _to be chosen at the end._
