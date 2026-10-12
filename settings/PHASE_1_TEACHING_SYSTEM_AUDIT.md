# Phase 1 — Teaching-System Repository and App Audit

**Date:** 2026-10-12  
**Status:** Phase 1 complete. This audit records the existing implementation before architectural changes. **No application code or learner content was changed in this phase.**  
**Audited repository:** `Rafael-bulezi/ingenium-ao`, branch `main`, HEAD `d077c17` (`Add lesson storyboard visual reference`).  
**Production app:** https://ingenium-ao.vercel.app/

## Executive summary

Ingenium already has a working, recognizable dotted-paper canvas, bilingual lesson content, step controls, question doodles, practice and saved progress. The previous guide pass added an intuition hook, symbol glossary and reasoned steps to all 26 lessons. This is a strong base to build on—not a reason to replace the app.

The main mismatch with the desired experience is **lesson sequencing and presentation**. A lesson currently renders as one long page. Its introduction, formula and symbol glossary appear together before the worked example; the example's internal steps can be revealed, but concept, visual explanation, general rule and practice are not separate guided stages. The lesson-level progress indicator and persistent Previous / audio / Next navigation from the storyboard do not exist yet. The current idea panel is also a large dark navy block with a bright green-accented formula strip, which conflicts with the requested natural, light formula treatment.

Recommended next move: establish the reusable design tokens and stage shell as Phase 2, preserving existing routes, state, practice, audio and canvas. Then validate the pattern on representative lessons before migrating broadly.

## What is in the repository

The app is a small static web application: `index.html` loads a single vanilla JavaScript application (`app.js`) and a global stylesheet (`styles.css`). Navigation uses hash routes; content is fetched as JSON in lazy-loaded chunks. `package.json` has only a `start` script and there is no committed automated test suite or test runner configuration. The Vercel deployment serves the static app.

The data currently contains **13 Mathematics and 13 Physics lessons**, with Portuguese and English mirrors. Each lesson has guide content, a medium practice variant and a practice ladder. All 13 Mathematics lessons have structured canvas walkthrough steps. Physics has no `walkthrough` fields; its 13 worked examples use the separate staged text-panel renderer driven by the guide data. Both locale datasets contain 156 lesson-practice records; 11 have optional question doodles. The timed quiz has 11 questions in each language, of which 7 have a doodle. Additional app content includes 10 formula-triangle topics, 40 shortcuts, and 162 audio files.

## Existing systems and reuse points

| Area | Current implementation | Implication for rollout |
|---|---|---|
| Routing and content loading | Hash routes in `app.js`; JSON chunks load on demand. | Keep the routes and extend existing lesson data/rendering; avoid a parallel app or course engine. |
| Lesson composition | `renderLesson()` emits a single long scroll: idea card → optional formula triangle → worked example → practice/ladder → completion and previous/next. | A stage shell must re-sequence this content without losing access to the existing parts. |
| Guide data | `guide.hook`, `guide.symbols`, and `guide.steps[]` exist for all 26 lessons in both languages. | Reuse these fields first; audit when the formula, symbols, or rule should appear rather than displaying all of them at the opening. |
| Mathematics canvas | `walkthrough.steps`, `quadroModel()`, SVG overlays/notes, step chips, previous/reveal/show-all/replay, voice controls and full-screen mode. | Preserve the actual canvas and its step state. Retain canvas annotations alongside the explanation that they support. |
| Physics examples | `guidedPhysicsCard()` reveals `guide.steps[]` as a handwritten-style line plus a rationale. | It is a useful staged fallback but does not yet provide the evolving subject-specific diagrams/audio behavior of the Mathematics canvas. |
| Question visuals | `renderQuestionDoodle()` creates SVG variants, including equation, vectors, sequence, function, probability, rectangle, motion, forces and circuit. | Build on the deterministic SVG approach; maintain text alternatives and do not reveal answers. |
| Practice/assessment | Lesson practice includes typed/multiple-choice modes, hints, reveal, medium variants and ladders. The quiz is timed at 20 minutes and has 11 questions. | Keep answer validation, feedback, timer and answer state working through navigation changes. |
| Persistence/language | State is stored in `localStorage` under `ingenium-prep-v1`, with legacy-key migration; PT/EN content and UI exist. | Keep saved progress and language stable while adding stage position; validate reload/resume and both locales. |
| Audio | `audioUrl()` selects locale-specific MP3 files; the repo contains 162 audio assets and step voice controls. | Preserve the available per-step audio. Verify how it maps to new stages; do not assume every Physics stage already has narration. |
| Design tokens | CSS variables define navy ink, cream/paper surfaces, blue, lime, coral and yellow; responsive rules exist. | Reuse and refine tokens rather than replacing the product identity. Reduce lime's role where it becomes structural. |

