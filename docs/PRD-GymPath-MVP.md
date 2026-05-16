# Product Requirements Document: GymPath MVP

**Product Name:** GymPath  
**Tagline:** Train smarter, adjust faster, and see visible progress.  
**Platform:** Mobile-first web app

## 1. Executive Summary

GymPath is a mobile-first fitness web app for users at different training levels. It helps beginners start safely, helps returning users restart without overwhelm, and helps advanced lifters progress with split training, exercise substitutions, pain-aware adjustments, nutrition guidance, community interaction, and AI coaching.

The product focuses on reducing fitness decision fatigue. Instead of forcing users to search across fragmented videos, posts, and apps, GymPath gives them a structured path: assessment -> plan -> warm-up -> workout -> feedback -> adjustment -> visible progress.

## 2. Problem Statement

### Who has this problem?
- Beginners who do not know what to train, how to eat, or which advice is trustworthy
- Returning users who need a low-pressure way to restart
- Experienced lifters who need split routines, better progression, and smarter adjustments
- Health-focused users who do not want a full gym routine and mainly want diet or simple home options

### What is the problem?
Fitness content is fragmented, noisy, and inconsistent. Many apps are either too basic, too logging-focused, too home-workout oriented, or too advanced without enough explanation. Users do not know:
- what to do today
- whether a movement pain is a form issue, normal training sensation, or a stop signal
- when to replace an exercise
- how to adapt when they are too tired or too busy
- how to judge progress beyond body weight alone

### Why is it painful?
- Beginners get overwhelmed and ask the wrong questions
- Advanced users waste time building plans manually
- Users quit when workouts feel too long, too hard, or too confusing
- Users lack positive feedback loops that make progress feel real

### Why existing solutions fall short
| Product | Gap GymPath addresses |
|---|---|
| Keep | Strong general fitness brand, but often feels broad and less centered on gym-style progression for all levels |
| MyFitnessPal | Excellent nutrition tracking, but not enough workout guidance and adaptive training support |
| Strong | Great logging tool, but weaker on education, plan explanation, and adaptive guidance |
| Fitbod | Smart workout generation, but more opaque and more subscription-driven than a lightweight MVP needs |

## 3. Target Users

| Segment | Needs | GymPath response |
|---|---|---|
| Beginner | Safe start, no confusion, full-body training, basic nutrition guidance, myth busting | Simple assessment, full-body plans, warm-up guidance, beginner education |
| Restarting user | Low-pressure return, reduced volume, flexible adaptation | Restart mode, dynamic plan reduction, recovery-aware adjustments |
| Advanced lifter | Split routines, higher-level theory, exercise substitutions, better progression | Split training, advanced knowledge, pain-aware substitutions, progression logic |
| Health-first user | "I do not want to go to the gym", diet-first or light home work | Diet guidance only or simple home-bodyweight mode |

## 4. Product Vision

GymPath should feel like a professional training companion, not a content dump. The app should:
- tell users what to do
- explain why it matters
- adapt when the workout is too hard, too long, or uncomfortable
- show visible progress through charts and measurements
- support social motivation through community posting and feedback
- reduce common beginner confusion and false fitness beliefs

## 5. Core User Journey

1. User opens GymPath.
2. User enters profile data such as height, weight, age, experience, training level, available days, available time, and goal.
3. GymPath generates a plan:
   - beginners get full-body training
   - advanced users get split training
   - health-first users can get diet-only or home-bodyweight guidance
4. Before training, GymPath shows warm-up and activation guidance.
5. During or after training, the user can report pain, fatigue, workout duration, and perceived difficulty.
6. GymPath suggests substitutions, form cues, rest adjustments, or a lighter plan if needed.
7. The user logs measurements and check-ins.
8. Charts show progress trends and create positive feedback.
9. The user can post, comment, and like in the community using a nickname.
10. The AI coach answers questions using the user's current plan and feedback.

## 6. MVP Scope

### Must-have features
| Feature | What it does | User story | Acceptance criteria |
|---|---|---|---|
| User assessment | Collects height, weight, age, training level, experience, available days, available time, goal, equipment access, and preferred style | As a user, I want the app to understand me so it can give relevant guidance | Profile form exists; BMI is shown only as a basic reference for beginners; advanced users are guided more by body fat, measurements, strength, and recovery than BMI |
| Adaptive training plan engine | Generates full-body plans for beginners and split plans for advanced users; adapts when the user is tired, short on time, or rates a workout as too hard | As a user, I want the plan to adjust so I can keep training realistically | Plan output changes based on level, goal, time, fatigue, and training feedback |
| Warm-up and activation | Shows pre-workout warm-up, activation, and injury-prevention guidance | As a user, I want a warm-up that fits my workout so I can train safely | Each session includes a warm-up block and brief activation cues |
| Pain-aware exercise guidance | Lets users report pain type, location, and severity, then suggests substitute exercises or technique cues | As a user, I want help deciding whether to keep going, modify, or stop | App classifies reported discomfort into low-risk, form-related, caution, or stop cases; severe pain triggers a stop-and-seek-help message |
| Exercise library | Shows curated gym-based exercises with teaching links, notes, target muscles, and substitute movements | As a user, I want clear exercise teaching so I can train correctly | Each core exercise includes a description, cues, and at least one external teaching link |
| Nutrition guidance | Gives calorie/protein guidance and simple meal planning; also supports diet-only mode | As a user, I want practical nutrition help so I can match food to my goal | Users can get nutrition targets; health-first users can choose diet-only or light home-workout guidance |
| Progress tracking and charts | Records weight, body measurements, workout volume, workout time, perceived effort, pain score, and adherence | As a user, I want to see trends so I feel progress | The app stores metrics and displays trend charts or summaries |
| Community feed | Lets users post, comment, and like using a nickname | As a user, I want to share and react without friction | Users can set a nickname, post updates, comment, and like posts |
| AI coach | Answers training, nutrition, adjustment, and recovery questions using the user's current context | As a user, I want quick answers in plain language | Users can chat with the coach; if the API is unavailable, a fallback guidance mode still works |
| Knowledge center | Explains common fitness myths and beginner mistakes | As a user, I want the app to correct my blind spots so I do not keep asking the wrong questions | App includes short educational cards such as spot-reduction myths, split-vs-full-body guidance, and recovery basics |

