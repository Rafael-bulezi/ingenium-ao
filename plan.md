# Metodista Engineering Entrance Prep — Plan

## Product direction
A mobile-first study companion for Metodista engineering entrance-exam preparation, centered on Mathematics and Physics. The experience turns a long syllabus into a calm, game-like learning path: each topic becomes a compact lesson with a concept card, worked example, guided practice, and completion state.

## Design system
- **Design movement:** Friendly educational game UI / soft neo-brutalism, inspired by language-learning apps but tuned for serious exam preparation.
- **Core principles:** One clear next action; visible progress; explanations before evaluation; rewarding repetition without childish clutter.
- **Color philosophy:** Deep ink/navy grounds the interface and improves focus. A warm paper background reduces visual fatigue. Lime-green is the ownable progress color; blue and coral distinguish the Mathematics and Physics worlds.
- **Layout paradigm:** A vertical trail rather than a dashboard grid. The learner scrolls through a path of rounded lesson nodes, with a sticky progress rail and bottom navigation for Home, Path, Test, and Profile.
- **Signature elements:** Numbered circular lesson nodes; a thick progress ribbon; small “coach note” cards with a friendly star mark.
- **Interaction philosophy:** Every action gives immediate feedback. Completing a lesson advances the trail; hints reveal one idea at a time; solution steps unfold sequentially rather than dumping an answer.
- **Animation:** Short 160–240ms ease-out transitions; completed nodes pop with a subtle scale; progress ribbon fills smoothly; test answer selection uses a quick color wash. Respect reduced-motion preferences.
- **Typography:** Plus Jakarta Sans for interface and headings, with a slightly heavier display weight for lesson names. Math expressions use a readable serif fallback where helpful.
- **Brand essence:** “A focused daily path from syllabus anxiety to exam confidence.” Personality: encouraging, precise, energetic.
- **Brand voice:** Direct, warm, never vague. Example lines: “One idea at a time. You’ve got this.” and “Show your working — that’s where the marks live.”
- **Wordmark / mark:** A small lime compass-star built from four rounded arrows, paired with the METODISTA PREP wordmark.
- **Signature brand color:** Progress Lime `#B8F36B`.

## Implementation approach
- Plain TypeScript-free HTML/CSS/JS app to keep the artifact portable and fast.
- `index.html` provides the shell and accessible landmarks.
- `styles.css` owns responsive layout, trail visuals, lesson cards, test states, loading states, and reduced-motion behavior.
- `app.js` owns route-like view switching, localStorage progress, sequential solution reveals, practice feedback, and chunk orchestration. It loads only the compact catalog first; full Mathematics, Physics, and test JSON chunks are fetched on demand.
- `content/catalog.json` contains only titles, summaries, priority flags, and durations for the initial dashboard/path.
- `content/math.json`, `content/physics.json`, and `content/test.json` hold full lesson/test data and are requested only when those experiences open.
- `public/manus-routes.json` declares the single-page route for Webdev.
- `app.config.ts` provides a stable project logo metadata literal.
- The app deliberately does not need login or a database in v1: progress is saved in the learner’s browser using localStorage.

## Content model
- Two subject tracks: Matemática and Física.
- Each track contains concise topic lessons. Priority topics are marked for Engenharia Industrial e Sistemas Eléctricos.
- Each lesson stores: concept summary, worked-example prompt, ordered solution steps, one practice question, hint, answer, explanation, and estimated minutes.
- Mini-test draws a fixed 10-question set across both subjects for deterministic review and a predictable 20-minute session.

## Project structure
```
metodista/
├── index.html                # app shell and semantic view containers
├── styles.css                # responsive visual system
├── app.js                    # state, interactions, content and rendering
├── app.config.ts             # project logo metadata
├── plan.md                   # this plan and design decisions
├── TODO.md                   # deliverable outcomes and acceptance clauses
└── public/
    └── manus-routes.json     # single-page route declaration
```

## Scope decisions
- Language: Portuguese for the student-facing content, with familiar formula notation.
- No decorative stock imagery: this is a focused study tool, so visual personality comes from the trail, color, and motion system.
- No account or cloud sync in this version; browser persistence is transparent and immediate.
- Loading skeletons appear only while a content chunk is in flight. Once a view is loaded, normal answer selection, navigation, and progress updates render in memory without replacing the active controls; this avoids interaction races on fast taps.
- Lesson practice has two levels (Fácil and Médio) and two response formats (Escrever and Escolha múltipla). Typed prompts expose a tooltip/placeholder explaining the expected answer format.
- Worked examples use restrained arrow connectors between revealed steps to make the movement from one equation transformation to the next explicit without overwhelming the visual system.
