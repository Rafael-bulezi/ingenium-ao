# Ingenium — Learning Experience Direction

**Status:** Groundwork for the next polish pass. This file records direction and acceptance criteria; it does not authorize a broad rebuild or change the app yet.

## Product direction

Make each lesson easier to understand on the first read and easier to continue through. Preserve Ingenium’s current Mathematics/Physics tracks, lesson path, progress, and hand-drawn identity. Improve the existing sequential canvas rather than replacing it. Keep the interface calm: every new visual or control must help the learner understand the question, the reasoning, or the next action.

The work has four connected goals:

1. Rewrite confusing prompts into clear, answerable questions.
2. Make each canvas step explain one move and why it is valid.
3. Refine the doodles and add an optional doodle view for selected questions.
4. Make lesson-to-lesson navigation obvious without adding dashboard clutter.

## Explanation pattern to borrow

The [shared “Explain Vectors Simply” conversation](https://chatgpt.com/share/6ac9161c-2ae0-83e9-bf81-de9086325596?ogimg=plain) is a useful reference for pacing, not wording to copy. It first gives a plain-language meaning, maps symbols to familiar quantities, works one component or operation at a time, explains why a sign or formula matters, then gives a small practice question and a short takeaway. When the topic becomes harder, it names the pattern before moving to the next type.

For Ingenium, translate that pattern into short canvas frames. Avoid long chat-like explanations or multiple unrelated examples in one screen. Use a familiar analogy only when it clarifies the mathematics or physics, then return to the exact exam problem.

## Canvas walkthrough: target sequence

The current lesson already has progressive step controls, replay, “show all,” and a full-screen canvas. Keep those controls and refine what each frame communicates. A typical worked example should move through these stages, skipping any that do not help that example:

1. **Restate the task:** Say what the question is asking in ordinary language.
2. **Identify the information:** Show the given quantities, symbols, signs, and units.
3. **Name the target:** Make the unknown or requested result visible before calculating.
4. **Sketch the situation:** Draw one simple, labelled diagram that corresponds to the given information.
5. **Choose the rule:** State the principle or formula and briefly explain why it fits this problem.
6. **Work one move at a time:** Each frame adds one calculation or transformation. Pair it with a short sentence about what changed and why.
7. **Check the result:** Verify units, sign, direction, scale, or substitution where relevant.
8. **Close with a takeaway:** Give the final answer and one memorable rule or common mistake to avoid.

The learner should never have to infer which number came from the question, which one is being calculated, or why the next line follows. Keep the previous step visible when it helps show continuity; do not reveal the entire derivation by default.

## Question clarity

Use these rules for lesson practice, the mini-test, and any new question content:

- Ask for one result or one action at a time. Split a compound task into labelled sub-steps if it tests more than one skill.
- Put the givens and the requested result in separate, direct sentences. Define each symbol before relying on it.
- Include units and approximations in the prompt when they matter. For example, state when to use `g = 10 m/s²`.
- Prefer concrete verbs such as **calculate**, **add**, **compare**, or **identify** over vague prompts such as “solve this” or “what happens?”
- Do not hide essential conditions in a long sentence. Remove filler such as “for a warm-up” when it does not help the learner.
- Keep hints gradual. The first hint should point to the relevant quantity or principle; it should not give away the answer.
- After an attempt, say what was correct, identify the next useful step, and explain the result in the same notation used in the prompt.

**Example of the intended wording change:**

- Current style: “Aquecimento: soma A = (1, 2) com B = (2, 2). Qual é o vector soma?”
- Clearer: “Calcula `R = A + B`, com `A = (1, 2)` e `B = (2, 2)`. Escreve `R` no formato `(x, y)`.”

The rewritten version states the operation, gives the values, and specifies the answer format without adding a separate lesson inside the question. Apply wording changes carefully; review Mathematics and Physics prompts in both languages rather than replacing text mechanically.

## Optional “View as doodle” for questions

Add this as an optional second view of a question, not a replacement for its text. A learner can switch between **Question** and **View as doodle**. The doodle should show the setup and the requested quantity; it must not reveal the answer or solution before the learner asks for it.

Use the same drawing language as the worked-example canvas: a few clear shapes, labelled quantities, units, arrows, and a visible unknown such as `?`. For vector addition, a sketch might show the two component arrows on axes and mark the resultant as the target. For a forces question, it might show the object, the relevant force arrows, their labels, and which quantity is requested. The drawing must match the exact wording and values of the question.

For groundwork, prefer an optional, small visual description attached to selected question records over a new question-system rewrite. The written prompt remains authoritative and available at all times. Provide a text alternative and do not rely on colour alone to distinguish known values, unknowns, or directions. Start with questions where a diagram materially improves understanding; not every question needs one.

## Navigation without clutter

A learner should be able to answer “Where am I?” and “What do I do next?” at a glance.

- Keep the subject, topic, and position in the track visible in the lesson header.
- Keep a small **Back to path** action available.
- Put a clear **Previous lesson / Next lesson** path at the end of lesson content. Once the current lesson is complete, make the next lesson the primary action; do not make the completion checkbox the only way to discover how to continue.
- If a next lesson is still locked, explain the requirement and point to the action that unlocks it.
- At the end of a subject, offer the natural next destination, such as the route or mini-test.
- Preserve the existing bottom navigation and quick-action hierarchy. Avoid adding a second sidebar, extra dashboards, or several competing “continue” buttons.

## Doodle quality bar

Every drawing must do instructional work. Keep one main idea per frame, use a consistent visual grammar across subjects, and label every arrow, axis, force, and important value. Use the drawing to make spatial relationships or changes easier to see, not as decoration. If a diagram is schematic and not to scale, say so when scale could mislead. Keep lines and labels readable on a phone, and make the written explanation understandable without the image.

## Rollout and checks

1. **Audit and clarify:** Review the existing questions and canvas steps. Pilot clearer wording on one Mathematics lesson and one Physics lesson before applying the style across all 26 topics.
2. **Refine the canvas:** Improve step labels, diagram annotations, and the link between each equation and its doodle. Keep the current reveal, replay, and “show all” behaviour.
3. **Prototype question doodles:** Start with a vector question and a forces question. Validate that each drawing clarifies the setup without exposing the answer.
4. **Polish progression:** Add and test the next/previous lesson path and the end-of-subject destination.
5. **Expand only after review:** Check factual accuracy, Portuguese/English parity, accessibility, keyboard use, 360–390px mobile layouts, and browser-console errors before applying the pattern broadly.

The first implementation pass should be deliberately small: two representative questions and one or two worked examples. Keep the current product structure and data model wherever practical; add only the fields and UI needed to support clear, useful visuals.
