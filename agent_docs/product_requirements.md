# Product Requirements

## Product

**GymPath** is a mobile-first fitness web app that reduces fitness decision fatigue by combining training plans, warm-ups, teaching links, nutrition plans, pain-aware substitutions, progress tracking, community, and AI coaching.

## Target Users

| Segment | Need | GymPath response |
|---|---|---|
| Beginner | Safe start, no confusion, fast feedback | Four-day beginner split, warm-up guidance, beginner knowledge cards |
| Restarting user | Lower barrier after breaks | Reduced-volume restart plans and flexible adjustment |
| Experienced lifter | More useful guidance than basic tutorials | Split plans, strength plans, substitutions, advanced education |
| Health-first user | Diet-first or no-gym movement | Nutrition guidance and home upper/lower bodyweight plan |

## Core User Journey

1. User opens GymPath.
2. User registers/logs in or uses guest preview.
3. User selects level, goal, plan type, body data, activity level, and session time.
4. App generates a training plan and nutrition guidance.
5. User views warm-up, activation, exercise teaching links, and diet targets.
6. User reports pain or workout feedback.
7. App gives substitutions, recovery guidance, and light next-plan adjustment.
8. User checks in and can earn seven-day supplement lottery eligibility.
9. User saves measurements and sees weight/waist/body-fat trend lines.
10. User posts, comments, likes, and asks the AI coach questions.

## Must-Have Features

| Feature | Requirement |
|---|---|
| Account gate | Register/login on app entry, with guest preview option |
| Training profile | Level, goal, plan type, body data, activity level, session time |
| Training plan | Beginner four-day split, restarting plans, advanced splits, strength plans, muscle-gain variants, health/home plans |
| Warm-up/teaching | Each workout includes warm-up and Bilibili/Douyin-oriented teaching links where available |
| Nutrition | Goal-based calories/macros, fat-loss plan selector, muscle-gain/strength nutrition rules, food logging |
| Pain replacement | Anatomy map, pain type/severity, joint-specific substitutions, relief, rehab, and videos |
| Feedback/check-in | Completion, fatigue, pain, duration, plan adjustment, seven-day lottery |
| Progress | Logged-in users can save measurements and view trend lines |
| Community | Logged-in users can create posts with optional photos, like, and comment |
| AI coach | Uses DeepSeek-compatible API when configured; local fallback remains available |
| Knowledge | Beginner myth-busting and training education cards |

## Explicit MVP Boundaries

Included:

- Local SQLite persistence
- LAN/public-tunnel demo from the user's computer
- Local account/session system
- Course-required Python files and pytest tests
- Mobile-first web UI

Excluded:

- Real payment/VIP flow
- Cloud-hosted production database
- Password reset email
- WeChat Mini Program frontend
- Medical diagnosis
- Wearable-device integration
- Large uncurated exercise database

## Success Metrics

- User can complete register/login -> plan -> warm-up -> feedback -> check-in -> progress -> community/AI flow.
- Logged-in measurement and check-in data persist after refresh/login.
- Community post/comment/like works from another logged-in account, including optional photo posts.
- AI coach answers when API key is configured and falls back when not configured.
- App remains usable on mobile-sized screens.

## Safety Rules

- Pain guidance is educational, not diagnosis.
- Severe, sharp, worsening, radiating pain, numbness, or loss of function should trigger stop-and-seek-professional-help messaging.
- BMI is a rough reference only, especially for muscular users.
- Avoid unsafe promises such as spot reduction, guaranteed fat loss, or injury treatment claims.
