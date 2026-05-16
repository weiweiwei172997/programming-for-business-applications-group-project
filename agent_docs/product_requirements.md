# Product Requirements

## Product

**Name:** GymPath  
**Tagline:** Train smarter, adjust faster, and see visible progress.  
**Platform:** Mobile-first web app  
**Description:** A layered fitness growth platform that helps different training levels reduce decision fatigue and directly receive suitable training plans, exercise teaching, diet suggestions, workout feedback, community interaction, and AI-assisted fitness education.

## Target Users

| Segment | Needs | GymPath Response |
|---|---|---|
| Beginner | Safe start, no confusion, full-body training, basic nutrition guidance, myth busting | Simple assessment, full-body plans, warm-up guidance, beginner education |
| Restarting user | Low-pressure return, reduced volume, flexible adaptation | Restart mode, dynamic plan reduction, recovery-aware adjustments |
| Advanced lifter | Split routines, higher-level theory, exercise substitutions, better progression | Split training, advanced knowledge, pain-aware substitutions, progression logic |
| Health-first user | Does not want a full gym routine and may want diet-only or simple home movement | Diet guidance only or simple home-bodyweight mode |

## Problem

Fitness content is fragmented, noisy, and inconsistent. Many apps are too basic, too logging-focused, too home-workout oriented, or too advanced without enough explanation. Users often do not know:

- what to train today
- how to eat for their goal
- which fitness claims are wrong
- whether pain is a form issue, normal discomfort, or a stop signal
- when to replace an exercise
- how to adapt when training feels too hard or too long
- how to judge progress beyond body weight

## Primary User Story

As a user, I want GymPath to understand my training level, goal, available time, and feedback so it can give me a practical training plan, guide me through warm-up and exercises, help me log the workout, and adjust later sessions so I can keep improving without guessing.

## Must-Have Features

### 1. User Assessment

**What it does:** Collects height, weight, age, training level, experience, available days, available time, goal, equipment access, and preferred style.  
**User story:** As a user, I want the app to understand me so it can give relevant guidance.  
**Acceptance criteria:** Profile form exists. BMI is shown only as a basic reference for beginners. Advanced users are guided more by body fat, measurements, strength, and recovery than BMI.

### 2. Adaptive Training Plan Engine

**What it does:** Generates full-body plans for beginners and split plans for advanced users. Adapts when the user is tired, short on time, or rates a workout as too hard.  
**User story:** As a user, I want the plan to adjust so I can keep training realistically.  
**Acceptance criteria:** Plan output changes based on level, goal, time, fatigue, and training feedback.

### 3. Warm-Up And Activation

**What it does:** Shows pre-workout warm-up, activation, and injury-prevention guidance.  
**User story:** As a user, I want a warm-up that fits my workout so I can train safely.  
**Acceptance criteria:** Each session includes a warm-up block and brief activation cues.

### 4. Pain-Aware Exercise Guidance

**What it does:** Lets users report pain type, location, and severity, then suggests substitute exercises or technique cues.  
**User story:** As a user, I want help deciding whether to keep going, modify, or stop.  
**Acceptance criteria:** App classifies reported discomfort into low-risk, form-related, caution, or stop cases. Severe pain triggers a stop-and-seek-help message.

### 5. Exercise Library

**What it does:** Shows curated gym-based exercises with teaching links, notes, target muscles, and substitute movements.  
**User story:** As a user, I want clear exercise teaching so I can train correctly.  
**Acceptance criteria:** Each core exercise includes a description, cues, and at least one external teaching link.

### 6. Nutrition Guidance

**What it does:** Gives calorie/protein guidance and simple meal planning. Supports diet-only mode.  
**User story:** As a user, I want practical nutrition help so I can match food to my goal.  
**Acceptance criteria:** Users can get nutrition targets. Health-first users can choose diet-only or light home-workout guidance.

### 7. Progress Tracking And Charts

**What it does:** Records weight, body measurements, workout volume, workout time, perceived effort, pain score, and adherence.  
**User story:** As a user, I want to see trends so I feel progress.  
**Acceptance criteria:** The app stores metrics and displays trend charts or summaries.

### 8. Community Feed

**What it does:** Lets users post, comment, and like using a nickname.  
**User story:** As a user, I want to share and react without friction.  
**Acceptance criteria:** Users can set a nickname, post updates, comment, and like posts.

### 9. AI Coach

**What it does:** Answers training, nutrition, adjustment, and recovery questions using the user's current context.  
**User story:** As a user, I want quick answers in plain language.  
**Acceptance criteria:** Users can chat with the coach. If the API is unavailable, a fallback guidance mode still works.

### 10. Knowledge Center

**What it does:** Explains common fitness myths and beginner mistakes.  
**User story:** As a user, I want the app to correct my blind spots so I do not keep asking the wrong questions.  
**Acceptance criteria:** App includes short educational cards such as spot-reduction myths, split-vs-full-body guidance, recovery basics, BMI limitations, and safe progression.

## Nice-To-Have If MVP Is Stable

- Better community sorting and tags
- More measurement types and richer charts
- More exercise substitutions
- More advanced recovery education

## Not In MVP

- Real account login
- VIP payment or subscription flow
- Cloud sync across devices
- WeChat Mini Program front end
- Medical diagnosis or injury treatment claims
- Massive exercise database
- Full wearable-device integration

## Success Metrics

| Metric | Target | Why It Matters |
|---|---|---|
| Core flow completion | Users can go from assessment to plan to warm-up to workout feedback to progress view without blocking bugs | Confirms the app is usable end to end |
| Engagement | Test users complete at least one check-in and one follow-up action such as a post, comment, or AI question | Shows the app creates repeat use |
| Retention intent | Test users say they would use the app again for planning, logging, or teaching | Indicates the concept is worth continuing |
| Satisfaction | Most testers rate the experience as clear, useful, and professional-looking | Measures whether the product feels credible |

## UI/UX Requirements

Design direction:

- professional
- clean
- athletic
- data-driven

Visual principles:

1. Clear hierarchy first, decoration second.
2. Card-based content with strong spacing.
3. Neutral background with one confident accent color.
4. Charts and progress indicators should feel motivating, not noisy.
5. Community screens can feel social, but still stay clean and readable.

Key screens:

1. Today - current plan, warm-up, and check-in
2. Plan - weekly training plan and exercise substitutions
3. Log - measurements, pain, fatigue, and workout feedback
4. Community - posts, comments, likes, and nickname profile
5. Learn - myths, beginner guidance, recovery, and training theory
6. Coach - AI chat for questions and plan adjustments

## Constraints

- Mobile-first web app.
- Core implementation must be Python.
- `project.py` must contain `main()` and at least three custom top-level functions.
- `test_project.py` must include pytest tests for at least three functions.
- Data can be lightweight and local for MVP.
- No real auth, payment, cloud sync, or WeChat front end in MVP.
- Pain and injury content must be educational and cautious, not medical diagnosis.

## Definition Of Done

The MVP is ready when:

- A user can complete assessment -> plan -> warm-up -> workout -> feedback -> adjustment -> chart view.
- The community supports post, comment, and like through a nickname.
- The AI coach can answer common training questions or fall back gracefully.
- The app shows visible progress trends.
- The design feels professional and not cluttered.
- The core experience works on mobile-sized screens.

