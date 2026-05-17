"use client";

import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getJson, postFormData, postJson, putJson } from "../lib/api";

type Level = "beginner" | "restarting" | "experienced";
type Goal = "muscle_gain" | "strength_gain" | "fat_loss" | "general_fitness" | "health";
type Gender = "male" | "female" | "other";
type Activity = "sedentary" | "light" | "moderate" | "active";
type View = "plan" | "nutrition" | "feedback" | "lottery" | "progress" | "community" | "knowledge" | "coach";
type FatLossPlan = "kaisheng_carb_cycle" | "orange_carb_taper";
type StrengthPlan = "beginner_ab_linear" | "advanced_linear_5x5" | "universal_5x5_split";
type MuscleGainPlan = "tan_chengyi_beginner_follow" | "tan_kaisheng_three_split" | "orange_hypertrophy";
type CarbSensitivity = "standard" | "sensitive";
type DietTrainingIntensity = "auto" | "beginner_or_female" | "fitness_enthusiast" | "high_intensity";
type Locale = "zh" | "en";

type Profile = {
  level: Level;
  goal: Goal;
  days_per_week: number;
  minutes_per_session: number;
  weight_kg: number;
  height_cm: number;
  age: number;
  gender: Gender;
  activity_level: Activity;
  fat_loss_plan: FatLossPlan;
  strength_plan: StrengthPlan;
  muscle_gain_plan: MuscleGainPlan;
  carb_sensitivity: CarbSensitivity;
  target_weight_kg: number;
  diet_training_intensity: DietTrainingIntensity;
};

type Exercise = {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  target_muscle: string;
  notes: string;
  teaching_url: string;
  phase?: string;
};

type WorkoutPlan = {
  goal: Goal;
  days_per_week: number;
  minutes_per_session: number;
  split: { split_name: string; reason: string; notes: string[] };
  muscle_gain_plan?: ProgramBrief;
  strength_plan?: ProgramBrief;
  weekly_schedule: {
    day: string;
    focus: string;
    warmup: string[];
    exercises: Exercise[];
    session_note: string;
    rest_policy?: string;
    learning_points?: string[];
    is_rest_day?: boolean;
    rest_note?: string;
    session_video_url?: string;
    warmup_video_url?: string;
  }[];
};

type WorkoutDay = WorkoutPlan["weekly_schedule"][number];

type ProgramBrief = {
  title: string;
  audience: string;
  source_basis: string;
  logic_points: string[];
  progression_rules: string[];
  stall_strategy?: string[];
  warnings: string[];
};

type Nutrition = {
  bmi: number;
  bmi_note: string;
  calories: { maintenance_calories: number; target_calories: number };
  protein: { min_grams: number; max_grams: number };
  diet_plan?: {
    type: "fat_loss_carb_cycle" | "orange_carb_taper" | "steady_macros" | "performance_macros";
    title: string;
    bmr?: number;
    bmr_formula?: string;
    life_burn?: number;
    life_burn_note?: string;
    daily_expenditure?: number;
    training_burn?: { minutes: number; intensity_factor: number; calories: number; label: string };
    maintenance_calories?: number;
    rest_maintenance_calories?: number;
    training_day_calories?: number;
    rest_day_calories?: number;
    calorie_floor?: number;
    macro_ratio?: { carbs: number; protein: number; fat: number; label: string };
    baseline_daily: { carbs_g: number; protein_g: number; fat_g: number; calories: number };
    weekly_totals: { carbs_g: number; protein_g: number; fat_g: number };
    cycle_days: {
      key: string;
      label: string;
      days_per_week: number;
      carbs_g: number;
      protein_g: number;
      fat_g: number;
      calories: number;
      timing: string;
    }[];
    meal_timing: {
      protein_per_meal_g: string;
      meals_per_day: string;
      meal_interval_hours: string;
      note: string;
    };
    target_timeline?: {
      target_weight_kg: number;
      target_loss_kg: number;
      conservative_months_3_percent: number;
      aggressive_months_5_percent: number;
      weekly_loss_target_kg_3_percent: number;
      weekly_loss_target_kg_5_percent: number;
      note: string;
    } | null;
    adjustment_protocol?: {
      first_check_days: number;
      extra_wait_days: number;
      weekly_loss_target_kg: number;
      carb_cut_if_stalled_g: string;
      rule: string;
    };
    rules: string[];
  };
};

type FoodItem = {
  id: string;
  name: string;
  portion: string;
  calories: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
  meal_tags: string[];
  source_note: string;
  default_grams: number;
  default_state: string;
  states: FoodState[];
};

type FoodState = {
  key: string;
  label: string;
  calories_per_100g: number;
  carbs_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
};

type MealSection = {
  key: string;
  label: string;
  note: string;
  default_food_ids: string[];
};

type FoodLibrary = {
  foods: FoodItem[];
  meals: MealSection[];
  macro_sources: string[];
  note: string;
};

type MacroTotals = {
  calories: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
};

type MealFoodSelection = {
  food_id: string;
  grams: number;
  state: string;
};

type CustomFoodDraft = {
  name: string;
  grams: string;
  carbs: string;
  protein: string;
  fat: string;
};

type PainInput = {
  exercise_name: string;
  pain_location: string;
  pain_type: string;
  pain_level: number;
};

type PainResult = {
  assessment: {
    category: "stop" | "modify_or_replace" | "continue_with_cues";
    action: string;
    explanation: string;
  };
  substitution: { exercise: string; suggestions: string[] };
  joint_guidance?: {
    label: string;
    substitutions: string[];
    relief_methods: string[];
    rehab_drills: string[];
    video_links: { label: string; url: string }[];
    medical_note: string;
  };
};

type FeedbackInput = {
  completed: boolean;
  fatigue_level: number;
  duration_min: number;
  pain_level: number;
};

type FeedbackResult = {
  volume_multiplier: number;
  rest_adjustment_seconds: number;
  recommended_rest_seconds?: number;
  replace_exercise: boolean;
  next_session_focus: string;
  decision_level?: string;
  combined_load_score?: number;
  pain_context?: {
    exercise_name: string;
    pain_location: string;
    pain_type: string;
    pain_level: number;
  };
  notes: string[];
};

type CheckinReward = {
  streak: number;
  eligible: boolean;
  reward_tickets: number;
  days_until_lottery: number;
  cycle_progress: number;
  cycle_goal: number;
  prizes: string[];
  message: string;
};

type LotteryDraw = {
  id: string;
  prize: string;
  draw_type: "trial" | "ticket";
  created_at: string;
};

type LotteryState = {
  trial_used: boolean;
  ticket_draws: number;
  history: LotteryDraw[];
};

type ChatMessage = { role: "user" | "assistant"; content: string };
type AiChatResponse = {
  reply: string;
  provider: string;
  model: string;
  used_api: boolean;
  warning?: string;
};

type Measurement = { date: string; weight_kg: number; waist_cm: number; body_fat_percent: number };
type ProgressResult = {
  status: string;
  entries?: number;
  weight_change_kg?: number | null;
  waist_change_cm?: number | null;
  body_fat_change_percent?: number | null;
  message: string;
};
type Knowledge = { title: string; content: string };

type User = {
  id: number;
  username: string;
  email?: string | null;
  created_at: string;
};

type AuthResponse = {
  token: string;
  user: User;
  expires_at: string;
};

type MeasurementResponse = { measurements: Measurement[] };
type CheckinResponse = { checkin_dates: string[] };

type CommunityComment = {
  id: number;
  post_id: number;
  content: string;
  author_id: number;
  author: string;
  created_at: string;
};

type CommunityPost = {
  id: number;
  title: string;
  content: string;
  image_url?: string | null;
  author_id: number;
  author: string;
  created_at: string;
  updated_at: string;
  like_count: number;
  comment_count: number;
  viewer_liked: boolean;
  comments: CommunityComment[];
};

const initialProfile: Profile = {
  level: "beginner",
  goal: "muscle_gain",
  days_per_week: 3,
  minutes_per_session: 60,
  weight_kg: 72,
  height_cm: 175,
  age: 22,
  gender: "male",
  activity_level: "moderate",
  fat_loss_plan: "kaisheng_carb_cycle",
  strength_plan: "beginner_ab_linear",
  muscle_gain_plan: "tan_chengyi_beginner_follow",
  carb_sensitivity: "standard",
  target_weight_kg: 65,
  diet_training_intensity: "auto",
};

const LEVELS: { value: Level; label: string; note: string }[] = [
  { value: "beginner", label: "Beginner", note: "Guided four-day video plan" },
  { value: "restarting", label: "Fitness Enthusiast", note: "Structured training with manageable progression" },
  { value: "experienced", label: "High-Intensity Trainee", note: "Hard training, specialization, and recovery control" },
];

const GOALS: { value: Goal; label: string; note: string }[] = [
  { value: "muscle_gain", label: "Muscle Gain", note: "Volume and progression" },
  { value: "strength_gain", label: "Strength", note: "Compound lifts first" },
  { value: "fat_loss", label: "Fat Loss", note: "Calories and consistency" },
  { value: "health", label: "Health", note: "Low-friction movement" },
];

const FAT_LOSS_PLANS: { value: FatLossPlan; label: string; note: string }[] = [
  { value: "kaisheng_carb_cycle", label: "Kaisheng Carb-Cycle Cut", note: "2 high / 3 medium / 2 low-carb days" },
  { value: "orange_carb_taper", label: "Orange Carb-Taper Cut", note: "BMR + training burn + staged carb drops" },
];

const STRENGTH_PLANS: { value: StrengthPlan; label: string; note: string }[] = [
  { value: "beginner_ab_linear", label: "Beginner A/B Linear Strength", note: "Empty bar start / 2+2 rule / train-rest cycle" },
  { value: "advanced_linear_5x5", label: "Advanced Linear 5x5", note: "70% 1RM start / light day / deloads" },
  { value: "universal_5x5_split", label: "Universal 5x5 Split", note: "Push-pull-squat / four-week cycle / RPE control" },
];

const MUSCLE_GAIN_PLANS: { value: MuscleGainPlan; label: string; note: string }[] = [
  { value: "tan_chengyi_beginner_follow", label: "Tan Chengyi Beginner Follow-Along", note: "Four sessions / video sequence / beginner launch" },
  { value: "tan_kaisheng_three_split", label: "Tan + Kaisheng Three-Day Split", note: "Chest-shoulder-triceps / back-rear delts-biceps / glutes-legs" },
  { value: "orange_hypertrophy", label: "Orange Hypertrophy Cycle", note: "Hypertrophy / mass-strength / strength phase" },
];

const CARB_SENSITIVITY_OPTIONS: { value: CarbSensitivity; label: string; note: string }[] = [
  { value: "standard", label: "Standard", note: "Carbs 50 / protein 30 / fat 20" },
  { value: "sensitive", label: "Carb Sensitive", note: "Carbs 40 / protein 40 / fat 20" },
];

const VIEWS: { value: View; label: string; code: string }[] = [
  { value: "plan", label: "Training Plan", code: "TRAIN" },
  { value: "nutrition", label: "Nutrition", code: "FUEL" },
  { value: "feedback", label: "Feedback", code: "ADAPT" },
  { value: "lottery", label: "Prize Wheel", code: "SPIN" },
  { value: "progress", label: "Progress", code: "TRACE" },
  { value: "community", label: "Community", code: "CLUB" },
  { value: "knowledge", label: "Knowledge", code: "LEARN" },
  { value: "coach", label: "AI Coach", code: "AI" },
];

const DEFAULT_LOTTERY_PRIZES = ["Protein Powder", "Creatine", "Electrolyte Drink", "Shaker Bottle", "Training Gloves", "Supplement Sample"];

const EMPTY_LOTTERY_STATE: LotteryState = {
  trial_used: false,
  ticket_draws: 0,
  history: [],
};

let renderLocale: Locale = "zh";

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "zh";
  return window.localStorage.getItem("gympath_locale") === "en" ? "en" : "zh";
}