## Gaps against the supplied teaching-system brief

1. **No screen-level lesson sequence yet.** There is no “2 of 6” stage indicator or consistent Previous / audio / Next control for each instructional stage. Existing Previous / Next lesson links sit at the bottom of the long page; example-step buttons are inside the example card.
2. **Opening content is too simultaneous.** `guideIdeaCard()` places the explanation, the entire lesson formula and symbol glossary together. This can expose a rule before a visual or example has made its purpose clear—especially for patterns and concept-first lessons.
3. **Formula styling needs to change.** `.guide-idea-copy` is a large dark navy panel and `.guide-formula` uses a bright green left rule and green formula. Replace this default with a calm paper/cream page and a light, integrated equation treatment. Keep dark navy for purposeful navigation/contrast; do not rebuild every section as a card.
4. **The canvas is not yet the common teacher workspace.** Mathematics has the richer incremental SVG/annotation system. Physics uses a distinct text-first staged panel, so the shared teaching rhythm needs reusable content types without forcing a single identical diagram template.
5. **Some interactions and stages are below the fold.** Formula triangle, practice, completion, lesson navigation and the coach note can extend the scroll. Move the primary sequence and next action into the focused stage flow, but retain those existing features at appropriate moments.
6. **Practice visual coverage is selective.** Only 11 of 156 lesson-practice records and 7 of 11 timed-test questions include doodle data. Keep visuals optional and pedagogically chosen; do not make the rollout a quota-driven illustration task.
7. **Automated QA is not committed.** `package.json` has no test/lint/build scripts beyond `start`, and no test configuration was found. Current regression checks have been ad-hoc browser runs. Add lightweight repeatable checks only where useful; avoid introducing a heavy framework solely for this rollout.
8. **Guide content is a first draft.** Its bilingual structure and step counts align with the existing solution data, but subject accuracy, prerequisites, misconceptions and the sequencing of each topic still need review. Visual polish is not a substitute for that review.

## Verification performed

- Inspected the live source structure, lesson renderers, global styles, content files, persistence, language switching, audio hooks and SVG doodle renderer.
- Confirmed both subjects contain 13 lessons and all 26 lessons have bilingual guide data. Confirmed the 13 Mathematics walkthroughs and 13 Physics guide-driven step panels are distinct implementations.
- Smoke-tested production at 390px on Vectors, Sequences and Physics Motion: the lesson idea, example, practice and next-lesson navigation rendered; no horizontal overflow or browser page errors were observed.
- Prior rollout checks also exercised the lesson set at 360px and 390px. Keyboard/screen-reader accessibility review and broader visual/behavior review remain for later phases.

## Phase 2 recommendation — design system

Define tokens and reusable styles for warm paper/cream backgrounds, navy navigation and readable text, calm blue instructional structure, restrained green success/highlights, typography, spacing, borders, dotted canvas surfaces, equations, step markers, annotations, feedback and navigation. Then create the reusable lesson-stage shell: compact topic/progress header, one focused content purpose, retained canvas or appropriate visual, and predictable Previous / audio / Next actions.

Pilot that shell with representative content types before migrating the curriculum: vector representation/addition/magnitude, arithmetic and non-arithmetic patterns, differentiation, geometry and one Physics lesson. Keep formulas at the point in the teaching sequence where they make sense. Preserve the existing hash routes, data where practical, `localStorage`, practice flows, question sketches, audio, mini-test and formula-triangle feature.

**Audit conclusion:** The app has valuable functioning pieces; the next phase is a presentation/sequence redesign around them, not a ground-up rewrite. The storyboard reference is committed at [`settings/references/guided-vector-lesson-reference.png`](references/guided-vector-lesson-reference.png), and the product direction is in [`LEARNING_EXPERIENCE_DIRECTION.md`](LEARNING_EXPERIENCE_DIRECTION.md).

## Follow-up implementation status — 2026-10-12

Since this baseline audit, the Phase 2 visual foundation and reusable lesson-stage shell have been implemented in `app.js` and `styles.css`. The shell separates the current lesson into idea, relationship, worked-example, and practice screens while preserving the existing Mathematics canvas, Physics step panel, routes, language state, practice, and completion controls. This is a **presentation scaffold over existing lesson content**, not a completed pedagogical rewrite or a claim that all 26 lessons now meet the target teaching quality. Follow the living direction document for the next reference-lesson pilot and remaining work.
