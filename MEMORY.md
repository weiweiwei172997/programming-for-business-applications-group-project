# MEMORY.md - GymPath Working Memory

This file stores current project state for AI agents. Keep it short, factual, and updated after meaningful changes.

## Active Phase & Goal

**Phase 1: Working MVP foundation**

Current status: first foundation slice implemented.

Built:

- `requirements.txt`
- `project.py` with core logic and `main()`
- `test_project.py`
- `data/exercises.json`
- `data/knowledge_cards.json`
- `app.py` Streamlit MVP shell
- `api.py` FastAPI API wrapper for React frontend
- `frontend/` Next/React black-white-gray interface
- `README.md`
- Chinese-first app UI and user-visible content

Validated:

- `python -m pytest` passes with 13 tests
- `python -m py_compile project.py app.py test_project.py` passes
- Streamlit and pandas are available in the current environment
- Chinese UI update passed `python -m pytest`, `py_compile`, JSON parsing, and Streamlit health check
- Added Chinese UI version reset so old English session state is cleared after refresh
- Frontend redesigned with a premium dark fitness-brand visual system inspired by shadcn composition principles and the `frontend-design` skill direction
- Latest frontend constraint update: native Streamlit components only, black/white/gray theme only, no custom HTML/CSS injection
- Latest architecture update: React/Next is now the primary frontend for stronger UI quality; Python core remains in `project.py`, served through FastAPI in `api.py`
- Latest React frontend server: `http://localhost:3000`
- Latest FastAPI server: `http://127.0.0.1:8000`
- Verification after React/Next upgrade: `python -m pytest`, `py_compile`, `npm run typecheck`, `npm run build`, API health check, frontend HTTP 200, and `npm audit --audit-level=moderate` all pass
- Exercise teaching links now jump directly to specific Bilibili video pages. YouTube links, Bilibili search pages, and Douyin search pages were removed from generated plans and `data/exercises.json`.
- Beginner level now uses a four-session split with the user's supplied training videos: chest/shoulders/triceps, back/biceps, lower body, rest day, shoulders/arms. Beginner plans override the weekly slider to 4 training sessions.
- Visible training cards now only show direct video buttons, not video author/source/title metadata.
- All generated set rest intervals are at least 120 seconds. Heavy compound or fatiguing exercises recommend longer rests, and feedback can raise the next-session rest target to 180-240 seconds.
- Added `scripts/start_gympath.ps1` to start both the FastAPI API and React/Next frontend together on Windows.
- Fat-loss nutrition now includes a weight-based carb cycling plan in `generate_diet_plan()`: daily carbs = 2.0 x bodyweight, fat = 0.8 x bodyweight, protein = 1.3 x bodyweight; weekly high/medium/low carb split is shown in the React nutrition page.
- Fat-loss nutrition now supports multiple selectable plans. The previous plan is named `凯圣王碳循环减脂`; the new `橙子碳水渐降减脂` calculates BMR, training burn, standard/sensitive macro ratios, target-weight timeline, and the 7-day plus 3-day carb reduction rule.
- Rest guidance is now day-level only: `rest_policy` appears once near the start of each training day. Exercise cards keep numeric rest seconds but no longer include repeated rest guidance text.
- Generic exercise cue text is hidden from both the React frontend and the Streamlit fallback. Exercise cards should not show broad lines like "肩胛保持稳定，控制动作幅度"; keep them focused on exercise name, phase/muscle, sets/reps/rest, and video links.
- Strength-gain now has selectable plans in the React profile when goal is `strength_gain`: `小白A/B轮线性力量`, `老手线性5x5增力`, and `全人群5x5三分化`. Backend logic lives in `generate_workout_plan(..., strength_plan_type=...)` and returns `strength_plan` metadata plus plan-specific weekly schedules.

- React body-data inputs are now visible only on the training plan and nutrition tabs. Pain guidance, feedback, progress, and knowledge keep the profile panel but no longer show the body-data panel.