const ZH_TEXT: Record<string, string> = {
  "System ready": "\u7cfb\u7edf\u5c31\u7eea",
  "BLACK / WHITE / NATIVE UI": "\u9ed1\u767d\u7070 / \u539f\u751f\u7ec4\u4ef6 / \u8bad\u7ec3\u7cfb\u7edf",
  "Stop guessing your training.": "\u8bad\u7ec3\u4e0d\u8be5\u9760\u731c\u3002",
  "GymPath turns level, goal, warm-ups, exercise teaching, nutrition, pain substitutions, post-workout feedback, and rewards into one clear workflow.": "GymPath \u628a\u8bad\u7ec3\u6c34\u5e73\u3001\u76ee\u6807\u3001\u70ed\u8eab\u6fc0\u6d3b\u3001\u52a8\u4f5c\u6559\u5b66\u3001\u996e\u98df\u3001\u75bc\u75db\u66ff\u6362\u3001\u7ec3\u540e\u53cd\u9988\u548c\u6253\u5361\u6fc0\u52b1\u4e32\u6210\u4e00\u4e2a\u6e05\u6670\u6d41\u7a0b\u3002",
  "Training Profile": "\u8bad\u7ec3\u753b\u50cf",
  "Training Level": "\u8bad\u7ec3\u6c34\u5e73",
  "Goal": "\u76ee\u6807",
  "Body Data": "\u8eab\u4f53\u6570\u636e",
  "Weight kg": "\u4f53\u91cd kg",
  "Height cm": "\u8eab\u9ad8 cm",
  "Age": "\u5e74\u9f84",
  "Sex": "\u6027\u522b",
  "Male": "\u7537",
  "Female": "\u5973",
  "Other / Not specified": "\u5176\u4ed6 / \u4e0d\u900f\u9732",
  "Daily activity": "\u65e5\u5e38\u6d3b\u52a8",
  "Sedentary": "\u4e45\u5750",
  "Light activity": "\u8f7b\u5ea6\u6d3b\u52a8",
  "Moderate activity": "\u4e2d\u7b49\u6d3b\u52a8",
  "High activity": "\u9ad8\u6d3b\u52a8\u91cf",
  "Used to estimate maintenance calories, target calories, and lifestyle burn.": "\u7528\u4e8e\u4f30\u7b97\u7ef4\u6301\u70ed\u91cf\u3001\u76ee\u6807\u70ed\u91cf\u548c\u751f\u6d3b\u6d88\u8017\u3002",
  "Generating": "\u751f\u6210\u4e2d",
  "Generate Nutrition Plan": "\u751f\u6210\u996e\u98df\u65b9\u6848",
  "Generate Training Plan": "\u751f\u6210\u8bad\u7ec3\u65b9\u6848",
  "Beginner": "\u65b0\u624b",
  "Fitness Enthusiast": "\u5065\u8eab\u7231\u597d\u8005",
  "High-Intensity Trainee": "\u9ad8\u5f3a\u5ea6\u8bad\u7ec3\u8005",
  "Muscle Gain": "\u589e\u808c",
  "Strength": "\u589e\u529b",
  "Fat Loss": "\u51cf\u8102",
  "Health": "\u5065\u5eb7",
  "Training Plan": "\u8bad\u7ec3\u8ba1\u5212",
  "Nutrition": "\u996e\u98df",
  "Feedback": "\u53cd\u9988\u8c03\u6574",
  "Prize Wheel": "\u62bd\u5956\u8f6c\u76d8",
  "Progress": "\u7ef4\u5ea6\u8d8b\u52bf",
  "Community": "\u793e\u533a\u4ea4\u6d41",
  "Knowledge": "\u8ba4\u77e5\u626b\u76f2",
  "AI Coach": "AI \u6559\u7ec3",
  "No plan yet": "\u8fd8\u6ca1\u6709\u8bad\u7ec3\u8ba1\u5212",
  "Fill in the training profile and generate a plan to see training days, warm-ups, exercises, and teaching links.": "\u586b\u5199\u8bad\u7ec3\u753b\u50cf\u5e76\u751f\u6210\u8ba1\u5212\u540e\uff0c\u53ef\u4ee5\u770b\u5230\u8bad\u7ec3\u65e5\u3001\u70ed\u8eab\u6fc0\u6d3b\u3001\u52a8\u4f5c\u5b89\u6392\u548c\u6559\u5b66\u94fe\u63a5\u3002",
  "Food Log": "\u996e\u98df\u8bb0\u5f55",
  "Fitness AI Q&A": "\u5065\u8eab AI \u95ee\u7b54",
  "Register / Log In": "\u6ce8\u518c / \u767b\u5f55",
  "Log In": "\u767b\u5f55",
  "Register": "\u6ce8\u518c",
  "Nickname": "\u6635\u79f0",
  "Nickname or Email": "\u6635\u79f0\u6216\u90ae\u7bb1",
  "Email (optional)": "\u90ae\u7bb1\uff08\u53ef\u9009\uff09",
  "Password": "\u5bc6\u7801",
  "Create Account": "\u521b\u5efa\u8d26\u53f7",
  "Create Account & Enter": "\u521b\u5efa\u8d26\u53f7\u5e76\u8fdb\u5165",
  "Log In & Enter": "\u767b\u5f55\u5e76\u8fdb\u5165",
  "Preview as guest; log in later for community actions": "\u5148\u6e38\u5ba2\u9884\u89c8\uff0c\u793e\u533a\u4e92\u52a8\u7a0d\u540e\u767b\u5f55",
  "Entering GymPath.": "\u6b63\u5728\u8fdb\u5165 GymPath\u3002",
  "Checking your local login session.": "\u6b63\u5728\u68c0\u67e5\u672c\u5730\u767b\u5f55\u72b6\u6001\u3002",
  "Enter your training account first.": "\u5148\u8fdb\u5165\u4f60\u7684\u8bad\u7ec3\u8d26\u53f7\u3002",
  "Create an account to post, like, and comment, while keeping GymPath usable as a real multi-user fitness web app.": "\u521b\u5efa\u8d26\u53f7\u540e\u53ef\u4ee5\u53d1\u5e16\u3001\u70b9\u8d5e\u548c\u8bc4\u8bba\uff0c\u8ba9 GymPath \u50cf\u771f\u6b63\u7684\u591a\u4eba\u5065\u8eab Web App\u3002",
  "Local MVP account": "本地 MVP 账号",
  "Account mode": "账号模式",
  "e.g. No-Shrug Shoulders": "例如：不耸肩同学",
  "For future account recovery": "用于后续找回账号",
  "At least 6 characters": "至少 6 个字符",
  "Guided four-day video plan": "四分化视频跟练",
  "Structured training with manageable progression": "结构化训练，稳步推进",
  "Hard training, specialization, and recovery control": "高强度训练、专项突破和恢复控制",
  "Volume and progression": "训练容量与渐进超负荷",
  "Compound lifts first": "优先主项复合动作",
  "Calories and consistency": "热量控制与持续执行",
  "Low-friction movement": "低门槛动起来",
  "Muscle-Gain Plan": "增肌计划",
  "Strength Plan": "增力计划",
  "Fat-Loss Nutrition Plan": "减脂饮食计划",
  "Orange Macro Ratio": "橙子饮食比例",
  "Kaisheng Carb-Cycle Cut": "凯圣王碳循环减脂",
  "Orange Carb-Taper Cut": "橙子碳水渐降减脂",
  "2 high / 3 medium / 2 low-carb days": "2 天高碳 / 3 天中碳 / 2 天低碳",
  "BMR + training burn + staged carb drops": "基础代谢 + 训练消耗 + 阶段性降碳",
  "Beginner A/B Linear Strength": "小白 A/B 轮线性力量",
  "Empty bar start / 2+2 rule / train-rest cycle": "空杆起步 / 2+2 法则 / 练一休一",
  "Advanced Linear 5x5": "老手线性 5x5",
  "70% 1RM start / light day / deloads": "70% 极限起步 / 轻训日 / 减载",
  "Universal 5x5 Split": "全人群 5x5 三分化",
  "Push-pull-squat / four-week cycle / RPE control": "推拉蹲 / 四周周期 / RPE 控制",
  "Tan Chengyi Beginner Follow-Along": "谭成义新手跟练",
  "Four sessions / video sequence / beginner launch": "四次训练 / 视频顺序 / 新手启动",
  "Tan + Kaisheng Three-Day Split": "谭成义 + 凯圣王三分化",
  "Chest-shoulder-triceps / back-rear delts-biceps / glutes-legs": "胸肩三头 / 背后束二头 / 臀腿",
  "Orange Hypertrophy Cycle": "橙子增肌计划",
  "Hypertrophy / mass-strength / strength phase": "肌肥大 / 增肌增力 / 增力阶段",
  "Standard": "标准",
  "Carb Sensitive": "碳水敏感",
  "Carbs 50 / protein 30 / fat 20": "碳水 50 / 蛋白 30 / 脂肪 20",
  "Carbs 40 / protein 40 / fat 20": "碳水 40 / 蛋白 40 / 脂肪 20",
  "Training burn is now automatic: Beginner or female = 5 kcal/min, Fitness Enthusiast = 8 kcal/min, High-Intensity Trainee = 10 kcal/min.": "训练消耗已自动匹配：新手或女生 = 5 kcal/分钟，健身爱好者 = 8 kcal/分钟，高强度训练者 = 10 kcal/分钟。",
  "Generated from the current goal, with training days, warm-ups, exercises, and feedback adjustment entry points.": "已根据当前目标生成训练日、热身激活、动作安排和练后反馈调整入口。",
  "Recovery Plan": "恢复安排",
  "No formal training today. Prioritize recovery.": "今天不安排正式训练，优先恢复。",
  "Warm-up / Activation": "热身 / 激活",
  "Teaching video": "教学视频",
  "Session video": "训练视频",
  "Warm-up video": "热身视频",
  "Core Logic": "核心逻辑",
  "Progression Rules": "进阶规则",
  "Stall Strategy": "停滞处理",
  "Risk Notes": "风险提示",
  "Waiting for body data": "等待身体数据",
  "Generating a plan also calculates calories, protein, and a rough BMI reference.": "生成方案时会同步计算热量、蛋白质和粗略 BMI 参考。",
  "Target Calories": "目标热量",
  "Protein Target": "计划蛋白质",
  "Only a rough reference for muscular lifters": "老炮只作粗略参考",
  "Daily Carb Target": "每日碳水基准",
  "Training-day Carb Target": "训练日碳水基准",
  "Daily Fat Target": "每日脂肪基准",
  "Training-day Fat Target": "训练日脂肪基准",
  "Protein Per Meal": "单餐蛋白",
  "Maintenance": "维持热量",
  "Calculated from the selected nutrition plan": "按当前饮食计划计算",
  "Easier to sustain across 3-5 meals": "分 3-5 餐更容易执行",
  "25% of total calories ÷ 4 kcal/g": "总热量的 25% ÷ 4 kcal/g",
  "PERFORMANCE FUEL": "表现供能",
  "CARB CYCLE": "碳循环",
  "CARB TAPER": "碳水渐降",
  "Fat-Loss Carb Cycle": "减脂碳循环",
  "2 high / 3 medium / 2 low": "2 高 / 3 中 / 2 低",
  "BMR": "基础代谢",
  "Basal Metabolic Rate": "基础代谢率",
  "Formula result": "公式结果",
  "Lifestyle Burn": "生活消耗",
  "Estimate": "估算",
  "Training Burn": "训练消耗",
  "Duration": "时长",
  "Intensity factor": "强度系数",
  "Auto factor": "自动系数",
  "Estimated burn": "估算消耗",
  "Calorie Strategy": "热量策略",
  "Training day": "训练日",
  "Rest day": "休息日",
  "Floor": "底线",
  "Training days sit around +250 kcal; rest days sit around -600 kcal, but no day goes below BMR.": "训练日约 +250 kcal；休息日约 -600 kcal，但任何一天都不低于基础代谢。",
  "Daily Expenditure": "每日消耗",
  "Base total": "基础总消耗",
  "Fat-Loss Target": "减脂目标",
  "Target weight": "目标体重",
  "Total loss": "总减重",
  "3% pace": "3% 速度",
  "5% pace": "5% 速度",
  "Male: 10x bodyweight + 6.25x height - 5x age + 5. Female: same formula but ending with -161.": "男性：10×体重 + 6.25×身高 - 5×年龄 + 5；女性同公式但最后为 -161。",
  "Hit protein first, then check total calories.": "先把蛋白吃够，再看总热量。",
  "Bulking is not random eating; cutting is not extreme restriction.": "增肌不是乱吃，减脂也不是极端节食。",
  "Adjust calories only after two weeks without body-weight or measurement change.": "连续两周体重和围度都没变化时，再调整热量。",
  "BMI is weak for muscular users. Combine it with measurements, strength, photos, and body-fat trends.": "BMI 对肌肉量高的人参考价值有限，要结合围度、力量、照片和体脂趋势。",
  "Nutrition Execution Rules": "饮食执行线",
  "Today Target": "今日目标",
  "Selected Total": "已选合计",
  "Remaining": "剩余",
  "Food values are practical estimates for common portions. For packaged foods, use the nutrition label. After selecting multiple foods, each meal header updates calories and macros in real time.": "食物数据是常见份量的实用估算；包装食品优先看营养成分表。选择多个食物后，每餐顶部会实时更新热量和三大营养素。",
  "Not listed? Add a custom food": "没有你吃的？自定义食物",
  "Food name, e.g. beef rice bowl": "食物名称，例如牛肉盖饭",
  "Amount eaten, g": "吃了多少 g",
  "Carbs per 100g": "每 100g 碳水",
  "Protein per 100g": "每 100g 蛋白质",
  "Fat per 100g": "每 100g 脂肪",
  "Add to meal": "加入本餐",
  "Nutrition data sources": "营养数据来源",
  "Pain Check": "动作疼痛判断",
  "Not medical diagnosis": "非医疗诊断",
  "Current exercise": "当前动作",
  "Pain location": "疼痛位置",
  "Pain type": "疼痛类型",
  "Shoulder": "肩",
  "Elbow": "肘",
  "Wrist": "腕",
  "Low back": "腰背",
  "Low Back": "腰背",
  "Hip": "髋",
  "Knee": "膝",
  "Ankle": "踝",
  "Muscle burn": "肌肉灼烧感",
  "Pinching": "夹挤疼",
  "Joint discomfort": "关节不适",
  "Sharp pain": "锐痛",
  "Radiating pain": "放射痛",
  "Getting worse": "越来越痛",
  "Check whether to continue": "判断是否继续",
  "Relief options": "缓解方式",
  "Rehab drills": "康复训练",
  "Video links": "视频入口",
  "Muscle and Joint Map": "真实肌肉关节图",
  "Click a joint": "点击关节",
  "Image source: Wikimedia Commons / OpenStax Anatomy and Physiology / CC BY 4.0": "图片来源：Wikimedia Commons / OpenStax Anatomy and Physiology / CC BY 4.0",
  "Click the painful joint to get substitutions, relief options, rehab drills, and video links.": "点击疼痛关节后，系统会给出替代动作、缓解方式、康复训练和视频入口。",
  "Adjust Next Session From Fatigue + Pain": "根据疲劳 + 疼痛调整下一次训练",
  "Plan connected": "已关联训练计划",
  "Generate a plan first": "请先生成训练计划",
  "Training completed today": "今天已完成训练",
  "Session duration, min": "本次训练时长，分钟",
  "The next-session recommendation combines fatigue, pain level, pain type, and pain location. Higher pain plus higher fatigue pushes the plan toward lower volume, longer rest, or exercise substitution.": "下一次训练建议会综合疲劳程度、疼痛等级、疼痛类型和疼痛位置。疼痛与疲劳越高，越倾向于降低容量、延长休息或替换动作。",
  "Adjust next session": "调整下一次训练",
  "Substitute the painful movement next time": "下次替换疼痛动作",
  "Movement can be monitored": "动作可继续观察",
  "SUPPLEMENT LOTTERY": "补剂抽奖",
  "Check-In Prize Wheel": "打卡抽奖转盘",
  "Keep going": "继续加油",
  "Your first spin is a free trial. After that, every 7-day check-in streak earns one real draw ticket. Prizes include protein powder, creatine, and training accessories.": "第一次可以试抽；之后每坚持打卡 7 天获得一次正式抽奖资格，奖品包括蛋白粉、肌酸和训练配件。",
  "Trial Spin": "试抽",
  "Ready": "可用",
  "Used": "已使用",
  "Draw Tickets": "抽奖券",
  "Current Streak": "当前连续打卡",
  "Spinning": "抽奖中",
  "Spin": "开始抽奖",
  "KEEP GOING": "继续加油",
  "Keep Going": "继续加油",
  "You can spin now": "现在可以抽奖",
  "Use the free trial or an earned check-in ticket. After spinning, keep checking in to unlock the next 7-day ticket.": "使用试抽或已获得的打卡抽奖券。抽完后继续打卡，解锁下一个 7 天奖励。",
  "Check in after training. A 7-day streak unlocks one formal prize-wheel ticket.": "训练后完成打卡；连续 7 天可解锁一张正式抽奖券。",
  "Today's check-in recorded": "今日打卡已记录",
  "Complete today's check-in": "完成今日打卡",
  "PRIZE POOL": "奖品池",
  "Prize Pool and Result": "奖品池与抽奖结果",
  "Ready to spin": "准备抽奖",
  "Trial": "试抽",
  "Ticket": "抽奖券",
  "You won": "你抽中了",
  "This was the first free trial spin, so it did not consume a 7-day ticket.": "这是第一次免费试抽，不消耗 7 天打卡券。",
  "This consumed one 7-day check-in draw ticket.": "本次消耗了一张 7 天打卡抽奖券。",
  "No draw history yet. Press “Spin” to use your first trial spin.": "还没有抽奖记录。点击“开始抽奖”使用第一次试抽。",
  "Measurement Trends": "维度趋势",
  "Add Record": "新增记录",
  "Customize date, body weight, waist, and body-fat percentage. The line chart sorts entries by date automatically.": "可自定义日期、体重、腰围和体脂率；折线图会按日期自动排序。",
  "Date": "日期",
  "Weight": "体重",
  "Waist": "腰围",
  "Body Fat": "体脂率",
  "Analyze Trend": "分析趋势",
  "Trend Line Chart": "趋势折线图",
  "Logged-In Account": "已登录账号",
  "Account required for posting": "发帖需要登录",
  "You can now post, like, and comment. Training plans and AI coaching stay available as usual.": "你现在可以发帖、点赞和评论；训练计划和 AI 教练照常可用。",
  "Log Out": "退出登录",
  "Create Account & Log In": "创建账号并登录",
  "Log In to GymPath": "登录 GymPath",
  "Share a Training Update": "分享训练动态",
  "Posting enabled": "可发帖",
  "Log in to unlock": "登录后解锁",
  "Title: What happened in today's chest session?": "标题：今天胸部训练发生了什么？",
  "Write your training question, check-in note, meal plan, movement feeling, or something you want experienced lifters to answer.": "写下你的训练问题、打卡记录、饮食计划、动作感受，或想让老手回答的内容。",
  "Post image (optional)": "帖子图片（可选）",
  "Supports JPG / PNG / WebP / GIF, max 5MB per image": "支持 JPG / PNG / WebP / GIF，单张最大 5MB",
  "Refresh Feed": "刷新动态",
  "Publish": "发布",
  "Community Feed": "社区动态",
  "No posts yet": "还没有帖子",
  "Create the first training update after logging in, so classmates or test users have a real interaction entry point.": "登录后发布第一条训练动态，让同学或测试用户可以真实互动。",
  "Liked": "已赞",
  "Like": "点赞",
  "Write a comment...": "写一条评论...",
  "Log in to comment": "登录后评论",
  "Comment": "评论",
  "Close": "关闭",
  "Full-size post image preview": "帖子大图预览",
  "Close full-size image": "关闭大图",
  "Thinking": "思考中",
  "DeepSeek / fallback": "DeepSeek / 备用回答",
  "You": "你",
  "GymPath AI": "GymPath AI",
  "How should a beginner arrange one week of muscle-gain training?": "新手增肌一周怎么安排？",
  "My front shoulder hurts during bench press. What can I substitute?": "卧推肩前侧疼，可以替换什么动作？",
  "How should I distribute carbs during a fat-loss phase?": "减脂期碳水应该怎么分配？",
  "Can I train again if I am sore the next day?": "练完第二天酸痛还能继续练吗？",
  "Ask a fitness question, e.g. can I train chest today if my shoulder hurts?": "输入你的健身问题，例如：今天肩疼还能不能练胸？",
  "Generating Answer": "正在生成回答",
  "Send to AI Coach": "发送给 AI 教练",
  "Note: AI answers are for fitness education and training decisions only. They do not replace a doctor, physiotherapist, or in-person coach.": "提示：AI 回答只用于健身学习和训练决策，不替代医生、康复师或线下教练。",
  "I am the GymPath AI coach. Ask me about training plans, exercise substitutions, nutrition, cutting, bulking, recovery, and beginner fitness concepts.": "我是 GymPath AI 教练。你可以问我训练计划、动作替换、饮食、减脂、增肌、恢复和新手健身认知问题。",
  "AI coaching is temporarily unavailable. Describe your goal, exercise, pain location, training performance, and diet record clearly, and I can still help you troubleshoot.": "AI 教练暂时不可用。你可以先把目标、动作、疼痛位置、训练表现和饮食记录说清楚，我会继续帮你排查。",
  "Beginner Knowledge Base": "新手认知扫盲库",
  "Remove wrong assumptions first": "先破除错误认知",
  "Spot Reduction": "局部减脂",
  "BMI Limits": "BMI 局限",
  "Beginner Splits": "新手分化",
  "Pain Rules": "疼痛规则",
  "Calorie Deficit": "热量缺口",
  "Carb Cycling": "碳循环",
  "Progressive Overload": "渐进超负荷",
  "Deload": "减载",
  "Soreness vs Injury": "酸痛与伤痛",
  "Warm-Up Logic": "热身逻辑",
  "Restart Training": "重启训练",
  "Supplements": "补剂",
  "Photo Tracking": "照片记录",
  "You cannot target fat loss in one body part": "不能只瘦某一个部位",
  "Spot reduction is one of the most common beginner myths. You can train abs, arms, or legs to make those muscles stronger, but fat loss is mainly driven by an overall calorie deficit. The practical path is whole-body fat loss, targeted muscle training, and long-term measurement tracking.": "局部减脂是新手最常见的误区之一。练腹、练手臂、练腿可以让对应肌肉更强，但脂肪下降主要由整体热量缺口决定。更实际的路径是全身减脂、局部肌肉训练和长期围度记录。",
  "BMI is only a rough reference": "BMI 只是粗略参考",
  "Experienced lifters often carry more muscle, so BMI may mislabel muscle mass as excess weight. Judge body composition with weight, waist, estimated body-fat percentage, photos, strength performance, and recovery trends rather than one BMI number.": "有训练基础的人通常肌肉量更高，BMI 容易把肌肉误判成超重。判断体态要结合体重、腰围、体脂估算、照片、力量表现和恢复趋势，而不是只看一个 BMI 数字。",
  "Beginners can use a simple split": "新手也可以用简单分化",
  "Beginners do not have to train full body only, but a split must stay simple, repeatable, and easy to follow. GymPath's beginner four-day split focuses on warm-ups, movement paths, and target-muscle sensation before adding load.": "新手不一定只能练全身，但分化必须简单、可重复、容易照着做。GymPath 的新手四分化先关注热身、动作路径和目标肌肉感受，再考虑加重量。",
  "Pain is not proof of effort": "疼痛不是努力的证明",
  "Muscle burn, pump, and hard effort can be part of training. Sharp pain, radiating pain, numbness, worsening pain, or deep joint pain are different signals. If those appear, reduce load, shorten range, substitute the exercise, or stop that session.": "肌肉灼烧、泵感和用力感可以是训练的一部分；锐痛、放射痛、麻木、越来越痛或深层关节痛则是不同信号。出现这些情况时，应降低重量、缩短幅度、替换动作，或停止本次训练。",
  "Fat loss starts with a calorie deficit": "减脂从热量缺口开始",
  "Fat loss is not about banning one food. It comes from a long-term average intake below expenditure. Carbs, fats, and protein can all stay in the diet; the key is total calories, enough protein, and training that remains sustainable.": "减脂不是禁止某种食物，而是长期平均摄入低于消耗。碳水、脂肪和蛋白质都可以保留，关键是总热量、足够蛋白质和可持续训练。",
  "Protein is the recovery floor": "蛋白质是恢复底线",
  "Muscle gain and fat loss both need enough protein. During fat loss, protein is especially useful for preserving muscle and improving fullness. A practical pattern is 4-5 meals, with about 20-40g protein per meal.": "增肌和减脂都需要足够蛋白质。减脂期蛋白质尤其有助于保留肌肉和增加饱腹感。实用做法是分 4-5 餐，每餐约 20-40g 蛋白质。",
  "A high-carb day is not a cheat day": "高碳日不是放纵日",
  "Carb cycling puts more carbs around high-intensity training days and fewer carbs on rest or lighter days. High-carb days support performance; low-carb days control weekly totals. Both still need structure.": "碳循环是在高强度训练日前后安排更多碳水，在休息或轻训练日减少碳水。高碳日支持表现，低碳日控制周总量，两者都需要结构化执行。",
  "Progress comes from trackable progression": "进步来自可记录的渐进",
  "Training is not about failing every session. Progress means load, reps, sets, control, or density improves while technique stays stable. If it can be recorded, it can be adjusted.": "训练不是每次都练到力竭。真正的进步是重量、次数、组数、控制或训练密度在动作稳定的前提下提升。能记录，就能调整。",
  "A deload is not regression": "减载不是退步",
  "When motivation drops for days, sleep worsens, loads fall, or joints feel irritated, a deload week can keep long-term progress alive. Reduce load, sets, or high-intensity work to restore the system.": "当训练热情连续下降、睡眠变差、重量下滑或关节不适时，减载周反而能保护长期进步。通过降低重量、组数或高强度内容让系统恢复。",
  "Separate soreness from injury signals": "区分酸痛和伤痛信号",
  "Delayed soreness is usually broad, dull, and improves with movement. Injury risk feels more local, sharp, joint-centered, radiating, or worse as you train. Beginners should learn whether today calls for training, modification, or rest.": "延迟性酸痛通常范围较大、钝痛，活动后会缓解；伤痛风险通常更局部、更锐利、集中在关节、会放射或越练越痛。新手要学会判断今天是继续练、调整练，还是休息。",
  "A warm-up prepares the exact training pattern": "热身要服务今天的训练模式",
  "A useful warm-up is not just sweating. Prepare the joints, target muscles, and movement pattern you will train today, then ramp into the working sets gradually.": "有效热身不只是出汗，而是准备今天要训练的关节、目标肌肉和动作模式，然后逐步递增到正式组。",
  "Do not restart at your peak loads": "重启训练不要从巅峰重量开始",
  "After a break, reduce load and sets for the first few sessions. Rebuild movement feel, recovery, and check-in rhythm before pushing hard again. A sustainable restart beats one heroic session.": "停练后前几次要降低重量和组数，先找回动作感觉、恢复能力和打卡节奏，再逐渐加码。可持续重启比一次硬顶更重要。",
  "Supplements do not replace the basics": "补剂不能替代基本功",
  "Creatine, whey, caffeine, and electrolytes can help convenience or performance, but they cannot replace training consistency, protein, sleep, and calorie control. If budget is limited, stabilize food and training first.": "肌酸、乳清、咖啡因和电解质可以提高便利性或表现，但不能替代稳定训练、蛋白质、睡眠和热量控制。预算有限时，先把饮食和训练稳定下来。",
  "Photos and measurements give better feedback": "照片和围度能提供更好反馈",
  "Body weight fluctuates daily. Fixed lighting, fixed angles, weekly weight, waist, and body-fat estimates make real trends easier to see and help decide whether diet needs adjustment.": "体重每天都会波动。固定光线、固定角度、每周体重、腰围和体脂估算更容易看出真实趋势，也更利于判断饮食是否需要调整。",
  "Build the basics first": "先把基础做好",
  "Train consistently, eat enough protein, sleep well, and adjust based on feedback.": "稳定训练、吃够蛋白质、睡好觉，再根据反馈调整。",
  "Carbs": "碳水",
  "Protein": "蛋白质",
  "Fat": "脂肪",
  "Calories": "热量",
  "Baseline": "今日基准",
  "High-Carb Day": "高碳日",
  "Medium-Carb Day": "中碳日",
  "Low-Carb Day": "低碳日",
  "Training Day": "训练日",
  "Rest Day": "休息日",
  "Default": "默认",
  "Custom": "自定义",
  "Raw weight": "生重",
  "Cooked weight": "熟重",
  "Dry weight": "干重",
  "switch raw/cooked or dry/cooked state": "可切换生重/熟重或干重/熟重",
  "Anterior and posterior muscle anatomy": "人体前后视肌肉解剖图",
  "Trend chart for weight, waist, and body-fat percentage": "体重、腰围和体脂率趋势图",
  "Open full-size post image": "打开帖子大图",
  "Stop this movement today": "今天停止这个动作",
  "Reduce load or substitute": "降低重量或替换动作",
  "Continue cautiously": "谨慎继续",
  "Stop this exercise today. If symptoms continue, consult a qualified professional.": "今天停止这个动作；如果症状持续，请咨询合格专业人士。",
  "Reduce load, shorten range of motion, slow the tempo, or switch to a more stable substitute.": "降低重量、缩短动作幅度、放慢节奏，或换成更稳定的替代动作。",
  "You may continue cautiously, but control the movement and re-check the setup.": "可以谨慎继续，但要控制动作，并重新检查动作设置。",
  "Keep the plan next time": "下次保持计划",
  "Restart with a lower barrier": "降低门槛重启",
  "Reduce fatigue first": "先降低疲劳",
  "Substitute the painful movement": "替换疼痛动作",
  "Stop the high-risk movement and deload": "停止高风险动作并减载",
  "Deload and substitute": "减载并替换",
  "Lower stress and monitor": "降低压力并观察",
  "Normal progression": "正常推进",
  "Lower barrier": "降低门槛",
  "High fatigue": "疲劳偏高",
  "Pain modification": "疼痛调整",
  "Monitor": "继续观察",
  "Recovery first": "恢复优先",
  "High risk": "高风险",
  "Unclassified": "未分类",
  "Numbness": "麻木",
  "Electric pain": "电击样疼痛",
  "Next session should be shorter and easier to complete.": "下一次训练应更短、更容易完成。",
  "Reduce total sets by about 25% for the next similar workout.": "下一次同类训练总组数减少约 25%。",
  "This workout felt manageable. Consider a small load or rep increase next time.": "这次训练可控，下次可以小幅加重量或加次数。",
  "Shorten accessory work to keep sessions realistic.": "缩短辅助动作，让训练时长更现实。",
  "Do not repeat the painful movement next session; substitute it and reduce workload.": "下一次不要重复疼痛动作，先替换并降低训练量。",
  "Pain and fatigue are both high. Deload the next similar session and replace the painful movement.": "疼痛和疲劳都偏高，下一次同类训练减载并替换疼痛动作。",
  "Pain and fatigue are moderate. Keep the next session easier and avoid adding load.": "疼痛和疲劳中等，下一次训练保持更轻，不要加重量。",
  "Replace or modify the painful movement before repeating this session.": "再次训练前先替换或修改疼痛动作。",
  "Keep the plan unchanged and focus on consistent execution.": "计划保持不变，重点放在稳定执行。",
  "Beginner four-day split: chest, shoulders, and triceps. Learn the video sequence before adding load.": "新手四分化：胸、肩、三头。先学会视频动作顺序，再考虑加重量。",
  "Beginner four-day split: back and biceps. Start by feeling the lats before heavy pulling.": "新手四分化：背和二头。先找到背阔肌发力，再追求更重的拉。",
  "Beginner four-day split: lower body. Keep balance and joint control ahead of load.": "新手四分化：下肢。先保证平衡和关节控制，再追求重量。",
  "Beginner four-day split: shoulders and arms. Keep shoulder positions stable and avoid swinging.": "新手四分化：肩和手臂。肩部位置保持稳定，避免借力甩动。",
  "Recovery day: no hard training.": "休息日：不做高强度训练。",
  "Rest one day after the lower-body session. Keep steps easy, sleep enough, and do light mobility only if it feels good.": "下肢训练后休息一天。轻松走路、保证睡眠；如果身体感觉不错，可做轻量活动度训练。",
  "Protein Powder": "蛋白粉",
  "Creatine": "肌酸",
  "Electrolyte Drink": "电解质饮料",
  "Shaker Bottle": "摇摇杯",
  "Training Gloves": "训练手套",
  "Supplement Sample": "补剂试用装",
  "Switch to English": "\u5207\u6362\u5230\u82f1\u6587",
  "Switch to Chinese": "\u5207\u6362\u5230\u4e2d\u6587",
};

