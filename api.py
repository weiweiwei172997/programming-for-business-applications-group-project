"""FastAPI wrapper for the GymPath Python core.

The React/Next frontend uses this file as a thin API layer while the course
required business logic stays in project.py.
"""

from __future__ import annotations

import secrets
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:
    pass

from project import (
    adjust_plan_after_feedback,
    assess_pain_response,
    calculate_bmi,
    calculate_calorie_target,
    calculate_day_meal_totals,
    calculate_protein_target,
    generate_diet_plan,
    generate_workout_plan,
    get_fat_loss_food_library,
    get_checkin_reward_status,
    get_ai_fitness_reply,
    get_joint_pain_guidance,
    get_knowledge_card,
    suggest_exercise_substitution,
    summarize_progress_trend,
)
from storage import (
    add_comment,
    add_checkin,
    create_workout_feedback,
    create_post,
    get_user_by_token,
    init_storage,
    list_checkins,
    list_measurements,
    list_posts,
    login_user,
    register_user,
    replace_measurements,
    toggle_like,
)


init_storage()

app = FastAPI(title="GymPath API", version="1.0.0")

COMMUNITY_UPLOAD_DIR = Path(__file__).resolve().parent / "data" / "uploads" / "community"
MAX_COMMUNITY_IMAGE_BYTES = 5 * 1024 * 1024
COMMUNITY_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PlanRequest(BaseModel):
    level: str = "beginner"
    goal: str = "muscle_gain"
    days_per_week: int = Field(default=3, ge=1, le=7)
    minutes_per_session: int = Field(default=60, ge=15, le=180)
    strength_plan_type: str = "auto"
    muscle_gain_plan_type: str = "auto"


class NutritionRequest(BaseModel):
    weight_kg: float = Field(gt=0)
    height_cm: float = Field(gt=0)
    age: int = Field(gt=0)
    gender: str = "male"
    goal: str = "muscle_gain"
    activity_level: str = "moderate"
    level: str = "beginner"
    days_per_week: int = Field(default=3, ge=1, le=7)
    minutes_per_session: int = Field(default=60, ge=0, le=240)
    diet_plan_type: str = "kaisheng_carb_cycle"
    carb_sensitivity: str = "standard"
    target_weight_kg: float | None = Field(default=None, gt=0)
    diet_training_intensity: str = "auto"


class PainRequest(BaseModel):
    exercise_name: str = "Barbell Bench Press"
    pain_location: str = "shoulder"
    pain_type: str = "pinch"
    pain_level: int = Field(default=3, ge=0, le=10)
    goal: str = "muscle_gain"


class FeedbackRequest(BaseModel):
    plan: dict[str, Any]
    completed: bool = True
    fatigue_level: int = Field(default=5, ge=0, le=10)
    duration_min: int = Field(default=60, ge=0, le=240)
    pain_level: int = Field(default=0, ge=0, le=10)
    pain_location: str = "shoulder"
    pain_type: str = "burn"
    exercise_name: str = "Barbell Bench Press"


class ProgressEntry(BaseModel):
    date: str
    weight_kg: float | None = None
    waist_cm: float | None = None
    body_fat_percent: float | None = None


class ProgressRequest(BaseModel):
    measurements: list[ProgressEntry]


class MealTotalsRequest(BaseModel):
    meals: dict[str, list[Any]]


class CheckinRewardRequest(BaseModel):
    checkin_dates: list[str]
    today: str | None = None


class CheckinCreateRequest(BaseModel):
    date: str


class AiChatMessage(BaseModel):
    role: str
    content: str


class AiChatRequest(BaseModel):
    messages: list[AiChatMessage]
    profile: dict[str, Any] | None = None


class RegisterRequest(BaseModel):
    username: str = Field(min_length=2, max_length=20)
    password: str = Field(min_length=6, max_length=72)
    email: str | None = None


class LoginRequest(BaseModel):
    identifier: str = Field(min_length=2, max_length=80)
    password: str = Field(min_length=6, max_length=72)


class PostCreateRequest(BaseModel):
    title: str = Field(min_length=2, max_length=80)
    content: str = Field(min_length=5, max_length=2000)


class CommentCreateRequest(BaseModel):
    content: str = Field(min_length=2, max_length=800)


def current_user(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="请先登录")
    token = authorization.split(" ", 1)[1].strip()
    user = get_user_by_token(token)
    if user is None:
        raise HTTPException(status_code=401, detail="登录已过期，请重新登录")
    return user


