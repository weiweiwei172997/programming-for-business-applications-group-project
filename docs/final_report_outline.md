# Final Report Outline - GymPath

## 1. Introduction

- Product name: GymPath
- Problem: fragmented fitness guidance and high decision cost
- Target users: beginners, restarting users, experienced lifters, health-first users
- MVP goal: provide assessment, plan generation, warm-up, feedback, adjustment, progress tracking, community, and AI education

## 2. Research And Market Context

- Competitor summary: Keep, MyFitnessPal, Strong, Fitbod
- Gap: existing tools are often too broad, too logging-focused, too home-workout oriented, or not educational enough
- GymPath opportunity: layered guidance for multiple training levels

## 3. System Design

- Stack: Python core, FastAPI, React/Next, SQLite, pytest, TypeScript
- Architecture: `frontend/` UI, `api.py` FastAPI layer, `project.py` core logic, `storage.py` SQLite persistence
- Data flow: account/guest entry -> assessment -> plan -> warm-up -> feedback/check-in -> persistence -> chart/community/AI

## 4. Implementation

- Core functions in `project.py`
- React/Next screens
- SQLite persistence
- AI coach with DeepSeek-compatible API and fallback
- Local registration/login and community interaction

## 5. Testing

- pytest unit tests
- Manual FastAPI/React flow checks
- AI fallback checks
- Mobile layout checks

## 6. AI Assistance Reflection

- How prompts evolved
- What AI helped with
- What decisions were changed by human judgment
- Limitations of AI output

## 7. Limitations And Future Work

- Local accounts are not cloud-hosted production accounts
- No payment system
- No cloud sync across different servers/devices
- No WeChat Mini Program front end yet
- Future MySQL/PostgreSQL hosting and WeChat Mini Program architecture

## 8. Conclusion

- Summary of business value
- Summary of technical learning
- Why GymPath is a useful MVP foundation