function uiText(value: string) {
  return renderLocale === "zh" ? zhText(value) : value;
}

function zhText(value: string) {
  if (!value) return value;
  return ZH_TEXT[value] ?? EXERCISE_CN[value] ?? FOCUS_CN[value] ?? SPLIT_CN[value] ?? WARMUP_CN[value] ?? value;
}

const EXERCISE_CN: Record<string, string> = {
  "Cable Fly": "龙门架绳索夹胸",
  "Goblet Squat": "高脚杯深蹲",
  "Box Squat": "箱式深蹲",
  "Hack Squat": "哈克深蹲",
  "Dumbbell Bench Press": "哑铃卧推",
  "Neutral-Grip Machine Press": "中立握器械推",
  "Landmine Press": "地雷管推举",
  "Machine Shoulder Press": "器械推肩",
  "Lat Pulldown": "高位下拉",
  "Romanian Deadlift": "罗马尼亚硬拉",
  "Romanian Deadlift with lighter load": "轻重量罗马尼亚硬拉",
  "Seated Cable Row": "坐姿绳索划船",
  "Single-Arm Seated Cable Row": "单手坐姿绳索划船",
  "Close-Grip Seated Cable Row": "窄握坐姿划船",
  "Straight-Arm Pulldown": "直臂下压",
  "Leg Press": "腿举",
  "Machine Chest Press": "器械推胸",
  "Incline Machine Chest Press": "上斜器械卧推",
  "Dumbbell Shoulder Press": "哑铃推肩",
  "Seated Overhead Press": "坐姿推举",
  "Barbell Overhead Press": "杠铃实力推",
  "Pendlay Row": "潘德伦划船",
  "Chin-up": "引体向上",
  "Overhead Cable Triceps Extension": "颈后绳索臂屈伸",
  "Cable Triceps Pressdown": "绳索下压",
  "Dumbbell Curl": "哑铃弯举",
  "Cable Curl": "绳索弯举",
  "Barbell Curl": "杠铃弯举",
  "Back Squat": "杠铃深蹲",
  "Barbell Bench Press": "杠铃卧推",
  Deadlift: "硬拉",
  "Pull-up": "引体向上",
  "Incline Dumbbell Press": "上斜哑铃卧推",
  "Lateral Raise": "侧平举",
  "Seated Reverse Fly": "坐姿反飞鸟",
  "Cable Face Pull": "绳索面拉",
  "Front Raise": "前平举",
  "Barbell Front Raise": "杠铃前平举",
  "Machine Fly": "器械夹胸",
  "Shoulder Stability Drill": "肩关节稳定性训练",
  "Back Extension": "山羊挺身",
  "Wall Sit": "靠墙静蹲",
  "Hip Adduction Machine / Copenhagen Plank": "内收夹腿 / 哥本哈根支撑",
  "Single-Leg Dumbbell Romanian Deadlift": "单腿哑铃硬拉",
  "Walking Lunge": "行走弓步",
  "Rotational Lunge": "旋转弓步训练",
  "Standing Calf Raise": "站姿提踵",
  "Seated Calf Raise": "坐姿提踵",
  Plank: "平板支撑",
  "Push-up": "俯卧撑",
  "Push-up Handle Variation": "俯卧撑把手变式",
  "Bodyweight Squat": "徒手深蹲",
  "Incline Push-up": "上斜俯卧撑",
  "Rear Delt Bottle Raise": "水瓶后束飞鸟",
  "Bottle Lateral Raise": "水瓶侧平举",
  "Bottle Front Raise": "水瓶前平举",
  "Bench Dips": "凳上臂屈伸",
  "Kneeling Ab Wheel": "跪姿健腹轮",
  "Bent-Over Dumbbell Row": "俯身哑铃划船",
  "Arm-Reach Crunch": "手臂上举卷腹",
  "Single-Leg Hamstring Activation": "单腿大腿后侧激活",
  "Chair Hip Hinge": "扶凳髋关节臀部训练",
  "Groin Mobility Split Squat": "腹股沟改良蹲",
  "Elevated Calf Raise": "垫高提踵",
  "Hip Thrust": "臀推",
  "Cable Pull-through": "绳索臀拉",
  "Machine variation": "器械变式",
  "Cable variation": "绳索变式",
  Dips: "双杠臂屈伸",
  "Lying Triceps Extension": "仰卧臂屈伸",
  "Y-Raise Lateral Raise": "Y 字侧平举",
  "Single-Arm Cable Pulldown": "单手钢线下拉",
  "Neutral-Grip Pulldown": "对握下拉",
  "Single-Arm Machine Row": "单手器械划船",
  "Open-Elbow Seated Row": "坐姿划船开肘",
  "Bulgarian Split Squat": "保加利亚深蹲",
  "Front Squat": "颈前深蹲",
  "Straight-Leg Barbell Bench Press": "直腿杠铃卧推",
  "Incline Barbell Bench Press": "杠铃上斜卧推",
  "Seal Row": "海豹划船",
  "Reverse-Grip Machine Row": "贴身器械反手划船",
  "Reverse-Grip Lat Pulldown": "反手高位下拉",
  "Bent-Over Dumbbell Reverse Fly": "俯身哑铃飞鸟",
  "Reverse Pec Deck": "蝴蝶机反式飞鸟",
  "Incline Bench Lateral Raise": "站姿上斜凳侧平举",
  "Seated Lateral Raise": "坐姿侧平举",
  "Hammer Dumbbell Curl": "锤式哑铃弯举",
  "Incline Barbell Triceps Extension": "上斜杠铃臂屈伸",
  "Cable Crunch": "绳索卷腹",
  "Plate Crunch": "杠铃片卷腹",
  "Deficit Deadlift": "超程硬拉",
  "T-Bar Row": "T 杆划船",
  "Kneeling Cable Crunch": "绳索跪姿卷腹",
  "Side Cable Crunch": "侧身卷腹下拉",
};

const FOCUS_CN: Record<string, string> = {
  "Beginner Chest Shoulders Triceps": "胸 + 肩 + 三头",
  "Beginner Back Biceps": "背 + 二头",
  "Beginner Lower Body": "下肢",
  "Beginner Recovery Day": "休息日",
  "Beginner Shoulders Arms": "肩 + 手臂",
  "Upper A": "上肢 A",
  "Upper B": "上肢 B",
  "Lower A": "下肢 A",
  "Lower B": "下肢 B",
  Push: "推",
  Pull: "拉",
  Legs: "腿",
  "Light Movement": "轻量活动",
  "Home Movement": "居家活动",
  "Home Upper Body": "居家上肢",
  "Home Lower Body": "居家下肢 + 腹肌",
  "A轮：深蹲 + 卧推 + 硬拉": "A轮：深蹲 + 卧推 + 硬拉",
  "B轮：深蹲 + 实力推 + 硬拉": "B轮：深蹲 + 实力推 + 硬拉",
  "卧推正常推进": "卧推正常推进",
  "深蹲正常推进": "深蹲正常推进",
  "卧推轻训": "卧推轻训",
  "硬拉正常推进 + 深蹲轻训": "硬拉正常推进 + 深蹲轻训",
  "主项补强日": "主项补强日",
  "推日：卧推5x5": "推日：卧推5x5",
  "拉日：罗马尼亚硬拉5x5": "拉日：罗马尼亚硬拉5x5",
  "蹲日：深蹲5x5": "蹲日：深蹲5x5",
  "恢复日": "恢复日",
};

const SPLIT_CN: Record<string, string> = {
  "Beginner Four-Day Split": "新手四分化",
  "Tan Chengyi Beginner Follow Along": "谭成义新手跟练",
  "Tan Chengyi Kaisheng Three-Day Split": "谭成义+凯圣王三分化",
  "Orange Three-Phase Hypertrophy": "橙子增肌计划",
  "Health Starter": "健康启动",
  "Home Upper Lower Health": "居家上/下肢健康计划",
  "Push Pull Legs Restart": "推拉腿重启",
  "Upper Lower Restart": "上下肢重启",
  "Push Pull Legs": "推拉腿分化",
  "Upper Lower": "上下肢分化",
  "Beginner AB Linear Strength": "小白A/B轮线性力量",
  "Advanced Linear Strength": "老手线性5x5增力",
  "Universal 5x5 Strength Split": "全人群5x5三分化",
};

const WARMUP_CN: Record<string, string> = {
  "5 min upper-body cardio": "5 分钟上肢低强度升温",
  "Band chest openers": "弹力带胸椎打开",
  "Scapular push-ups": "肩胛俯卧撑",
  "Cable fly warm-up set": "绳索夹胸轻重量热身组",
  "Bench press ramp-up sets": "卧推递增热身组",
  "5 min easy rower": "5 分钟轻松划船机",
  "Shoulder blade depression drills": "肩胛下沉控制练习",
  "Straight-arm pulldown warm-up": "直臂下压轻重量激活",
  "Light cable row ramp-up sets": "绳索划船递增热身组",
  "5 min incline walk or bike": "5 分钟坡走或单车升温",
  "Hip circles": "髋关节绕环",
  "Adductor rockbacks": "内收肌后坐动态拉伸",
  "Bodyweight lunges": "徒手弓步激活",
  "Calf ankle rocks": "踝关节与小腿动态活动",
  "Band external rotations": "弹力带外旋",
  "Face pull warm-up set": "面拉轻重量热身组",
  "Light overhead press ramp-up sets": "推肩递增热身组",
  "3-5 min easy cardio": "3-5 分钟低强度有氧升温",
  "Dynamic joint circles": "动态关节环绕",
  "Two light ramp-up sets": "目标动作前做 2 组递增热身",
  "Band pull-aparts": "弹力带拉伸激活肩胛",
  "Glute bridges": "臀桥激活",
  "Bodyweight squats": "徒手深蹲唤醒下肢",
  "Rocking Plank": "拉锯式平板支撑",
  "Wrist preparation": "手腕准备",
  "Light shoulder circles": "轻量肩关节绕环",
  "Hip hinge rehearsal": "屈髋模式预演",
  "Ankle rocks": "踝关节前后活动",
};

const measurementsSeed: Measurement[] = [
  { date: "2026-05-01", weight_kg: 72.4, waist_cm: 82, body_fat_percent: 18.6 },
  { date: "2026-05-08", weight_kg: 72.0, waist_cm: 81.4, body_fat_percent: 18.2 },
  { date: "2026-05-14", weight_kg: 71.6, waist_cm: 80.8, body_fat_percent: 17.9 },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function dateIsoDaysAgo(daysAgo: number) {
  const day = new Date();
  day.setDate(day.getDate() - daysAgo);
  return day.toISOString().slice(0, 10);
}

function initialCheckinDates() {
  return [6, 5, 4, 3, 2, 1].map(dateIsoDaysAgo);
}

function lotteryStorageKey(user: User | null) {
  return `gympath_lottery_state_${user?.id ?? "guest"}`;
}

function readLotteryState(key: string): LotteryState {
  if (typeof window === "undefined") return EMPTY_LOTTERY_STATE;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return EMPTY_LOTTERY_STATE;
    const parsed = JSON.parse(raw) as Partial<LotteryState>;
    return {
      trial_used: Boolean(parsed.trial_used),
      ticket_draws: Math.max(0, Number(parsed.ticket_draws ?? 0)),
      history: Array.isArray(parsed.history) ? parsed.history.slice(0, 12) as LotteryDraw[] : [],
    };
  } catch {
    return EMPTY_LOTTERY_STATE;
  }
}

function lotteryChances(reward: CheckinReward | null, state: LotteryState) {
  const trial_available = !state.trial_used;
  const earned_tickets = reward?.reward_tickets ?? 0;
  const ticket_available = Math.max(0, earned_tickets - state.ticket_draws);
  return {
    trial_available,
    ticket_available,
    earned_tickets,
    total_available: (trial_available ? 1 : 0) + ticket_available,
  };
}

const ANATOMY_IMAGE_URL = "/anatomy-muscles-zh.jpg";
const ANATOMY_SOURCE_URL = "https://commons.wikimedia.org/wiki/File:1105_Anterior_and_Posterior_Views_of_Muscles_zh.jpg";

const PAIN_JOINTS = [
  { key: "shoulder", label: "Shoulder", view: "front", x: 35.6, y: 10.2 },
  { key: "elbow", label: "Elbow", view: "front", x: 31.2, y: 17.5 },
  { key: "wrist", label: "Wrist", view: "front", x: 27.1, y: 23.5 },
  { key: "hip", label: "Hip", view: "front", x: 46.1, y: 24.6 },
  { key: "knee", label: "Knee", view: "front", x: 43.1, y: 33.5 },
  { key: "ankle", label: "Ankle", view: "front", x: 43.1, y: 41.4 },
  { key: "back", label: "Low Back", view: "back", x: 49.4, y: 65.8 },
  { key: "shoulder", label: "Shoulder", view: "back", x: 63.2, y: 60.6 },
  { key: "elbow", label: "Elbow", view: "back", x: 69.0, y: 66.1 },
  { key: "wrist", label: "Wrist", view: "back", x: 72.1, y: 72.3 },
  { key: "hip", label: "Hip", view: "back", x: 51.2, y: 71.0 },
  { key: "knee", label: "Knee", view: "back", x: 44.2, y: 82.5 },
  { key: "ankle", label: "Ankle", view: "back", x: 44.2, y: 92.3 },
];

