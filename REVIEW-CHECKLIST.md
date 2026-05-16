# REVIEW-CHECKLIST.md

Use this before marking any feature complete.

## Product Fit

- [ ] The change supports the GymPath MVP, not a future-only idea.
- [ ] The user can understand what to do next.
- [ ] The feature reduces fitness decision cost.
- [ ] Beginner and experienced user needs are separated clearly when needed.

## Architecture

- [ ] Core business logic lives outside the UI when possible.
- [ ] `project.py` remains meaningful and testable.
- [ ] New dependencies are justified and listed in `requirements.txt`.
- [ ] Database changes have a clear reason and do not break existing data.
- [ ] No unrelated files were rewritten.

## Testing

- [ ] New deterministic logic has pytest coverage.
- [ ] `python -m pytest` passes.
- [ ] The feature was manually tested in the React/Next app if it affects UI.
- [ ] `npm run typecheck` and `npm run build` pass after frontend changes.
- [ ] API failure paths were checked when touching AI features.

## UI Quality

- [ ] The interface works on mobile-sized screens.
- [ ] Important text is readable and does not overflow.
- [ ] The screen has a clear hierarchy and obvious primary action.
- [ ] No placeholder text remains.
- [ ] The design matches professional, clean, athletic, data-driven GymPath direction.

## Safety And Privacy

- [ ] No medical diagnosis claims were added.
- [ ] Severe pain cases tell users to stop and seek professional help.
- [ ] API keys are not hardcoded.
- [ ] The AI coach does not send unnecessary personal data.
- [ ] Community input length is controlled.

## Documentation

- [ ] README instructions still match the app.
- [ ] `MEMORY.md` is updated after meaningful changes.
- [ ] Prompt-log relevant decisions are captured in `docs/ai_prompt_log.md`.
