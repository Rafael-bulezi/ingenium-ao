# Ingenium — Learning Experience Direction

**Status:** Groundwork for the next polish pass. This file records direction and acceptance criteria; it does not authorize a broad rebuild or change the app yet.

## Product direction

Make every lesson easier to understand on the first read and easier to continue through. This direction applies across **all Mathematics and Physics areas**, not only vectors. Preserve Ingenium’s current subject tracks, lesson path, progress, and hand-drawn identity. Improve the existing sequential canvas rather than replacing it. Keep the interface calm: every new visual or control must help the learner understand the question, the reasoning, or the next action.

Use one consistent teaching rhythm, but choose the explanation and visual form that fits each idea. An equation may need its operations unpacked; a sequence may need its differences shown; a function may need a graph; a probability problem may need a table or tree; a force problem may need arrows. Do not force every topic into a vector-style sketch or make every question use a doodle.

The work has four connected goals:

1. Rewrite confusing prompts into clear, answerable questions.
2. Make each canvas step explain one move and why it is valid.
3. Refine the doodles and add an optional visual view for questions where it helps.
4. Make lesson-to-lesson navigation obvious without adding dashboard clutter.

## Explanation pattern to borrow

The [shared “Explain Vectors Simply” conversation](https://chatgpt.com/share/6ac9161c-2ae0-83e9-bf81-de9086325596?ogimg=plain) is a useful reference for pacing, not wording to copy. It gives a plain-language meaning, maps symbols to familiar quantities, works one component or operation at a time, explains why a sign or formula matters, then gives a small practice question and a short takeaway. When the topic becomes harder, it names the pattern before moving to the next type.

Vectors are the example in that conversation, not the boundary of this direction. Apply the same clarity and sequencing to algebra, equations, functions, sequences, probability, geometry, calculus, mechanics, fluids, electricity, waves, and the other topics in the course. Use an analogy only when it clarifies the concept, then return to the exact exam problem. Avoid long chat-like explanations or several unrelated examples on one screen.

## Canvas walkthrough: target sequence

The current lesson already has progressive step controls, replay, “show all,” and a full-screen canvas. Keep those controls and refine what each frame communicates. A typical worked example should move through these stages, skipping any that do not help that example:

1. **Restate the task:** Say what the question is asking in ordinary language.
2. **Identify the information:** Show the givens, symbols, signs, units, or conditions.
3. **Name the target:** Make the unknown or requested result visible before calculating.
4. **Choose the right representation:** Use a labelled doodle, equation balance, number line, table, graph, shape, circuit, or other small visual only when it clarifies the idea.
5. **Choose the rule:** State the principle or formula and briefly explain why it fits this problem.
6. **Work one move at a time:** Each frame adds one calculation or transformation. Pair it with a short sentence about what changed and why.
7. **Check the result:** Verify units, sign, direction, scale, pattern, or substitution where relevant.
8. **Close with a takeaway:** Give the final answer and one memorable rule or common mistake to avoid.

The learner should never have to infer which value came from the question, which one is being calculated, or why the next line follows. Keep the previous step visible when it helps show continuity; do not reveal the entire derivation by default.

## Question clarity

Use these rules for lesson practice, the mini-test, and any new question content:

- Ask for one result or one action at a time. Split a compound task into labelled sub-steps if it tests more than one skill.
- Put the givens and the requested result in separate, direct sentences. Define each symbol before relying on it.
- Include units and approximations in the prompt when they matter. For example, state when to use `g = 10 m/s²`.
- Prefer concrete verbs such as **calculate**, **add**, **compare**, or **identify** over vague prompts such as “solve this” or “what happens?”
- Do not hide essential conditions in a long sentence. Remove filler when it does not help the learner.
- Keep hints gradual. The first hint should point to the relevant quantity or principle; it should not give away the answer.
- After an attempt, say what was correct, identify the next useful step, and explain the result in the same notation used in the prompt.
- Review language and examples in both Portuguese and English. Do not rewrite question text mechanically without checking its mathematical or physical meaning.

**Examples of the intended wording change:**

- Vectors — current style: “Aquecimento: soma A = (1, 2) com B = (2, 2). Qual é o vector soma?” Clearer: “Calcula `R = A + B`, com `A = (1, 2)` e `B = (2, 2)`. Escreve `R` no formato `(x, y)`.”
- Forces — current style: “Para aquecer: com g = 10 m/s², qual o peso de 2 kg?” Clearer: “Um corpo tem massa `m = 2 kg`. Usa `g = 10 m/s²`. Calcula o peso `P` e indica a resposta em newtons (`N`).”

These are illustrations, not preferred templates for every topic. The goal is to state the operation, give the relevant information, and specify the target without adding a separate lesson inside the question.

## Optional “View as doodle” for questions

Add this as an optional second view of a question, not a replacement for its text. A learner can switch between **Question** and **View as doodle**. The visual should show the setup and the requested quantity; it must not reveal the answer or solution before the learner asks for it.

Choose the visual form by topic. Examples include a balance or “undo the operation” sequence for equations; a term strip and difference row for sequences; an input/output map or labelled graph for functions; a small table or outcome tree for probability; a labelled shape for geometry and trigonometry; arrows for vectors and forces; a circuit sketch for electricity; and a waveform for waves. These are options, not a checklist. A visual belongs only where it makes that particular question easier to understand.

For groundwork, prefer a small optional visual description attached to selected question records over a new question-system rewrite. Keep the written prompt authoritative and available at all times. Provide a text alternative and do not rely on colour alone to distinguish known values, unknowns, or relationships. Start with questions from several topic families; do not limit the feature to vector questions or require it on every question.

## Navigation without clutter

A learner should be able to answer “Where am I?” and “What do I do next?” at a glance.

- Keep the subject, topic, and position in the track visible in the lesson header.
- Keep a small **Back to path** action available.
- Put a clear **Previous lesson / Next lesson** path at the end of lesson content. Once the current lesson is complete, make the next lesson the primary action; do not make the completion checkbox the only way to discover how to continue.
- If a next lesson is still locked, explain the requirement and point to the action that unlocks it.
- At the end of a subject, offer the natural next destination, such as the route or mini-test.
- Preserve the existing bottom navigation and quick-action hierarchy. Avoid adding a second sidebar, extra dashboards, or several competing “continue” buttons.

## Doodle quality bar

Every drawing must do instructional work. Keep one main idea per frame, use a consistent visual grammar across subjects, and label every arrow, axis, force, important value, or relationship. Use the drawing to make spatial, numerical, or causal relationships easier to see, not as decoration. If a diagram is schematic and not to scale, say so when scale could mislead. Keep lines and labels readable on a phone, and make the written explanation understandable without the image.

## Rollout and checks

1. **Audit the full course:** Review wording and explanations across all 26 lessons. Tag the kinds of reasoning each topic needs instead of assuming one diagram style fits all.
2. **Pilot across different topic families:** Try clear prompts and sequential examples in symbolic Mathematics (such as equations), pattern/graph Mathematics (such as sequences or functions), and more than one Physics representation (such as forces and circuits). Include vectors as one useful case, not the only case.
3. **Refine the canvas:** Improve step labels, annotations, and the link between each equation and its supporting visual. Keep the current reveal, replay, and “show all” behaviour.
4. **Prototype question visuals:** Test the optional view on several different question types. Confirm that each visual clarifies the setup without exposing the answer, and that questions without a useful visual remain text-only.
5. **Polish progression:** Add and test the next/previous lesson path and the end-of-subject destination.
6. **Expand only after review:** Check factual accuracy, Portuguese/English parity, accessibility, keyboard use, 360–390px mobile layouts, and browser-console errors before applying changes across the course.

The first implementation pass should be small enough to review but broad enough to prove this direction works beyond vectors: use examples from multiple reasoning and visual families in both subjects. Keep the current product structure and data model wherever practical; add only the fields and UI needed to support clear explanations and useful visuals.
