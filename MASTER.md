# Ingenium — Master Sheet

Single source of truth for links, IDs, commands, and what went wrong. App = pt-AO study SPA
for the Metodista engineering access exam. Repo dir: `metodista-engineering-prep/`.

## 1. Links & entry points

| What | Where | Status |
| --- | --- | --- |
| **Live app (canonical)** | https://ingenium-ao.vercel.app | ✅ verified 2026-10-09 (200, title shows "Ingenium") |
| Triangles page | https://ingenium-ao.vercel.app/#/triangles | ✅ verified live — 10 cards, 10 drag grips |
| Prep mode switch | app → Perfil → "Modo preparação" | ✅ persists in `state.prep`; path shows "prep · tudo aberto" |
| Old URL (same project, kept working) | https://rota-engenharia.vercel.app | ✅ 200 — still attached; safe to remove later if never shared |
| GitHub repo | https://github.com/Rafael-bulezi/ingenium-ao | ✅ pushed `main` @ `89a2846` (prep mode + #/triangles + app-style home) |
| Local dev | `cd metodista-engineering-prep && node server.js` | runs on `PORT=3311` (used for all QA) |
| QA temp harnesses | `__harness.html` / `__probe.html` served from the app | ❌ never commit — delete before `git add` |

## 2. Confirmed IDs / facts

| Fact | Value |
| --- | --- |
| Vercel project | `ingenium-ao` (`prj_4ouEmI9Q5Fk6m3H7sJuE0rvrazlz`) |
| Vercel team / org | `team_Gffx3LNgFKAN0M0sO4Z0f0zW` (Rafael-bulezi) |
| Deploy mode | Git-connected: **push to `main` → production auto-deploy** (~15 s + build) |
| Vercel CLI auth file (this machine) | `%APPDATA%\com.vercel.cli\Data\auth.json` |
| localStorage key | `metodista-prep-v1` — **never rename** (users' progress lives here) |
| Content | 25 lessons (12 math + 13 physics), **125 ladder questions (5/lesson)**, 12 walkthroughs (math), 10 formulaTri (2 math + 8 physics) + `content/triangles.json` (base + 2 deep levels each), 77 audio MP3s (30 of them `*-tri-*`) |
| Routes | `#/` home · `#/path/:subject` · `#/lesson/:id` · `#/triangles` · `#/test` · `#/profile` |
| State keys | `completed[]`, `practice{}`, `test`, `voiceOff`, **`prep`** (modo preparação: abre todas as lições), **`triDeep{lessonId:0-2}`** (nível expandido de cada triângulo) |

## 3. Repeatable recipes

**Ship a change** — commit → `git push origin main` → wait ~45 s → verify:

```bash
curl -s https://ingenium-ao.vercel.app/ | grep -o "<title>[^<]*</title>"
curl -s https://ingenium-ao.vercel.app/app.js | grep -c "<new-symbol>"
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" https://ingenium-ao.vercel.app/audio/m-algebra-0.mp3
# content counts (ladders/walkthroughs/triangles) via fetch of /content/*.json
```

**Check deploy status** — `node vercel-deps.mjs` (session dir; lists state/sha/url via API).

**Rename GitHub repo** — `gh repo rename ingenium-ao --yes` then `git remote set-url origin ...` then push.

**Rename/move a Vercel *.vercel.app domain** — renaming the project does NOT move the domain; attach it:

```
PATCH /v9/projects/<name>          {"name":"<new>"}
POST  /v10/projects/<new>/domains  {"name":"<new>.vercel.app"}
```

**Mobile QA** — use the mobile-viewport-qa skill harness (same-origin iframe, 390/375/320);
for full-page views use a tall iframe (`h=4200`) + `screenshot({fullPage:true})`.

## 4. Stumbling blocks (what we did wrong)

1. **Vercel rename ≠ domain move.** After `PATCH`ing the project to `ingenium-ao`, the new domain
   404'd (`DEPLOYMENT_NOT_FOUND`) because `rota-engenharia.vercel.app` was an explicitly attached
   domain. Fix: `POST /v10/projects/ingenium-ao/domains {"name":"ingenium-ao.vercel.app"}`. Always
   re-check `<name>.vercel.app` with curl after a rename.
2. **Vercel CLI auth path** is `%APPDATA%\com.vercel.cli\Data\auth.json`, not `...\com.vercel.cli\auth.json`.
3. **`navigate()` leading-slash bug**: `"#/lesson/x"` (typed URL) resolved to home because
   `replace(/^#/,"")` left a slash → `parts[0]=""`. In-app links (`#lesson/x`) were fine, so it hid.
   Fixed to `replace(/^#\/?/,"")`.
4. **Harness scroll targets lie**: with `keep=0` the scroll runs once (y=0 diagnostics). Use the
   default keeper, or let Playwright auto-scroll on click, or use a tall iframe instead of scrolling.
5. **Playwright clicks through the harness iframe are sometimes swallowed** (click "ok", no event).
   Not an app bug — retry, or `locator.press('Enter')` on the focused button (fires a real click).
6. **SDK locator limits**: no `allInnerTexts()`, `scrollIntoViewIfNeeded()`, `boundingBox()`,
   `evaluate()`. Iterate `nth(i).innerText()`; screenshots via `tab.screenshot`; fullPage works.
7. **`body{min-width:320px}`** made every route read +15 px "overflow" in the 320 px probe
   (classic scrollbar → clientWidth 305). Removed it; added `.example-label{flex-wrap:wrap}` for
   ≤520 px. Probe clean at 375 and 320 now.
8. **Screenshot typos aren't typos**: "aqueçer" at 390 px was just Kalam rendering — the JSON said
   "aquecer". Grep the content, don't trust low-res text.
9. **Nested patch paths**: a physics practice string lives at `medium.practice`, not `practice` —
   the first patch silently wrote nothing there. Check the JSON path before string-replacing.
10. **Never commit QA scaffolding**: `__harness.html` / `__probe.html` (SPA server returns 200 for
    deleted paths — a 200 on a deleted file proves nothing; check the body).
11. **`allLessons()` is the catalog, not the details.** Catalog entries carry no `formulaTri` — only
    `lessonDetails[id]` (from `math.json`/`physics.json`) does. The first triangles page rendered
    **0 cards** for exactly this reason. Fix: map catalog → `lessonDetails` when filtering, and let
    `ensureTriData()` load both detail chunks plus `triangles.json`.
12. **`syncTriDeep()` clobbered an in-progress drag.** `document.fonts.ready` (and the resize
    handler) re-sync every card to its *committed* level, so a drag released in that window measured
    0 px and snapped back to closed — looked like "drag doesn't work". Fix: skip the card that is
    currently captured (`triDrag.card === card`).
13. **Harness URL fragment trap**: appending `&diag=1&hq=…` to a URL already ending in `#top` put the
    params *inside the fragment* — the server never saw them, the same cached harness kept loading,
    and every fix looked ignored. Query params go **before** `#`, and the harness document itself
    needs a cache-bust. When Playwright input is untrustworthy, drive the app's own handlers from the
    same-origin harness (`el.dispatchEvent(new PointerEvent(...))`, `el.click()`) — deterministic, and
    it reads real heights/levels.

## 5. Standing constraints

- Reply to Rafael in English; app copy stays pt-AO informal ("tu").
- **No API keys/secrets in output, ever** — scripts read auth files internally and print only results.
- Billable API calls need an explicit ask first; prefer free routes.
- Sandro Curió harvested material = internal study only, never redistribute.
- QA must not play audio in Rafael's browser (seed `voiceOff:true`); use new tabs, leave no mess.
- Temp QA files deleted before any commit.
