# Deep Research Result: GymPath Python-Based Fitness Web App MVP

Access date for web sources: 2026-05-13

## Executive Recommendation

Build **GymPath as a mobile-first Streamlit web app first**, then consider a WeChat Mini Program only if time remains.

This recommendation is an inference from the assignment constraints and the framework documentation:

- The course brief requires a Python project with `project.py`, `main()`, at least three top-level custom functions, `test_project.py`, `requirements.txt`, README, final report, and AI prompt evolution log.
- Streamlit lets the visible app and the core business logic stay in Python, which directly supports those requirements.
- WeChat Mini Programs can use Python only as a backend, while the actual mini program interface normally requires WXML, WXSS, and JavaScript/TypeScript. That would reduce the amount of visible work that is clearly Python-based.
- Native mobile app development should be excluded from this two-day MVP because it adds too much setup, packaging, and debugging risk.

Recommended MVP stack:

| Layer | Recommendation | Reason |
|---|---|---|
| UI framework | Streamlit | Fastest route to a working Python web app. Supports tabs, pages, widgets, session state, charts, and deployment. |
| Core logic | Plain Python functions in `project.py` | Matches the assignment and makes pytest testing easy. |
| Storage | JSON file or Python `sqlite3` | JSON is fastest; SQLite is stronger if the project wants a more "database" story. |
| Tests | pytest | Directly required by the brief. |
| Deployment | Local demo first; Streamlit Community Cloud if time allows | Low cost and simple for a course demo. |

## Framework Choice

| Option | Strengths | Weaknesses for this project | Verdict |
|---|---|---|---|
| Streamlit | Python-first, quick UI, widgets, session state, tabs, multipage navigation, simple deployment. | Less control than a hand-built HTML/CSS front end. Some custom styling may need CSS. | **Best first choice.** Most realistic for two days and a beginner relying on AI. |
| Flask | Lightweight, flexible, supports HTML templates and static files. Good if you want a polished custom design. | Requires more front-end work: HTML, CSS, templates, routes, forms, and state handling. | Good second choice if design control matters more than speed. |
| Django | Full-featured framework with database models, admin, forms, and stronger project structure. | More setup and concepts than needed for a small two-day MVP. | Better for a later full product, not this MVP. |
| WeChat Mini Program + Python backend | Good for China mobile usage and later product direction. Python can run backend APIs. | Front end is not Python, deployment/configuration is heavier, and it does not match the assignment as cleanly. | Future expansion after the web MVP. |

Practical inference: for this course project, Streamlit has the best "visible product per hour" ratio. Flask can look more custom, but Streamlit is more likely to be completed, tested, and demo-ready within two days.

## Competitor Landscape

