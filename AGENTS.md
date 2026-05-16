# AGENTS.md - GymPath AI Agent Master Plan

This is the universal instruction file for all AI coding assistants working on GymPath.
Read this file first, then open the specific files in `agent_docs/` only when needed.

## Project Snapshot

**Product:** GymPath  
**One-line description:** A mobile-first Python fitness web app that helps users reduce fitness decision fatigue by generating adaptive training plans, warm-up guidance, nutrition advice, progress feedback, community interaction, and AI-powered beginner education.  
**Stage:** MVP development  
**User technical level:** Vibe-coder. The user knows a little Python and MySQL, and will rely heavily on AI coding.  
**Primary stack:** Python, Streamlit, SQLite, pytest, pandas, python-dotenv, OpenAI-compatible AI API client.  
**Project root:** `group project/`

## Source of Truth

Use these documents in order:

1. `AGENTS.md` - current phase, core rules, and workflow.
2. `MEMORY.md` - active state and decisions.
3. `agent_docs/project_brief.md` - persistent project conventions.
4. `agent_docs/product_requirements.md` - exact MVP features and user stories.
5. `agent_docs/tech_stack.md` - stack, commands, architecture, and setup.
6. `agent_docs/code_patterns.md` - implementation patterns.
7. `agent_docs/testing.md` - verification rules.
8. `docs/PRD-GymPath-MVP.md` - full PRD.
9. `docs/TechDesign-GymPath-MVP.md` - full technical design.
10. `docs/research-GymPath.md` - research context.

## Active Phase And Goal

**Phase 1: Build the working MVP foundation.**

Goal: create a usable app skeleton where a user can complete:

`assessment -> generated plan -> warm-up -> exercise teaching -> workout feedback -> light adjustment -> progress view`

Phase 1 must also satisfy the course requirements:

- `project.py`
- `main()` inside `project.py`
- at least three custom top-level functions in `project.py`
- `test_project.py`
- pytest tests for at least three functions
- `requirements.txt`
- README
- AI prompt evolution log

## MVP Feature List

Build these features for v1:

1. User assessment
2. Adaptive training plan engine
3. Warm-up and activation guidance
4. Pain-aware exercise guidance
5. Exercise library with teaching links
6. Nutrition guidance
7. Progress tracking and charts
8. Community feed with nickname mode
9. AI coach with fallback guidance
10. Knowledge center for beginner myth-busting

Do not build these in the MVP unless the user explicitly asks after the core loop works:

- real account login
- payment or VIP subscription
- cloud sync
- WeChat Mini Program front end
- medical diagnosis
- massive exercise database
- wearable integration

## Architecture Rules

### Required File Boundaries

- `project.py` contains core business logic and `main()`.
- `test_project.py` tests deterministic functions from `project.py`.
- `app.py` contains Streamlit UI and imports logic from `project.py`.
- `ai_coach.py` contains AI API calls and fallback response logic.
- `storage.py` contains SQLite setup and save/load helpers if storage logic grows.
- `data/` contains static exercise and knowledge data.
- `docs/` contains assignment/report/prompt-log materials.

### Core Principle

Do not trap important logic inside Streamlit button callbacks. Put reusable logic in `project.py` so it can be tested with pytest and reused later if the app migrates to FastAPI, Flask, MySQL, or WeChat Mini Program.

## How I Should Think

1. **Understand Intent First:** Before answering, identify what the user actually needs.
2. **Ask If Unsure:** If critical information is missing, ask one specific question before proceeding.
3. **Plan Before Coding:** Propose a brief plan and ask for approval before coding unless the user has clearly asked for direct implementation.
4. **Verify After Changes:** Run tests or manual checks after each meaningful change.
5. **Explain Trade-offs:** When recommending something, mention reasonable alternatives and why they were not chosen.

## Plan -> Execute -> Verify

### Plan

- Read `AGENTS.md`, `MEMORY.md`, and the relevant `agent_docs/` file.
- Restate the feature being implemented.
- List the files that will change.
- Keep the plan short and beginner-friendly.

### Execute

- Implement one feature or one small slice at a time.
- Keep changes focused.
- Prefer standard Python and built-in libraries unless `agent_docs/tech_stack.md` says otherwise.
- Use `apply_patch` or normal file editing. Do not rewrite unrelated files.

### Verify

- Run `python -m pytest` after changing `project.py` or tests.
- Run `streamlit run app.py` for UI testing when a visible app exists.
- Manually check the end-to-end core flow.
- If verification fails, fix the issue before moving on.

