# Code Patterns

Use these patterns when implementing GymPath.

## Core Logic Pattern

Core logic belongs in `project.py`, not in Streamlit UI.

```python
def recommend_training_split(level: str, goal: str, days_per_week: int) -> dict:
    """Recommend a training split based on user level, goal, and weekly availability."""
    if days_per_week < 1:
        raise ValueError("days_per_week must be at least 1")

    normalized_level = level.lower().strip()
    normalized_goal = goal.lower().strip()

    if normalized_level == "beginner":
        return {
            "split_name": "Full Body",
            "days": days_per_week,
            "reason": "Beginners usually progress better with simple full-body practice.",
            "notes": ["Keep volume manageable.", "Prioritize technique and consistency."],
        }

    if normalized_level == "experienced" and days_per_week >= 5:
        return {
            "split_name": "Push Pull Legs",
            "days": days_per_week,
            "reason": "Experienced lifters can handle higher frequency and more specialization.",
            "notes": ["Track recovery.", "Use substitutions if joint discomfort appears."],
        }

    return {
        "split_name": "Upper Lower",
        "days": days_per_week,
        "reason": "Balanced training split for moderate experience and schedule flexibility.",
        "notes": ["Adjust volume based on fatigue.", "Keep sessions within available time."],
    }
```

## Workout Plan Output Shape

Use a predictable dictionary shape so UI and tests can rely on it.

```python
{
    "level": "beginner",
    "goal": "muscle_gain",
    "split": "Full Body",
    "weekly_schedule": [
        {
            "day": "Day 1",
            "focus": "Full Body A",
            "warmup": ["5 min incline walk", "Band pull-aparts", "Bodyweight squats"],
            "exercises": [
                {
                    "name": "Goblet Squat",
                    "sets": 3,
                    "reps": "8-12",
                    "rest_seconds": 90,
                    "notes": "Control the descent and keep knees tracking over toes.",
                    "teaching_url": "https://..."
                }
            ]
        }
    ]
}
```

## Pain Response Pattern

Pain guidance must be cautious and non-diagnostic.

```python
def assess_pain_response(pain_location: str, pain_type: str, pain_level: int) -> dict:
    """Classify workout discomfort and recommend a safe next action."""
    if pain_level < 0 or pain_level > 10:
        raise ValueError("pain_level must be between 0 and 10")

    risky_types = {"sharp", "numbness", "radiating", "worsening"}
    normalized_type = pain_type.lower().strip()

    if pain_level >= 8 or normalized_type in risky_types:
        return {
            "category": "stop",
            "action": "Stop this exercise today and consider professional help if symptoms continue.",
            "medical_note": "GymPath does not diagnose injuries or medical conditions.",
        }

    if pain_level >= 5:
        return {
            "category": "modify_or_replace",
            "action": "Reduce load, shorten range of motion, or choose a substitute exercise.",
            "medical_note": "If pain worsens, stop training the movement.",
        }

    return {
        "category": "continue_with_cues",
        "action": "Continue carefully with form cues and controlled tempo.",
        "medical_note": "Monitor changes during the set.",
    }
```

## Plan Adjustment Pattern

Keep adjustments light and explainable.

```python
def adjust_plan_after_feedback(plan: dict, feedback: dict) -> dict:
    """Return a lightly adjusted plan summary based on workout feedback."""
    fatigue = feedback.get("fatigue_level", 0)
    duration = feedback.get("duration_min", 0)
    pain_level = feedback.get("pain_level", 0)

    adjustment = {
        "volume_multiplier": 1.0,
        "notes": [],
        "replace_exercise": False,
    }

    if fatigue >= 8:
        adjustment["volume_multiplier"] = 0.75
        adjustment["notes"].append("Next similar workout should reduce total sets by about 25%.")

    if duration >= 90:
        adjustment["notes"].append("Shorten accessory work to keep the session realistic.")

    if pain_level >= 5:
        adjustment["replace_exercise"] = True
        adjustment["notes"].append("Suggest a substitute movement next time.")

    return adjustment
```

## AI Coach Pattern

Keep AI optional and safe.

```python
def build_ai_context(profile: dict, plan: dict, feedback: dict, question: str) -> dict:
    """Build limited, non-sensitive context for the AI coach."""
    return {
        "level": profile.get("level"),
        "goal": profile.get("goal"),
        "days_per_week": profile.get("days_per_week"),
        "current_plan_summary": plan.get("split") if plan else None,
        "recent_feedback": {
            "fatigue_level": feedback.get("fatigue_level") if feedback else None,
            "pain_level": feedback.get("pain_level") if feedback else None,
            "pain_location": feedback.get("pain_location") if feedback else None,
        },
        "question": question,
    }
```

Fallback rule:

- If no API key exists, use local beginner education responses.
- If API call fails, show a fallback answer and keep the app running.
- Do not block plan generation, logging, or community features because of AI failure.

## SQLite Pattern

Use parameterized queries only.

```python
def add_post(conn, nickname: str, title: str, content: str, category: str) -> int:
    cursor = conn.execute(
        """
        INSERT INTO community_posts (nickname, title, content, category, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
        """,
        (nickname, title, content, category),
    )
    conn.commit()
    return int(cursor.lastrowid)
```

Never build SQL with string concatenation.

## Streamlit State Pattern

Use `st.session_state` only for UI state. Persist important user data to SQLite.

```python
if "current_plan" not in st.session_state:
    st.session_state["current_plan"] = None
```

## UI Styling Pattern

Use custom CSS sparingly, with reusable classes.

```python
st.markdown(
    """
    <style>
    .gym-card {
        border: 1px solid rgba(120, 120, 120, 0.22);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 0.75rem;
        background: rgba(255, 255, 255, 0.92);
    }
    .gym-badge {
        display: inline-block;
        padding: 0.2rem 0.5rem;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 700;
        background: #d8f85a;
        color: #172014;
    }
    </style>
    """,
    unsafe_allow_html=True,
)
```

Design rule:

- Professional, clean, athletic, data-driven.
- Do not make it look like a plain school assignment form.
- Use the `frontend-design` skill standard when available.

