import pytest

from project import (
    adjust_plan_after_feedback,
    assess_pain_response,
    calculate_bmi,
    calculate_checkin_streak,
    calculate_day_meal_totals,
    calculate_meal_totals,
    calculate_protein_target,
    classify_user_level,
    generate_diet_plan,
    generate_workout_plan,
    get_fat_loss_food_library,
    get_checkin_reward_status,
    recommend_training_split,
)


def test_calculate_bmi_valid_input():
    assert calculate_bmi(70, 175) == 22.9


def test_calculate_bmi_rejects_invalid_height():
    with pytest.raises(ValueError):
        calculate_bmi(70, 0)


def test_classify_user_level_beginner():
    assert classify_user_level(2, 1, "new") == "beginner"


def test_classify_user_level_experienced():
    assert classify_user_level(24, 4, "consistent") == "experienced"


def test_recommend_training_split_beginner():
    split = recommend_training_split("beginner", "muscle_gain", 3)
    assert split["split_name"] == "Beginner Four-Day Split"
    assert split["days"] == 4
    assert "four-day" in split["reason"]


def test_recommend_training_split_advanced():
    split = recommend_training_split("experienced", "muscle_gain", 5)
    assert split["split_name"] == "Push Pull Legs"


def test_generate_workout_plan_has_required_fields():
    plan = generate_workout_plan("beginner", "muscle_gain", 3, 60)
    assert plan["split"]["split_name"] == "Tan Chengyi Beginner Follow Along"
    assert plan["muscle_gain_plan"]["title"] == "谭成义新手跟练"
    assert plan["days_per_week"] == 4
    assert len(plan["weekly_schedule"]) == 5

    first_day = plan["weekly_schedule"][0]
    assert first_day["focus"] == "Beginner Chest Shoulders Triceps"
    assert first_day["session_video_url"] == "https://www.bilibili.com/video/BV1S8ArzREru/"
    assert first_day["warmup_video_url"].startswith("https://www.bilibili.com/video/")
    assert first_day["warmup"]
    assert first_day["exercises"]

    first_exercise = first_day["exercises"][0]
    assert {"name", "sets", "reps", "rest_seconds", "teaching_url"} <= set(first_exercise)
    assert first_exercise["name"] == "Cable Fly"
    assert first_exercise["phase"] == "主项"
    assert first_exercise["sets"] == 4
    assert first_exercise["reps"] == "12"
    assert first_exercise["rest_seconds"] >= 120
    assert "rest_guidance" not in first_exercise
    assert "至少 2 分钟" in first_day["rest_policy"]
    assert first_exercise["teaching_url"] == first_day["session_video_url"]
    assert "search" not in first_exercise["teaching_url"].lower()
    assert "youtube" not in first_exercise["teaching_url"].lower()
    assert "teaching_title" not in first_exercise
    assert "teaching_creator" not in first_exercise
    assert "teaching_platform" not in first_exercise
    assert "video_creators" not in first_exercise

    rest_day = plan["weekly_schedule"][3]
    assert rest_day["is_rest_day"] is True
    assert rest_day["exercises"] == []


def test_generate_workout_plan_health_uses_home_upper_lower_plan():
    plan = generate_workout_plan("beginner", "health", 2, 45)

    assert plan["split"]["split_name"] == "Home Upper Lower Health"
    assert plan["days_per_week"] == 2
    assert [day["focus"] for day in plan["weekly_schedule"]] == ["Home Upper Body", "Home Lower Body"]
    assert plan["weekly_schedule"][0]["session_video_url"] == "https://www.bilibili.com/video/BV1L2cazNELf/"
    assert plan["weekly_schedule"][1]["session_video_url"] == "https://www.bilibili.com/video/BV1LbcWzyE64/"
    assert "Push-up" in [exercise["name"] for exercise in plan["weekly_schedule"][0]["exercises"]]
    assert "Bulgarian Split Squat" in [exercise["name"] for exercise in plan["weekly_schedule"][1]["exercises"]]


def test_generate_workout_plan_strength_plan_options():
    beginner = generate_workout_plan("beginner", "strength_gain", 3, 60, strength_plan_type="beginner_ab_linear")
    assert beginner["split"]["split_name"] == "Beginner AB Linear Strength"
    assert beginner["strength_plan"]["title"] == "小白A/B轮线性力量"
    assert beginner["weekly_schedule"][0]["focus"] == "A轮：深蹲 + 卧推 + 硬拉"
    assert beginner["weekly_schedule"][0]["exercises"][0]["name"] == "Back Squat"
    assert beginner["weekly_schedule"][0]["exercises"][0]["sets"] == 5
    assert beginner["weekly_schedule"][0]["exercises"][0]["reps"] == "5"
    assert "22法则" in " ".join(beginner["strength_plan"]["progression_rules"])

    advanced = generate_workout_plan("experienced", "strength_gain", 4, 75, strength_plan_type="advanced_linear_5x5")
    assert advanced["split"]["split_name"] == "Advanced Linear Strength"
    assert "70%" in advanced["weekly_schedule"][0]["exercises"][0]["reps"]
    assert any("立即减载" in item for item in advanced["strength_plan"]["warnings"])

    universal = generate_workout_plan("restarting", "strength_gain", 3, 60, strength_plan_type="universal_5x5_split")
    assert universal["split"]["split_name"] == "Universal 5x5 Strength Split"
    assert universal["weekly_schedule"][0]["focus"] == "推日：卧推5x5"
    assert any("RPE" in item for item in universal["strength_plan"]["progression_rules"])