- Muscle-gain now has selectable plans through `generate_workout_plan(..., muscle_gain_plan_type=...)`: `tan_chengyi_beginner_follow`, `tan_kaisheng_three_split`, and `orange_hypertrophy`. Legacy mixed full-body training templates were removed from plan generation and visible React labels.
- Fat-loss nutrition now includes a meal logger inspired by the provided mini-program screenshot: Python exposes a food macro library and meal-total functions, the React nutrition tab lets users multi-select foods per meal, each meal shows calories/carbs/protein/fat totals, and the daily total is compared against the selected fat-loss plan target.
- The meal logger food library now has 42 common fitness foods and supports custom grams plus weight-state selection. Core Python meal calculations accept either legacy food ids or structured selections like `{food_id, grams, state}` for dry/cooked or raw/cooked macro calculation.
- Latest React cleanup: the training-profile/body-data setup area is visible only on the training plan and nutrition tabs; pain, feedback, progress, and knowledge now open directly into their feature views.
- Pain replacement now has an interactive body map for shoulder, elbow, wrist, back, hip, knee, and ankle. Clicking a joint calls `/api/pain` and returns substitute movements, relief methods, rehab drills, and Bilibili video links.
- Progress tracking now records body-fat percentage alongside weight and waist. The positive-feedback meter was replaced with a React/SVG line chart for weight, waist, and body-fat trends.
- The knowledge section was expanded beyond four cards to cover calorie deficit, protein targets, carb cycling, progressive overload, deloads, soreness vs injury, warm-up logic, restart training, supplements, and photo/measurement tracking.
- Latest visual refinement: the progress chart now uses three clearly distinct monochrome line styles (solid circle markers for weight, dashed square markers for waist, dotted triangle markers for body-fat percentage) and explicitly supports custom date editing.
- Latest pain-map refinement: the abstract stick-figure body map was replaced with an original front/back muscle anatomy plate with clickable joint hotspots and a 3D-modeling roadmap panel for a future Three.js model.
- Nutrition now uses a generic `饮食记录` label instead of `减脂饮食记录`. When the selected goal is muscle gain or strength gain, the nutrition target switches to the new performance guide: Harvard-style BMR, lifestyle burn, training burn, training-day surplus, rest-day deficit with BMR floor, and macro energy ratio 5:2.5:2.5.
- Latest plan/pain-map update: the visible goal selector no longer includes `体能`; health goals now generate an upper/lower home bodyweight plan with the user's two Bilibili videos. The pain map now uses a real clear Wikimedia/OpenStax anatomy image with clickable joint hotspots instead of a self-drawn SVG.
- Anatomy image loading fix: the Wikimedia/OpenStax muscle image is now stored locally at `frontend/public/anatomy-muscles-zh.jpg` and referenced as `/anatomy-muscles-zh.jpg`, avoiding external hotlink/network failures in the demo browser.
- Anatomy hotspot calibration fix: joint hotspots were recalculated for the actual stacked front/back anatomy image dimensions instead of the earlier side-by-side layout assumption.
- Latest check-in update: the training profile no longer exposes the weekly training-days slider. Feedback/check-in now includes a 7-day supplement lottery incentive, with backend reward status from `get_checkin_reward_status()` and prizes such as protein powder and creatine.
- Latest AI update: added a GymPath AI Q&A tab backed by `/api/ai-chat` and `get_ai_fitness_reply()`. The backend reads `DEEPSEEK_API_KEY` from environment or `.env`, calls DeepSeek through the OpenAI SDK when configured, and falls back to local rule-based fitness guidance when the API is unavailable.

The first usable GymPath version should continue toward:

`assessment -> generated plan -> warm-up -> exercise teaching -> workout feedback -> light adjustment -> progress chart`

The app should be usable for a course demo before adding extra polish.

## Current Decisions

- Product name: GymPath
- Platform: mobile-first web app
- MVP stack: Python core + FastAPI API + React/Next frontend + pytest
- Streamlit remains as a fallback prototype, not the primary UI
- Future path: MySQL persistence/WeChat Mini Program after MVP
- User level: vibe-coder, AI writes most code, user tests and judges product direction
- UI direction: professional, clean, athletic, data-driven
- UI generation: follow local `frontend-design` skill standard when available
- Core logic must live in `project.py`
- UI/API layers must import logic from `project.py`
- AI coach uses API if configured and local fallback if unavailable
- Pain guidance must be cautious and non-diagnostic

## Key Source Documents

- `docs/research-GymPath.md`
- `docs/PRD-GymPath-MVP.md`
- `docs/TechDesign-GymPath-MVP.md`
- `AGENTS.md`
- `agent_docs/`

## Next Actions

1. Manually click through pain body-map joints and progress chart in the browser.
2. Add SQLite or MySQL persistence for profile, feedback, measurements, and community.
3. Add nickname-based community feed.
4. Add `ai_coach.py` with API and fallback guidance.
5. Update final report screenshots.

## Risks To Watch

- Scope creep: community, AI, charts, and adaptive logic can grow too large.
- UI risk: React frontend is stronger visually but adds a second runtime to manage.
- Safety risk: pain guidance must not sound like medical diagnosis.
- Demo risk: AI API may fail, so fallback is required.
- Course risk: `project.py`, `main()`, tests, README, and requirements must not be forgotten.

## Update Cadence

Update this file after:

- completing a milestone
- changing architecture
- adding or removing a major feature
- changing commands or dependencies
- discovering an important bug or limitation