def optional_user(authorization: str | None = Header(default=None)) -> dict[str, Any] | None:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    return get_user_by_token(authorization.split(" ", 1)[1].strip())


def _bad_request(error: ValueError) -> HTTPException:
    return HTTPException(status_code=400, detail=str(error))


async def _save_community_image(image: UploadFile | None) -> str | None:
    if image is None or not image.filename:
        return None

    extension = COMMUNITY_IMAGE_TYPES.get(image.content_type or "")
    if extension is None:
        raise HTTPException(status_code=400, detail="只支持 JPG、PNG、WebP 或 GIF 图片")

    data = await image.read()
    if not data:
        return None
    if len(data) > MAX_COMMUNITY_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="图片不能超过 5MB")

    COMMUNITY_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{secrets.token_hex(16)}{extension}"
    (COMMUNITY_UPLOAD_DIR / filename).write_bytes(data)
    return filename


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "gympath-api"}


@app.post("/api/auth/register")
def auth_register(request: RegisterRequest) -> dict[str, Any]:
    try:
        return register_user(request.username, request.password, request.email)
    except ValueError as error:
        raise _bad_request(error) from error


@app.post("/api/auth/login")
def auth_login(request: LoginRequest) -> dict[str, Any]:
    try:
        return login_user(request.identifier, request.password)
    except ValueError as error:
        raise HTTPException(status_code=401, detail=str(error)) from error