## UI And Front-End Skill Workflow

The UI must be generated and refined using the user's local skill workflow when available.

Use these standards:

- `frontend-design`: create a distinctive, polished, app-like interface. Avoid generic notebook-looking Streamlit UI.
- `plan-eng-review`: check architecture, data flow, tests, and edge cases before large implementation.
- `plan-design-review`: review mobile layout, screen hierarchy, visual consistency, and usability before UI-heavy implementation.
- `brainstorming`: use before major new features or behavior changes.

GymPath design direction:

- professional
- clean
- athletic
- data-driven
- credible
- beginner-friendly without feeling childish

Implementation target:

- Streamlit app should feel like a mobile-first fitness app.
- Use cards, clear spacing, concise labels, and one confident accent color.
- Do not use placeholder content such as "Lorem ipsum".
- Do not add decorative clutter that makes the app harder to scan.

## Safety And Fitness Guidance Rules

- GymPath is not a medical product.
- Do not diagnose injuries, diseases, or medical conditions.
- Pain guidance must be educational and cautious.
- Severe, sharp, worsening, unusual, radiating pain, numbness, or loss of function should trigger a stop-and-seek-professional-help message.
- BMI is only a basic reference. For experienced lifters, do not treat BMI as a strong judgment metric.
- AI coach should focus on fitness education, beginner myth-busting, training plan explanation, and nutrition basics.

## AI Coach Rules

Use hybrid AI:

- Call the user's AI API for open-ended coaching when API credentials exist.
- Fall back to local rules for common beginner questions and API failures.
- Do not hardcode API keys.
- Use environment variables: `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`.

Only send limited context to the API:

- training level
- goal
- current plan summary
- recent feedback
- pain location/type/level
- user question

Do not send:

- real name
- phone number
- payment data
- sensitive medical diagnosis history

## Commands

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Run tests:

```bash
python -m pytest
```

Run the app:

```bash
streamlit run app.py
```

Optional final dependency snapshot:

```bash
python -m pip freeze
```

## What NOT To Do

- Do NOT delete files without explicit confirmation.
- Do NOT move the project away from Python/Streamlit for the MVP.
- Do NOT add React, Next.js, Django, or WeChat Mini Program code unless the user explicitly approves an architecture change.
- Do NOT modify database schemas without a migration or backup plan.
- Do NOT add features outside the current phase.
- Do NOT skip tests for "simple" changes.
- Do NOT bypass failing tests.
- Do NOT hardcode API keys.
- Do NOT make medical claims or diagnosis claims.
- Do NOT use deprecated libraries or unexplained large dependencies.

## Engineering Constraints

- Use type hints for new core Python functions when reasonable.
- Keep function inputs and outputs deterministic in `project.py` where possible.
- Validate user inputs before calculation.
- Keep business logic out of Streamlit UI callbacks.
- Prefer small functions with clear names.
- Prefer dictionaries/lists/dataclasses over unclear positional tuples for complex data.
- New dependencies require a reason and must be added to `requirements.txt`.
- If a file grows too large, propose a split before making it worse.

## Checkpoints

Create a checkpoint after each milestone:

1. Core functions and pytest tests pass.
2. Streamlit shell runs.
3. Assessment and plan generation work.
4. Feedback and adjustment loop works.
5. Progress chart works.
6. Community works.
7. AI coach works with fallback.
8. README and report support docs are ready.

## First Build Sequence

1. Create `requirements.txt`.
2. Create `project.py` with core functions and `main()`.
3. Create `test_project.py` and pass pytest.
4. Create static data files in `data/`.
5. Create `app.py` Streamlit shell.
6. Add assessment and plan generation.
7. Add warm-up, exercise links, and nutrition.
8. Add feedback, pain guidance, and adaptive adjustment.
9. Add measurements and charts.
10. Add community nickname feed.
11. Add AI coach with fallback.
12. Polish UI using the `frontend-design` standard.
13. Write README and prompt log.

## Definition Of Done

The MVP is done when:

- `python -m pytest` passes.
- `streamlit run app.py` launches successfully.
- A user can complete assessment -> plan -> warm-up -> workout feedback -> adjustment -> chart view.
- Community supports nickname post, comment, and like.
- AI coach answers common beginner questions or falls back gracefully.
- The UI works on mobile-sized screens.
- `README.md` explains install, test, and run steps.
- `docs/ai_prompt_log.md` exists and records the AI development process.

