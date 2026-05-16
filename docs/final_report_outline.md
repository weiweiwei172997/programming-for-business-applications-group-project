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

- Stack: Python, Streamlit, SQLite, pytest
- Architecture: `app.py` UI, `project.py` core logic, optional `storage.py`, optional `ai_coach.py`
- Data flow: assessment -> plan -> warm-up -> feedback -> adjustment -> chart

## 4. Implementation

- Core functions in `project.py`
- Streamlit screens
- SQLite persistence
- AI coach fallback
- Community nickname mode

## 5. Testing

- pytest unit tests
- Manual Streamlit flow checks
- AI fallback checks
- Mobile layout checks

## 6. AI Assistance Reflection

- How prompts evolved
- What AI helped with
- What decisions were changed by human judgment
- Limitations of AI output

## 7. Limitations And Future Work

- No real login in MVP
- No payment system
- No cloud sync
- No WeChat Mini Program front end yet
- Future MySQL/FastAPI/WeChat architecture

## 8. Conclusion

- Summary of business value
- Summary of technical learning
- Why GymPath is a useful MVP foundation