export default function Home() {
  const resultRef = useRef<HTMLElement | null>(null);
  const [locale, setLocale] = useState<Locale>(readStoredLocale);
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [view, setView] = useState<View>("plan");
  const [status, setStatus] = useState("System ready");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [nutrition, setNutrition] = useState<Nutrition | null>(null);
  const [pain, setPain] = useState<PainInput>({
    exercise_name: "Barbell Bench Press",
    pain_location: "shoulder",
    pain_type: "pinch",
    pain_level: 3,
  });
  const [painResult, setPainResult] = useState<PainResult | null>(null);
  const [feedback, setFeedback] = useState<FeedbackInput>({
    completed: true,
    fatigue_level: 5,
    duration_min: 60,
    pain_level: 0,
  });
  const [feedbackResult, setFeedbackResult] = useState<FeedbackResult | null>(null);
  const [checkins, setCheckins] = useState<string[]>(initialCheckinDates);
  const [checkinReward, setCheckinReward] = useState<CheckinReward | null>(null);
  const [lotteryState, setLotteryState] = useState<LotteryState>(EMPTY_LOTTERY_STATE);
  const [lotteryRotation, setLotteryRotation] = useState(0);
  const [lotterySpinning, setLotterySpinning] = useState(false);
  const [lotteryResult, setLotteryResult] = useState<LotteryDraw | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>(measurementsSeed);
  const [progress, setProgress] = useState<ProgressResult | null>(null);
  const [knowledgeTopic, setKnowledgeTopic] = useState("spot_reduction");
  const [knowledge, setKnowledge] = useState<Knowledge | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "I am the GymPath AI coach. Ask me about training plans, exercise substitutions, nutrition, cutting, bulking, recovery, and beginner fitness concepts." },
  ]);
  const [chatInput, setChatInput] = useState("My shoulder feels uncomfortable during bench press. Can I still train chest today?");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMeta, setChatMeta] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({ username: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authChecked, setAuthChecked] = useState(true);
  const [guestMode, setGuestMode] = useState(false);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [postDraft, setPostDraft] = useState({ title: "", content: "" });
  const [postImage, setPostImage] = useState<File | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [communityError, setCommunityError] = useState("");
  const currentLotteryStorageKey = useMemo(() => lotteryStorageKey(user), [user]);
  renderLocale = locale;

  useEffect(() => {
    void generatePlan();
    void analyzeProgress();
    void loadKnowledge(knowledgeTopic);
    void refreshCheckinReward(checkins);
    // Initial dashboard hydration only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    renderLocale = locale;
    window.localStorage.setItem("gympath_locale", locale);
  }, [locale]);

  useEffect(() => {
    const savedToken = window.localStorage.getItem("gympath_token");
    if (!savedToken) return;

    setAuthToken(savedToken);
    getJson<{ user: User }>("/api/auth/me", savedToken)
      .then((result) => {
        setUser(result.user);
        setGuestMode(false);
      })
      .catch(() => {
        window.localStorage.removeItem("gympath_token");
        setAuthToken(null);
        setUser(null);
      });
  }, []);

  useEffect(() => {
    void loadCommunity(authToken);
    if (authToken) {
      void loadAccountData(authToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  useEffect(() => {
    setLotteryState(readLotteryState(currentLotteryStorageKey));
    setLotteryResult(null);
  }, [currentLotteryStorageKey]);

  function patchProfile<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  async function generatePlan() {
    setLoading(true);
    setStatus("Generating training and nutrition plans");
    try {
      const nextPlan = await postJson<WorkoutPlan>("/api/plan", {
        level: profile.level,
        goal: profile.goal,
        days_per_week: profile.days_per_week,
        minutes_per_session: profile.minutes_per_session,
        strength_plan_type: profile.strength_plan,
        muscle_gain_plan_type: profile.muscle_gain_plan,
      });
      const nextNutrition = await postJson<Nutrition>("/api/nutrition", {
        weight_kg: profile.weight_kg,
        height_cm: profile.height_cm,
        age: profile.age,
        gender: profile.gender,
        goal: profile.goal,
        activity_level: profile.activity_level,
        level: profile.level,
        days_per_week: profile.days_per_week,
        minutes_per_session: profile.minutes_per_session,
        diet_plan_type: profile.fat_loss_plan,
        carb_sensitivity: profile.carb_sensitivity,
        target_weight_kg: profile.target_weight_kg,
        diet_training_intensity: "auto",
      });
      setPlan(nextPlan);
      setNutrition(nextNutrition);
      setStatus("Plan updated. You can start training.");
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (error) {
      setStatus(error instanceof Error ? `API connection failed: ${error.message}` : "API connection failed");
    } finally {
      setLoading(false);
    }
  }

  async function checkPain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await requestPainGuidance(pain);
  }

  async function requestPainGuidance(nextPain: PainInput) {
    setFeedback((current) => ({ ...current, pain_level: nextPain.pain_level }));
    setStatus("Checking pain response and substitutions");
    try {
      const result = await postJson<PainResult>("/api/pain", { ...nextPain, goal: profile.goal });
      setPainResult(result);
      setStatus("Pain guidance ready");
    } catch (error) {
      setStatus(error instanceof Error ? `Pain check failed: ${error.message}` : "Pain check failed");
    }
  }

  function selectPainLocation(location: string) {
    const nextPain = { ...pain, pain_location: location, pain_type: "joint", pain_level: Math.max(pain.pain_level, 4) };
    setPain(nextPain);
    setFeedback((current) => ({ ...current, pain_level: nextPain.pain_level }));
    void requestPainGuidance(nextPain);
  }

  async function refreshCheckinReward(nextDates: string[]) {
    try {
      const result = await postJson<CheckinReward>("/api/checkin-reward", {
        checkin_dates: nextDates,
        today: todayIso(),
      });
      setCheckinReward(result);
    } catch (error) {
      setStatus(error instanceof Error ? `Check-in rewards failed to load: ${error.message}` : "Check-in rewards failed to load");
    }
  }

  async function loadAccountData(token: string) {
    try {
      const [savedMeasurements, savedCheckins] = await Promise.all([
        getJson<MeasurementResponse>("/api/progress/measurements", token),
        getJson<CheckinResponse>("/api/checkins", token),
      ]);
      const accountMeasurements = savedMeasurements.measurements.length
        ? savedMeasurements.measurements
        : [
            {
              date: todayIso(),
              weight_kg: profile.weight_kg,
              waist_cm: 82,
              body_fat_percent: 18,
            },
          ];
      setMeasurements(accountMeasurements);
      await analyzeProgress(accountMeasurements);
      setCheckins(savedCheckins.checkin_dates);
      await refreshCheckinReward(savedCheckins.checkin_dates);
      setStatus("Account data synced");
    } catch (error) {
      setStatus(error instanceof Error ? `Account sync failed: ${error.message}` : "Account sync failed");
    }
  }

  async function completeTodayCheckin() {
    const today = todayIso();
    try {
      const nextDates = authToken
        ? (await postJson<CheckinResponse>("/api/checkins", { date: today }, authToken)).checkin_dates
        : Array.from(new Set([...checkins, today])).sort();
      setCheckins(nextDates);
      await refreshCheckinReward(nextDates);
      setStatus(nextDates.includes(today) ? "Today's check-in is recorded" : "Check-in updated");
    } catch (error) {
      setStatus(error instanceof Error ? `Check-in failed: ${error.message}` : "Check-in failed");
    }
  }

  function saveLotteryState(nextState: LotteryState) {
    setLotteryState(nextState);
    window.localStorage.setItem(currentLotteryStorageKey, JSON.stringify(nextState));
  }

  function spinLottery() {
    const prizes = checkinReward?.prizes?.length ? checkinReward.prizes : DEFAULT_LOTTERY_PRIZES;
    const chances = lotteryChances(checkinReward, lotteryState);
    if (lotterySpinning) return;
    if (chances.total_available <= 0) {
      setStatus("No draw chance yet. Keep checking in; every 7-day streak unlocks one draw.");
      return;
    }

    const drawType: LotteryDraw["draw_type"] = chances.trial_available ? "trial" : "ticket";
    const winnerIndex = Math.floor(Math.random() * prizes.length);
    const segmentAngle = 360 / prizes.length;
    const targetOffset = 360 - (winnerIndex * segmentAngle + segmentAngle / 2);
    const rotationBase = Math.ceil(lotteryRotation / 360) * 360;
    const nextRotation = rotationBase + 360 * 6 + targetOffset;

    setLotterySpinning(true);
    setLotteryResult(null);
    setLotteryRotation(nextRotation);
    setStatus(drawType === "trial" ? "Running your first trial draw" : "Using one check-in draw ticket");

    window.setTimeout(() => {
      const draw: LotteryDraw = {
        id: `${Date.now()}-${winnerIndex}`,
        prize: prizes[winnerIndex],
        draw_type: drawType,
        created_at: new Date().toISOString(),
      };
      const nextState: LotteryState = {
        trial_used: lotteryState.trial_used || drawType === "trial",
        ticket_draws: lotteryState.ticket_draws + (drawType === "ticket" ? 1 : 0),
        history: [draw, ...lotteryState.history].slice(0, 12),
      };
      saveLotteryState(nextState);
      setLotteryResult(draw);
      setLotterySpinning(false);
      setStatus(`Draw complete: ${enText(draw.prize)}`);
    }, 3200);
  }

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!plan) {
      setStatus("Generate a training plan first");
      return;
    }
    setStatus("Adjusting from post-workout feedback");
    try {
      const mergedFeedback = {
        ...feedback,
        pain_level: Math.max(feedback.pain_level, pain.pain_level),
        pain_location: pain.pain_location,
        pain_type: pain.pain_type,
        exercise_name: pain.exercise_name,
      };
      const result = await postJson<FeedbackResult>("/api/feedback", { plan, ...mergedFeedback }, authToken);
      setFeedbackResult(result);
      if (feedback.completed) {
        await completeTodayCheckin();
      }
      setStatus("Feedback adjustment complete");
    } catch (error) {
      setStatus(error instanceof Error ? `Feedback failed: ${error.message}` : "Feedback failed");
    }
  }

  async function analyzeProgress(nextMeasurements = measurements) {
    try {
      const result = await postJson<ProgressResult>("/api/progress", { measurements: nextMeasurements });
      setProgress(result);
    } catch (error) {
      setStatus(error instanceof Error ? `Progress analysis failed: ${error.message}` : "Progress analysis failed");
    }
  }

  async function saveAndAnalyzeProgress() {
    try {
      const nextMeasurements = authToken
        ? (await putJson<MeasurementResponse>("/api/progress/measurements", { measurements }, authToken)).measurements
        : measurements;
      setMeasurements(nextMeasurements);
      await analyzeProgress(nextMeasurements);
      setStatus(authToken ? "Progress saved to your account" : "Guest progress updated on this page");
    } catch (error) {
      setStatus(error instanceof Error ? `Progress save failed: ${error.message}` : "Progress save failed");
    }
  }

  async function loadKnowledge(topic: string) {
    setKnowledgeTopic(topic);
    try {
      const result = await getJson<Knowledge>(`/api/knowledge/${topic}`);
      setKnowledge(result);
    } catch (error) {
      setStatus(error instanceof Error ? `Knowledge card failed to load: ${error.message}` : "Knowledge card failed to load");
    }
  }

  async function sendAiMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = chatInput.trim();
    if (!content) return;

    const nextMessages: ChatMessage[] = [...chatMessages, { role: "user", content }];
    setChatMessages(nextMessages);
    setChatInput("");
    setChatLoading(true);
    setStatus("AI coach is thinking");
    try {
      const result = await postJson<AiChatResponse>("/api/ai-chat", {
        messages: nextMessages,
        profile: {
          level: profile.level,
          locale,
          goal: profile.goal,
          minutes_per_session: profile.minutes_per_session,
          weight_kg: profile.weight_kg,
          height_cm: profile.height_cm,
          age: profile.age,
          activity_level: profile.activity_level,
          current_plan: plan
            ? {
                split: plan.split.split_name,
                days: plan.weekly_schedule.map((day) => ({
                  focus: day.focus,
                  exercises: day.exercises.slice(0, 5).map((exercise) => exercise.name),
                })),
              }
            : null,
          latest_feedback: feedback,
          latest_pain_check: pain,
          progress_entries: measurements.slice(-3),
        },
      });
      setChatMessages([...nextMessages, { role: "assistant", content: result.reply }]);
      setChatMeta(`${result.used_api ? "DeepSeek API" : "Local fallback"} / ${result.model}${result.warning ? ` / ${result.warning}` : ""}`);
      setStatus("AI coach replied");
    } catch (error) {
      setChatMessages([...nextMessages, { role: "assistant", content: "AI coaching is temporarily unavailable. Describe your goal, exercise, pain location, training performance, and diet record clearly, and I can still help you troubleshoot." }]);
      setChatMeta(error instanceof Error ? error.message : "AI request failed");
      setStatus("AI request failed");
    } finally {
      setChatLoading(false);
    }
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    try {
      const payload =
        authMode === "register"
          ? { username: authForm.username, email: authForm.email || null, password: authForm.password }
          : { identifier: authForm.username, password: authForm.password };
      const result = await postJson<AuthResponse>(authMode === "register" ? "/api/auth/register" : "/api/auth/login", payload);
      setAuthToken(result.token);
      setUser(result.user);
      setGuestMode(false);
      window.localStorage.setItem("gympath_token", result.token);
      setAuthForm({ username: "", email: "", password: "" });
      setAuthError("");
      setCommunityError("");
      setStatus(authMode === "register" ? "Account created and signed in" : "Signed in");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Sign-in failed");
    }
  }

  function logout() {
    window.localStorage.removeItem("gympath_token");
    setAuthToken(null);
    setUser(null);
    setGuestMode(false);
    setStatus("Signed out");
  }

  async function loadCommunity(token = authToken) {
    try {
      const result = await getJson<{ posts: CommunityPost[] }>("/api/community/posts", token);
      setCommunityPosts(result.posts);
    } catch (error) {
      setStatus(error instanceof Error ? `Community failed to load: ${error.message}` : "Community failed to load");
    }
  }

  async function createCommunityPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCommunityError("");
    if (!authToken) {
      setCommunityError("Sign in before posting");
      return;
    }
    if (postImage && postImage.size > 5 * 1024 * 1024) {
      setCommunityError("Image must be under 5 MB");
      return;
    }
    try {
      const body = new FormData();
      body.set("title", postDraft.title);
      body.set("content", postDraft.content);
      if (postImage) {
        body.set("image", postImage);
      }
      await postFormData<CommunityPost>("/api/community/posts-with-image", body, authToken);
      setPostDraft({ title: "", content: "" });
      setPostImage(null);
      await loadCommunity(authToken);
      setStatus("Post published");
    } catch (error) {
      setCommunityError(error instanceof Error ? error.message : "Post failed");
    }
  }

  async function likePost(postId: number) {
    setCommunityError("");
    if (!authToken) {
      setCommunityError("Sign in before liking posts");
      return;
    }
    try {
      await postJson<{ post_id: number; liked: boolean; like_count: number }>(`/api/community/posts/${postId}/like`, {}, authToken);
      await loadCommunity(authToken);
    } catch (error) {
      setCommunityError(error instanceof Error ? error.message : "Like failed");
    }
  }

  async function submitComment(event: FormEvent<HTMLFormElement>, postId: number) {
    event.preventDefault();
    setCommunityError("");
    if (!authToken) {
      setCommunityError("Sign in before commenting");
      return;
    }
    const content = (commentDrafts[postId] ?? "").trim();
    if (!content) return;
    try {
      await postJson<CommunityComment>(`/api/community/posts/${postId}/comments`, { content }, authToken);
      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
      await loadCommunity(authToken);
    } catch (error) {
      setCommunityError(error instanceof Error ? error.message : "Comment failed");
    }
  }

  const planExerciseNames = Array.from(
    new Set(plan?.weekly_schedule.flatMap((day) => day.exercises.map((exercise) => exercise.name)) ?? [])
  );
  const showSetup = view === "plan" || view === "nutrition";
  const targetWeightMax = Math.max(45, Math.round(profile.weight_kg - 1));
  const targetWeightValue = Math.min(profile.target_weight_kg, targetWeightMax);

  if (!authChecked) {
    return <AuthLoading locale={locale} setLocale={setLocale} />;
  }

  if (!user && !guestMode) {
    return (
      <AuthGate
        locale={locale}
        setLocale={setLocale}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        authError={authError}
        onAuthSubmit={submitAuth}
        onGuest={() => setGuestMode(true)}
      />
    );
  }

  return (
    <main className="app-shell">
      <LanguageToggle locale={locale} setLocale={setLocale} />
      <aside className="rail">
        <div className="brand">
          <span>GP</span>
          <div>
            <strong>GYMPATH</strong>
            <small>TRAINING OS</small>
          </div>
        </div>

        <nav className="nav" aria-label="Main navigation">
          {VIEWS.map((item) => (
            <button
              key={item.value}
              className={view === item.value ? "nav-button active" : "nav-button"}
              type="button"
              onClick={() => setView(item.value)}
            >
              <span>{item.code}</span>
              {uiText(item.label)}
            </button>
          ))}
        </nav>

      </aside>

      <section className="workspace">
        <header className="hero">
          <div>
            <p className="kicker">{uiText("BLACK / WHITE / NATIVE UI")}</p>
            <h1>{uiText("Stop guessing your training.")}</h1>
            <p>
              {uiText("GymPath turns level, goal, warm-ups, exercise teaching, nutrition, pain substitutions, post-workout feedback, and rewards into one clear workflow.")}
            </p>
          </div>
        </header>

        {showSetup ? (
        <section className="setup-grid">
          <Panel code="PROFILE" title="Training Profile">
            <Segment label="Training Level" options={LEVELS} value={profile.level} onChange={(value) => patchProfile("level", value)} />
            <Segment label="Goal" options={GOALS} value={profile.goal} onChange={(value) => patchProfile("goal", value)} />
            {view === "plan" && profile.goal === "muscle_gain" ? (
              <div className="fat-loss-config">
                <Segment label="Muscle-Gain Plan" options={MUSCLE_GAIN_PLANS} value={profile.muscle_gain_plan} onChange={(value) => patchProfile("muscle_gain_plan", value)} />
              </div>
            ) : null}
            {view === "plan" && profile.goal === "strength_gain" ? (
              <div className="fat-loss-config">
                <Segment label="Strength Plan" options={STRENGTH_PLANS} value={profile.strength_plan} onChange={(value) => patchProfile("strength_plan", value)} />
              </div>
            ) : null}
            {profile.goal === "fat_loss" ? (
              <div className="fat-loss-config">
                <Segment label="Fat-Loss Nutrition Plan" options={FAT_LOSS_PLANS} value={profile.fat_loss_plan} onChange={(value) => patchProfile("fat_loss_plan", value)} />
                {profile.fat_loss_plan === "orange_carb_taper" ? (
                  <>
                    <Segment label="Orange Macro Ratio" options={CARB_SENSITIVITY_OPTIONS} value={profile.carb_sensitivity} onChange={(value) => patchProfile("carb_sensitivity", value)} />
                    <p className="soft">{uiText("Training burn is now automatic: Beginner or female = 5 kcal/min, Fitness Enthusiast = 8 kcal/min, High-Intensity Trainee = 10 kcal/min.")}</p>
                    <Field label={`Target weight ${targetWeightValue} kg`}>
                      <input type="range" min="40" max={targetWeightMax} step="1" value={targetWeightValue} onChange={(event) => patchProfile("target_weight_kg", Number(event.target.value))} />
                    </Field>
                  </>
                ) : null}
              </div>
            ) : null}
            <Field label={`Session length ${profile.minutes_per_session} min`}>
              <input type="range" min="20" max="120" step="5" value={profile.minutes_per_session} onChange={(event) => patchProfile("minutes_per_session", Number(event.target.value))} />
            </Field>
            <button className="primary" type="button" onClick={generatePlan} disabled={loading}>
              {loading ? uiText("Generating") : view === "nutrition" ? uiText("Generate Nutrition Plan") : uiText("Generate Training Plan")}
            </button>
          </Panel>

          {showSetup ? (
            <Panel code="BODY" title="Body Data">
              <div className="body-grid">
                <Field label="Weight kg">
                  <input type="number" value={profile.weight_kg} onChange={(event) => patchProfile("weight_kg", Number(event.target.value))} />
                </Field>
                <Field label="Height cm">
                  <input type="number" value={profile.height_cm} onChange={(event) => patchProfile("height_cm", Number(event.target.value))} />
                </Field>
                <Field label="Age">
                  <input type="number" value={profile.age} onChange={(event) => patchProfile("age", Number(event.target.value))} />
                </Field>
                <Field label="Sex">
                  <select value={profile.gender} onChange={(event) => patchProfile("gender", event.target.value as Gender)}>
                    <option value="male">{uiText("Male")}</option>
                    <option value="female">{uiText("Female")}</option>
                    <option value="other">{uiText("Other / Not specified")}</option>
                  </select>
                </Field>
                <Field label="Daily activity">
                  <select value={profile.activity_level} onChange={(event) => patchProfile("activity_level", event.target.value as Activity)}>
                    <option value="sedentary">{uiText("Sedentary")}</option>
                    <option value="light">{uiText("Light activity")}</option>
                    <option value="moderate">{uiText("Moderate activity")}</option>
                    <option value="active">{uiText("High activity")}</option>
                  </select>
                  <small className="field-note">{uiText("Used to estimate maintenance calories, target calories, and lifestyle burn.")}</small>
                </Field>
              </div>
            </Panel>
          ) : null}
        </section>
        ) : null}

        <section className="stage" ref={resultRef}>
          {view === "plan" && <PlanView plan={plan} />}
          {view === "nutrition" && <NutritionView nutrition={nutrition} />}
          {view === "feedback" && (
            <FeedbackView
              pain={pain}
              setPain={setPain}
              painResult={painResult}
              onPainSubmit={checkPain}
              onJointSelect={selectPainLocation}
              exerciseNames={planExerciseNames}
              feedback={feedback}
              setFeedback={setFeedback}
              result={feedbackResult}
              onSubmit={submitFeedback}
              hasPlan={Boolean(plan)}
            />
          )}
          {view === "lottery" && (
            <LotteryView
              reward={checkinReward}
              checkins={checkins}
              lotteryState={lotteryState}
              rotation={lotteryRotation}
              spinning={lotterySpinning}
              result={lotteryResult}
              onSpin={spinLottery}
              todayChecked={checkins.includes(todayIso())}
              onCheckin={completeTodayCheckin}
            />
          )}
          {view === "progress" && (
            <ProgressView measurements={measurements} setMeasurements={setMeasurements} progress={progress} addMeasurement={() => setMeasurements((current) => [...current, { date: new Date().toISOString().slice(0, 10), weight_kg: current.at(-1)?.weight_kg ?? profile.weight_kg, waist_cm: current.at(-1)?.waist_cm ?? 82, body_fat_percent: current.at(-1)?.body_fat_percent ?? 18 }])} analyzeProgress={saveAndAnalyzeProgress} />
          )}
          {view === "community" && (
            <CommunityView
              user={user}
              authMode={authMode}
              setAuthMode={setAuthMode}
              authForm={authForm}
              setAuthForm={setAuthForm}
              authError={authError}
              communityError={communityError}
              onAuthSubmit={submitAuth}
              onLogout={logout}
              posts={communityPosts}
              postDraft={postDraft}
              setPostDraft={setPostDraft}
              postImage={postImage}
              setPostImage={setPostImage}
              onPostSubmit={createCommunityPost}
              onLike={likePost}
              commentDrafts={commentDrafts}
              setCommentDrafts={setCommentDrafts}
              onCommentSubmit={submitComment}
              reload={() => void loadCommunity(authToken)}
            />
          )}
          {view === "knowledge" && <KnowledgeView topic={knowledgeTopic} card={knowledge} load={loadKnowledge} />}
          {view === "coach" && (
            <AiCoachView
              messages={chatMessages}
              input={chatInput}
              setInput={setChatInput}
              loading={chatLoading}
              meta={chatMeta}
              onSubmit={sendAiMessage}
            />
          )}
        </section>
      </section>
    </main>
  );
}

function LanguageToggle({
  locale,
  setLocale,
}: {
  locale: Locale;
  setLocale: Dispatch<SetStateAction<Locale>>;
}) {
  const nextLocale = locale === "zh" ? "en" : "zh";
  return (
    <button
      className="language-toggle"
      type="button"
      onClick={() => setLocale(nextLocale)}
      aria-label={uiText(locale === "zh" ? "Switch to English" : "Switch to Chinese")}
    >
      <span>{locale === "zh" ? "\u4e2d\u6587" : "EN"}</span>
      <strong>{locale === "zh" ? "EN" : "\u4e2d\u6587"}</strong>
    </button>
  );
}

function Panel({ code, title, children }: { code: string; title: string; children: ReactNode }) {
  return (
    <section className="panel">
      <p className="kicker">{code}</p>
      <h2>{uiText(title)}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{uiText(label)}</span>
      {children}
    </label>
  );
}

function AuthLoading({ locale, setLocale }: { locale: Locale; setLocale: Dispatch<SetStateAction<Locale>> }) {
  return (
    <main className="auth-gate">
      <LanguageToggle locale={locale} setLocale={setLocale} />
      <section className="auth-panel">
        <p className="kicker">GYMPATH ACCOUNT</p>
        <h1>{uiText("Entering GymPath.")}</h1>
        <p>{uiText("Checking your local login session.")}</p>
      </section>
    </main>
  );
}