| Product | Main features | Strengths | Weaknesses / gap GymPath can target | Pricing / monetization notes | Sources |
|---|---|---|---|---|---|
| Keep | Fitness courses, AI-assisted personalized training, live and recorded classes, exercise equipment ecosystem, broad China fitness market positioning. | Strong brand, large content library, strong consumer fitness positioning. | Can feel broad and crowded. GymPath can be more focused on gym-based bodybuilding paths for beginner, restarting, and advanced users. | Free app with in-app purchases. App Store China listing shows monthly membership at 19 RMB, quarterly at 58 RMB, and yearly at 218 RMB. | https://ir.keep.com/en/about_profile.php; https://apps.apple.com/cn/app/keep-ai-%E8%BF%90%E5%8A%A8%E6%95%99%E7%BB%83/id952694580 (accessed 2026-05-13) |
| MyFitnessPal | Calorie, macro, meal, exercise, and progress tracking; premium tiers add meal scanning, meal planning, deeper nutrition tools, and AI features. | Very strong food database and nutrition tracking. | Workout planning is not the core value. GymPath can combine training plan generation with simple nutrition guidance. | Free app with in-app purchases. App Store listing shows Monthly Premium at $19.99 and Yearly Premium at $79.99, plus additional legacy price points. | https://www.myfitnesspal.com/features; https://support.myfitnesspal.com/hc/en-us/articles/360032622611-What-features-does-Premium-offer; https://apps.apple.com/us/app/myfitnesspal-calorie-counter/id341232718 (accessed 2026-05-13) |
| Strong | Workout logging, custom routines, exercise instructions, timers, charts, measurements, Apple Watch support. | Excellent for gym users who already know what to do and mainly need logging. | Less beginner-guidance-oriented. GymPath can explain what to train today and why. | Free app with Strong PRO subscription. App Store listing shows PRO at $4.99/month or $29.99/year, plus other legacy price points. | https://www.strong.app/; https://apps.apple.com/us/app/id464254577 (accessed 2026-05-13) |
| Fitbod | AI-generated workouts, adaptive recommendations, exercise videos, 1000+ exercises, recovery-aware training suggestions. | Strong automated workout generation and exercise library. | More advanced and subscription-heavy. GymPath can provide a simpler rule-based MVP with transparent plans and course-friendly Python logic. | Subscription app. App Store listing shows monthly plans at $12.99 and $15.99, and yearly plans at $79.99 and $95.99, plus legacy price points. | https://fitbod.me/; https://apps.apple.com/us/app/fitbod-workout-fitness-plans/id1041517543 (accessed 2026-05-13) |

Opportunity summary:

GymPath should not try to beat these products in size. It should win in clarity:

- Beginner: "Tell me what to do today, safely."
- Restarting user: "Help me return without guilt or overload."
- Experienced gym user: "Give me a structured progression path and advanced knowledge."

## MVP Feature Matrix

| Priority | Features | Reason |
|---|---|---|
| Must-have | Level selection, goal selection, weekly workout plan generator, exercise list with teaching video links, check-in/streak, simple calorie/protein target, clean mobile-first UI. | These demonstrate product value and provide enough Python logic for tests. |
| Should-have | Restart plan if the user missed training, simple meal guidance, knowledge cards, progress feedback after check-in. | These support the key user segments without requiring complex infrastructure. |
| Nice-to-have | Advanced theory section, bodybuilding news, influencer resources, photo pose tips, simple charts. | Good demo polish, but not required for a stable MVP. |
| Future version | User login, cloud sync, real AI coach chat, payments, community, WeChat Mini Program front end, personalized long-term progression engine. | These are product-scale features, not two-day course features. |

Cut if time is tight:

1. Remove meal logging and keep only calorie/protein guidance.
2. Remove news/community and keep static knowledge cards.
3. Keep only one local user profile stored in JSON.
4. Keep video links static instead of building a search feature.

## Recommended App Architecture

Use a small but professional file structure:

```text
group project/
  project.py
  test_project.py
  requirements.txt
  README.md
  research-GymPath.md
  data/
    exercises.json
    sample_checkins.json
  docs/
    ai_prompt_log.md
```

Recommended `requirements.txt`:

```text
streamlit
pytest
```

Optional later:

```text
pandas
```

Keep the first version simple. Streamlit can render the interface, while `project.py` contains the testable logic. If the UI grows later, split non-required helpers into extra files, but keep the required custom functions in `project.py` so the assignment checker is satisfied.

## Suggested Python Functions

The project should include 5-8 useful functions. At least three should be easy to test with pytest.