### Nice-to-have if the MVP is stable
- Better community sorting and tags
- More measurement types and richer charts
- More exercise substitutions
- More advanced recovery education

## 7. Success Metrics

| Metric | Target | Why it matters |
|---|---|---|
| Core flow completion | Users can go from assessment to plan to warm-up to workout feedback to progress view without blocking bugs | Confirms the app is usable end to end |
| Engagement | Test users complete at least one check-in and one follow-up action such as a post, comment, or AI question | Shows the app creates repeat use |
| Retention intent | Test users say they would use the app again for planning, logging, or teaching | Indicates the concept is worth continuing |
| Satisfaction | Most testers rate the experience as clear, useful, and professional-looking | Measures whether the product feels credible |

## 8. Look and Feel

**Design direction:** professional, clean, athletic, and data-driven

### Visual principles
1. Clear hierarchy first, decoration second
2. Card-based content with strong spacing
3. Neutral background with one confident accent color
4. Charts and progress indicators should feel motivating, not noisy
5. Community screens can feel social, but still stay clean and readable

### Key screens
1. **Today** - current plan, warm-up, and check-in
2. **Plan** - weekly training plan and exercise substitutions
3. **Log** - measurements, pain, fatigue, and workout feedback
4. **Community** - posts, comments, likes, and nickname profile
5. **Learn** - myths, beginner guidance, recovery, and training theory
6. **Coach** - AI chat for questions and plan adjustments

## 9. Technical Considerations

### Platform
- Mobile-first web app
- Future WeChat Mini Program is a later expansion, not part of the MVP

### Data and logic
- Core behavior should be rule-based and transparent
- User data can be stored locally in a lightweight format for the MVP
- AI coaching can use an external API if available
- The app should still have a fallback when the AI API is unavailable

### Safety and privacy
- The app must not claim to diagnose injuries or medical conditions
- Pain guidance should be educational and cautious
- Severe, worsening, or unusual pain should trigger a stop-and-seek-help message
- The app should avoid unnecessary sensitive data collection

### Usability
- Works well on phone screens
- Fast to navigate
- Easy for beginners, but still useful for advanced users
- No account friction for the MVP community flow; nickname mode is acceptable

## 10. Constraints and Assumptions

### Constraints
- No real account login in the MVP
- No payment system in the MVP
- No cloud sync in the MVP
- No WeChat Mini Program in the MVP
- No large uncurated exercise library

### Assumptions
- Users are willing to enter a few profile details in exchange for personalized guidance
- Users accept nickname-based community participation for the first version
- Users want practical guidance more than a huge content library

## 11. Out of Scope

Not in the MVP:
- Real account login
- VIP payment / subscription flow
- Cloud sync across devices
- WeChat Mini Program front end
- Medical diagnosis or injury treatment claims
- Massive exercise database
- Full wearable-device integration

## 12. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Pain guidance looks like medical advice | Safety concern | Keep language educational, add stop rules, and avoid diagnosis claims |
| Community without real accounts feels weak | Product credibility risk | Make nickname mode polished and visually similar to a real community |
| Scope gets too large | Delivery risk | Keep the first version focused on the adaptive workout loop and visible progress |
| AI API fails | Demo risk | Add fallback guidance so the app still works |
| Beginner and advanced needs conflict | UX confusion | Separate beginner full-body mode and advanced split mode clearly |

## 13. Definition of Done

The MVP is ready when:
- a user can complete assessment -> plan -> warm-up -> workout -> feedback -> adjustment -> chart view
- the community supports post, comment, and like through a nickname
- the AI coach can answer common training questions
- the app shows visible progress trends
- the design feels professional and not cluttered
- the core experience works on mobile-sized screens

## 14. Future Versions

GymPath v2 can add:
- real accounts
- payments
- cloud sync
- WeChat Mini Program
- richer community moderation
- deeper recovery and rehab flows
- broader exercise libraries
- more personalized long-term periodization