function AuthGate({
  locale,
  setLocale,
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  authError,
  onAuthSubmit,
  onGuest,
}: {
  locale: Locale;
  setLocale: Dispatch<SetStateAction<Locale>>;
  authMode: "login" | "register";
  setAuthMode: Dispatch<SetStateAction<"login" | "register">>;
  authForm: { username: string; email: string; password: string };
  setAuthForm: Dispatch<SetStateAction<{ username: string; email: string; password: string }>>;
  authError: string;
  onAuthSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGuest: () => void;
}) {
  return (
    <main className="auth-gate">
      <LanguageToggle locale={locale} setLocale={setLocale} />
      <section className="auth-hero">
        <p className="kicker">GYMPATH / TRAINING OS</p>
        <h1>{uiText("Enter your training account first.")}</h1>
        <p>{uiText("Create an account to post, like, and comment, while keeping GymPath usable as a real multi-user fitness web app.")}</p>
      </section>
      <section className="auth-panel">
        <Header code="ACCOUNT" title={authMode === "register" ? "Create Account" : "Log In"} right="Local MVP account" />
        <form className="auth-form" onSubmit={onAuthSubmit}>
          <div className="auth-tabs" role="tablist" aria-label={uiText("Account mode")}>
            <button type="button" className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>{uiText("Log In")}</button>
            <button type="button" className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>{uiText("Register")}</button>
          </div>
          <Field label={authMode === "register" ? "Nickname" : "Nickname or Email"}>
            <input value={authForm.username} onChange={(event) => setAuthForm((current) => ({ ...current, username: event.target.value }))} placeholder={uiText("e.g. No-Shrug Shoulders")} />
          </Field>
          {authMode === "register" ? (
            <Field label="Email (optional)">
              <input value={authForm.email} onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))} placeholder={uiText("For future account recovery")} />
            </Field>
          ) : null}
          <Field label="Password">
            <input type="password" value={authForm.password} onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))} placeholder={uiText("At least 6 characters")} />
          </Field>
          {authError ? <p className="form-error">{cleanApiError(authError)}</p> : null}
          <button className="primary" type="submit">{uiText(authMode === "register" ? "Create Account & Enter" : "Log In & Enter")}</button>
          <button className="ghost guest-entry" type="button" onClick={onGuest}>{uiText("Preview as guest; log in later for community actions")}</button>
        </form>
      </section>
    </main>
  );
}