| Function | Purpose | Easy to test? |
|---|---|---|
| `classify_user_level(training_months, weekly_frequency, missed_days)` | Classifies beginner, restarting, or experienced user. | Yes |
| `calculate_daily_calorie_target(weight_kg, height_cm, age, gender, goal, activity_level)` | Gives a basic calorie target using a simple formula and goal adjustment. | Yes |
| `calculate_protein_target(weight_kg, goal)` | Recommends daily protein grams based on goal. | Yes |
| `recommend_training_split(level, goal, days_per_week)` | Chooses full-body, upper/lower, push-pull-legs, or strength split. | Yes |
| `generate_workout_plan(level, goal, days_per_week)` | Returns a weekly plan with exercises, sets, reps, rest, and notes. | Yes |
| `suggest_restart_plan(days_missed, previous_level)` | Lowers volume and restarts safely after a break. | Yes |
| `calculate_checkin_streak(checkin_dates)` | Calculates current workout streak from date strings. | Yes |
| `get_exercise_video_links(exercise_name)` | Returns curated video/resource links from a dictionary. | Yes, if the data is static. |

Recommended minimum tests:

- `test_calculate_protein_target`
- `test_recommend_training_split`
- `test_calculate_checkin_streak`
- `test_generate_workout_plan`

## Product Design Recommendation

Make the web app feel like a mobile app:

- Use a narrow centered layout that looks good on phone width.
- Use `st.tabs` for the main screens: `Today`, `Plan`, `Log`, `Learn`.
- Put the most important output first: "Today's workout."
- Use cards for workout days and exercises.
- Use progress bars or simple metrics for streak and completion.
- Use short labels and clear calls to action.
- Use one confident accent color, such as green or electric blue, with neutral backgrounds.
- Avoid a giant action database in version 1. The value is not "1000 exercises"; the value is "the right plan for this user."

Suggested screens:

1. **Today**: user profile summary, current goal, today's workout, check-in button.
2. **Plan**: weekly training plan with exercise details and teaching links.
3. **Nutrition**: calorie/protein recommendation and simple meal guidance.
4. **Learn**: beginner safety, advanced training theory, nutrition basics.
5. **About / Report**: project explanation and business value for the demo.

## Two-Day Development Roadmap

### Day 1

Morning:

- Create `project.py`, `test_project.py`, `requirements.txt`, and README.
- Implement core functions first.
- Write pytest tests for at least three functions.
- Create static exercise and video-link data.

Afternoon:

- Build the Streamlit UI shell.
- Add level/goal/days-per-week inputs.
- Display generated weekly workout plans.
- Add calorie/protein recommendations.
- Add basic mobile-first styling.

### Day 2

Morning:

- Add check-in and streak logic.
- Add simple persistence with JSON or `st.session_state`.
- Add knowledge cards and video links.
- Improve wording, safety notes, and beginner/advanced differentiation.

Afternoon:

- Run pytest.
- Test the full user flow manually.
- Prepare screenshots and demo script.
- Write README setup instructions.
- Prepare report sections and AI prompt log.

Backup plan:

If time is short, deliver only:

1. Level/goal form.
2. Workout plan generator.
3. Exercise teaching links.
4. Calorie/protein target.
5. Check-in streak.
6. README and pytest tests.

This is enough to demonstrate Python logic, business value, and a usable product.

## Course Report Support

Business value framing:

GymPath addresses a common fitness product gap: beginners are overwhelmed by too much information, returning users need low-pressure restart guidance, and experienced users want progression rather than generic beginner workouts. The business value is a clearer, layered fitness pathway that reduces decision fatigue and improves workout consistency.

Implementation documentation outline:

1. Project background and target users.
2. Competitor analysis and opportunity.
3. System design and technology choice.
4. Core Python functions and data flow.
5. Testing strategy with pytest.
6. UI walkthrough and demo screenshots.
7. Limitations and future work.
8. AI prompt evolution and reflection.

AI prompt log structure:

| Timestamp | Prompt | AI output kept | AI output discarded | 50-word decision justification |
|---|---|---|---|---|
| 2026-05-13 HH:MM | Example prompt | What was useful | What was not used | Why this decision improved the project |

Conceptual reflection angle:

Start with the idea of a broad fitness app, then explain how the project narrowed into a two-day Python MVP focused on three user journeys: beginner launch, restart after inconsistency, and advanced progression. This shows iterative product thinking and responsible scope control.