def test_generate_workout_plan_muscle_gain_plan_options():
    beginner = generate_workout_plan(
        "beginner",
        "muscle_gain",
        3,
        60,
        muscle_gain_plan_type="tan_chengyi_beginner_follow",
    )
    assert beginner["split"]["split_name"] == "Tan Chengyi Beginner Follow Along"
    assert beginner["muscle_gain_plan"]["title"] == "谭成义新手跟练"
    assert beginner["weekly_schedule"][0]["focus"] == "Beginner Chest Shoulders Triceps"

    three_split = generate_workout_plan(
        "experienced",
        "muscle_gain",
        3,
        75,
        muscle_gain_plan_type="tan_kaisheng_three_split",
    )
    assert three_split["split"]["split_name"] == "Tan Chengyi Kaisheng Three-Day Split"
    assert three_split["weekly_schedule"][0]["focus"] == "胸 + 三角肌中束 + 三头肌"
    assert three_split["weekly_schedule"][0]["exercises"][0]["reps"] == "15热身 + 12-10-8正式"

    orange = generate_workout_plan(
        "experienced",
        "muscle_gain",
        5,
        90,
        muscle_gain_plan_type="orange_hypertrophy",
    )
    assert orange["split"]["split_name"] == "Orange Three-Phase Hypertrophy"
    assert orange["muscle_gain_plan"]["title"] == "橙子增肌计划"
    assert any(day["day"] == "第三阶段 第一天" for day in orange["weekly_schedule"])


def test_muscle_gain_plan_does_not_use_full_body_templates():
    plan = generate_workout_plan("restarting", "muscle_gain", 2, 60)
    rendered = str(plan)
    assert "Full Body" not in rendered
    assert "全身训练" not in rendered


def test_calculate_protein_target_fat_loss_range():
    target = calculate_protein_target(80, "fat_loss")
    assert target["min_grams"] == 144
    assert target["max_grams"] == 192


def test_generate_diet_plan_fat_loss_carb_cycle_uses_weight_formula():
    plan = generate_diet_plan(93, "fat_loss")
    assert plan["type"] == "fat_loss_carb_cycle"
    assert plan["baseline_daily"]["carbs_g"] == 186
    assert plan["baseline_daily"]["fat_g"] == 74
    assert plan["baseline_daily"]["protein_g"] == 120
    assert plan["weekly_totals"]["carbs_g"] == 1302
    assert plan["weekly_totals"]["fat_g"] == 518
    assert plan["weekly_totals"]["protein_g"] == 840

    cycle = {day["key"]: day for day in plan["cycle_days"]}
    assert cycle["high_carb"]["days_per_week"] == 2
    assert cycle["high_carb"]["carbs_g"] == 326
    assert cycle["high_carb"]["fat_g"] == 39
    assert cycle["medium_carb"]["days_per_week"] == 3
    assert cycle["medium_carb"]["carbs_g"] == 152
    assert cycle["medium_carb"]["fat_g"] == 60
    assert cycle["low_carb"]["days_per_week"] == 2
    assert cycle["low_carb"]["carbs_g"] == 97
    assert cycle["low_carb"]["fat_g"] == 130
    assert plan["meal_timing"]["protein_per_meal_g"] == "20-40"


def test_generate_diet_plan_orange_carb_taper_uses_bmr_and_training_burn():
    plan = generate_diet_plan(
        90,
        "fat_loss",
        plan_type="orange_carb_taper",
        height_cm=185,
        age=20,
        gender="male",
        minutes_per_session=60,
        level="beginner",
        carb_sensitivity="standard",
        target_weight_kg=75,
        training_intensity="beginner_or_female",
    )
    assert plan["type"] == "orange_carb_taper"
    assert plan["bmr"] == 1961
    assert plan["training_burn"]["intensity_factor"] == 5
    assert plan["training_burn"]["calories"] == 300
    assert plan["daily_expenditure"] == 2261
    assert plan["macro_ratio"]["label"] == "标准 5/3/2"
    assert plan["baseline_daily"]["carbs_g"] == 283
    assert plan["baseline_daily"]["protein_g"] == 170
    assert plan["baseline_daily"]["fat_g"] == 50
    assert plan["target_timeline"]["target_loss_kg"] == 15
    assert plan["target_timeline"]["conservative_months_3_percent"] == 5.6
    assert plan["adjustment_protocol"]["weekly_loss_target_kg"] == 0.67
    assert plan["adjustment_protocol"]["carb_cut_if_stalled_g"] == "15-30"