@app.get("/api/auth/me")
def auth_me(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    return {"user": user}


@app.get("/api/community/posts")
def community_posts(user: dict[str, Any] | None = Depends(optional_user)) -> dict[str, Any]:
    return {"posts": list_posts(viewer_id=user["id"] if user else None)}


@app.post("/api/community/posts")
def community_create_post(request: PostCreateRequest, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    try:
        return create_post(user["id"], request.title, request.content)
    except ValueError as error:
        raise _bad_request(error) from error


@app.post("/api/community/posts-with-image")
async def community_create_post_with_image(
    title: str = Form(min_length=2, max_length=80),
    content: str = Form(min_length=5, max_length=2000),
    image: UploadFile | None = File(default=None),
    user: dict[str, Any] = Depends(current_user),
) -> dict[str, Any]:
    image_path = await _save_community_image(image)
    try:
        return create_post(user["id"], title, content, image_path=image_path)
    except ValueError as error:
        if image_path:
            (COMMUNITY_UPLOAD_DIR / image_path).unlink(missing_ok=True)
        raise _bad_request(error) from error


@app.get("/api/uploads/community/{filename}")
def community_uploaded_image(filename: str) -> FileResponse:
    safe_name = Path(filename).name
    if safe_name != filename:
        raise HTTPException(status_code=404, detail="图片不存在")

    image_path = COMMUNITY_UPLOAD_DIR / safe_name
    if not image_path.is_file():
        raise HTTPException(status_code=404, detail="图片不存在")
    return FileResponse(image_path)


@app.post("/api/community/posts/{post_id}/like")
def community_toggle_like(post_id: int, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    try:
        return toggle_like(user["id"], post_id)
    except ValueError as error:
        raise _bad_request(error) from error


@app.post("/api/community/posts/{post_id}/comments")
def community_add_comment(
    post_id: int,
    request: CommentCreateRequest,
    user: dict[str, Any] = Depends(current_user),
) -> dict[str, Any]:
    try:
        return add_comment(user["id"], post_id, request.content)
    except ValueError as error:
        raise _bad_request(error) from error


@app.get("/api/food-library")
def food_library() -> dict[str, Any]:
    return get_fat_loss_food_library()


@app.post("/api/meal-totals")
def meal_totals(request: MealTotalsRequest) -> dict[str, Any]:
    return calculate_day_meal_totals(request.meals)


@app.post("/api/checkin-reward")
def checkin_reward(request: CheckinRewardRequest) -> dict[str, Any]:
    return get_checkin_reward_status(request.checkin_dates, today=request.today)


@app.get("/api/checkins")
def user_checkins(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    return {"checkin_dates": list_checkins(user["id"])}


@app.post("/api/checkins")
def user_add_checkin(request: CheckinCreateRequest, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    try:
        return {"checkin_dates": add_checkin(user["id"], request.date)}
    except ValueError as error:
        raise _bad_request(error) from error


@app.post("/api/ai-chat")
def ai_chat(request: AiChatRequest, user: dict[str, Any] | None = Depends(optional_user)) -> dict[str, Any]:
    profile = dict(request.profile or {})
    if user:
        profile["account_username"] = user["username"]
    return get_ai_fitness_reply(
        [message.model_dump() for message in request.messages],
        profile=profile or None,
    )


@app.post("/api/plan")
def create_plan(request: PlanRequest) -> dict[str, Any]:
    return generate_workout_plan(
        level=request.level,
        goal=request.goal,
        days_per_week=request.days_per_week,
        minutes_per_session=request.minutes_per_session,
        strength_plan_type=request.strength_plan_type,
        muscle_gain_plan_type=request.muscle_gain_plan_type,
    )


@app.post("/api/nutrition")
def nutrition(request: NutritionRequest) -> dict[str, Any]:
    diet_plan = generate_diet_plan(
        request.weight_kg,
        request.goal,
        plan_type=request.diet_plan_type,
        height_cm=request.height_cm,
        age=request.age,
        gender=request.gender,
        minutes_per_session=request.minutes_per_session,
        days_per_week=request.days_per_week,
        level=request.level,
        activity_level=request.activity_level,
        carb_sensitivity=request.carb_sensitivity,
        target_weight_kg=request.target_weight_kg,
        training_intensity=request.diet_training_intensity,
    )
    calories = calculate_calorie_target(
        weight_kg=request.weight_kg,
        height_cm=request.height_cm,
        age=request.age,
        gender=request.gender,
        goal=request.goal,
        activity_level=request.activity_level,
    )
    if diet_plan.get("type") == "performance_macros":
        calories = {
            "maintenance_calories": diet_plan["maintenance_calories"],
            "target_calories": diet_plan["training_day_calories"],
            "rest_day_calories": diet_plan["rest_day_calories"],
            "goal": request.goal,
            "note": "训练日目标 = BMR + 生活消耗 + 训练消耗 + 约250 kcal；休息日目标 = BMR + 生活消耗 - 约600 kcal，且不低于 BMR。",
        }
    protein = calculate_protein_target(request.weight_kg, request.goal)
    bmi = calculate_bmi(request.weight_kg, request.height_cm)
    return {
        "bmi": bmi,
        "bmi_note": "BMI 只作为粗略参考。肌肉量较高的训练者要结合围度、力量、照片和体脂趋势判断。",
        "calories": calories,
        "protein": protein,
        "diet_plan": diet_plan,
    }


@app.post("/api/pain")
def pain_guidance(request: PainRequest) -> dict[str, Any]:
    assessment = assess_pain_response(
        pain_location=request.pain_location,
        pain_type=request.pain_type,
        pain_level=request.pain_level,
    )
    substitution = suggest_exercise_substitution(
        exercise_name=request.exercise_name,
        pain_location=request.pain_location,
        goal=request.goal,
    )
    joint_guidance = get_joint_pain_guidance(request.pain_location, request.goal)
    return {"assessment": assessment, "substitution": substitution, "joint_guidance": joint_guidance}


@app.post("/api/feedback")
def feedback(request: FeedbackRequest, user: dict[str, Any] | None = Depends(optional_user)) -> dict[str, Any]:
    feedback_payload = {
        "completed": request.completed,
        "fatigue_level": request.fatigue_level,
        "duration_min": request.duration_min,
        "pain_level": request.pain_level,
        "pain_location": request.pain_location,
        "pain_type": request.pain_type,
        "exercise_name": request.exercise_name,
    }
    adjustment = adjust_plan_after_feedback(
        request.plan,
        feedback_payload,
    )
    if user:
        adjustment["saved_feedback"] = create_workout_feedback(user["id"], feedback_payload, adjustment)
    return adjustment


@app.post("/api/progress")
def progress(request: ProgressRequest) -> dict[str, Any]:
    return summarize_progress_trend([entry.model_dump() for entry in request.measurements])


@app.get("/api/progress/measurements")
def user_measurements(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    return {"measurements": list_measurements(user["id"])}


@app.put("/api/progress/measurements")
def user_replace_measurements(request: ProgressRequest, user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    return {"measurements": replace_measurements(user["id"], [entry.model_dump() for entry in request.measurements])}


@app.get("/api/knowledge/{topic}")
def knowledge(topic: str) -> dict[str, str]:
    return get_knowledge_card(topic)