function Segment<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; note: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="segment">
      <legend>{uiText(label)}</legend>
      <div>
        {options.map((option) => (
          <button key={option.value} type="button" className={value === option.value ? "tile active" : "tile"} onClick={() => onChange(option.value)}>
            <strong>{uiText(option.label)}</strong>
            <span>{uiText(option.note)}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function PlanView({ plan }: { plan: WorkoutPlan | null }) {
  if (!plan) return <Empty title="No plan yet" text="Fill in the training profile and generate a plan to see training days, warm-ups, exercises, and teaching links." />;

  return (
    <section className="wide">
      <Header code="WEEK PLAN" title={tx(SPLIT_CN, plan.split.split_name)} right={renderLocale === "zh" ? `${plan.days_per_week} 天 / ${plan.minutes_per_session} 分钟` : `${plan.days_per_week} days / ${plan.minutes_per_session} min`} />
      {plan.muscle_gain_plan ? (
        <ProgramBriefView code="MUSCLE PLAN" plan={plan.muscle_gain_plan} />
      ) : plan.strength_plan ? (
        <ProgramBriefView code="STRENGTH PLAN" plan={plan.strength_plan} />
      ) : (
        <p className="soft">{uiText("Generated from the current goal, with training days, warm-ups, exercises, and feedback adjustment entry points.")}</p>
      )}
      <div className="day-stack">
        {plan.weekly_schedule.map((day, index) => {
          const dayVideoLinks = uniqueDayVideoLinks(day);
          const shownExerciseVideoUrls = new Set(dayVideoLinks.map((link) => canonicalVideoUrl(link.url)));
          return (
          <article className="day" key={`${day.day}-${day.focus}`}>
            <div className="day-head">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{tx(FOCUS_CN, day.focus)}</h3>
                <p>{sessionNote(day.session_note)}</p>
              </div>
            </div>
            {day.is_rest_day ? (
              <div className="rest-card">
                <strong>{uiText("Recovery Plan")}</strong>
                <p>{enText(day.rest_note ?? "No formal training today. Prioritize recovery.")}</p>
              </div>
            ) : (
              <>
                {day.rest_policy ? <p className="session-rest-policy">{enText(day.rest_policy)}</p> : null}
                <div className="day-actions">
                  {dayVideoLinks.map((link) => (
                    <a key={`${day.day}-${link.key}`} href={link.url} target="_blank" rel="noreferrer">
                      {uiText(link.label)}
                    </a>
                  ))}
                </div>
                <details>
                  <summary>{uiText("Warm-up / Activation")}</summary>
                  <ul className="chip-row">
                    {day.warmup.map((item) => <li key={item}>{tx(WARMUP_CN, item)}</li>)}
                  </ul>
                </details>
                {day.learning_points?.length ? (
                  <div className="rule-list compact-rules">
                    {day.learning_points.map((point) => <p key={point}>{enText(point)}</p>)}
                  </div>
                ) : null}
                <div className="exercise-grid">
                  {day.exercises.map((exercise, exerciseIndex) => {
                    const videoKey = canonicalVideoUrl(exercise.teaching_url);
                    const showTeachingVideo = Boolean(exercise.teaching_url) && !shownExerciseVideoUrls.has(videoKey);
                    if (showTeachingVideo) {
                      shownExerciseVideoUrls.add(videoKey);
                    }
                    return (
                      <article className="exercise" key={`${exercise.name}-${exerciseIndex}`}>
                        <header>
                          <span>{enText(exercise.phase ?? exercise.target_muscle)}</span>
                          {showTeachingVideo ? <a href={exercise.teaching_url} target="_blank" rel="noreferrer">{uiText("Teaching video")}</a> : null}
                        </header>
                        <h4>{tx(EXERCISE_CN, exercise.name)}</h4>
                        <p>{renderLocale === "zh" ? `${exercise.sets} 组 / ${exercise.reps} 次 / 休息 ${formatRest(exercise.rest_seconds)}` : `${exercise.sets} sets / ${exercise.reps} reps / rest ${formatRest(exercise.rest_seconds)}`}</p>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </article>
          );
        })}
      </div>
    </section>
  );
}

function uniqueDayVideoLinks(day: WorkoutDay) {
  const seen = new Set<string>();
  return [
    { key: "session", label: "Session video", url: day.session_video_url },
    { key: "warmup", label: "Warm-up video", url: day.warmup_video_url },
  ].filter((link): link is { key: string; label: string; url: string } => {
    if (!link.url) return false;
    const videoKey = canonicalVideoUrl(link.url);
    if (seen.has(videoKey)) return false;
    seen.add(videoKey);
    return true;
  });
}

function ProgramBriefView({ code, plan }: { code: string; plan: ProgramBrief }) {
  return (
    <section className="strength-brief">
      <div>
        <p className="kicker">{code}</p>
        <h3>{enText(plan.title)}</h3>
        <p>{enText(plan.source_basis)}</p>
        <p>{enText(plan.audience)}</p>
      </div>
      <div className="strength-grid">
        <article>
          <strong>{uiText("Core Logic")}</strong>
          {plan.logic_points.map((item) => <span key={item}>{enText(item)}</span>)}
        </article>
        <article>
          <strong>{uiText("Progression Rules")}</strong>
          {plan.progression_rules.map((item) => <span key={item}>{enText(item)}</span>)}
        </article>
        {plan.stall_strategy?.length ? (
          <article>
            <strong>{uiText("Stall Strategy")}</strong>
            {plan.stall_strategy.map((item) => <span key={item}>{enText(item)}</span>)}
          </article>
        ) : null}
        <article>
          <strong>{uiText("Risk Notes")}</strong>
          {plan.warnings.map((item) => <span key={item}>{enText(item)}</span>)}
        </article>
      </div>
    </section>
  );
}

function NutritionView({ nutrition }: { nutrition: Nutrition | null }) {
  const [foodLibrary, setFoodLibrary] = useState<FoodLibrary | null>(null);
  const [mealSelections, setMealSelections] = useState<Record<string, MealFoodSelection[]>>({});
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [selectedDietDay, setSelectedDietDay] = useState("baseline");

  useEffect(() => {
    let active = true;
    getJson<FoodLibrary>("/api/food-library")
      .then((library) => {
        if (!active) return;
        setFoodLibrary(library);
        setMealSelections((current) => {
          if (Object.keys(current).length) return current;
          return Object.fromEntries(
            library.meals.map((meal) => [
              meal.key,
              meal.default_food_ids
                .map((foodId) => library.foods.find((food) => food.id === foodId))
                .filter(Boolean)
                .map((food) => defaultMealSelection(food as FoodItem)),
            ])
          );
        });
      })
      .catch(() => {
        if (active) setFoodLibrary(null);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!nutrition) return <Empty title="Waiting for body data" text="Generating a plan also calculates calories, protein, and a rough BMI reference." />;
  const diet = nutrition.diet_plan;
  const dietTarget = diet ? selectDietTarget(diet, selectedDietDay) : null;
  const proteinValue = diet ? String(diet.baseline_daily.protein_g) : `${nutrition.protein.min_grams}-${nutrition.protein.max_grams}`;
  const isPerformanceDiet = diet?.type === "performance_macros";
  const calorieNote = isPerformanceDiet
    ? renderLocale === "zh"
      ? `训练日 ${diet.training_day_calories} kcal / 休息日 ${diet.rest_day_calories} kcal`
      : `Training day ${diet.training_day_calories} kcal / rest day ${diet.rest_day_calories} kcal`
    : renderLocale === "zh"
      ? `维持热量 ${nutrition.calories.maintenance_calories} kcal`
      : `Maintenance ${nutrition.calories.maintenance_calories} kcal`;
  const proteinNote = isPerformanceDiet
    ? "25% of total calories ÷ 4 kcal/g"
    : diet ? "Calculated from the selected nutrition plan" : "Easier to sustain across 3-5 meals";
  const carbTargetLabel = isPerformanceDiet ? "Training-day Carb Target" : "Daily Carb Target";
  const fatTargetLabel = isPerformanceDiet ? "Training-day Fat Target" : "Daily Fat Target";
  return (
    <div className="metric-grid">
      <Metric label="Target Calories" value={String(nutrition.calories.target_calories)} suffix="kcal" note={calorieNote} />
      <Metric label="Protein Target" value={proteinValue} suffix="g" note={proteinNote} />
      <Metric label="BMI" value={String(nutrition.bmi)} suffix="" note="Only a rough reference for muscular lifters" />
      {diet ? (
        <>
          <Metric label={carbTargetLabel} value={String(diet.baseline_daily.carbs_g)} suffix="g" note={renderLocale === "zh" ? `每周 ${diet.weekly_totals.carbs_g}g` : `${diet.weekly_totals.carbs_g}g per week`} />
          <Metric label={fatTargetLabel} value={String(diet.baseline_daily.fat_g)} suffix="g" note={renderLocale === "zh" ? `每周 ${diet.weekly_totals.fat_g}g` : `${diet.weekly_totals.fat_g}g per week`} />
          <Metric label="Protein Per Meal" value={diet.meal_timing.protein_per_meal_g} suffix="g" note={renderLocale === "zh" ? `${diet.meal_timing.meals_per_day} 餐 / 每 ${diet.meal_timing.meal_interval_hours} 小时` : `${diet.meal_timing.meals_per_day} meals / every ${diet.meal_timing.meal_interval_hours} hours`} />
        </>
      ) : null}
      {diet?.type === "performance_macros" ? (
        <section className="wide metric-span">
          <Header code="PERFORMANCE FUEL" title={enText(diet.title)} right={enText(diet.macro_ratio?.label ?? "5:2.5:2.5")} />
          <div className="macro-cycle orange-cycle">
            <article className="macro-card">
              <header><span>{uiText("BMR")}</span><strong>{uiText("Basal Metabolic Rate")}</strong></header>
              <div className="macro-row"><span>{uiText("Formula result")}</span><b>{diet.bmr} kcal</b></div>
              <p>{enText(diet.bmr_formula ?? "")}</p>
            </article>
            <article className="macro-card">
              <header><span>LIFE</span><strong>{uiText("Lifestyle Burn")}</strong></header>
              <div className="macro-row"><span>{uiText("Estimate")}</span><b>{diet.life_burn} kcal</b></div>
              <p>{enText(diet.life_burn_note ?? "")}</p>
            </article>
            <article className="macro-card">
              <header><span>TRAIN</span><strong>{uiText("Training Burn")}</strong></header>
              <div className="macro-row"><span>{uiText("Duration")}</span><b>{diet.training_burn?.minutes} min</b></div>
              <div className="macro-row"><span>{uiText("Intensity factor")}</span><b>{diet.training_burn?.intensity_factor}</b></div>
              <div className="macro-row"><span>{uiText("Estimated burn")}</span><b>{diet.training_burn?.calories} kcal</b></div>
              <p>{enText(diet.training_burn?.label ?? "")}</p>
            </article>
            <article className="macro-card">
              <header><span>TARGET</span><strong>{uiText("Calorie Strategy")}</strong></header>
              <div className="macro-row"><span>{uiText("Training day")}</span><b>{diet.training_day_calories} kcal</b></div>
              <div className="macro-row"><span>{uiText("Rest day")}</span><b>{diet.rest_day_calories} kcal</b></div>
              <div className="macro-row"><span>{uiText("Floor")}</span><b>{diet.calorie_floor} kcal</b></div>
              <p>{uiText("Training days sit around +250 kcal; rest days sit around -600 kcal, but no day goes below BMR.")}</p>
            </article>
          </div>
        </section>
      ) : null}
      {diet?.type === "fat_loss_carb_cycle" ? (
        <section className="wide metric-span">
          <Header code="CARB CYCLE" title="Fat-Loss Carb Cycle" right="2 high / 3 medium / 2 low" />
          <div className="macro-cycle">
            {diet.cycle_days.map((day) => (
              <article className="macro-card" key={day.key}>
                <header>
                  <span>{renderLocale === "zh" ? `每周 ${day.days_per_week} 天` : `${day.days_per_week} days / week`}</span>
                  <strong>{enText(day.label)}</strong>
                </header>
                <div className="macro-row"><span>{uiText("Carbs")}</span><b>{day.carbs_g}g</b></div>
                <div className="macro-row"><span>{uiText("Protein")}</span><b>{day.protein_g}g</b></div>
                <div className="macro-row"><span>{uiText("Fat")}</span><b>{day.fat_g}g</b></div>
                <div className="macro-row"><span>{uiText("Calories")}</span><b>{day.calories} kcal</b></div>
                <p>{enText(day.timing)}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {diet?.type === "orange_carb_taper" ? (
        <section className="wide metric-span">
          <Header code="CARB TAPER" title="Orange Carb-Taper Cut" right={enText(diet.macro_ratio?.label ?? "BMR + training burn")} />
          <div className="macro-cycle orange-cycle">
            <article className="macro-card">
              <header><span>{uiText("BMR")}</span><strong>{uiText("Basal Metabolic Rate")}</strong></header>
              <div className="macro-row"><span>{uiText("Formula result")}</span><b>{diet.bmr} kcal</b></div>
              <p>{uiText("Male: 10x bodyweight + 6.25x height - 5x age + 5. Female: same formula but ending with -161.")}</p>
            </article>
            <article className="macro-card">
              <header><span>TRAIN</span><strong>{uiText("Training Burn")}</strong></header>
              <div className="macro-row"><span>{uiText("Auto factor")}</span><b>{diet.training_burn?.intensity_factor}</b></div>
              <div className="macro-row"><span>{uiText("Duration")}</span><b>{diet.training_burn?.minutes} min</b></div>
              <div className="macro-row"><span>{uiText("Estimated burn")}</span><b>{diet.training_burn?.calories} kcal</b></div>
              <p>{enText(diet.training_burn?.label ?? "")}</p>
            </article>
            <article className="macro-card">
              <header><span>TOTAL</span><strong>{uiText("Daily Expenditure")}</strong></header>
              <div className="macro-row"><span>{uiText("Base total")}</span><b>{diet.daily_expenditure} kcal</b></div>
              <div className="macro-row"><span>{uiText("Carbs")}</span><b>{diet.baseline_daily.carbs_g}g</b></div>
              <div className="macro-row"><span>{uiText("Protein")}</span><b>{diet.baseline_daily.protein_g}g</b></div>
              <div className="macro-row"><span>{uiText("Fat")}</span><b>{diet.baseline_daily.fat_g}g</b></div>
            </article>
            {diet.target_timeline ? (
              <article className="macro-card">
                <header><span>TARGET</span><strong>{uiText("Fat-Loss Target")}</strong></header>
                <div className="macro-row"><span>{uiText("Target weight")}</span><b>{diet.target_timeline.target_weight_kg}kg</b></div>
                <div className="macro-row"><span>{uiText("Total loss")}</span><b>{diet.target_timeline.target_loss_kg}kg</b></div>
                <div className="macro-row"><span>{uiText("3% pace")}</span><b>{diet.target_timeline.conservative_months_3_percent} {renderLocale === "zh" ? "个月" : "months"}</b></div>
                <div className="macro-row"><span>{uiText("5% pace")}</span><b>{diet.target_timeline.aggressive_months_5_percent} {renderLocale === "zh" ? "个月" : "months"}</b></div>
                <p>{enText(diet.target_timeline.note)}</p>
              </article>
            ) : null}
          </div>
          {diet.adjustment_protocol ? (
            <div className="rule-list compact-rules">
              <p>{enText(diet.adjustment_protocol.rule)}</p>
              <p>{renderLocale === "zh" ? `按每月 3% 的速度，当前每周目标约 ${diet.adjustment_protocol.weekly_loss_target_kg}kg。若进度停滞，每日碳水减少 ${diet.adjustment_protocol.carb_cut_if_stalled_g}g。` : `At a 3% monthly pace, the current weekly loss target is about ${diet.adjustment_protocol.weekly_loss_target_kg}kg. If progress stalls, reduce daily carbs by ${diet.adjustment_protocol.carb_cut_if_stalled_g}g.`}</p>
            </div>
          ) : null}
        </section>
      ) : null}
      {diet && foodLibrary && dietTarget ? (
        <MealPlanner
          diet={diet}
          target={dietTarget}
          setSelectedDietDay={setSelectedDietDay}
          foodLibrary={foodLibrary}
          customFoods={customFoods}
          setCustomFoods={setCustomFoods}
          mealSelections={mealSelections}
          setMealSelections={setMealSelections}
        />
      ) : null}
      <section className="wide metric-span">
        <Header code="FUEL RULE" title="Nutrition Execution Rules" right="" />
        <div className="rule-list">
          {diet?.rules.map((rule) => <p key={rule}>{enText(rule)}</p>)}
          {diet ? <p>{enText(diet.meal_timing.note)}</p> : null}
          {!diet ? <p>{uiText("Hit protein first, then check total calories.")}</p> : null}
          {!diet ? <p>{uiText("Bulking is not random eating; cutting is not extreme restriction.")}</p> : null}
          {!diet ? <p>{uiText("Adjust calories only after two weeks without body-weight or measurement change.")}</p> : null}
          <p>{uiText("BMI is weak for muscular users. Combine it with measurements, strength, photos, and body-fat trends.")}</p>
        </div>
      </section>
    </div>
  );
}

function MealPlanner({
  diet,
  target,
  setSelectedDietDay,
  foodLibrary,
  customFoods,
  setCustomFoods,
  mealSelections,
  setMealSelections,
}: {
  diet: NonNullable<Nutrition["diet_plan"]>;
  target: MacroTotals & { key: string; label: string };
  setSelectedDietDay: Dispatch<SetStateAction<string>>;
  foodLibrary: FoodLibrary;
  customFoods: FoodItem[];
  setCustomFoods: Dispatch<SetStateAction<FoodItem[]>>;
  mealSelections: Record<string, MealFoodSelection[]>;
  setMealSelections: Dispatch<SetStateAction<Record<string, MealFoodSelection[]>>>;
}) {
  const [customDrafts, setCustomDrafts] = useState<Record<string, CustomFoodDraft>>({});
  const targetOptions = diet.cycle_days.length
    ? diet.cycle_days.map((day) => ({
        key: day.key,
        label: day.label,
        calories: day.calories,
        carbs_g: day.carbs_g,
        protein_g: day.protein_g,
        fat_g: day.fat_g,
      }))
    : [
        {
          key: "baseline",
          label: "Baseline",
          calories: diet.baseline_daily.calories,
          carbs_g: diet.baseline_daily.carbs_g,
          protein_g: diet.baseline_daily.protein_g,
          fat_g: diet.baseline_daily.fat_g,
        },
      ];
  const allFoods = [...foodLibrary.foods, ...customFoods];
  const foodById = new Map(allFoods.map((food) => [food.id, food]));
  const mealTotals = Object.fromEntries(
    foodLibrary.meals.map((meal) => [meal.key, sumFoodSelections(mealSelections[meal.key] ?? [], foodById)])
  ) as Record<string, MacroTotals>;
  const dailyTotal = sumFoodSelections(Object.values(mealSelections).flat(), foodById);
  const remaining = {
    calories: Math.round(target.calories - dailyTotal.calories),
    carbs_g: roundMacro(target.carbs_g - dailyTotal.carbs_g),
    protein_g: roundMacro(target.protein_g - dailyTotal.protein_g),
    fat_g: roundMacro(target.fat_g - dailyTotal.fat_g),
  };

  function toggleFood(mealKey: string, foodId: string) {
    setMealSelections((current) => {
      const selected = current[mealKey] ?? [];
      const exists = selected.some((item) => item.food_id === foodId);
      const food = foodById.get(foodId);
      return {
        ...current,
        [mealKey]: exists ? selected.filter((item) => item.food_id !== foodId) : food ? [...selected, defaultMealSelection(food)] : selected,
      };
    });
  }

  function updateFoodSelection(mealKey: string, foodId: string, patch: Partial<MealFoodSelection>) {
    setMealSelections((current) => ({
      ...current,
      [mealKey]: (current[mealKey] ?? []).map((item) => {
        if (item.food_id !== foodId) return item;
        const food = foodById.get(foodId);
        const nextState = patch.state ?? item.state;
        const validState = food?.states.some((state) => state.key === nextState) ? nextState : food?.default_state ?? item.state;
        return {
          ...item,
          ...patch,
          state: validState,
          grams: Math.max(1, Number(patch.grams ?? item.grams)),
        };
      }),
    }));
  }

  function patchCustomDraft(mealKey: string, patch: Partial<CustomFoodDraft>) {
    setCustomDrafts((current) => ({
      ...current,
      [mealKey]: { ...defaultCustomFoodDraft(), ...(current[mealKey] ?? {}), ...patch },
    }));
  }

  function addCustomFood(mealKey: string) {
    const draft = customDrafts[mealKey] ?? defaultCustomFoodDraft();
    const food = buildCustomFood(mealKey, draft);
    if (!food) return;

    setCustomFoods((current) => [...current, food]);
    setMealSelections((current) => ({
      ...current,
      [mealKey]: [...(current[mealKey] ?? []), defaultMealSelection(food)],
    }));
    setCustomDrafts((current) => ({ ...current, [mealKey]: defaultCustomFoodDraft() }));
  }

  return (
    <section className="wide metric-span meal-planner">
      <Header
        code="MEAL LOG"
        title="Food Log"
        right={
          <select value={target.key} onChange={(event) => setSelectedDietDay(event.target.value)}>
            {targetOptions.map((option) => (
              <option key={option.key} value={option.key}>{enText(option.label)}</option>
            ))}
          </select>
        }
      />
      <div className="meal-target">
        <MacroBadge label="Today Target" totals={target} />
        <MacroBadge label="Selected Total" totals={dailyTotal} />
        <MacroBadge label="Remaining" totals={remaining} />
      </div>
      <p className="meal-note">{uiText("Food values are practical estimates for common portions. For packaged foods, use the nutrition label. After selecting multiple foods, each meal header updates calories and macros in real time.")}</p>
      <div className="meal-stack">
        {foodLibrary.meals.map((meal) => {
          const selectedIds = mealSelections[meal.key] ?? [];
          const selectedFoodIdSet = new Set(selectedIds.map((item) => item.food_id));
          const availableFoods = allFoods.filter((food) => food.meal_tags.includes(meal.key));
          const customDraft = customDrafts[meal.key] ?? defaultCustomFoodDraft();
          const canAddCustomFood = isCustomFoodDraftValid(customDraft);
          return (
            <article className="meal-card" key={meal.key}>
              <header>
                <div>
                  <span>{enText(meal.label)}</span>
                  <strong>{mealTotals[meal.key]?.calories ?? 0} kcal</strong>
                </div>
                <div className="meal-macros">
                  <b>{uiText("Carbs")} {mealTotals[meal.key]?.carbs_g ?? 0}g</b>
                  <b>{uiText("Protein")} {mealTotals[meal.key]?.protein_g ?? 0}g</b>
                  <b>{uiText("Fat")} {mealTotals[meal.key]?.fat_g ?? 0}g</b>
                </div>
              </header>
              <p>{enText(meal.note)}</p>
              <div className="food-choice-grid">
                {availableFoods.map((food) => (
                  <button
                    key={`${meal.key}-${food.id}`}
                    className={selectedFoodIdSet.has(food.id) ? "food-chip active" : "food-chip"}
                    type="button"
                    onClick={() => toggleFood(meal.key, food.id)}
                  >
                    <strong>{enText(food.name)}</strong>
                    <span>{food.default_grams}g · {enText(stateLabel(food, food.default_state))}</span>
                    <small>{renderLocale === "zh" ? "每 100g" : "Per 100g"} {stateCalories(food, food.default_state)} kcal · {food.states.length > 1 ? uiText("switch raw/cooked or dry/cooked state") : enText(food.portion)}</small>
                  </button>
                ))}
              </div>
              <div className="custom-food-form">
                <strong>{uiText("Not listed? Add a custom food")}</strong>
                <input value={customDraft.name} onChange={(event) => patchCustomDraft(meal.key, { name: event.target.value })} placeholder={uiText("Food name, e.g. beef rice bowl")} />
                <input type="number" min="1" value={customDraft.grams} onChange={(event) => patchCustomDraft(meal.key, { grams: event.target.value })} placeholder={uiText("Amount eaten, g")} />
                <input type="number" min="0" step="0.1" value={customDraft.carbs} onChange={(event) => patchCustomDraft(meal.key, { carbs: event.target.value })} placeholder={uiText("Carbs per 100g")} />
                <input type="number" min="0" step="0.1" value={customDraft.protein} onChange={(event) => patchCustomDraft(meal.key, { protein: event.target.value })} placeholder={uiText("Protein per 100g")} />
                <input type="number" min="0" step="0.1" value={customDraft.fat} onChange={(event) => patchCustomDraft(meal.key, { fat: event.target.value })} placeholder={uiText("Fat per 100g")} />
                <button className="ghost" type="button" onClick={() => addCustomFood(meal.key)} disabled={!canAddCustomFood}>{uiText("Add to meal")}</button>
              </div>
              {selectedIds.length ? (
                <div className="selected-food-list">
                  {selectedIds.map((selection) => {
                    const food = foodById.get(selection.food_id);
                    if (!food) return null;
                    const itemTotals = macroForSelection(selection, food);
                    return (
                      <div className="selected-food-row" key={`${meal.key}-${selection.food_id}`}>
                        <div>
                          <strong>{enText(food.name)}</strong>
                          <span>{renderLocale === "zh" ? `${Math.round(itemTotals.calories)} kcal · 碳水 ${itemTotals.carbs_g}g / 蛋白 ${itemTotals.protein_g}g / 脂肪 ${itemTotals.fat_g}g` : `${Math.round(itemTotals.calories)} kcal · carbs ${itemTotals.carbs_g}g / protein ${itemTotals.protein_g}g / fat ${itemTotals.fat_g}g`}</span>
                        </div>
                        <input
                          aria-label={`${enText(food.name)} grams`}
                          type="number"
                          min="1"
                          step="1"
                          value={selection.grams}
                          onChange={(event) => updateFoodSelection(meal.key, food.id, { grams: Number(event.target.value) })}
                        />
                        <select value={selection.state} onChange={(event) => updateFoodSelection(meal.key, food.id, { state: event.target.value })}>
                          {food.states.map((state) => <option key={state.key} value={state.key}>{enText(state.label)}</option>)}
                        </select>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
      <details className="source-details">
        <summary>{uiText("Nutrition data sources")}</summary>
        <ul>
          {foodLibrary.macro_sources.map((source) => <li key={source}>{source}</li>)}
        </ul>
      </details>
    </section>
  );
}

function MacroBadge({ label, totals }: { label: string; totals: MacroTotals }) {
  return (
    <article>
      <span>{uiText(label)}</span>
      <strong>{Math.round(totals.calories)} kcal</strong>
      <p>{uiText("Carbs")} {roundMacro(totals.carbs_g)}g / {uiText("Protein")} {roundMacro(totals.protein_g)}g / {uiText("Fat")} {roundMacro(totals.fat_g)}g</p>
    </article>
  );
}

function PainView({
  pain,
  setPain,
  result,
  onSubmit,
  onJointSelect,
  exerciseNames,
  syncPainLevel,
}: {
  pain: PainInput;
  setPain: Dispatch<SetStateAction<PainInput>>;
  result: PainResult | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onJointSelect: (location: string) => void;
  exerciseNames: string[];
  syncPainLevel?: (level: number) => void;
}) {
  const names = Array.from(new Set(["Barbell Bench Press", "Back Squat", "Deadlift", ...exerciseNames]));
  return (
    <div className="stack">
      <section className="pain-layout">
        <HumanPainMap selected={pain.pain_location} onSelect={onJointSelect} />
        <form className="wide form" onSubmit={onSubmit}>
          <Header code="PAIN CHECK" title="Pain Check" right="Not medical diagnosis" />
          <div className="body-grid">
            <Field label="Current exercise">
              <select value={pain.exercise_name} onChange={(event) => setPain((current) => ({ ...current, exercise_name: event.target.value }))}>
                {names.map((name) => <option key={name} value={name}>{tx(EXERCISE_CN, name)}</option>)}
              </select>
            </Field>
            <Field label="Pain location">
              <select value={pain.pain_location} onChange={(event) => setPain((current) => ({ ...current, pain_location: event.target.value }))}>
                <option value="shoulder">{uiText("Shoulder")}</option>
                <option value="elbow">{uiText("Elbow")}</option>
                <option value="wrist">{uiText("Wrist")}</option>
                <option value="back">{uiText("Low back")}</option>
                <option value="hip">{uiText("Hip")}</option>
                <option value="knee">{uiText("Knee")}</option>
                <option value="ankle">{uiText("Ankle")}</option>
              </select>
            </Field>
            <Field label="Pain type">
              <select value={pain.pain_type} onChange={(event) => setPain((current) => ({ ...current, pain_type: event.target.value }))}>
                <option value="burn">{uiText("Muscle burn")}</option>
                <option value="pinch">{uiText("Pinching")}</option>
                <option value="joint">{uiText("Joint discomfort")}</option>
                <option value="sharp">{uiText("Sharp pain")}</option>
                <option value="radiating">{uiText("Radiating pain")}</option>
                <option value="worsening">{uiText("Getting worse")}</option>
              </select>
            </Field>
            <Field label={`Pain level ${pain.pain_level}/10`}>
              <input
                type="range"
                min="0"
                max="10"
                value={pain.pain_level}
                onChange={(event) => {
                  const level = Number(event.target.value);
                  setPain((current) => ({ ...current, pain_level: level }));
                  syncPainLevel?.(level);
                }}
              />
            </Field>
          </div>
          <button className="primary" type="submit">{uiText("Check whether to continue")}</button>
        </form>
      </section>
      {result && (
        <section className="wide">
          <Header code="RESULT" title={painCategory(result.assessment.category)} right={tx(EXERCISE_CN, result.substitution.exercise)} />
          <p className="big-copy">{painAction(result.assessment.action)}</p>
          <div className="chip-row">
            {result.substitution.suggestions.map((item) => <span key={item}>{tx(EXERCISE_CN, item)}</span>)}
          </div>
          {result.joint_guidance ? (
            <div className="joint-guidance">
              <article>
                <strong>{renderLocale === "zh" ? `${enText(result.joint_guidance.label)}替代动作` : `${enText(result.joint_guidance.label)} substitutions`}</strong>
                <div className="chip-row">
                  {result.joint_guidance.substitutions.map((item) => <span key={item}>{tx(EXERCISE_CN, item)}</span>)}
                </div>
              </article>
              <article>
                <strong>{uiText("Relief options")}</strong>
                <ul>{result.joint_guidance.relief_methods.map((item) => <li key={item}>{enText(item)}</li>)}</ul>
              </article>
              <article>
                <strong>{uiText("Rehab drills")}</strong>
                <ul>{result.joint_guidance.rehab_drills.map((item) => <li key={item}>{enText(item)}</li>)}</ul>
              </article>
              <article>
                <strong>{uiText("Video links")}</strong>
                <div className="day-actions">
                  {result.joint_guidance.video_links.map((item) => <a key={item.url} href={item.url} target="_blank" rel="noreferrer">{enText(item.label)}</a>)}
                </div>
              </article>
              <p className="medical-note">{enText(result.joint_guidance.medical_note)}</p>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}

function HumanPainMap({ selected, onSelect }: { selected: string; onSelect: (location: string) => void }) {
  return (
    <section className="wide human-map-card">
      <Header code="ANATOMY MAP" title="Muscle and Joint Map" right="Click a joint" />
      <div className="human-map anatomy-photo-board">
        <div className="anatomy-photo-frame">
          <img src={ANATOMY_IMAGE_URL} alt={uiText("Anterior and posterior muscle anatomy")} loading="lazy" />
          {PAIN_JOINTS.map((joint, index) => (
            <button
              key={`${joint.key}-${joint.view}-${index}`}
              className={selected === joint.key ? "joint-hotspot active" : "joint-hotspot"}
              type="button"
              style={{ left: `${joint.x}%`, top: `${joint.y}%` }}
              onClick={() => onSelect(joint.key)}
              aria-label={renderLocale === "zh" ? `选择${enText(joint.label)}疼痛` : `Select ${enText(joint.label)} pain`}
            >
              <span>{enText(joint.label)}</span>
            </button>
          ))}
        </div>
        <a className="image-source-link" href={ANATOMY_SOURCE_URL} target="_blank" rel="noreferrer">
          {uiText("Image source: Wikimedia Commons / OpenStax Anatomy and Physiology / CC BY 4.0")}
        </a>
      </div>
      <p className="map-help">{uiText("Click the painful joint to get substitutions, relief options, rehab drills, and video links.")}</p>
    </section>
  );
}

function FeedbackView({
  pain,
  setPain,
  painResult,
  onPainSubmit,
  onJointSelect,
  exerciseNames,
  feedback,
  setFeedback,
  result,
  onSubmit,
  hasPlan,
}: {
  pain: PainInput;
  setPain: Dispatch<SetStateAction<PainInput>>;
  painResult: PainResult | null;
  onPainSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onJointSelect: (location: string) => void;
  exerciseNames: string[];
  feedback: FeedbackInput;
  setFeedback: Dispatch<SetStateAction<FeedbackInput>>;
  result: FeedbackResult | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  hasPlan: boolean;
}) {
  return (
    <div className="stack">
      <PainView
        pain={pain}
        setPain={setPain}
        result={painResult}
        onSubmit={onPainSubmit}
        onJointSelect={onJointSelect}
        exerciseNames={exerciseNames}
        syncPainLevel={(level) => setFeedback((current) => ({ ...current, pain_level: level }))}
      />
      <form className="wide form" onSubmit={onSubmit}>
        <Header code="POST SESSION" title="Adjust Next Session From Fatigue + Pain" right={hasPlan ? "Plan connected" : "Generate a plan first"} />
        <label className="check-row">
          <input type="checkbox" checked={feedback.completed} onChange={(event) => setFeedback((current) => ({ ...current, completed: event.target.checked }))} />
          {uiText("Training completed today")}
        </label>
        <div className="body-grid">
          <Field label={`Fatigue ${feedback.fatigue_level}/10`}>
            <input type="range" min="0" max="10" value={feedback.fatigue_level} onChange={(event) => setFeedback((current) => ({ ...current, fatigue_level: Number(event.target.value) }))} />
          </Field>
          <Field label={`Pain ${feedback.pain_level}/10`}>
            <input
              type="range"
              min="0"
              max="10"
              value={feedback.pain_level}
              onChange={(event) => {
                const level = Number(event.target.value);
                setFeedback((current) => ({ ...current, pain_level: level }));
                setPain((current) => ({ ...current, pain_level: level }));
              }}
            />
          </Field>
          <Field label="Session duration, min">
            <input type="number" value={feedback.duration_min} onChange={(event) => setFeedback((current) => ({ ...current, duration_min: Number(event.target.value) }))} />
          </Field>
        </div>
        <p className="soft">{uiText("The next-session recommendation combines fatigue, pain level, pain type, and pain location. Higher pain plus higher fatigue pushes the plan toward lower volume, longer rest, or exercise substitution.")}</p>
        <button className="primary" type="submit" disabled={!hasPlan}>{uiText("Adjust next session")}</button>
      </form>
      {result && (
        <section className="wide">
          <Header
            code="ADAPT"
            title={nextFocusLabel(result.next_session_focus)}
            right={renderLocale === "zh" ? `${decisionLevelLabel(result.decision_level)} / 负荷评分 ${result.combined_load_score ?? "--"}` : `${decisionLevelLabel(result.decision_level)} / load score ${result.combined_load_score ?? "--"}`}
          />
          <div className="adjustment-summary">
            <span>{renderLocale === "zh" ? `${Math.round(result.volume_multiplier * 100)}% 容量` : `${Math.round(result.volume_multiplier * 100)}% volume`}</span>
            <span>{renderLocale === "zh" ? `休息 ${formatRest(result.recommended_rest_seconds ?? 120)}` : `Rest ${formatRest(result.recommended_rest_seconds ?? 120)}`}</span>
            <span>{uiText(result.replace_exercise ? "Substitute the painful movement next time" : "Movement can be monitored")}</span>
          </div>
          {result.pain_context ? (
            <p className="soft">
              {renderLocale === "zh" ? "疼痛记录" : "Pain record"}: {tx(EXERCISE_CN, result.pain_context.exercise_name)} / {painLocationLabel(result.pain_context.pain_location)} / {painTypeLabel(result.pain_context.pain_type)} / {result.pain_context.pain_level}/10
            </p>
          ) : null}
          <div className="rule-list">{result.notes.map((note) => <p key={note}>{feedbackNote(note)}</p>)}</div>
        </section>
      )}
    </div>
  );
}

function LotteryView({
  reward,
  checkins,
  lotteryState,
  rotation,
  spinning,
  result,
  todayChecked,
  onSpin,
  onCheckin,
}: {
  reward: CheckinReward | null;
  checkins: string[];
  lotteryState: LotteryState;
  rotation: number;
  spinning: boolean;
  result: LotteryDraw | null;
  todayChecked: boolean;
  onSpin: () => void;
  onCheckin: () => Promise<void>;
}) {
  const prizes = reward?.prizes?.length ? reward.prizes : DEFAULT_LOTTERY_PRIZES;
  const chances = lotteryChances(reward, lotteryState);
  const gradient = prizes
    .map((_, index) => {
      const start = (index * 360) / prizes.length;
      const end = ((index + 1) * 360) / prizes.length;
      const tone = index % 3 === 0 ? "#f2f2f2" : index % 3 === 1 ? "#1a1a1a" : "#757575";
      return `${tone} ${start}deg ${end}deg`;
    })
    .join(", ");
  const progress = reward?.cycle_progress ?? Math.min(7, checkins.length % 7 || (checkins.length ? 7 : 0));
  const goal = reward?.cycle_goal ?? 7;
  const daysLeft = reward?.days_until_lottery ?? Math.max(0, 7 - progress);

  return (
    <div className="stack lottery-stage">
      <section className="wide lottery-hero">
        <div>
          <Header
            code="SUPPLEMENT LOTTERY"
            title="Check-In Prize Wheel"
            right={chances.total_available > 0 ? (renderLocale === "zh" ? `${chances.total_available} 次抽奖可用` : `${chances.total_available} draw(s) available`) : "Keep going"}
          />
          <p className="big-copy">
            {uiText("Your first spin is a free trial. After that, every 7-day check-in streak earns one real draw ticket. Prizes include protein powder, creatine, and training accessories.")}
          </p>
          <div className="lottery-stats">
            <article><span>{uiText("Trial Spin")}</span><strong>{uiText(chances.trial_available ? "Ready" : "Used")}</strong></article>
            <article><span>{uiText("Draw Tickets")}</span><strong>{chances.ticket_available}</strong></article>
            <article><span>{uiText("Current Streak")}</span><strong>{reward?.streak ?? 0} {renderLocale === "zh" ? "天" : "days"}</strong></article>
          </div>
        </div>
        <div className="lottery-wheel-shell" aria-live="polite">
          <div className="wheel-pointer" />
          <div
            className={spinning ? "lottery-wheel spinning" : "lottery-wheel"}
            style={{ background: `conic-gradient(${gradient})`, transform: `rotate(${rotation}deg)` }}
          >
            {prizes.map((prize, index) => {
              const angle = (index * 360) / prizes.length + 360 / prizes.length / 2;
              return (
                <span
                  key={prize}
                  className="wheel-label"
                  style={{ transform: `rotate(${angle}deg) translateY(-7.2rem) rotate(${-angle}deg)` }}
                >
                  {enText(prize)}
                </span>
              );
            })}
          </div>
          <button className="wheel-center" type="button" onClick={onSpin} disabled={spinning}>
            {uiText(spinning ? "Spinning" : "Spin")}
          </button>
        </div>
      </section>

      <section className="wide keep-going-card">
        <Header code="KEEP GOING" title="Keep Going" right={`${progress}/${goal}`} />
        <div className="checkin-meter">
          <div>
            <strong>{chances.total_available > 0 ? uiText("You can spin now") : (renderLocale === "zh" ? `距离下一张抽奖券还差 ${daysLeft} 天` : `${daysLeft} day(s) to the next ticket`)}</strong>
            <p>
              {chances.total_available > 0
                ? uiText("Use the free trial or an earned check-in ticket. After spinning, keep checking in to unlock the next 7-day ticket.")
                : uiText("Check in after training. A 7-day streak unlocks one formal prize-wheel ticket.")}
            </p>
          </div>
          <progress value={progress} max={goal} />
        </div>
        <button className={todayChecked ? "ghost active" : "ghost"} type="button" onClick={() => void onCheckin()}>
          {uiText(todayChecked ? "Today's check-in recorded" : "Complete today's check-in")}
        </button>
      </section>

      <section className="wide">
        <Header code="PRIZE POOL" title="Prize Pool and Result" right={result ? `${uiText(result.draw_type === "trial" ? "Trial" : "Ticket")}: ${enText(result.prize)}` : "Ready to spin"} />
        {result ? (
          <div className="lottery-result">
            <span>{uiText("You won")}</span>
            <strong>{enText(result.prize)}</strong>
            <p>{uiText(result.draw_type === "trial" ? "This was the first free trial spin, so it did not consume a 7-day ticket." : "This consumed one 7-day check-in draw ticket.")}</p>
          </div>
        ) : null}
        <div className="prize-grid">
          {prizes.map((item) => <span key={item}>{enText(item)}</span>)}
        </div>
        {lotteryState.history.length ? (
          <div className="lottery-history">
            {lotteryState.history.map((draw) => (
              <p key={draw.id}>
                <span>{uiText(draw.draw_type === "trial" ? "Trial" : "Ticket")}</span>
                <strong>{enText(draw.prize)}</strong>
                <time>{formatCommunityTime(draw.created_at)}</time>
              </p>
            ))}
          </div>
        ) : (
          <p className="soft">{uiText("No draw history yet. Press “Spin” to use your first trial spin.")}</p>
        )}
      </section>
    </div>
  );
}

function ProgressView({
  measurements,
  setMeasurements,
  progress,
  addMeasurement,
  analyzeProgress,
}: {
  measurements: Measurement[];
  setMeasurements: Dispatch<SetStateAction<Measurement[]>>;
  progress: ProgressResult | null;
  addMeasurement: () => void;
  analyzeProgress: () => Promise<void>;
}) {
  return (
    <div className="stack">
      <section className="wide">
        <Header code="MEASUREMENTS" title="Measurement Trends" right={<button className="ghost" type="button" onClick={addMeasurement}>{uiText("Add Record")}</button>} />
        <p className="soft">{uiText("Customize date, body weight, waist, and body-fat percentage. The line chart sorts entries by date automatically.")}</p>
        <div className="table">
          <div className="table-row progress-row head"><span>{uiText("Date")}</span><span>{uiText("Weight")}</span><span>{uiText("Waist")}</span><span>{uiText("Body Fat")}</span></div>
          {measurements.map((item, index) => (
            <div className="table-row progress-row" key={`${item.date}-${index}`}>
              <input type="date" value={item.date} onChange={(event) => setMeasurements((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, date: event.target.value } : entry))} />
              <input type="number" step="0.1" value={item.weight_kg} onChange={(event) => setMeasurements((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, weight_kg: Number(event.target.value) } : entry))} />
              <input type="number" step="0.1" value={item.waist_cm} onChange={(event) => setMeasurements((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, waist_cm: Number(event.target.value) } : entry))} />
              <input type="number" step="0.1" value={item.body_fat_percent} onChange={(event) => setMeasurements((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, body_fat_percent: Number(event.target.value) } : entry))} />
            </div>
          ))}
        </div>
        <button className="primary" type="button" onClick={() => void analyzeProgress()}>{uiText("Analyze Trend")}</button>
      </section>
      {progress && (
        <section className="wide">
          <Header code="TRACE" title="Trend Line Chart" right={renderLocale === "zh" ? `${progress.entries ?? measurements.length} 条记录` : `${progress.entries ?? measurements.length} records`} />
          <ProgressLineChart measurements={measurements} />
          <div className="trend-summary">
            <span>{uiText("Weight")} {formatDelta(progress.weight_change_kg ?? 0, "kg")}</span>
            <span>{uiText("Waist")} {formatDelta(progress.waist_change_cm ?? 0, "cm")}</span>
            <span>{uiText("Body Fat")} {formatDelta(progress.body_fat_change_percent ?? 0, "%")}</span>
          </div>
          <p className="big-copy">{trendMessage(progress.message)}</p>
        </section>
      )}
    </div>
  );
}

function ProgressLineChart({ measurements }: { measurements: Measurement[] }) {
  const sorted = [...measurements].sort((a, b) => a.date.localeCompare(b.date));
  const width = 620;
  const height = 260;
  const padding = 36;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  function pointsFor(values: number[]) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    return values.map((value, index) => {
      const x = padding + (sorted.length <= 1 ? innerWidth / 2 : (index / (sorted.length - 1)) * innerWidth);
      const y = padding + (1 - (value - min) / range) * innerHeight;
      return { x, y, value };
    });
  }

  const series = [
    { key: "weight", label: "Weight", unit: "kg", pattern: "solid line / circle", zhPattern: "实线 / 圆点", points: pointsFor(sorted.map((item) => item.weight_kg)) },
    { key: "waist", label: "Waist", unit: "cm", pattern: "long dash / square", zhPattern: "长虚线 / 方点", points: pointsFor(sorted.map((item) => item.waist_cm)) },
    { key: "fat", label: "Body Fat", unit: "%", pattern: "dotted line / triangle", zhPattern: "点线 / 三角点", points: pointsFor(sorted.map((item) => item.body_fat_percent)) },
  ];

  return (
    <div className="line-chart-card">
      <svg className="line-chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={uiText("Trend chart for weight, waist, and body-fat percentage")}>
        <path className="chart-grid" d={`M${padding} ${padding} H${width - padding} M${padding} ${height / 2} H${width - padding} M${padding} ${height - padding} H${width - padding}`} />
        {series.map((item) => (
          <g key={item.key} className={`chart-series ${item.key}`}>
            <polyline points={item.points.map((point) => `${point.x},${point.y}`).join(" ")} />
            {item.points.map((point, index) => (
              <ChartPoint key={`${item.key}-${sorted[index].date}`} type={item.key} x={point.x} y={point.y} />
            ))}
          </g>
        ))}
        {sorted.map((item, index) => {
          const x = padding + (sorted.length <= 1 ? innerWidth / 2 : (index / (sorted.length - 1)) * innerWidth);
          return <text key={item.date} className="chart-date" x={x} y={height - 8} textAnchor="middle">{item.date.slice(5)}</text>;
        })}
      </svg>
      <div className="line-chart-legend">
        {series.map((item) => {
          const first = item.points[0]?.value ?? 0;
          const last = item.points.at(-1)?.value ?? first;
          return <span key={item.key} className={item.key}><i />{uiText(item.label)} {last.toFixed(1)}{item.unit} ({formatDelta(last - first, item.unit)}) - {renderLocale === "zh" ? item.zhPattern : item.pattern}</span>;
        })}
      </div>
    </div>
  );
}

function ChartPoint({ type, x, y }: { type: string; x: number; y: number }) {
  if (type === "waist") return <rect x={x - 4.5} y={y - 4.5} width="9" height="9" />;
  if (type === "fat") return <path d={`M${x} ${y - 6} L${x + 6} ${y + 5} L${x - 6} ${y + 5} Z`} />;
  return <circle cx={x} cy={y} r="4.5" />;
}

function CommunityView({
  user,
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  authError,
  communityError,
  onAuthSubmit,
  onLogout,
  posts,
  postDraft,
  setPostDraft,
  postImage,
  setPostImage,
  onPostSubmit,
  onLike,
  commentDrafts,
  setCommentDrafts,
  onCommentSubmit,
  reload,
}: {
  user: User | null;
  authMode: "login" | "register";
  setAuthMode: Dispatch<SetStateAction<"login" | "register">>;
  authForm: { username: string; email: string; password: string };
  setAuthForm: Dispatch<SetStateAction<{ username: string; email: string; password: string }>>;
  authError: string;
  communityError: string;
  onAuthSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onLogout: () => void;
  posts: CommunityPost[];
  postDraft: { title: string; content: string };
  setPostDraft: Dispatch<SetStateAction<{ title: string; content: string }>>;
  postImage: File | null;
  setPostImage: Dispatch<SetStateAction<File | null>>;
  onPostSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onLike: (postId: number) => Promise<void>;
  commentDrafts: Record<number, string>;
  setCommentDrafts: Dispatch<SetStateAction<Record<number, string>>>;
  onCommentSubmit: (event: FormEvent<HTMLFormElement>, postId: number) => void;
  reload: () => void;
}) {
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);

  return (
    <div className="stack community-stack">
      <section className="wide community-auth">
        <Header code="ACCOUNT" title={user ? "Logged-In Account" : "Register / Log In"} right={user ? user.username : "Account required for posting"} />
        {user ? (
          <div className="account-row">
            <div>
              <strong>{user.username}</strong>
              <p>{uiText("You can now post, like, and comment. Training plans and AI coaching stay available as usual.")}</p>
            </div>
            <button className="ghost" type="button" onClick={onLogout}>{uiText("Log Out")}</button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={onAuthSubmit}>
            <div className="auth-tabs" role="tablist" aria-label={uiText("Account mode")}>
              <button type="button" className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>{uiText("Log In")}</button>
              <button type="button" className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>{uiText("Register")}</button>
            </div>
            <div className="body-grid">
              <Field label={authMode === "register" ? "Nickname" : "Nickname or Email"}>
                <input value={authForm.username} onChange={(event) => setAuthForm((current) => ({ ...current, username: event.target.value }))} placeholder={uiText("e.g. No-Shrug Shoulders")} />
              </Field>
              {authMode === "register" ? (
                <Field label="Email (optional)">
                  <input value={authForm.email} onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))} placeholder={uiText("For future account recovery")} />
                </Field>
              ) : null}
              <Field label="Password">
                <input type="password" value={authForm.password} onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))} placeholder={uiText("At least 6 characters")} />
              </Field>
            </div>
            {authError ? <p className="form-error">{cleanApiError(authError)}</p> : null}
            <button className="primary" type="submit">{uiText(authMode === "register" ? "Create Account & Log In" : "Log In to GymPath")}</button>
          </form>
        )}
      </section>

      <section className="wide community-publisher">
        <Header code="POST" title="Share a Training Update" right={user ? "Posting enabled" : "Log in to unlock"} />
        <form className="post-form" onSubmit={onPostSubmit}>
          <input value={postDraft.title} onChange={(event) => setPostDraft((current) => ({ ...current, title: event.target.value }))} placeholder={uiText("Title: What happened in today's chest session?")} disabled={!user} />
          <textarea value={postDraft.content} onChange={(event) => setPostDraft((current) => ({ ...current, content: event.target.value }))} placeholder={uiText("Write your training question, check-in note, meal plan, movement feeling, or something you want experienced lifters to answer.")} disabled={!user} />
          <label className="image-upload">
            <span>{uiText("Post image (optional)")}</span>
            <input
              key={postImage ? postImage.name : "empty-community-image"}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={!user}
              onChange={(event) => setPostImage(event.target.files?.[0] ?? null)}
            />
            <small>{postImage ? `${postImage.name} - ${Math.ceil(postImage.size / 1024)} KB` : uiText("Supports JPG / PNG / WebP / GIF, max 5MB per image")}</small>
          </label>
          {communityError ? <p className="form-error">{cleanApiError(communityError)}</p> : null}
          <div className="post-actions">
            <button className="ghost" type="button" onClick={reload}>{uiText("Refresh Feed")}</button>
            <button className="primary" type="submit" disabled={!user}>{uiText("Publish")}</button>
          </div>
        </form>
      </section>

      <section className="wide community-feed">
        <Header code="CLUB FEED" title="Community Feed" right={renderLocale === "zh" ? `${posts.length} 条帖子` : `${posts.length} posts`} />
        {posts.length === 0 ? (
          <Empty title="No posts yet" text="Create the first training update after logging in, so classmates or test users have a real interaction entry point." />
        ) : (
          posts.map((post) => (
            <article className="post-card" key={post.id}>
              <div className="post-head">
                <div>
                  <strong>{post.title}</strong>
                  <p>{post.author} - {formatCommunityTime(post.created_at)}</p>
                </div>
                <button className={post.viewer_liked ? "like-button active" : "like-button"} type="button" onClick={() => void onLike(post.id)} disabled={!user}>
                  {uiText(post.viewer_liked ? "Liked" : "Like")} - {post.like_count}
                </button>
              </div>
              <p className="post-content">{post.content}</p>
              {post.image_url ? (
                <button
                  className="post-image-button"
                  type="button"
                  onClick={() => setPreviewImage({ src: post.image_url ?? "", alt: `${post.title} image` })}
                  aria-label={uiText("Open full-size post image")}
                >
                  <img className="post-image" src={post.image_url} alt={`${post.title} image`} loading="lazy" />
                </button>
              ) : null}
              <div className="comment-list">
                {post.comments.map((comment) => (
                  <p key={comment.id}><strong>{comment.author}</strong> {comment.content}</p>
                ))}
              </div>
              <form className="comment-form" onSubmit={(event) => onCommentSubmit(event, post.id)}>
                <input value={commentDrafts[post.id] ?? ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} placeholder={uiText(user ? "Write a comment..." : "Log in to comment")} disabled={!user} />
                <button className="ghost" type="submit" disabled={!user}>{uiText("Comment")}</button>
              </form>
            </article>
          ))
        )}
      </section>
      {previewImage ? (
        <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={uiText("Full-size post image preview")} onClick={() => setPreviewImage(null)}>
          <button className="lightbox-close" type="button" onClick={() => setPreviewImage(null)} aria-label={uiText("Close full-size image")}>{uiText("Close")}</button>
          <img src={previewImage.src} alt={previewImage.alt} onClick={(event) => event.stopPropagation()} />
        </div>
      ) : null}
    </div>
  );
}

function AiCoachView({
  messages,
  input,
  setInput,
  loading,
  meta,
  onSubmit,
}: {
  messages: ChatMessage[];
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  loading: boolean;
  meta: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const examples = [
    "How should a beginner arrange one week of muscle-gain training?",
    "My front shoulder hurts during bench press. What can I substitute?",
    "How should I distribute carbs during a fat-loss phase?",
    "Can I train again if I am sore the next day?",
  ];

  return (
    <section className="wide ai-coach">
      <Header code="AI COACH" title="Fitness AI Q&A" right={loading ? "Thinking" : "DeepSeek / fallback"} />
      <div className="chat-shell">
        <div className="chat-log" aria-live="polite">
          {messages.map((message, index) => (
            <article className={message.role === "user" ? "chat-bubble user" : "chat-bubble assistant"} key={`${message.role}-${index}`}>
              <span>{uiText(message.role === "user" ? "You" : "GymPath AI")}</span>
              <p>{message.role === "assistant" ? uiText(message.content) : message.content}</p>
            </article>
          ))}
        </div>
        <div className="prompt-row">
          {examples.map((example) => (
            <button className="ghost" type="button" key={example} onClick={() => setInput(example)}>
              {uiText(example)}
            </button>
          ))}
        </div>
        <form className="chat-form" onSubmit={onSubmit}>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={uiText("Ask a fitness question, e.g. can I train chest today if my shoulder hurts?")}
            rows={4}
          />
          <button className="primary" type="submit" disabled={loading || !input.trim()}>
            {uiText(loading ? "Generating Answer" : "Send to AI Coach")}
          </button>
        </form>
        <p className="ai-meta">
          {meta ? uiText(meta) : uiText("Note: AI answers are for fitness education and training decisions only. They do not replace a doctor, physiotherapist, or in-person coach.")}
        </p>
      </div>
    </section>
  );
}

function KnowledgeView({ topic, card, load }: { topic: string; card: Knowledge | null; load: (topic: string) => Promise<void> }) {
  const topics = [
    ["spot_reduction", "Spot Reduction"],
    ["bmi_limits", "BMI Limits"],
    ["full_body_vs_split", "Beginner Splits"],
    ["pain_rules", "Pain Rules"],
    ["calorie_deficit", "Calorie Deficit"],
    ["protein_target", "Protein Target"],
    ["carb_cycle", "Carb Cycling"],
    ["progressive_overload", "Progressive Overload"],
    ["deload", "Deload"],
    ["soreness_vs_injury", "Soreness vs Injury"],
    ["warmup", "Warm-Up Logic"],
    ["restart_training", "Restart Training"],
    ["supplements", "Supplements"],
    ["photo_tracking", "Photo Tracking"],
  ];
  return (
    <section className="wide">
      <Header code="KNOWLEDGE" title="Beginner Knowledge Base" right="Remove wrong assumptions first" />
      <div className="topic-row">
        {topics.map(([value, label]) => (
          <button key={value} className={topic === value ? "ghost active" : "ghost"} type="button" onClick={() => void load(value)}>{uiText(label)}</button>
        ))}
      </div>
      {card && (
        <article className="knowledge-card">
          <p className="kicker">CARD</p>
          <h3>{knowledgeTitle(card.title)}</h3>
          <p>{knowledgeContent(card.content)}</p>
        </article>
      )}
    </section>
  );
}

function Header({ code, title, right }: { code: string; title: string; right: ReactNode }) {
  return (
    <div className="section-head">
      <div>
        <p className="kicker">{code}</p>
        <h2>{uiText(title)}</h2>
      </div>
      <span>{typeof right === "string" ? uiText(right) : right}</span>
    </div>
  );
}

function Metric({ label, value, suffix, note }: { label: string; value: string; suffix: string; note: string }) {
  return (
    <article className="metric">
      <span>{uiText(label)}</span>
      <strong>{value}<small>{suffix}</small></strong>
      <p>{uiText(note)}</p>
    </article>
  );
}

function Trend({ label, value, unit }: { label: string; value: number; unit: string }) {
  const width = Math.min(Math.abs(value) * 18 + 12, 100);
  return (
    <div className="trend">
      <div><span>{label}</span><strong>{value > 0 ? "+" : ""}{value.toFixed(1)}{unit}</strong></div>
      <span className="bar"><span style={{ width: `${width}%` }} /></span>
    </div>
  );
}

function formatDelta(value: number, unit: string) {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded.toFixed(1)}${unit}`;
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <section className="empty">
      <p className="kicker">EMPTY</p>
      <h2>{uiText(title)}</h2>
      <p>{uiText(text)}</p>
    </section>
  );
}

function labelOf<T extends string>(options: { value: T; label: string }[], value: T) {
  return options.find((item) => item.value === value)?.label ?? value;
}

function tx(map: Record<string, string>, value: string) {
  return renderLocale === "zh" ? map[value] ?? uiText(enText(value)) : enText(value);
}

function enText(value: string) {
  if (renderLocale === "zh") return zhText(value);
  const map: Record<string, string> = {
    "肩": "Shoulder",
    "肘": "Elbow",
    "腕": "Wrist",
    "髋": "Hip",
    "膝": "Knee",
    "踝": "Ankle",
    "腰背": "Low Back",
    "今日基准": "Baseline",
    "高碳日": "High-Carb Day",
    "中碳日": "Medium-Carb Day",
    "低碳日": "Low-Carb Day",
    "训练日": "Training Day",
    "休息日": "Rest Day",
    "生重": "Raw weight",
    "熟重": "Cooked weight",
    "干重": "Dry weight",
    "默认": "Default",
    "自定义": "Custom",
    "早餐": "Breakfast",
    "午餐": "Lunch",
    "晚餐": "Dinner",
    "加餐": "Snack",
    "训练前": "Pre-workout",
    "训练后": "Post-workout",
    "蛋白粉": "Protein Powder",
    "肌酸": "Creatine",
    "电解质饮料": "Electrolyte Drink",
    "摇摇杯": "Shaker Bottle",
    "训练手套": "Training Gloves",
    "补剂试用装": "Supplement Sample",
    "谭成义新手跟练": "Tan Chengyi Beginner Follow-Along",
    "谭成义+凯圣王三分化": "Tan + Kaisheng Three-Day Split",
    "橙子增肌计划": "Orange Hypertrophy Cycle",
    "小白A/B轮线性力量": "Beginner A/B Linear Strength",
    "老手线性5x5增力": "Advanced Linear 5x5 Strength",
    "全人群5x5三分化": "Universal 5x5 Split",
    "A轮：深蹲 + 卧推 + 硬拉": "Round A: Squat + Bench + Deadlift",
    "B轮：深蹲 + 实力推 + 硬拉": "Round B: Squat + Overhead Press + Deadlift",
    "卧推正常推进": "Bench Press Progression",
    "深蹲正常推进": "Squat Progression",
    "卧推轻训": "Bench Light Day",
    "硬拉正常推进 + 深蹲轻训": "Deadlift Progression + Squat Light Day",
    "主项补强日": "Main-Lift Assistance Day",
    "推日：卧推5x5": "Push Day: Bench 5x5",
    "拉日：罗马尼亚硬拉5x5": "Pull Day: Romanian Deadlift 5x5",
    "蹲日：深蹲5x5": "Squat Day: Squat 5x5",
    "恢复日": "Recovery Day",
    "第一阶段 第一天": "Phase 1 Day 1",
    "第一阶段 第二天": "Phase 1 Day 2",
    "第一阶段 第三天": "Phase 1 Day 3",
    "第一阶段 第五天": "Phase 1 Day 5",
    "第二阶段 第一天": "Phase 2 Day 1",
    "第二阶段 第二天": "Phase 2 Day 2",
    "第二阶段 第四天": "Phase 2 Day 4",
    "第二阶段 第五天": "Phase 2 Day 5",
    "第三阶段 第一天": "Phase 3 Day 1",
    "第三阶段 第二天": "Phase 3 Day 2",
    "第三阶段 第四天": "Phase 3 Day 4",
    "第三阶段 第五天": "Phase 3 Day 5",
    "胸": "Chest",
    "背部": "Back",
    "肩膀": "Shoulders",
    "胸+手臂": "Chest + Arms",
    "背部+肩后束": "Back + Rear Delts",
    "胸+肩中束": "Chest + Lateral Delts",
    "胸 + 肩 + 三头": "Chest + Shoulders + Triceps",
    "背 + 二头": "Back + Biceps",
    "下肢": "Lower Body",
    "肩 + 手臂": "Shoulders + Arms",
    "居家上肢": "Home Upper Body",
    "居家下肢 + 腹肌": "Home Lower Body + Abs",
    "胸 + 三角肌中束 + 三头肌": "Chest + Lateral Delts + Triceps",
    "背 + 三角肌后束 + 二头肌": "Back + Rear Delts + Biceps",
    "臀 + 股四头肌 + 腘绳肌": "Glutes + Quads + Hamstrings",
    "胸部": "Chest",
    "肩膀（注意控制）": "Shoulders (Controlled)",
    "胸+手臂（注意控制）": "Chest + Arms (Controlled)",
    "深蹲 + 罗马尼亚硬拉 + 核心": "Squat + Romanian Deadlift + Core",
    "腿部 + 核心": "Legs + Core",
    "燕麦片": "Oats",
    "鸡蛋": "Whole Egg",
    "蛋清": "Egg Whites",
    "脱脂牛奶": "Skim Milk",
    "全麦面包": "Whole-Wheat Bread",
    "香蕉": "Banana",
    "苹果": "Apple",
    "希腊酸奶": "Greek Yogurt",
    "乳清蛋白": "Whey Protein",
    "熟白米饭": "Cooked White Rice",
    "红薯": "Sweet Potato",
    "土豆": "Potato",
    "玉米": "Corn",
    "鸡胸肉": "Chicken Breast",
    "瘦牛肉": "Lean Beef",
    "三文鱼": "Salmon",
    "北豆腐": "Firm Tofu",
    "西兰花": "Broccoli",
    "混合蔬菜": "Mixed Vegetables",
    "橄榄油": "Olive Oil",
    "杏仁": "Almonds",
    "糙米饭": "Brown Rice",
    "意面": "Pasta",
    "全麦意面": "Whole-Wheat Pasta",
    "藜麦": "Quinoa",
    "荞麦面": "Soba Noodles",
    "南瓜": "Pumpkin",
    "火鸡胸": "Turkey Breast",
    "虾仁": "Shrimp",
    "鳕鱼": "Cod",
    "水浸金枪鱼": "Tuna in Water",
    "毛豆": "Edamame",
    "低脂茅屋奶酪": "Low-Fat Cottage Cheese",
    "蛋白棒": "Protein Bar",
    "菠菜": "Spinach",
    "花菜": "Cauliflower",
    "蘑菇": "Mushrooms",
    "番茄": "Tomato",
    "黄瓜": "Cucumber",
    "牛油果": "Avocado",
    "花生酱": "Peanut Butter",
    "核桃": "Walnuts",
    "50g 干重": "50g dry",
    "1 个": "1 item",
    "2 片": "2 slices",
    "1 个约180g": "1 medium item, about 180g",
    "150g 熟重": "150g cooked",
    "120g 熟重": "120g cooked",
    "200g 熟重": "200g cooked",
    "180g 熟重": "180g cooked",
    "1 根": "1 bar",
    "优先给蛋白和稳定碳水，避免早上只喝咖啡硬扛。": "Prioritize protein and stable carbs; do not run the morning on coffee alone.",
    "把主食、优质蛋白和蔬菜搭起来，训练日可把更多碳水放在午餐。": "Build the meal with carbs, quality protein, and vegetables. Training days can place more carbs at lunch.",
    "低碳日可以减少主食，保留蛋白和蔬菜。": "On low-carb days, reduce staple carbs while keeping protein and vegetables.",
    "用于补蛋白或训练前后补一点易消化碳水。": "Use this to add protein or easy carbs around training.",
    "减脂碳循环计划": "Fat-Loss Carb Cycle Plan",
    "基础饮食计划": "Baseline Nutrition Plan",
    "橙子碳水渐降减脂": "Orange Carb-Taper Cut",
    "增肌营养计划": "Muscle-Gain Nutrition Plan",
    "增力营养计划": "Strength Nutrition Plan",
    "标准 5/3/2": "Standard 5/3/2",
    "碳水敏感 4/4/2": "Carb-sensitive 4/4/2",
    "碳水:蛋白质:脂肪 = 5:2.5:2.5（供能比例）": "Carbs:Protein:Fat = 5:2.5:2.5 by calories",
    "放在腿、背或最累的训练日，保证训练表现。": "Use on leg, back, or hardest training days to protect performance.",
    "放在普通训练日或日常活动较多的日子。": "Use on normal training days or days with more daily activity.",
    "放在休息日或低强度活动日，控制总碳水。": "Use on rest days or low-intensity days to control total carbs.",
    "每餐蛋白控制在 20-40g，分 4-5 次吃，间隔 2-3 小时更容易执行。": "Keep each protein serving around 20-40g across 4-5 meals, spaced 2-3 hours apart.",
    "先把每日蛋白吃够，再按高碳/中碳/低碳日安排碳水和脂肪。": "Hit daily protein first, then distribute carbs and fats by high-, medium-, and low-carb days.",
    "高碳日优先匹配大肌群或高强度训练，低碳日优先匹配休息日。": "Match high-carb days to large-muscle or high-intensity sessions, and low-carb days to rest days.",
    "连续两周体重、腰围和训练状态都没有变化，再微调总量。": "Only adjust totals after two weeks with no change in weight, waist, or training state.",
    "把蛋白质分散到多餐，训练前后优先安排易消化碳水。": "Spread protein across meals and place easy-digesting carbs around training.",
    "增肌期保持小幅热量盈余，不要用乱吃替代稳定进步。": "Keep a small surplus during muscle gain; do not replace structured progress with random overeating.",
    "优先保证蛋白质、训练表现和睡眠，再微调碳水。": "Prioritize protein, training performance, and sleep before fine-tuning carbs.",
    "每月下降当前体重的 3%-5% 属于较合理区间；比例越高，吃得越少，时间越短，但体感越累。": "Losing 3%-5% of current body weight per month is a reasonable range. The higher the rate, the less you eat and the harder it feels.",
    "每天早起空腹记录体重；蛋白质尽量分到 4-5 餐，每餐 20-40g。": "Record fasted body weight every morning. Split protein into 4-5 meals with 20-40g per meal when possible.",
    "7 天后若相比上次记录达到每周目标，饮食不变；若未达到，再等 3 天；仍未达到时，每日碳水降低 15-30g。": "After 7 days, keep diet unchanged if the weekly loss target is reached. If not, wait 3 more days; if still stalled, reduce daily carbs by 15-30g.",
    "先用基础代谢加训练消耗估算一天基础热量消耗。": "Estimate daily expenditure from BMR plus training burn first.",
    "标准比例用碳水 50%、蛋白 30%、脂肪 20%；碳水敏感者改用碳水 40%、蛋白 40%、脂肪 20%。": "Standard ratio: 50% carbs, 30% protein, 20% fat. Carb-sensitive option: 40% carbs, 40% protein, 20% fat.",
    "每天早起空腹记录体重，用 7-10 天趋势决定是否减少碳水，不要只看单日波动。": "Use 7-10 days of fasted body-weight trend before reducing carbs; do not react to one-day fluctuations.",
    "训练日：基础代谢 + 生活消耗 + 训练消耗 + 约250 kcal 盈余。": "Training day: BMR + lifestyle burn + training burn + about 250 kcal surplus.",
    "休息日：基础代谢 + 生活消耗 - 约600 kcal，但不低于基础代谢。": "Rest day: BMR + lifestyle burn - about 600 kcal, but never below BMR.",
    "男性：66 + 13.7×体重kg + 5×身高cm - 6.8×年龄；女性：655 + 9.6×体重kg + 1.8×身高cm - 4.7×年龄。": "Male: 66 + 13.7x bodyweight kg + 5x height cm - 6.8x age. Female: 655 + 9.6x bodyweight kg + 1.8x height cm - 4.7x age.",
    "生活消耗加入基础代谢；轻体力约300-500 kcal，重体力约500-800 kcal。": "Lifestyle burn is added to BMR: light work about 300-500 kcal, heavy work about 500-800 kcal.",
    "蛋白质分餐摄入更利于消化吸收；训练后可以把每日约30%碳水放到训练后补糖原。": "Protein is easier to digest when split across meals; after training, place about 30% of daily carbs post-workout to replenish glycogen.",
    "不管增肌还是减脂，摄入热量不要低于基础代谢。": "Whether gaining or cutting, do not set intake below BMR.",
    "训练日保持约200-300 kcal 盈余，优先保证训练表现和恢复。": "Keep training days around a 200-300 kcal surplus to protect performance and recovery.",
    "休息日保持约500-700 kcal 缺口，但不要低于基础代谢。": "Keep rest days around a 500-700 kcal deficit, but not below BMR.",
    "三大营养素按供能比例综合计算：碳水50%，蛋白25%，脂肪25%。": "Calculate macros by calorie ratio: 50% carbs, 25% protein, 25% fat.",
    "训练前约3小时吃正餐；来不及时可在训练前15分钟补易消化碳水。": "Eat a regular meal about 3 hours before training; if rushed, add easy carbs about 15 minutes before.",
    "训练中掉多少体重，训练后尽量补回对应水分；尿液透明或柠檬色通常说明水分较充足。": "Replace roughly the body weight lost during training with fluids afterward. Clear or lemon-colored urine usually indicates decent hydration.",
    "每天尽量吃一斤生蔬菜或等量蔬菜，保证膳食纤维和微量营养素。": "Aim for about 500g raw vegetables or an equivalent cooked amount daily for fiber and micronutrients.",
    "用户自定义营养数据": "User-defined nutrition data",
  };
  return map[value] ?? (/[\u4e00-\u9fff]/.test(value) ? "GymPath guidance: keep execution simple, protect technique, manage fatigue, and adjust only after tracking real feedback." : value);
}

function canonicalVideoUrl(url: string) {
  const cleanUrl = url.trim();
  try {
    const parsed = new URL(cleanUrl);
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return cleanUrl.split("?")[0].split("#")[0].replace(/\/$/, "").toLowerCase();
  }
}

function selectDietTarget(diet: NonNullable<Nutrition["diet_plan"]>, selectedKey: string): MacroTotals & { key: string; label: string } {
  const selectedCycleDay = diet.cycle_days.find((day) => day.key === selectedKey) ?? diet.cycle_days[0];
  if (selectedCycleDay) {
    return {
      key: selectedCycleDay.key,
      label: selectedCycleDay.label,
      calories: selectedCycleDay.calories,
      carbs_g: selectedCycleDay.carbs_g,
      protein_g: selectedCycleDay.protein_g,
      fat_g: selectedCycleDay.fat_g,
    };
  }
  return {
    key: "baseline",
    label: "Baseline",
    calories: diet.baseline_daily.calories,
    carbs_g: diet.baseline_daily.carbs_g,
    protein_g: diet.baseline_daily.protein_g,
    fat_g: diet.baseline_daily.fat_g,
  };
}

function roundMacro(value: number) {
  return Math.round(value * 10) / 10;
}

function defaultMealSelection(food: FoodItem): MealFoodSelection {
  return {
    food_id: food.id,
    grams: food.default_grams,
    state: food.default_state,
  };
}

function defaultCustomFoodDraft(): CustomFoodDraft {
  return { name: "", grams: "", carbs: "", protein: "", fat: "" };
}

function isCustomFoodDraftValid(draft: CustomFoodDraft) {
  const grams = Number(draft.grams);
  const carbs = Number(draft.carbs);
  const protein = Number(draft.protein);
  const fat = Number(draft.fat);
  return (
    Boolean(draft.name.trim()) &&
    Boolean(draft.grams.trim()) &&
    Boolean(draft.carbs.trim()) &&
    Boolean(draft.protein.trim()) &&
    Boolean(draft.fat.trim()) &&
    grams > 0 &&
    carbs >= 0 &&
    protein >= 0 &&
    fat >= 0
  );
}

function buildCustomFood(mealKey: string, draft: CustomFoodDraft): FoodItem | null {
  if (!isCustomFoodDraftValid(draft)) return null;

  const grams = Number(draft.grams);
  const carbs = Number(draft.carbs);
  const protein = Number(draft.protein);
  const fat = Number(draft.fat);
  const caloriesPer100g = carbs * 4 + protein * 4 + fat * 9;
  const safeName = draft.name.trim().slice(0, 24);

  return {
    id: `custom_${mealKey}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    name: safeName,
    portion: `${grams}g custom`,
    calories: Math.round((caloriesPer100g * grams) / 100),
    carbs_g: roundMacro((carbs * grams) / 100),
    protein_g: roundMacro((protein * grams) / 100),
    fat_g: roundMacro((fat * grams) / 100),
    meal_tags: [mealKey],
    source_note: "User-defined nutrition data",
    default_grams: grams,
    default_state: "custom",
    states: [
      {
        key: "custom",
        label: "Custom",
        calories_per_100g: Math.round(caloriesPer100g),
        carbs_per_100g: carbs,
        protein_per_100g: protein,
        fat_per_100g: fat,
      },
    ],
  };
}

function sumFoodSelections(selections: MealFoodSelection[], foodById: Map<string, FoodItem>): MacroTotals {
  return selections.reduce(
    (total, selection) => {
      const food = foodById.get(selection.food_id);
      if (!food) return total;
      const item = macroForSelection(selection, food);
      return {
        calories: total.calories + item.calories,
        carbs_g: roundMacro(total.carbs_g + item.carbs_g),
        protein_g: roundMacro(total.protein_g + item.protein_g),
        fat_g: roundMacro(total.fat_g + item.fat_g),
      };
    },
    { calories: 0, carbs_g: 0, protein_g: 0, fat_g: 0 }
  );
}

function macroForSelection(selection: MealFoodSelection, food: FoodItem): MacroTotals {
  const state = food.states.find((item) => item.key === selection.state) ?? food.states.find((item) => item.key === food.default_state) ?? food.states[0];
  const grams = Math.max(0, Number(selection.grams) || 0);
  const multiplier = grams / 100;
  return {
    calories: Math.round(state.calories_per_100g * multiplier),
    carbs_g: roundMacro(state.carbs_per_100g * multiplier),
    protein_g: roundMacro(state.protein_per_100g * multiplier),
    fat_g: roundMacro(state.fat_per_100g * multiplier),
  };
}

function stateLabel(food: FoodItem, stateKey: string) {
  return food.states.find((item) => item.key === stateKey)?.label ?? food.states[0]?.label ?? "Default";
}

function stateCalories(food: FoodItem, stateKey: string) {
  const state = food.states.find((item) => item.key === stateKey) ?? food.states[0];
  return state ? Math.round(state.calories_per_100g) : food.calories;
}

function formatRest(seconds: number) {
  if (renderLocale === "zh") {
    if (seconds >= 60 && seconds % 60 === 0) return `${seconds / 60}+ 分钟`;
    if (seconds >= 120) return `${Math.floor(seconds / 60)} 分 ${seconds % 60} 秒+`;
    return "2+ 分钟";
  }
  if (seconds >= 60 && seconds % 60 === 0) return `${seconds / 60}+ min`;
  if (seconds >= 120) return `${Math.floor(seconds / 60)} min ${seconds % 60} sec+`;
  return "2+ min";
}

function sessionNote(note: string) {
  return enText(note);
}

function painCategory(category: PainResult["assessment"]["category"]) {
  const map = {
    stop: "Stop this movement today",
    modify_or_replace: "Reduce load or substitute",
    continue_with_cues: "Continue cautiously",
  };
  return uiText(map[category]);
}

function painAction(action: string) {
  if (action.includes("Stop")) return uiText("Stop this exercise today. If symptoms continue, consult a qualified professional.");
  if (action.includes("Reduce")) return uiText("Reduce load, shorten range of motion, slow the tempo, or switch to a more stable substitute.");
  return uiText("You may continue cautiously, but control the movement and re-check the setup.");
}

function nextFocusLabel(value: string) {
  const map: Record<string, string> = {
    keep_plan: "Keep the plan next time",
    restart_simpler: "Restart with a lower barrier",
    reduce_fatigue: "Reduce fatigue first",
    substitute_painful_movement: "Substitute the painful movement",
    stop_or_deload_and_substitute: "Stop the high-risk movement and deload",
    deload_and_substitute: "Deload and substitute",
    reduce_stress: "Lower stress and monitor",
  };
  return uiText(map[value] ?? value);
}

function decisionLevelLabel(value?: string) {
  const map: Record<string, string> = {
    normal: "Normal progression",
    lower_barrier: "Lower barrier",
    fatigue_high: "High fatigue",
    pain_modify: "Pain modification",
    watch: "Monitor",
    recovery_priority: "Recovery first",
    high_risk: "High risk",
  };
  return value ? uiText(map[value] ?? value) : uiText("Unclassified");
}

function painLocationLabel(value: string) {
  const map: Record<string, string> = {
    shoulder: "Shoulder",
    elbow: "Elbow",
    wrist: "Wrist",
    back: "Low back",
    hip: "Hip",
    knee: "Knee",
    ankle: "Ankle",
  };
  return uiText(map[value] ?? value);
}

function painTypeLabel(value: string) {
  const map: Record<string, string> = {
    burn: "Muscle burn",
    pinch: "Pinching",
    joint: "Joint discomfort",
    sharp: "Sharp pain",
    radiating: "Radiating pain",
    worsening: "Getting worse",
    numbness: "Numbness",
    electric: "Electric pain",
  };
  return uiText(map[value] ?? value);
}

function feedbackNote(note: string) {
  const map: Record<string, string> = {
    "Next session should be shorter and easier to complete.": "Next session should be shorter and easier to complete.",
    "Reduce total sets by about 25% for the next similar workout.": "Reduce total sets by about 25% for the next similar workout.",
    "Workout felt manageable. Consider a small load or rep increase next time.": "This workout felt manageable. Consider a small load or rep increase next time.",
    "Shorten accessory work to keep sessions realistic.": "Shorten accessory work to keep sessions realistic.",
    "Do not repeat the painful movement next session; substitute it and reduce workload.": "Do not repeat the painful movement next session; substitute it and reduce workload.",
    "Pain and fatigue are both high. Deload the next similar session and replace the painful movement.": "Pain and fatigue are both high. Deload the next similar session and replace the painful movement.",
    "Pain and fatigue are moderate. Keep the next session easier and avoid adding load.": "Pain and fatigue are moderate. Keep the next session easier and avoid adding load.",
    "Replace or modify the painful movement before repeating this session.": "Replace or modify the painful movement before repeating this session.",
    "Keep the plan unchanged and focus on consistent execution.": "Keep the plan unchanged and focus on consistent execution.",
  };
  return uiText(map[note] ?? note);
}

function trendMessage(message: string) {
  const parts = message.match(/[^.]+[.]/g) ?? [message];
  return parts.map((part) => enText(part.trim())).join(" ");
}

function formatCommunityTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(renderLocale === "zh" ? "zh-CN" : "en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function cleanApiError(message: string) {
  try {
    const parsed = JSON.parse(message);
    if (typeof parsed.detail === "string") return enText(parsed.detail);
    if (Array.isArray(parsed.detail) && parsed.detail[0]?.msg) return enText(parsed.detail[0].msg);
  } catch {
    // Keep the original text when the API did not return JSON.
  }
  return enText(message);
}

function knowledgeTitle(title: string) {
  return enText(title);
}

function knowledgeContent(content: string) {
  return enText(content);
}