def test_generate_diet_plan_muscle_gain_uses_performance_nutrition_guide():
    plan = generate_diet_plan(
        72,
        "muscle_gain",
        height_cm=175,
        age=22,
        gender="male",
        minutes_per_session=60,
        days_per_week=3,
        level="beginner",
        activity_level="moderate",
    )
    assert plan["type"] == "performance_macros"
    assert plan["bmr"] == 1778
    assert plan["life_burn"] == 500
    assert plan["training_burn"]["calories"] == 300
    assert plan["training_day_calories"] == 2828
    assert plan["rest_day_calories"] == 1778
    assert plan["baseline_daily"]["carbs_g"] == 354
    assert plan["baseline_daily"]["protein_g"] == 177
    assert plan["baseline_daily"]["fat_g"] == 79
    assert plan["macro_ratio"]["label"].startswith("碳水:蛋白质:脂肪")


def test_fat_loss_food_library_and_meal_totals():
    library = get_fat_loss_food_library()
    assert any(food["id"] == "chicken_breast_150g" for food in library["foods"])
    assert any(meal["key"] == "breakfast" for meal in library["meals"])
    rice = next(food for food in library["foods"] if food["id"] == "rice_150g")
    assert rice["default_grams"] == 150
    assert {state["key"] for state in rice["states"]} == {"cooked", "dry"}

    meal = calculate_meal_totals(["rice_150g", "chicken_breast_150g", "broccoli_200g"])
    assert meal["calories"] == 513
    assert meal["carbs_g"] == 56.9
    assert meal["protein_g"] == 55.1
    assert meal["fat_g"] == 6.5

    day = calculate_day_meal_totals(
        {
            "breakfast": ["oats_50g", "egg_1"],
            "lunch": ["rice_150g", "chicken_breast_150g"],
        }
    )
    assert day["daily_total"]["calories"] == 710
    assert day["meals"]["breakfast"]["protein_g"] == 11.3

    custom = calculate_meal_totals(
        [
            {"food_id": "rice_150g", "grams": 100, "state": "dry"},
            {"food_id": "chicken_breast_150g", "grams": 200, "state": "raw"},
        ]
    )
    assert custom["calories"] == 610
    assert custom["carbs_g"] == 81.7
    assert custom["protein_g"] == 52.8


def test_assess_pain_response_stop_rule():
    response = assess_pain_response("shoulder", "sharp", 7)
    assert response["category"] == "stop"


def test_assess_pain_response_modify_rule():
    response = assess_pain_response("wrist", "joint", 4)
    assert response["category"] == "modify_or_replace"


def test_adjust_plan_after_feedback_too_tired():
    plan = generate_workout_plan("beginner", "muscle_gain", 3, 60)
    adjustment = adjust_plan_after_feedback(
        plan,
        {"completed": True, "fatigue_level": 9, "duration_min": 70, "pain_level": 1},
    )
    assert adjustment["volume_multiplier"] == 0.75
    assert adjustment["next_session_focus"] == "reduce_fatigue"
    assert adjustment["recommended_rest_seconds"] == 240
    assert adjustment["rest_adjustment_seconds"] == 120


def test_adjust_plan_after_feedback_pain_replaces_exercise():
    plan = generate_workout_plan("experienced", "strength_gain", 4, 75)
    adjustment = adjust_plan_after_feedback(
        plan,
        {"completed": True, "fatigue_level": 5, "duration_min": 60, "pain_level": 6},
    )
    assert adjustment["replace_exercise"] is True
    assert adjustment["next_session_focus"] == "substitute_painful_movement"


def test_adjust_plan_after_feedback_combines_pain_and_fatigue():
    plan = generate_workout_plan("experienced", "muscle_gain", 4, 75)
    adjustment = adjust_plan_after_feedback(
        plan,
        {
            "completed": True,
            "fatigue_level": 8,
            "duration_min": 75,
            "pain_level": 6,
            "pain_type": "joint",
            "pain_location": "shoulder",
            "exercise_name": "Barbell Bench Press",
        },
    )

    assert adjustment["volume_multiplier"] == 0.6
    assert adjustment["replace_exercise"] is True
    assert adjustment["next_session_focus"] == "deload_and_substitute"
    assert adjustment["decision_level"] == "recovery_priority"
    assert adjustment["combined_load_score"] == 14
    assert adjustment["pain_context"]["pain_location"] == "shoulder"


def test_calculate_checkin_streak():
    dates = ["2026-05-10", "2026-05-12", "2026-05-13", "2026-05-14"]
    assert calculate_checkin_streak(dates, today="2026-05-14") == 3


def test_get_checkin_reward_status_after_seven_days():
    dates = [
        "2026-05-10",
        "2026-05-11",
        "2026-05-12",
        "2026-05-13",
        "2026-05-14",
        "2026-05-15",
        "2026-05-16",
    ]

    status = get_checkin_reward_status(dates, today="2026-05-16")

    assert status["streak"] == 7
    assert status["eligible"] is True
    assert status["reward_tickets"] == 1
    assert "蛋白粉" in status["prizes"]
    assert "肌酸" in status["prizes"]