## Budget and Tools

| Item | Recommendation | Cost expectation |
|---|---|---|
| Coding assistant | Use AI for planning, coding help, bug fixing, and report drafting. | Depends on your existing subscription/token use. |
| App framework | Streamlit | Open source; no mandatory app cost. |
| Testing | pytest | Open source. |
| Storage | JSON or SQLite | Free. |
| Deployment | Local demo first; Streamlit Community Cloud if needed. | Streamlit Community Cloud has a free option. |
| Runtime AI API | Do not include in MVP. Use rule-based recommendations instead. | Avoids cost and complexity. |

Budget inference:

For the two-day course MVP, the only necessary paid cost is your AI coding/token usage. Hosting, database, and framework costs can stay near zero. Runtime AI should be postponed until after the assignment because it adds API keys, pricing uncertainty, latency, and more testing risk.

## Final Build Recommendation

Build first:

**A Streamlit mobile-first web app named GymPath, with rule-based Python functions for user classification, training plan generation, calorie/protein targets, exercise video links, and check-in streaks.**

Why:

- It satisfies the Python-first assignment requirements.
- It is feasible within two days.
- It creates a visible, demo-friendly product.
- It keeps the logic testable with pytest.
- It leaves a clear path to future WeChat Mini Program expansion by reusing the same Python recommendation logic as a backend later.

## Sources

Framework and deployment sources:

- Streamlit app model and execution concept: https://docs.streamlit.io/develop/concepts/architecture/app-model (accessed 2026-05-13)
- Streamlit navigation docs: https://docs.streamlit.io/develop/api-reference/navigation/st.navigation (accessed 2026-05-13)
- Streamlit tabs docs: https://docs.streamlit.io/develop/api-reference/layout/st.tabs (accessed 2026-05-13)
- Streamlit session state docs: https://docs.streamlit.io/develop/api-reference/caching-and-state/st.session_state (accessed 2026-05-13)
- Streamlit Community Cloud deploy docs: https://docs.streamlit.io/deploy/streamlit-community-cloud/deploy-your-app (accessed 2026-05-13)
- Flask quickstart and docs: https://flask.palletsprojects.com/en/latest/quickstart/ (accessed 2026-05-13)
- Flask templating docs: https://flask.palletsprojects.com/en/latest/templating/ (accessed 2026-05-13)
- Flask static files docs: https://flask.palletsprojects.com/en/latest/tutorial/static/ (accessed 2026-05-13)
- Django tutorial: https://docs.djangoproject.com/en/6.0/intro/tutorial01/ (accessed 2026-05-13)
- Django installation guide: https://docs.djangoproject.com/en/6.0/intro/install/ (accessed 2026-05-13)

Competitor and market sources:

- Keep company profile: https://ir.keep.com/en/about_profile.php (accessed 2026-05-13)
- Keep App Store China listing: https://apps.apple.com/cn/app/keep-ai-%E8%BF%90%E5%8A%A8%E6%95%99%E7%BB%83/id952694580 (accessed 2026-05-13)
- MyFitnessPal features: https://www.myfitnesspal.com/features (accessed 2026-05-13)
- MyFitnessPal Premium features: https://support.myfitnesspal.com/hc/en-us/articles/360032622611-What-features-does-Premium-offer (accessed 2026-05-13)
- MyFitnessPal App Store listing: https://apps.apple.com/us/app/myfitnesspal-calorie-counter/id341232718 (accessed 2026-05-13)
- Strong official site: https://www.strong.app/ (accessed 2026-05-13)
- Strong App Store listing: https://apps.apple.com/us/app/id464254577 (accessed 2026-05-13)
- Fitbod official site: https://fitbod.me/ (accessed 2026-05-13)
- Fitbod App Store listing: https://apps.apple.com/us/app/fitbod-workout-fitness-plans/id1041517543 (accessed 2026-05-13)
