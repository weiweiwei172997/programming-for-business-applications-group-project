"""Native Streamlit UI for the GymPath MVP.

Design constraints for this version:
- only black, white, and gray visual language
- only native Streamlit components
- no custom HTML blocks and no custom CSS injection
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pandas as pd
import streamlit as st

from project import (
    adjust_plan_after_feedback,
    assess_pain_response,
    calculate_bmi,
    calculate_calorie_target,
    calculate_protein_target,
    classify_user_level,
    generate_workout_plan,
    summarize_progress_trend,
)


APP_DIR = Path(__file__).parent
DATA_DIR = APP_DIR / "data"
APP_UI_VERSION = "native-mono-zh-cn-2026-05-14-1"


def main() -> None:
    st.set_page_config(
        page_title="GymPath 黑白灰训练系统",
        page_icon="GP",
        layout="wide",
        initial_sidebar_state="collapsed",
    )
    _init_state()

    render_header()
    render_status_bar()

    tabs = st.tabs(["01 测评", "02 今日训练", "03 计划", "04 记录", "05 学习"])
    with tabs[0]:
        render_assessment_screen()
    with tabs[1]:
        render_today_screen()
    with tabs[2]:
        render_plan_screen()
    with tabs[3]:
        render_log_screen()
    with tabs[4]:
        render_learn_screen()


def _init_state() -> None:
    if st.session_state.get("app_ui_version") != APP_UI_VERSION:
        st.session_state.clear()
        st.session_state["app_ui_version"] = APP_UI_VERSION

    defaults = {
        "profile": None,
        "current_plan": None,
        "last_feedback": None,
        "last_adjustment": None,
        "measurements": [],
        "checkins": [],
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


def render_header() -> None:
    st.title("GymPath")
    st.subheader("黑白灰训练系统")
    st.write(
        "用一条清晰路径解决今晚练什么、怎么热身、怎么调整、怎么看进步。"
        "界面只保留黑白灰，突出训练内容本身。"
    )
    st.divider()


def render_status_bar() -> None:
    profile = st.session_state.profile
    plan = st.session_state.current_plan
    done_count = sum(1 for item in st.session_state.checkins if item.get("completed"))

    level = _level_label(profile["level"]) if profile else "待测评"
    goal = _goal_label(profile["goal"]) if profile else "待选择"
    split = _split_label(plan["split"]["split_name"]) if plan else "待生成"
    sessions = len(st.session_state.checkins)

    col_a, col_b, col_c, col_d = st.columns(4)
    col_a.metric("训练水平", level)
    col_b.metric("目标", goal)
    col_c.metric("当前计划", split)
    col_d.metric("完成打卡", f"{done_count}/{sessions}")
    st.divider()


def render_assessment_screen() -> None:
    st.header("01 测评")
    st.caption("先判断用户处在哪个阶段，再决定训练结构。")

    with st.form("assessment_form"):
        left, right = st.columns(2)
        with left:
            st.subheader("基础信息")
            nickname = st.text_input("昵称", value="GymPath 用户")
            age = st.number_input("年龄", min_value=12, max_value=80, value=22, step=1)
            height_cm = st.number_input("身高 cm", min_value=120.0, max_value=230.0, value=175.0, step=1.0)
            weight_kg = st.number_input("体重 kg", min_value=35.0, max_value=220.0, value=70.0, step=0.5)
            gender = st.selectbox("热量估算性别输入", ["male", "female", "other"], format_func=_gender_label)

        with right:
            st.subheader("训练状态")
            training_months = st.number_input("累计训练月数", min_value=0, max_value=360, value=3, step=1)
            weekly_frequency = st.number_input("最近每周训练次数", min_value=0, max_value=7, value=2, step=1)
            consistency = st.selectbox(
                "训练稳定性",
                ["new", "inconsistent", "consistent", "returning"],
                format_func=_consistency_label,
            )
            goal = st.selectbox(
                "目标",
                ["muscle_gain", "strength_gain", "fat_loss", "general_fitness", "health"],
                format_func=_goal_label,
            )
            activity = st.selectbox(
                "日常活动量",
                ["sedentary", "light", "moderate", "active"],
                index=1,
                format_func=_activity_label,
            )

        days_per_week = st.slider("每周训练天数", min_value=1, max_value=6, value=3)
        minutes_per_session = st.slider("每次可训练时间 分钟", min_value=20, max_value=120, value=60, step=5)
        submitted = st.form_submit_button("生成训练路径", use_container_width=True)

    level = classify_user_level(training_months, weekly_frequency, consistency)
    bmi = calculate_bmi(weight_kg, height_cm)

    col_a, col_b, col_c = st.columns(3)
    col_a.metric("系统判断水平", _level_label(level))
    col_b.metric("BMI 参考", bmi)
    col_c.metric("计划频率", f"{days_per_week} 天/周")
    st.caption("BMI 只做粗略参考。训练老手更应该结合围度、力量、体脂估计、体态照片和恢复状态。")

    if submitted:
        profile = {
            "nickname": nickname.strip() or "GymPath 用户",
            "age": int(age),
            "height_cm": float(height_cm),
            "weight_kg": float(weight_kg),
            "gender": gender,
            "training_months": int(training_months),
            "weekly_frequency": int(weekly_frequency),
            "consistency": consistency,
            "level": level,
            "goal": goal,
            "activity": activity,
            "days_per_week": int(days_per_week),
            "minutes_per_session": int(minutes_per_session),
            "bmi": bmi,
        }
        st.session_state.profile = profile
        st.session_state.current_plan = generate_workout_plan(level, goal, int(days_per_week), int(minutes_per_session))
        st.session_state.last_feedback = None
        st.session_state.last_adjustment = None
        st.write("训练路径已生成。请进入“今日训练”。")


def render_today_screen() -> None:
    st.header("02 今日训练")
    plan = st.session_state.current_plan
    if not plan:
        st.write("请先完成测评并生成训练路径。")
        return

    today = plan["weekly_schedule"][0]
    split = plan["split"]

    col_a, col_b = st.columns([1.1, 0.9])
    with col_a:
        st.subheader(_focus_label(today["focus"]))
        st.caption(_split_label(split["split_name"]))
        st.write(_split_reason_zh(split["split_name"]))

        st.markdown("#### 热身激活")
        for item in today["warmup"]:
            st.write(f"- {_warmup_label(item)}")

    with col_b:
        st.subheader("训练原则")
        for note in _split_notes_zh(split["split_name"]):
            st.write(f"- {note}")
        st.caption(_session_note_zh(today["session_note"]))

    st.divider()
    st.markdown("#### 正式训练")
    for index, exercise in enumerate(today["exercises"], start=1):
        with st.container(border=True):
            name_col, dose_col = st.columns([1.3, 0.7])
            with name_col:
                st.subheader(f"{index}. {_exercise_label(exercise['name'])}")
                st.caption(_muscle_label(exercise["target_muscle"]))
            with dose_col:
                st.metric("组数 x 次数", f"{exercise['sets']} x {exercise['reps']}")
                st.metric("组间休息", _format_rest_zh(exercise["rest_seconds"]))
                st.link_button("直接看教学视频", exercise["teaching_url"], use_container_width=True)

    st.divider()
    render_feedback_panel()
    render_adjustment_panel()


def render_feedback_panel() -> None:
    st.markdown("#### 训练后反馈")
    with st.form("feedback_form"):
        completed = st.checkbox("我完成了今天训练", value=True)
        left, right = st.columns(2)
        with left:
            fatigue = st.slider("疲劳程度", 0, 10, 5)
            duration = st.slider("训练时长 分钟", 10, 150, 60, step=5)
        with right:
            pain_level = st.slider("疼痛等级", 0, 10, 0)
            pain_type = st.selectbox(
                "疼痛/不适类型",
                ["none", "muscle burn", "joint", "pinch", "sharp", "numbness", "worsening"],
                format_func=_pain_type_label,
            )
        pain_location = st.text_input("疼痛位置或动作感受", value="")
        notes = st.text_area("训练备注", placeholder="例如：卧推肩前侧不舒服，深蹲很轻松，今天时间不够。")
        submitted = st.form_submit_button("保存反馈并调整", use_container_width=True)

    if submitted:
        feedback = {
            "completed": completed,
            "fatigue_level": fatigue,
            "duration_min": duration,
            "pain_level": pain_level,
            "pain_type": pain_type,
            "pain_location": pain_location,
            "notes": notes,
        }
        st.session_state.last_feedback = feedback
        st.session_state.last_adjustment = adjust_plan_after_feedback(st.session_state.current_plan, feedback)
        st.session_state.checkins.append({"completed": completed, "fatigue": fatigue, "duration": duration})
        st.write("反馈已保存。")


def render_adjustment_panel() -> None:
    adjustment = st.session_state.last_adjustment
    feedback = st.session_state.last_feedback
    if not adjustment:
        st.caption("提交训练反馈后，这里会显示下一次训练怎么调整。")
        return

    st.markdown("#### 下一次调整")
    col_a, col_b = st.columns(2)
    col_a.metric("训练量系数", adjustment["volume_multiplier"])
    col_b.metric("是否替换动作", "是" if adjustment["replace_exercise"] else "否")

    for note in _adjustment_notes_zh(adjustment):
        st.write(f"- {note}")

    if feedback:
        pain = assess_pain_response(
            feedback.get("pain_location", ""),
            feedback.get("pain_type", "none"),
            int(feedback.get("pain_level", 0)),
        )
        st.write(f"疼痛建议：{_pain_guidance_zh(pain)}")
        st.caption("GymPath 只提供训练教育建议，不做伤病或疾病诊断。")


def render_plan_screen() -> None:
    st.header("03 计划")
    plan = st.session_state.current_plan
    if not plan:
        st.write("请先完成测评并生成训练路径。")
        return

    split = plan["split"]
    st.subheader(_split_label(split["split_name"]))
    st.write(_split_reason_zh(split["split_name"]))

    for day in plan["weekly_schedule"]:
        with st.expander(f"{_day_label(day['day'])} / {_focus_label(day['focus'])}", expanded=False):
            st.markdown("#### 热身")
            for item in day["warmup"]:
                st.write(f"- {_warmup_label(item)}")

            st.markdown("#### 动作安排")
            rows = []
            for exercise in day["exercises"]:
                rows.append(
                    {
                        "动作": _exercise_label(exercise["name"]),
                        "目标肌群": _muscle_label(exercise["target_muscle"]),
                        "组数": exercise["sets"],
                        "次数": exercise["reps"],
                        "休息": _format_rest_zh(exercise["rest_seconds"]),
                    }
                )
            st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)
            st.caption(_session_note_zh(day["session_note"]))


def render_log_screen() -> None:
    st.header("04 记录")
    profile = st.session_state.profile
    if not profile:
        st.write("请先完成测评并生成训练路径。")
        return

    protein = calculate_protein_target(profile["weight_kg"], profile["goal"])
    calories = calculate_calorie_target(
        profile["weight_kg"],
        profile["height_cm"],
        profile["age"],
        profile["gender"],
        profile["goal"],
        profile["activity"],
    )

    col_a, col_b, col_c = st.columns(3)
    col_a.metric("每日热量目标", f"{calories['target_calories']} kcal")
    col_b.metric("蛋白质范围", f"{protein['min_grams']}-{protein['max_grams']} g")
    col_c.metric("BMI 参考", profile["bmi"])
    st.caption("热量和蛋白质只是起始建议，后续应结合趋势、训练状态和恢复情况调整。")

    st.divider()
    st.markdown("#### 添加记录")
    with st.form("measurement_form"):
        left, right = st.columns(2)
        with left:
            weight = st.number_input("当前体重 kg", min_value=30.0, max_value=220.0, value=float(profile["weight_kg"]), step=0.5)
            waist = st.number_input("腰围 cm", min_value=40.0, max_value=180.0, value=80.0, step=0.5)
        with right:
            body_fat = st.number_input("体脂率估计 %", min_value=3.0, max_value=60.0, value=18.0, step=0.5)
            date_value = st.date_input("记录日期")
        submitted = st.form_submit_button("保存围度记录", use_container_width=True)

    if submitted:
        st.session_state.measurements.append(
            {
                "date": date_value.isoformat(),
                "weight_kg": float(weight),
                "waist_cm": float(waist),
                "body_fat_pct": float(body_fat),
            }
        )
        st.write("记录已保存。")

    measurements = st.session_state.measurements
    if measurements:
        df = pd.DataFrame(measurements).sort_values("date")
        table = df.rename(columns={"date": "日期", "weight_kg": "体重 kg", "waist_cm": "腰围 cm", "body_fat_pct": "体脂率 %"})
        st.dataframe(table, use_container_width=True, hide_index=True)

        chart_df = table.set_index("日期")
        st.line_chart(chart_df[["体重 kg"]], color="#888888")

        trend = summarize_progress_trend(measurements)
        st.write(f"趋势：{_trend_message_zh(trend['message'])}")
    else:
        st.caption("至少添加两次记录，才能看到更清晰的趋势。")


def render_learn_screen() -> None:
    st.header("05 学习")
    st.caption("用短卡片帮助新手先建立正确认知。")

    cards = _load_json(DATA_DIR / "knowledge_cards.json")
    for item in cards:
        with st.container(border=True):
            st.subheader(item["title"])
            st.write(item["content"])
            st.caption(item.get("level", "all"))

    st.divider()
    topics = ["spot_reduction", "bmi_limits", "full_body_vs_split", "pain_rules", "restart_training"]
    selected = st.selectbox("选择一个新手常见问题", topics, format_func=_topic_label)
    card = _local_knowledge_card(selected)
    st.subheader(card["title"])
    st.write(card["content"])


def _load_json(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def _goal_label(goal: str) -> str:
    return {
        "muscle_gain": "增肌",
        "strength_gain": "增力",
        "fat_loss": "减脂",
        "general_fitness": "综合体能",
        "health": "更健康 / 轻量活动",
    }.get(goal, goal)


def _level_label(level: str) -> str:
    return {
        "beginner": "新手",
        "restarting": "重启训练者",
        "experienced": "有经验训练者",
    }.get(level, level)


def _consistency_label(value: str) -> str:
    return {
        "new": "刚开始训练",
        "inconsistent": "断断续续",
        "consistent": "比较稳定",
        "returning": "停练后回归",
    }.get(value, value)


def _gender_label(value: str) -> str:
    return {"male": "男", "female": "女", "other": "其他/不想细分"}.get(value, value)


def _activity_label(value: str) -> str:
    return {
        "sedentary": "久坐为主",
        "light": "轻度活动",
        "moderate": "中等活动",
        "active": "活动较多",
    }.get(value, value)


def _pain_type_label(value: str) -> str:
    return {
        "none": "没有疼痛",
        "muscle burn": "正常肌肉酸胀/灼烧",
        "joint": "关节不适",
        "pinch": "夹挤感",
        "sharp": "尖锐疼痛",
        "numbness": "麻木/放射感",
        "worsening": "越来越痛",
    }.get(value, value)


def _split_label(value: str) -> str:
    return {
        "Health Starter": "健康启动计划",
        "Tan Chengyi Beginner Follow Along": "谭成义新手跟练",
        "Tan Chengyi Kaisheng Three-Day Split": "谭成义+凯圣王三分化",
        "Orange Three-Phase Hypertrophy": "橙子增肌计划",
        "Push Pull Legs Restart": "推/拉/腿重启分化",
        "Upper Lower Restart": "上肢/下肢重启分化",
        "Push Pull Legs": "推/拉/腿分化",
        "Upper Lower": "上肢/下肢分化",
    }.get(value, value)


def _split_reason_zh(split_name: str) -> str:
    return {
        "Health Starter": "如果目标只是更健康，先降低行动门槛最重要。短训练、轻活动和饮食建议也能建立正反馈。",
        "Tan Chengyi Beginner Follow Along": "新手按固定四次训练顺序执行，先降低决策成本。",
        "Tan Chengyi Kaisheng Three-Day Split": "三分化线性增肌计划，覆盖胸肩三头、背后束二头、臀腿后链。",
        "Orange Three-Phase Hypertrophy": "阶段化增肌计划，先肌肥大，再增肌增力，最后转化力量。",
        "Push Pull Legs Restart": "重启训练用推/拉/腿轮转，先完成再加量。",
        "Upper Lower Restart": "有一定基础但不稳定时，上下肢分化能兼顾训练感和恢复。",
        "Push Pull Legs": "有经验的训练者可以用推/拉/腿分化获得更高训练频率和更细的部位安排。",
        "Upper Lower": "上肢/下肢分化适合每周 4 练，频率、恢复和进步都比较平衡。",
    }.get(split_name, "根据你的水平、目标和可训练时间生成的计划。")


def _split_notes_zh(split_name: str) -> list[str]:
    return {
        "Health Starter": ["短训练也算训练。", "如果今天不想动，可以先执行饮食建议或居家轻量动作。"],
        "Tan Chengyi Beginner Follow Along": ["按视频顺序执行。", "动作稳定后再逐步加重量。"],
        "Tan Chengyi Kaisheng Three-Day Split": ["每周循环三天。", "完成规定组次后再加重量。"],
        "Orange Three-Phase Hypertrophy": ["按阶段推进。", "减载周不要省略。"],
        "Push Pull Legs Restart": ["先完成，再加量。", "停练后第一周不要用以前的巅峰状态要求自己。"],
        "Upper Lower Restart": ["训练量先保守。", "连续完成后再逐步增加组数或重量。"],
        "Push Pull Legs": ["注意恢复和关节反馈。", "如果某个动作感受差，可以用替代动作继续刺激目标肌群。"],
        "Upper Lower": ["适合稳定进阶。", "大动作稳步渐进，小动作补足目标肌群。"],
    }.get(split_name, [])


def _focus_label(value: str) -> str:
    return {
        "Light Movement": "轻量活动",
        "Home Movement": "居家活动",
        "Upper A": "上肢 A",
        "Upper B": "上肢 B",
        "Lower A": "下肢 A",
        "Lower B": "下肢 B",
        "Push": "推",
        "Pull": "拉",
        "Legs": "腿",
    }.get(value, value)


def _day_label(value: str) -> str:
    if value.startswith("Day "):
        return "第 " + value.split(" ", 1)[1] + " 天"
    return value


def _warmup_label(value: str) -> str:
    return {
        "3-5 min easy cardio": "3-5 分钟轻松有氧",
        "Dynamic joint circles": "动态关节环绕",
        "Two light ramp-up sets": "正式动作前做 2 组递增热身组",
        "Band pull-aparts": "弹力带拉开，激活上背",
        "Scapular push-ups": "肩胛俯卧撑，找肩胛控制",
        "Glute bridges": "臀桥，激活臀部",
        "Bodyweight squats": "徒手深蹲，唤醒下肢",
    }.get(value, value)


def _exercise_label(value: str) -> str:
    return {
        "Goblet Squat": "高脚杯深蹲",
        "Dumbbell Bench Press": "哑铃卧推",
        "Lat Pulldown": "高位下拉",
        "Romanian Deadlift": "罗马尼亚硬拉",
        "Seated Cable Row": "坐姿绳索划船",
        "Leg Press": "腿举",
        "Machine Chest Press": "器械推胸",
        "Dumbbell Shoulder Press": "哑铃推肩",
        "Cable Triceps Pressdown": "绳索下压",
        "Dumbbell Curl": "哑铃弯举",
        "Back Squat": "杠铃深蹲",
        "Barbell Bench Press": "杠铃卧推",
        "Deadlift": "硬拉",
        "Pull-up": "引体向上",
        "Incline Dumbbell Press": "上斜哑铃卧推",
        "Lateral Raise": "侧平举",
        "Walking Lunge": "行走箭步蹲",
        "Plank": "平板支撑",
        "Push-up": "俯卧撑",
        "Bodyweight Squat": "徒手深蹲",
    }.get(value, value)


def _muscle_label(value: str) -> str:
    return {
        "Legs": "腿部",
        "Chest": "胸部",
        "Back": "背部",
        "Hamstrings": "腘绳肌/臀后侧",
        "Shoulders": "肩部",
        "Arms": "手臂",
        "Posterior Chain": "后侧链",
        "Upper Chest": "上胸",
        "Core": "核心",
    }.get(value, value)


def _session_note_zh(value: str) -> str:
    if "Short session" in value:
        return "短时间训练：优先完成前三个动作，休息别拖太久。"
    if "Technique first" in value:
        return "技术优先。大多数动作每组保留 1-3 次余力。"
    if "Put compound" in value:
        return "力量目标：复合动作优先，每次发力要稳。"
    return "稳步进步即可。如果疲劳或疼痛上升，就根据反馈调整。"


def _pain_guidance_zh(pain: dict[str, str]) -> str:
    category = pain.get("category")
    if category == "stop":
        return "今天停止这个动作。如果症状持续、加重或很异常，建议寻求专业人士帮助。"
    if category == "modify_or_replace":
        return "降低重量、缩短动作幅度、放慢节奏，或者换一个更舒服的替代动作。"
    return "可以谨慎继续，但要控制动作、降低冲动发力，并观察感觉是否变差。"


def _adjustment_notes_zh(adjustment: dict[str, Any]) -> list[str]:
    notes: list[str] = []
    if adjustment.get("next_session_focus") == "restart_simpler":
        notes.append("下一次先做更短、更容易完成的版本，把重新启动放在第一位。")
    if adjustment.get("volume_multiplier", 1.0) < 1:
        notes.append("下次同类训练先降低总组数，避免硬撑导致中断。")
    if adjustment.get("replace_exercise"):
        notes.append("出现明显不适的动作，下次优先替换或修改动作模式。")
    if not notes:
        notes.append("计划可以暂时保持不变，重点是稳定完成和持续记录反馈。")
    return notes


def _format_rest_zh(seconds: int) -> str:
    if seconds >= 60 and seconds % 60 == 0:
        return f"{seconds // 60} 分钟以上"
    if seconds >= 120:
        return f"{seconds // 60} 分钟 {seconds % 60} 秒以上"
    return "2 分钟以上"


def _trend_message_zh(value: str) -> str:
    translations = {
        "Add at least two measurement entries to see a trend.": "至少添加两次记录，才能看到趋势。",
        "Keep logging measurements to reveal a clearer trend.": "继续记录围度和体重，趋势会更清楚。",
        "Body weight is trending up.": "体重正在上升。",
        "Body weight is trending down.": "体重正在下降。",
        "Body weight is stable.": "体重基本稳定。",
        "Waist measurement is decreasing.": "腰围正在下降。",
        "Waist measurement is increasing.": "腰围正在上升。",
        "Waist measurement is stable.": "腰围基本稳定。",
    }
    result = value
    for english, chinese in translations.items():
        result = result.replace(english, chinese)
    return result


def _topic_label(value: str) -> str:
    return {
        "spot_reduction": "能不能只瘦一个部位？",
        "bmi_limits": "BMI 到底准不准？",
        "full_body_vs_split": "新手要不要练分化？",
        "pain_rules": "疼痛和训练感怎么区分？",
        "restart_training": "停练后怎么重新开始？",
    }.get(value, value)


def _local_knowledge_card(topic: str) -> dict[str, str]:
    cards = {
        "spot_reduction": {
            "title": "不能只瘦一个部位",
            "content": "局部减脂基本是误区。你可以训练某块肌肉让它更强或更饱满，但脂肪下降主要取决于整体热量缺口。",
        },
        "bmi_limits": {
            "title": "BMI 只是粗略参考",
            "content": "健身老手肌肉量高时，BMI 很容易误导。应该结合围度、体脂估计、力量表现、体态照片和恢复状态综合判断。",
        },
        "full_body_vs_split": {
            "title": "新手也可以练简单分化",
            "content": "新手最需要的是安全启动、动作学习和快速正反馈。分化训练要从固定、简单、可重复的结构开始，先学会训练顺序和动作感受，再逐步增加重量和训练量。",
        },
        "pain_rules": {
            "title": "疼痛不是努力的证明",
            "content": "肌肉酸胀、灼烧和疲劳可能是正常训练感；尖锐、放射、麻木、越来越痛或严重疼痛，应当停止相关动作。",
        },
        "restart_training": {
            "title": "重启训练要比想象中更保守",
            "content": "停练后第一周不要用过去巅峰状态要求自己。先降低训练量，完成比练爆更重要。",
        },
    }
    return cards[topic]


if __name__ == "__main__":
    main()
