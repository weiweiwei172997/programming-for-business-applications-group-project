"use client";

import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";
import { getJson, postFormData, postJson, putJson } from "../lib/api";

type Level = "beginner" | "restarting" | "experienced";
type Goal = "muscle_gain" | "strength_gain" | "fat_loss" | "general_fitness" | "health";
type Gender = "male" | "female" | "other";
type Activity = "sedentary" | "light" | "moderate" | "active";
type View = "plan" | "nutrition" | "pain" | "feedback" | "progress" | "community" | "knowledge" | "coach";
type FatLossPlan = "kaisheng_carb_cycle" | "orange_carb_taper";
type StrengthPlan = "beginner_ab_linear" | "advanced_linear_5x5" | "universal_5x5_split";
type MuscleGainPlan = "tan_chengyi_beginner_follow" | "tan_kaisheng_three_split" | "orange_hypertrophy";
type CarbSensitivity = "standard" | "sensitive";
type DietTrainingIntensity = "auto" | "beginner_or_female" | "fitness_enthusiast" | "high_intensity";

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
  { value: "beginner", label: "新手", note: "四分化视频跟练" },
  { value: "restarting", label: "重启", note: "降低门槛，找回节奏" },
  { value: "experienced", label: "老炮", note: "分化训练，追求突破" },
];

const GOALS: { value: Goal; label: string; note: string }[] = [
  { value: "muscle_gain", label: "增肌", note: "容量与渐进" },
  { value: "strength_gain", label: "增力", note: "复合动作优先" },
  { value: "fat_loss", label: "减脂", note: "热量与坚持" },
  { value: "health", label: "健康", note: "低阻力开始" },
];

const FAT_LOSS_PLANS: { value: FatLossPlan; label: string; note: string }[] = [
  { value: "kaisheng_carb_cycle", label: "凯圣王碳循环减脂", note: "高碳2 / 中碳3 / 低碳2" },
  { value: "orange_carb_taper", label: "橙子碳水渐降减脂", note: "BMR + 训练消耗 + 卡点降碳" },
];

const STRENGTH_PLANS: { value: StrengthPlan; label: string; note: string }[] = [
  { value: "beginner_ab_linear", label: "小白A/B轮线性力量", note: "空杆起步 / 22法则 / 练一休一" },
  { value: "advanced_linear_5x5", label: "老手线性5x5增力", note: "70% 1RM低开 / 轻训 / 减载" },
  { value: "universal_5x5_split", label: "全人群5x5三分化", note: "推拉蹲 / 四周周期 / RPE控制" },
];

const MUSCLE_GAIN_PLANS: { value: MuscleGainPlan; label: string; note: string }[] = [
  { value: "tan_chengyi_beginner_follow", label: "谭成义新手跟练", note: "四次训练 / 视频顺序 / 新手启动" },
  { value: "tan_kaisheng_three_split", label: "谭成义+凯圣王三分化", note: "胸肩三头 / 背后束二头 / 臀腿" },
  { value: "orange_hypertrophy", label: "橙子增肌计划", note: "肌肥大 / 增肌增力 / 增力周期" },
];

const CARB_SENSITIVITY_OPTIONS: { value: CarbSensitivity; label: string; note: string }[] = [
  { value: "standard", label: "标准比例", note: "碳水50 / 蛋白30 / 脂肪20" },
  { value: "sensitive", label: "碳水敏感", note: "碳水40 / 蛋白40 / 脂肪20" },
];

const DIET_INTENSITY_OPTIONS: { value: DietTrainingIntensity; label: string; note: string }[] = [
  { value: "auto", label: "自动判断", note: "按水平和性别估算" },
  { value: "beginner_or_female", label: "新手 / 女生", note: "每分钟 5 kcal" },
  { value: "fitness_enthusiast", label: "健身爱好者", note: "每分钟 8 kcal" },
  { value: "high_intensity", label: "训练强度大", note: "每分钟 10 kcal" },
];

const VIEWS: { value: View; label: string; code: string }[] = [
  { value: "plan", label: "训练计划", code: "TRAIN" },
  { value: "nutrition", label: "饮食面板", code: "FUEL" },
  { value: "pain", label: "疼痛替换", code: "CHECK" },
  { value: "feedback", label: "练后反馈", code: "ADAPT" },
  { value: "progress", label: "围度趋势", code: "TRACE" },
  { value: "community", label: "社区交流", code: "CLUB" },
  { value: "knowledge", label: "认知扫盲", code: "LEARN" },
  { value: "coach", label: "AI问答", code: "AI" },
];

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

const ANATOMY_IMAGE_URL = "/anatomy-muscles-zh.jpg";
const ANATOMY_SOURCE_URL = "https://commons.wikimedia.org/wiki/File:1105_Anterior_and_Posterior_Views_of_Muscles_zh.jpg";

const PAIN_JOINTS = [
  { key: "shoulder", label: "肩", view: "front", x: 35.6, y: 10.2 },
  { key: "elbow", label: "肘", view: "front", x: 31.2, y: 17.5 },
  { key: "wrist", label: "腕", view: "front", x: 27.1, y: 23.5 },
  { key: "hip", label: "髋", view: "front", x: 46.1, y: 24.6 },
  { key: "knee", label: "膝", view: "front", x: 43.1, y: 33.5 },
  { key: "ankle", label: "踝", view: "front", x: 43.1, y: 41.4 },
  { key: "back", label: "腰背", view: "back", x: 49.4, y: 65.8 },
  { key: "shoulder", label: "肩", view: "back", x: 63.2, y: 60.6 },
  { key: "elbow", label: "肘", view: "back", x: 69.0, y: 66.1 },
  { key: "wrist", label: "腕", view: "back", x: 72.1, y: 72.3 },
  { key: "hip", label: "髋", view: "back", x: 51.2, y: 71.0 },
  { key: "knee", label: "膝", view: "back", x: 44.2, y: 82.5 },
  { key: "ankle", label: "踝", view: "back", x: 44.2, y: 92.3 },
];

export default function Home() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [view, setView] = useState<View>("plan");
  const [status, setStatus] = useState("系统待命");
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
  const [measurements, setMeasurements] = useState<Measurement[]>(measurementsSeed);
  const [progress, setProgress] = useState<ProgressResult | null>(null);
  const [knowledgeTopic, setKnowledgeTopic] = useState("spot_reduction");
  const [knowledge, setKnowledge] = useState<Knowledge | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "我是 GymPath AI 教练。你可以问我训练计划、动作替换、饮食、减脂、增肌、恢复和新手认知问题。" },
  ]);
  const [chatInput, setChatInput] = useState("卧推肩膀不舒服，今天还能练胸吗？");
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

  useEffect(() => {
    void generatePlan();
    void analyzeProgress();
    void loadKnowledge(knowledgeTopic);
    void refreshCheckinReward(checkins);
    // Initial dashboard hydration only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function patchProfile<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  async function generatePlan() {
    setLoading(true);
    setStatus("正在生成训练与饮食方案");
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
        diet_training_intensity: profile.diet_training_intensity,
      });
      setPlan(nextPlan);
      setNutrition(nextNutrition);
      setStatus("计划已更新，可以开始执行");
    } catch (error) {
      setStatus(error instanceof Error ? `API 连接失败：${error.message}` : "API 连接失败");
    } finally {
      setLoading(false);
    }
  }

  async function checkPain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await requestPainGuidance(pain);
  }

  async function requestPainGuidance(nextPain: PainInput) {
    setStatus("正在判断疼痛和替换动作");
    try {
      const result = await postJson<PainResult>("/api/pain", { ...nextPain, goal: profile.goal });
      setPainResult(result);
      setStatus("疼痛建议已生成");
    } catch (error) {
      setStatus(error instanceof Error ? `疼痛判断失败：${error.message}` : "疼痛判断失败");
    }
  }

  function selectPainLocation(location: string) {
    const nextPain = { ...pain, pain_location: location, pain_type: "joint", pain_level: Math.max(pain.pain_level, 4) };
    setPain(nextPain);
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
      setStatus(error instanceof Error ? `打卡奖励加载失败：${error.message}` : "打卡奖励加载失败");
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
      setStatus("账号数据已同步");
    } catch (error) {
      setStatus(error instanceof Error ? `账号数据同步失败：${error.message}` : "账号数据同步失败");
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
      setStatus(nextDates.length === checkins.length ? "今日已经完成打卡" : "今日打卡已记录");
    } catch (error) {
      setStatus(error instanceof Error ? `打卡保存失败：${error.message}` : "打卡保存失败");
    }
  }

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!plan) {
      setStatus("请先生成训练计划");
      return;
    }
    setStatus("正在根据练后反馈调整");
    try {
      const result = await postJson<FeedbackResult>("/api/feedback", { plan, ...feedback }, authToken);
      setFeedbackResult(result);
      if (feedback.completed) {
        await completeTodayCheckin();
      }
      setStatus("反馈调整已完成");
    } catch (error) {
      setStatus(error instanceof Error ? `反馈失败：${error.message}` : "反馈失败");
    }
  }

  async function analyzeProgress(nextMeasurements = measurements) {
    try {
      const result = await postJson<ProgressResult>("/api/progress", { measurements: nextMeasurements });
      setProgress(result);
    } catch (error) {
      setStatus(error instanceof Error ? `趋势分析失败：${error.message}` : "趋势分析失败");
    }
  }

  async function saveAndAnalyzeProgress() {
    try {
      const nextMeasurements = authToken
        ? (await putJson<MeasurementResponse>("/api/progress/measurements", { measurements }, authToken)).measurements
        : measurements;
      setMeasurements(nextMeasurements);
      await analyzeProgress(nextMeasurements);
      setStatus(authToken ? "围度趋势已保存到账号" : "游客趋势已在本页更新");
    } catch (error) {
      setStatus(error instanceof Error ? `围度保存失败：${error.message}` : "围度保存失败");
    }
  }

  async function loadKnowledge(topic: string) {
    setKnowledgeTopic(topic);
    try {
      const result = await getJson<Knowledge>(`/api/knowledge/${topic}`);
      setKnowledge(result);
    } catch (error) {
      setStatus(error instanceof Error ? `知识卡片加载失败：${error.message}` : "知识卡片加载失败");
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
    setStatus("AI教练正在思考");
    try {
      const result = await postJson<AiChatResponse>("/api/ai-chat", {
        messages: nextMessages,
        profile: {
          level: profile.level,
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
      setChatMeta(`${result.used_api ? "DeepSeek API" : "本地兜底"} / ${result.model}${result.warning ? ` / ${result.warning}` : ""}`);
      setStatus("AI教练已回复");
    } catch (error) {
      setChatMessages([...nextMessages, { role: "assistant", content: "AI问答暂时不可用。你可以先把目标、动作、疼痛位置、训练表现和饮食记录说清楚，我会继续帮你排查。" }]);
      setChatMeta(error instanceof Error ? error.message : "AI请求失败");
      setStatus("AI问答请求失败");
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
      setStatus(authMode === "register" ? "注册成功，已登录" : "登录成功");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "登录失败");
    }
  }

  function logout() {
    window.localStorage.removeItem("gympath_token");
    setAuthToken(null);
    setUser(null);
    setGuestMode(false);
    setStatus("已退出登录");
  }

  async function loadCommunity(token = authToken) {
    try {
      const result = await getJson<{ posts: CommunityPost[] }>("/api/community/posts", token);
      setCommunityPosts(result.posts);
    } catch (error) {
      setStatus(error instanceof Error ? `社区加载失败：${error.message}` : "社区加载失败");
    }
  }

  async function createCommunityPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCommunityError("");
    if (!authToken) {
      setCommunityError("请先登录再发帖");
      return;
    }
    if (postImage && postImage.size > 5 * 1024 * 1024) {
      setCommunityError("图片不能超过 5MB");
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
      setStatus("帖子已发布");
    } catch (error) {
      setCommunityError(error instanceof Error ? error.message : "发帖失败");
    }
  }

  async function likePost(postId: number) {
    setCommunityError("");
    if (!authToken) {
      setCommunityError("请先登录再点赞");
      return;
    }
    try {
      await postJson<{ post_id: number; liked: boolean; like_count: number }>(`/api/community/posts/${postId}/like`, {}, authToken);
      await loadCommunity(authToken);
    } catch (error) {
      setCommunityError(error instanceof Error ? error.message : "点赞失败");
    }
  }

  async function submitComment(event: FormEvent<HTMLFormElement>, postId: number) {
    event.preventDefault();
    setCommunityError("");
    if (!authToken) {
      setCommunityError("请先登录再评论");
      return;
    }
    const content = (commentDrafts[postId] ?? "").trim();
    if (!content) return;
    try {
      await postJson<CommunityComment>(`/api/community/posts/${postId}/comments`, { content }, authToken);
      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
      await loadCommunity(authToken);
    } catch (error) {
      setCommunityError(error instanceof Error ? error.message : "评论失败");
    }
  }

  const planExerciseNames = Array.from(
    new Set(plan?.weekly_schedule.flatMap((day) => day.exercises.map((exercise) => exercise.name)) ?? [])
  );
  const showSetup = view === "plan" || view === "nutrition";
  const targetWeightMax = Math.max(45, Math.round(profile.weight_kg - 1));
  const targetWeightValue = Math.min(profile.target_weight_kg, targetWeightMax);

  if (!authChecked) {
    return <AuthLoading />;
  }

  if (!user && !guestMode) {
    return (
      <AuthGate
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
      <aside className="rail">
        <div className="brand">
          <span>GP</span>
          <div>
            <strong>GYMPATH</strong>
            <small>TRAINING OS</small>
          </div>
        </div>

        <nav className="nav" aria-label="主导航">
          {VIEWS.map((item) => (
            <button
              key={item.value}
              className={view === item.value ? "nav-button active" : "nav-button"}
              type="button"
              onClick={() => setView(item.value)}
            >
              <span>{item.code}</span>
              {item.label}
            </button>
          ))}
        </nav>

      </aside>

      <section className="workspace">
        <header className="hero">
          <div>
            <p className="kicker">BLACK / WHITE / NATIVE UI</p>
            <h1>训练不该靠猜。</h1>
            <p>
              GymPath 把水平、目标、训练天数、热身、动作教学、饮食、疼痛替换和练后反馈压进一个清晰流程。
            </p>
          </div>
        </header>

        {showSetup ? (
        <section className="setup-grid">
          <Panel code="PROFILE" title="训练画像">
            <Segment label="训练水平" options={LEVELS} value={profile.level} onChange={(value) => patchProfile("level", value)} />
            <Segment label="目标" options={GOALS} value={profile.goal} onChange={(value) => patchProfile("goal", value)} />
            {profile.goal === "muscle_gain" ? (
              <div className="fat-loss-config">
                <Segment label="增肌计划" options={MUSCLE_GAIN_PLANS} value={profile.muscle_gain_plan} onChange={(value) => patchProfile("muscle_gain_plan", value)} />
              </div>
            ) : null}
            {profile.goal === "strength_gain" ? (
              <div className="fat-loss-config">
                <Segment label="增力计划" options={STRENGTH_PLANS} value={profile.strength_plan} onChange={(value) => patchProfile("strength_plan", value)} />
              </div>
            ) : null}
            {profile.goal === "fat_loss" ? (
              <div className="fat-loss-config">
                <Segment label="减脂饮食方案" options={FAT_LOSS_PLANS} value={profile.fat_loss_plan} onChange={(value) => patchProfile("fat_loss_plan", value)} />
                {profile.fat_loss_plan === "orange_carb_taper" ? (
                  <>
                    <Segment label="橙子方案比例" options={CARB_SENSITIVITY_OPTIONS} value={profile.carb_sensitivity} onChange={(value) => patchProfile("carb_sensitivity", value)} />
                    <Segment label="训练强度系数" options={DIET_INTENSITY_OPTIONS} value={profile.diet_training_intensity} onChange={(value) => patchProfile("diet_training_intensity", value)} />
                    <Field label={`目标体重 ${targetWeightValue} kg`}>
                      <input type="range" min="40" max={targetWeightMax} step="1" value={targetWeightValue} onChange={(event) => patchProfile("target_weight_kg", Number(event.target.value))} />
                    </Field>
                  </>
                ) : null}
              </div>
            ) : null}
            <Field label={`单次 ${profile.minutes_per_session} 分钟`}>
              <input type="range" min="20" max="120" step="5" value={profile.minutes_per_session} onChange={(event) => patchProfile("minutes_per_session", Number(event.target.value))} />
            </Field>
            <button className="primary" type="button" onClick={generatePlan} disabled={loading}>
              {loading ? "正在生成" : "生成黑白训练方案"}
            </button>
          </Panel>

          {showSetup ? (
            <Panel code="BODY" title="身体数据">
              <div className="body-grid">
                <Field label="体重 kg">
                  <input type="number" value={profile.weight_kg} onChange={(event) => patchProfile("weight_kg", Number(event.target.value))} />
                </Field>
                <Field label="身高 cm">
                  <input type="number" value={profile.height_cm} onChange={(event) => patchProfile("height_cm", Number(event.target.value))} />
                </Field>
                <Field label="年龄">
                  <input type="number" value={profile.age} onChange={(event) => patchProfile("age", Number(event.target.value))} />
                </Field>
                <Field label="性别">
                  <select value={profile.gender} onChange={(event) => patchProfile("gender", event.target.value as Gender)}>
                    <option value="male">男</option>
                    <option value="female">女</option>
                    <option value="other">其他 / 不指定</option>
                  </select>
                </Field>
                <Field label="日常活动">
                  <select value={profile.activity_level} onChange={(event) => patchProfile("activity_level", event.target.value as Activity)}>
                    <option value="sedentary">久坐</option>
                    <option value="light">轻度活动</option>
                    <option value="moderate">中等活动</option>
                    <option value="active">高活动量</option>
                  </select>
                </Field>
              </div>
            </Panel>
          ) : null}
        </section>
        ) : null}

        <section className="stage">
          {view === "plan" && <PlanView plan={plan} />}
          {view === "nutrition" && <NutritionView nutrition={nutrition} />}
          {view === "pain" && (
            <PainView pain={pain} setPain={setPain} result={painResult} onSubmit={checkPain} onJointSelect={selectPainLocation} exerciseNames={planExerciseNames} />
          )}
          {view === "feedback" && (
            <FeedbackView
              feedback={feedback}
              setFeedback={setFeedback}
              result={feedbackResult}
              onSubmit={submitFeedback}
              hasPlan={Boolean(plan)}
              checkins={checkins}
              reward={checkinReward}
              onCheckin={() => void completeTodayCheckin()}
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

function Panel({ code, title, children }: { code: string; title: string; children: ReactNode }) {
  return (
    <section className="panel">
      <p className="kicker">{code}</p>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function AuthLoading() {
  return (
    <main className="auth-gate">
      <section className="auth-panel">
        <p className="kicker">GYMPATH ACCOUNT</p>
        <h1>正在进入。</h1>
        <p>正在检查本地登录状态。</p>
      </section>
    </main>
  );
}

function AuthGate({
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  authError,
  onAuthSubmit,
  onGuest,
}: {
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
      <section className="auth-hero">
        <p className="kicker">GYMPATH / TRAINING OS</p>
        <h1>先进入你的训练账户。</h1>
        <p>注册后可以发帖、点赞、评论，并让 GymPath 从一次演示变成真正可多人使用的健身 Web App。</p>
      </section>
      <section className="auth-panel">
        <Header code="ACCOUNT" title={authMode === "register" ? "创建账户" : "登录账户"} right="MVP 本地账号" />
        <form className="auth-form" onSubmit={onAuthSubmit}>
          <div className="auth-tabs" role="tablist" aria-label="账户模式">
            <button type="button" className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>登录</button>
            <button type="button" className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>注册</button>
          </div>
          <Field label={authMode === "register" ? "昵称" : "昵称或邮箱"}>
            <input value={authForm.username} onChange={(event) => setAuthForm((current) => ({ ...current, username: event.target.value }))} placeholder="例如：练肩不耸肩" />
          </Field>
          {authMode === "register" ? (
            <Field label="邮箱（可选）">
              <input value={authForm.email} onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))} placeholder="用于以后找回账号" />
            </Field>
          ) : null}
          <Field label="密码">
            <input type="password" value={authForm.password} onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))} placeholder="至少 6 位" />
          </Field>
          {authError ? <p className="form-error">{cleanApiError(authError)}</p> : null}
          <button className="primary" type="submit">{authMode === "register" ? "创建账户并进入" : "登录并进入"}</button>
          <button className="ghost guest-entry" type="button" onClick={onGuest}>先游客浏览，社区互动稍后登录</button>
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
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <button key={option.value} type="button" className={value === option.value ? "tile active" : "tile"} onClick={() => onChange(option.value)}>
            <strong>{option.label}</strong>
            <span>{option.note}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function PlanView({ plan }: { plan: WorkoutPlan | null }) {
  if (!plan) return <Empty title="尚未生成计划" text="填写训练画像后点击生成，系统会返回训练日、热身、动作和教学入口。" />;

  return (
    <section className="wide">
      <Header code="WEEK PLAN" title={tx(SPLIT_CN, plan.split.split_name)} right={`${plan.days_per_week} 天 / ${plan.minutes_per_session} 分钟`} />
      {plan.muscle_gain_plan ? (
        <ProgramBriefView code="MUSCLE PLAN" plan={plan.muscle_gain_plan} />
      ) : plan.strength_plan ? (
        <ProgramBriefView code="STRENGTH PLAN" plan={plan.strength_plan} />
      ) : (
        <p className="soft">按当前目标生成训练日、热身、动作和反馈调整入口。</p>
      )}
      <div className="day-stack">
        {plan.weekly_schedule.map((day, index) => (
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
                <strong>恢复安排</strong>
                <p>{day.rest_note ?? "今天不安排正式训练，保证恢复。"}</p>
              </div>
            ) : (
              <>
                {day.rest_policy ? <p className="session-rest-policy">{day.rest_policy}</p> : null}
                <div className="day-actions">
                  {day.session_video_url ? (
                    <a href={day.session_video_url} target="_blank" rel="noreferrer">
                      本次训练视频
                    </a>
                  ) : null}
                  {day.warmup_video_url ? (
                    <a href={day.warmup_video_url} target="_blank" rel="noreferrer">
                      热身讲解视频
                    </a>
                  ) : null}
                </div>
                <details>
                  <summary>训练前热身 / 激活</summary>
                  <ul className="chip-row">
                    {day.warmup.map((item) => <li key={item}>{tx(WARMUP_CN, item)}</li>)}
                  </ul>
                </details>
                {day.learning_points?.length ? (
                  <div className="rule-list compact-rules">
                    {day.learning_points.map((point) => <p key={point}>{point}</p>)}
                  </div>
                ) : null}
                <div className="exercise-grid">
                  {day.exercises.map((exercise, exerciseIndex) => (
                    <article className="exercise" key={`${exercise.name}-${exerciseIndex}`}>
                      <header>
                        <span>{exercise.phase ?? exercise.target_muscle}</span>
                        <a href={exercise.teaching_url} target="_blank" rel="noreferrer">跟练视频</a>
                      </header>
                      <h4>{tx(EXERCISE_CN, exercise.name)}</h4>
                      <p>{exercise.sets} 组 / {exercise.reps} 次 / 组间休息 {formatRest(exercise.rest_seconds)}</p>
                    </article>
                  ))}
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function ProgramBriefView({ code, plan }: { code: string; plan: ProgramBrief }) {
  return (
    <section className="strength-brief">
      <div>
        <p className="kicker">{code}</p>
        <h3>{plan.title}</h3>
        <p>{plan.source_basis}</p>
        <p>{plan.audience}</p>
      </div>
      <div className="strength-grid">
        <article>
          <strong>底层逻辑</strong>
          {plan.logic_points.map((item) => <span key={item}>{item}</span>)}
        </article>
        <article>
          <strong>推进规则</strong>
          {plan.progression_rules.map((item) => <span key={item}>{item}</span>)}
        </article>
        {plan.stall_strategy?.length ? (
          <article>
            <strong>停滞处理</strong>
            {plan.stall_strategy.map((item) => <span key={item}>{item}</span>)}
          </article>
        ) : null}
        <article>
          <strong>风险提醒</strong>
          {plan.warnings.map((item) => <span key={item}>{item}</span>)}
        </article>
      </div>
    </section>
  );
}

function NutritionView({ nutrition }: { nutrition: Nutrition | null }) {
  const [foodLibrary, setFoodLibrary] = useState<FoodLibrary | null>(null);
  const [mealSelections, setMealSelections] = useState<Record<string, MealFoodSelection[]>>({});
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

  if (!nutrition) return <Empty title="等待身体数据" text="生成计划时会同时计算热量、蛋白质和 BMI 参考。" />;
  const diet = nutrition.diet_plan;
  const dietTarget = diet ? selectDietTarget(diet, selectedDietDay) : null;
  const proteinValue = diet ? String(diet.baseline_daily.protein_g) : `${nutrition.protein.min_grams}-${nutrition.protein.max_grams}`;
  const isPerformanceDiet = diet?.type === "performance_macros";
  const calorieNote = isPerformanceDiet
    ? `训练日 ${diet.training_day_calories} kcal / 休息日 ${diet.rest_day_calories} kcal`
    : `维持热量 ${nutrition.calories.maintenance_calories} kcal`;
  const proteinNote = isPerformanceDiet
    ? "按总热量25%供能 ÷ 4 kcal/g"
    : diet ? "按当前饮食计划计算" : "分到 3-5 餐更容易坚持";
  const dailyPrefix = isPerformanceDiet ? "训练日" : "每日";
  return (
    <div className="metric-grid">
      <Metric label="目标热量" value={String(nutrition.calories.target_calories)} suffix="kcal" note={calorieNote} />
      <Metric label="计划蛋白质" value={proteinValue} suffix="g" note={proteinNote} />
      <Metric label="BMI" value={String(nutrition.bmi)} suffix="" note="老炮只作粗略参考" />
      {diet ? (
        <>
          <Metric label={`${dailyPrefix}碳水目标`} value={String(diet.baseline_daily.carbs_g)} suffix="g" note={`每周 ${diet.weekly_totals.carbs_g}g`} />
          <Metric label={`${dailyPrefix}脂肪目标`} value={String(diet.baseline_daily.fat_g)} suffix="g" note={`每周 ${diet.weekly_totals.fat_g}g`} />
          <Metric label="单餐蛋白" value={diet.meal_timing.protein_per_meal_g} suffix="g" note={`${diet.meal_timing.meals_per_day} 餐 / 间隔 ${diet.meal_timing.meal_interval_hours} 小时`} />
        </>
      ) : null}
      {diet?.type === "performance_macros" ? (
        <section className="wide metric-span">
          <Header code="PERFORMANCE FUEL" title={diet.title} right={diet.macro_ratio?.label ?? "5:2.5:2.5"} />
          <div className="macro-cycle orange-cycle">
            <article className="macro-card">
              <header><span>BMR</span><strong>基础代谢</strong></header>
              <div className="macro-row"><span>公式结果</span><b>{diet.bmr} kcal</b></div>
              <p>{diet.bmr_formula}</p>
            </article>
            <article className="macro-card">
              <header><span>LIFE</span><strong>生活消耗</strong></header>
              <div className="macro-row"><span>估算值</span><b>{diet.life_burn} kcal</b></div>
              <p>{diet.life_burn_note}</p>
            </article>
            <article className="macro-card">
              <header><span>TRAIN</span><strong>训练消耗</strong></header>
              <div className="macro-row"><span>训练时长</span><b>{diet.training_burn?.minutes} 分钟</b></div>
              <div className="macro-row"><span>强度系数</span><b>{diet.training_burn?.intensity_factor}</b></div>
              <div className="macro-row"><span>估算消耗</span><b>{diet.training_burn?.calories} kcal</b></div>
              <p>{diet.training_burn?.label}</p>
            </article>
            <article className="macro-card">
              <header><span>TARGET</span><strong>热量策略</strong></header>
              <div className="macro-row"><span>训练日</span><b>{diet.training_day_calories} kcal</b></div>
              <div className="macro-row"><span>休息日</span><b>{diet.rest_day_calories} kcal</b></div>
              <div className="macro-row"><span>最低底线</span><b>{diet.calorie_floor} kcal</b></div>
              <p>训练日约 +250 kcal；休息日约 -600 kcal，但任何一天都不低于基础代谢。</p>
            </article>
          </div>
        </section>
      ) : null}
      {diet?.type === "fat_loss_carb_cycle" ? (
        <section className="wide metric-span">
          <Header code="CARB CYCLE" title="减脂碳循环" right="高碳 2 / 中碳 3 / 低碳 2" />
          <div className="macro-cycle">
            {diet.cycle_days.map((day) => (
              <article className="macro-card" key={day.key}>
                <header>
                  <span>{day.days_per_week} 天 / 周</span>
                  <strong>{day.label}</strong>
                </header>
                <div className="macro-row"><span>碳水</span><b>{day.carbs_g}g</b></div>
                <div className="macro-row"><span>蛋白</span><b>{day.protein_g}g</b></div>
                <div className="macro-row"><span>脂肪</span><b>{day.fat_g}g</b></div>
                <div className="macro-row"><span>热量</span><b>{day.calories} kcal</b></div>
                <p>{day.timing}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {diet?.type === "orange_carb_taper" ? (
        <section className="wide metric-span">
          <Header code="CARB TAPER" title="橙子碳水渐降减脂" right={diet.macro_ratio?.label ?? "BMR + 训练消耗"} />
          <div className="macro-cycle orange-cycle">
            <article className="macro-card">
              <header><span>BMR</span><strong>基础代谢</strong></header>
              <div className="macro-row"><span>公式结果</span><b>{diet.bmr} kcal</b></div>
              <p>男性：10x体重 + 6.25x身高 - 5x年龄 + 5；女性最后改为 -161。</p>
            </article>
            <article className="macro-card">
              <header><span>TRAIN</span><strong>训练消耗</strong></header>
              <div className="macro-row"><span>强度系数</span><b>{diet.training_burn?.intensity_factor}</b></div>
              <div className="macro-row"><span>本次时长</span><b>{diet.training_burn?.minutes} 分钟</b></div>
              <div className="macro-row"><span>估算消耗</span><b>{diet.training_burn?.calories} kcal</b></div>
              <p>{diet.training_burn?.label}</p>
            </article>
            <article className="macro-card">
              <header><span>TOTAL</span><strong>一天消耗</strong></header>
              <div className="macro-row"><span>基础热量</span><b>{diet.daily_expenditure} kcal</b></div>
              <div className="macro-row"><span>碳水</span><b>{diet.baseline_daily.carbs_g}g</b></div>
              <div className="macro-row"><span>蛋白</span><b>{diet.baseline_daily.protein_g}g</b></div>
              <div className="macro-row"><span>脂肪</span><b>{diet.baseline_daily.fat_g}g</b></div>
            </article>
            {diet.target_timeline ? (
              <article className="macro-card">
                <header><span>TARGET</span><strong>减脂目标</strong></header>
                <div className="macro-row"><span>目标体重</span><b>{diet.target_timeline.target_weight_kg}kg</b></div>
                <div className="macro-row"><span>目标下降</span><b>{diet.target_timeline.target_loss_kg}kg</b></div>
                <div className="macro-row"><span>3% 速度</span><b>{diet.target_timeline.conservative_months_3_percent} 月</b></div>
                <div className="macro-row"><span>5% 速度</span><b>{diet.target_timeline.aggressive_months_5_percent} 月</b></div>
                <p>{diet.target_timeline.note}</p>
              </article>
            ) : null}
          </div>
          {diet.adjustment_protocol ? (
            <div className="rule-list compact-rules">
              <p>{diet.adjustment_protocol.rule}</p>
              <p>按 3% 速度，当前每周目标约 {diet.adjustment_protocol.weekly_loss_target_kg}kg；卡住后每日碳水下调 {diet.adjustment_protocol.carb_cut_if_stalled_g}g。</p>
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
          mealSelections={mealSelections}
          setMealSelections={setMealSelections}
        />
      ) : null}
      <section className="wide metric-span">
        <Header code="FUEL RULE" title="饮食执行线" right="" />
        <div className="rule-list">
          {diet?.rules.map((rule) => <p key={rule}>{rule}</p>)}
          {diet ? <p>{diet.meal_timing.note}</p> : null}
          {!diet ? <p>先打满蛋白质，再看总热量。</p> : null}
          {!diet ? <p>增肌不等于乱吃，减脂不等于极端少吃。</p> : null}
          {!diet ? <p>连续两周体重和围度没有变化，再调整热量。</p> : null}
          <p>BMI 对肌肉量高的人不敏感，要结合围度、力量、照片和体脂趋势。</p>
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
  mealSelections,
  setMealSelections,
}: {
  diet: NonNullable<Nutrition["diet_plan"]>;
  target: MacroTotals & { key: string; label: string };
  setSelectedDietDay: Dispatch<SetStateAction<string>>;
  foodLibrary: FoodLibrary;
  mealSelections: Record<string, MealFoodSelection[]>;
  setMealSelections: Dispatch<SetStateAction<Record<string, MealFoodSelection[]>>>;
}) {
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
          label: "今日基准",
          calories: diet.baseline_daily.calories,
          carbs_g: diet.baseline_daily.carbs_g,
          protein_g: diet.baseline_daily.protein_g,
          fat_g: diet.baseline_daily.fat_g,
        },
      ];
  const foodById = new Map(foodLibrary.foods.map((food) => [food.id, food]));
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

  return (
    <section className="wide metric-span meal-planner">
      <Header
        code="MEAL LOG"
        title="饮食记录"
        right={
          <select value={target.key} onChange={(event) => setSelectedDietDay(event.target.value)}>
            {targetOptions.map((option) => (
              <option key={option.key} value={option.key}>{option.label}</option>
            ))}
          </select>
        }
      />
      <div className="meal-target">
        <MacroBadge label="今日目标" totals={target} />
        <MacroBadge label="已选合计" totals={dailyTotal} />
        <MacroBadge label="剩余额度" totals={remaining} />
      </div>
      <p className="meal-note">这些食物热量是按常见一份估算，包装食品以营养成分表为准。点选多个食物后，每餐顶部会实时汇总三大营养素和热量。</p>
      <div className="meal-stack">
        {foodLibrary.meals.map((meal) => {
          const selectedIds = mealSelections[meal.key] ?? [];
          const selectedFoodIdSet = new Set(selectedIds.map((item) => item.food_id));
          const availableFoods = foodLibrary.foods.filter((food) => food.meal_tags.includes(meal.key));
          return (
            <article className="meal-card" key={meal.key}>
              <header>
                <div>
                  <span>{meal.label}</span>
                  <strong>{mealTotals[meal.key]?.calories ?? 0} kcal</strong>
                </div>
                <div className="meal-macros">
                  <b>碳 {mealTotals[meal.key]?.carbs_g ?? 0}g</b>
                  <b>蛋 {mealTotals[meal.key]?.protein_g ?? 0}g</b>
                  <b>脂 {mealTotals[meal.key]?.fat_g ?? 0}g</b>
                </div>
              </header>
              <p>{meal.note}</p>
              <div className="food-choice-grid">
                {availableFoods.map((food) => (
                  <button
                    key={`${meal.key}-${food.id}`}
                    className={selectedFoodIdSet.has(food.id) ? "food-chip active" : "food-chip"}
                    type="button"
                    onClick={() => toggleFood(meal.key, food.id)}
                  >
                    <strong>{food.name}</strong>
                    <span>{food.default_grams}g · {stateLabel(food, food.default_state)}</span>
                    <small>每100g {stateCalories(food, food.default_state)} kcal · {food.states.length > 1 ? "可切换重量状态" : food.portion}</small>
                  </button>
                ))}
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
                          <strong>{food.name}</strong>
                          <span>{Math.round(itemTotals.calories)} kcal · 碳{itemTotals.carbs_g}g / 蛋{itemTotals.protein_g}g / 脂{itemTotals.fat_g}g</span>
                        </div>
                        <input
                          aria-label={`${food.name} 克数`}
                          type="number"
                          min="1"
                          step="1"
                          value={selection.grams}
                          onChange={(event) => updateFoodSelection(meal.key, food.id, { grams: Number(event.target.value) })}
                        />
                        <select value={selection.state} onChange={(event) => updateFoodSelection(meal.key, food.id, { state: event.target.value })}>
                          {food.states.map((state) => <option key={state.key} value={state.key}>{state.label}</option>)}
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
        <summary>营养数据来源</summary>
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
      <span>{label}</span>
      <strong>{Math.round(totals.calories)} kcal</strong>
      <p>碳 {roundMacro(totals.carbs_g)}g / 蛋 {roundMacro(totals.protein_g)}g / 脂 {roundMacro(totals.fat_g)}g</p>
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
}: {
  pain: PainInput;
  setPain: Dispatch<SetStateAction<PainInput>>;
  result: PainResult | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onJointSelect: (location: string) => void;
  exerciseNames: string[];
}) {
  const names = Array.from(new Set(["Barbell Bench Press", "Back Squat", "Deadlift", ...exerciseNames]));
  return (
    <div className="stack">
      <section className="pain-layout">
        <HumanPainMap selected={pain.pain_location} onSelect={onJointSelect} />
        <form className="wide form" onSubmit={onSubmit}>
          <Header code="PAIN CHECK" title="动作疼痛判断" right="非医疗诊断" />
          <div className="body-grid">
            <Field label="当前动作">
              <select value={pain.exercise_name} onChange={(event) => setPain((current) => ({ ...current, exercise_name: event.target.value }))}>
                {names.map((name) => <option key={name} value={name}>{tx(EXERCISE_CN, name)}</option>)}
              </select>
            </Field>
            <Field label="不适位置">
              <select value={pain.pain_location} onChange={(event) => setPain((current) => ({ ...current, pain_location: event.target.value }))}>
                <option value="shoulder">肩</option>
                <option value="elbow">肘</option>
                <option value="wrist">手腕</option>
                <option value="back">下背</option>
                <option value="hip">髋</option>
                <option value="knee">膝</option>
                <option value="ankle">踝</option>
              </select>
            </Field>
            <Field label="疼痛类型">
              <select value={pain.pain_type} onChange={(event) => setPain((current) => ({ ...current, pain_type: event.target.value }))}>
                <option value="burn">肌肉灼烧</option>
                <option value="pinch">夹挤感</option>
                <option value="joint">关节不适</option>
                <option value="sharp">尖锐痛</option>
                <option value="radiating">放射痛</option>
                <option value="worsening">越来越痛</option>
              </select>
            </Field>
            <Field label={`疼痛等级 ${pain.pain_level}/10`}>
              <input type="range" min="0" max="10" value={pain.pain_level} onChange={(event) => setPain((current) => ({ ...current, pain_level: Number(event.target.value) }))} />
            </Field>
          </div>
          <button className="primary" type="submit">判断能不能继续练</button>
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
                <strong>{result.joint_guidance.label}替代动作</strong>
                <div className="chip-row">
                  {result.joint_guidance.substitutions.map((item) => <span key={item}>{tx(EXERCISE_CN, item)}</span>)}
                </div>
              </article>
              <article>
                <strong>缓解方式</strong>
                <ul>{result.joint_guidance.relief_methods.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
              <article>
                <strong>康复训练</strong>
                <ul>{result.joint_guidance.rehab_drills.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
              <article>
                <strong>视频链接</strong>
                <div className="day-actions">
                  {result.joint_guidance.video_links.map((item) => <a key={item.url} href={item.url} target="_blank" rel="noreferrer">{item.label}</a>)}
                </div>
              </article>
              <p className="medical-note">{result.joint_guidance.medical_note}</p>
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
      <Header code="ANATOMY MAP" title="真实肌肉关节图" right="点击关节" />
      <div className="human-map anatomy-photo-board">
        <div className="anatomy-photo-frame">
          <img src={ANATOMY_IMAGE_URL} alt="人体肌肉前后视图" loading="lazy" />
          {PAIN_JOINTS.map((joint, index) => (
            <button
              key={`${joint.key}-${joint.view}-${index}`}
              className={selected === joint.key ? "joint-hotspot active" : "joint-hotspot"}
              type="button"
              style={{ left: `${joint.x}%`, top: `${joint.y}%` }}
              onClick={() => onSelect(joint.key)}
              aria-label={`选择${joint.label}疼痛`}
            >
              <span>{joint.label}</span>
            </button>
          ))}
        </div>
        <a className="image-source-link" href={ANATOMY_SOURCE_URL} target="_blank" rel="noreferrer">
          图片来源：Wikimedia Commons / OpenStax Anatomy and Physiology / CC BY 4.0
        </a>
      </div>
      <p className="map-help">点选疼痛关节后，系统会立刻给出替代动作、缓解方式、康复动作和视频入口。</p>
    </section>
  );
}

function FeedbackView({
  feedback,
  setFeedback,
  result,
  onSubmit,
  hasPlan,
  checkins,
  reward,
  onCheckin,
}: {
  feedback: FeedbackInput;
  setFeedback: Dispatch<SetStateAction<FeedbackInput>>;
  result: FeedbackResult | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  hasPlan: boolean;
  checkins: string[];
  reward: CheckinReward | null;
  onCheckin: () => void;
}) {
  return (
    <div className="stack">
      <form className="wide form" onSubmit={onSubmit}>
        <Header code="POST SESSION" title="练后反馈" right={hasPlan ? "已连接计划" : "先生成计划"} />
        <label className="check-row">
          <input type="checkbox" checked={feedback.completed} onChange={(event) => setFeedback((current) => ({ ...current, completed: event.target.checked }))} />
          今天是否完成训练
        </label>
        <div className="body-grid">
          <Field label={`疲劳 ${feedback.fatigue_level}/10`}>
            <input type="range" min="0" max="10" value={feedback.fatigue_level} onChange={(event) => setFeedback((current) => ({ ...current, fatigue_level: Number(event.target.value) }))} />
          </Field>
          <Field label={`疼痛 ${feedback.pain_level}/10`}>
            <input type="range" min="0" max="10" value={feedback.pain_level} onChange={(event) => setFeedback((current) => ({ ...current, pain_level: Number(event.target.value) }))} />
          </Field>
          <Field label="训练时长 min">
            <input type="number" value={feedback.duration_min} onChange={(event) => setFeedback((current) => ({ ...current, duration_min: Number(event.target.value) }))} />
          </Field>
        </div>
        <button className="primary" type="submit" disabled={!hasPlan}>轻量调整下次计划</button>
      </form>
      <section className="wide checkin-card">
        <Header
          code="CHECK-IN LOTTERY"
          title="7天打卡抽补剂"
          right={reward ? `连续 ${reward.streak}/7 天` : `${checkins.length} 条记录`}
        />
        <div className="checkin-meter">
          <div>
            <strong>{reward?.eligible ? "已获得抽奖资格" : "坚持到第7天解锁抽奖"}</strong>
            <p>{reward?.message ?? "完成训练后打卡，连续7天可参与蛋白粉、肌酸等健身补剂抽奖。"}</p>
          </div>
          <progress value={reward?.cycle_progress ?? 0} max={reward?.cycle_goal ?? 7} />
        </div>
        <div className="prize-grid">
          {(reward?.prizes ?? ["蛋白粉", "肌酸", "电解质饮料", "摇摇杯", "训练手套", "补剂试用装"]).map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <button className="ghost" type="button" onClick={onCheckin}>完成今日打卡</button>
      </section>
      {result && (
        <section className="wide">
          <Header
            code="ADAPT"
            title="下一次怎么调"
            right={`${Math.round(result.volume_multiplier * 100)}% 训练量 / 休息 ${formatRest(result.recommended_rest_seconds ?? 120)}`}
          />
          <div className="rule-list">{result.notes.map((note) => <p key={note}>{feedbackNote(note)}</p>)}</div>
        </section>
      )}
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
        <Header code="MEASUREMENTS" title="围度趋势" right={<button className="ghost" type="button" onClick={addMeasurement}>新增记录</button>} />
        <p className="soft">日期、体重、腰围和体脂率都可以直接自定义；折线图会按日期自动排序。</p>
        <div className="table">
          <div className="table-row progress-row head"><span>日期</span><span>体重</span><span>腰围</span><span>体脂率</span></div>
          {measurements.map((item, index) => (
            <div className="table-row progress-row" key={`${item.date}-${index}`}>
              <input type="date" value={item.date} onChange={(event) => setMeasurements((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, date: event.target.value } : entry))} />
              <input type="number" step="0.1" value={item.weight_kg} onChange={(event) => setMeasurements((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, weight_kg: Number(event.target.value) } : entry))} />
              <input type="number" step="0.1" value={item.waist_cm} onChange={(event) => setMeasurements((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, waist_cm: Number(event.target.value) } : entry))} />
              <input type="number" step="0.1" value={item.body_fat_percent} onChange={(event) => setMeasurements((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, body_fat_percent: Number(event.target.value) } : entry))} />
            </div>
          ))}
        </div>
        <button className="primary" type="button" onClick={() => void analyzeProgress()}>重新分析趋势</button>
      </section>
      {progress && (
        <section className="wide">
          <Header code="TRACE" title="趋势折线图" right={`${progress.entries ?? measurements.length} 条记录`} />
          <ProgressLineChart measurements={measurements} />
          <div className="trend-summary">
            <span>体重 {formatDelta(progress.weight_change_kg ?? 0, "kg")}</span>
            <span>腰围 {formatDelta(progress.waist_change_cm ?? 0, "cm")}</span>
            <span>体脂率 {formatDelta(progress.body_fat_change_percent ?? 0, "%")}</span>
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
    { key: "weight", label: "体重", unit: "kg", pattern: "实线 / 圆点", points: pointsFor(sorted.map((item) => item.weight_kg)) },
    { key: "waist", label: "腰围", unit: "cm", pattern: "长虚线 / 方点", points: pointsFor(sorted.map((item) => item.waist_cm)) },
    { key: "fat", label: "体脂率", unit: "%", pattern: "点线 / 三角点", points: pointsFor(sorted.map((item) => item.body_fat_percent)) },
  ];

  return (
    <div className="line-chart-card">
      <svg className="line-chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="体重、腰围、体脂率趋势折线图">
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
          return <span key={item.key} className={item.key}><i />{item.label} {last.toFixed(1)}{item.unit}（{formatDelta(last - first, item.unit)}） · {item.pattern}</span>;
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
        <Header code="ACCOUNT" title={user ? "已登录账户" : "注册 / 登录"} right={user ? user.username : "社区发帖需要账户"} />
        {user ? (
          <div className="account-row">
            <div>
              <strong>{user.username}</strong>
              <p>现在可以发帖、点赞和评论。训练计划和 AI 问答仍可继续正常使用。</p>
            </div>
            <button className="ghost" type="button" onClick={onLogout}>退出登录</button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={onAuthSubmit}>
            <div className="auth-tabs" role="tablist" aria-label="账户模式">
              <button type="button" className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>登录</button>
              <button type="button" className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>注册</button>
            </div>
            <div className="body-grid">
              <Field label={authMode === "register" ? "昵称" : "昵称或邮箱"}>
                <input value={authForm.username} onChange={(event) => setAuthForm((current) => ({ ...current, username: event.target.value }))} placeholder="例如：练肩不耸肩" />
              </Field>
              {authMode === "register" ? (
                <Field label="邮箱（可选）">
                  <input value={authForm.email} onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))} placeholder="用于以后找回账号" />
                </Field>
              ) : null}
              <Field label="密码">
                <input type="password" value={authForm.password} onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))} placeholder="至少 6 位" />
              </Field>
            </div>
            {authError ? <p className="form-error">{cleanApiError(authError)}</p> : null}
            <button className="primary" type="submit">{authMode === "register" ? "创建账户并登录" : "登录 GymPath"}</button>
          </form>
        )}
      </section>

      <section className="wide community-publisher">
        <Header code="POST" title="发布训练动态" right={user ? "可发布" : "登录后开放"} />
        <form className="post-form" onSubmit={onPostSubmit}>
          <input value={postDraft.title} onChange={(event) => setPostDraft((current) => ({ ...current, title: event.target.value }))} placeholder="标题：今天练胸有什么问题？" disabled={!user} />
          <textarea value={postDraft.content} onChange={(event) => setPostDraft((current) => ({ ...current, content: event.target.value }))} placeholder="写下训练问题、打卡记录、饮食安排、动作感受或想问老手的事。" disabled={!user} />
          <label className="image-upload">
            <span>帖子配图（可选）</span>
            <input
              key={postImage ? postImage.name : "empty-community-image"}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={!user}
              onChange={(event) => setPostImage(event.target.files?.[0] ?? null)}
            />
            <small>{postImage ? `${postImage.name} · ${Math.ceil(postImage.size / 1024)} KB` : "支持 JPG / PNG / WebP / GIF，单张最多 5MB"}</small>
          </label>
          {communityError ? <p className="form-error">{cleanApiError(communityError)}</p> : null}
          <div className="post-actions">
            <button className="ghost" type="button" onClick={reload}>刷新社区</button>
            <button className="primary" type="submit" disabled={!user}>发布</button>
          </div>
        </form>
      </section>

      <section className="wide community-feed">
        <Header code="CLUB FEED" title="社区交流" right={`${posts.length} 条帖子`} />
        {posts.length === 0 ? (
          <Empty title="社区还没有帖子" text="注册后发布第一条训练动态，给同学或测试用户一个可以互动的入口。" />
        ) : (
          posts.map((post) => (
            <article className="post-card" key={post.id}>
              <div className="post-head">
                <div>
                  <strong>{post.title}</strong>
                  <p>{post.author} · {formatCommunityTime(post.created_at)}</p>
                </div>
                <button className={post.viewer_liked ? "like-button active" : "like-button"} type="button" onClick={() => void onLike(post.id)} disabled={!user}>
                  {post.viewer_liked ? "已赞" : "点赞"} · {post.like_count}
                </button>
              </div>
              <p className="post-content">{post.content}</p>
              {post.image_url ? (
                <button
                  className="post-image-button"
                  type="button"
                  onClick={() => setPreviewImage({ src: post.image_url ?? "", alt: `${post.title} 配图` })}
                  aria-label="点开查看帖子大图"
                >
                  <img className="post-image" src={post.image_url} alt={`${post.title} 配图`} loading="lazy" />
                </button>
              ) : null}
              <div className="comment-list">
                {post.comments.map((comment) => (
                  <p key={comment.id}><strong>{comment.author}</strong> {comment.content}</p>
                ))}
              </div>
              <form className="comment-form" onSubmit={(event) => onCommentSubmit(event, post.id)}>
                <input value={commentDrafts[post.id] ?? ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} placeholder={user ? "写评论..." : "登录后评论"} disabled={!user} />
                <button className="ghost" type="submit" disabled={!user}>评论</button>
              </form>
            </article>
          ))
        )}
      </section>
      {previewImage ? (
        <div className="image-lightbox" role="dialog" aria-modal="true" aria-label="帖子大图预览" onClick={() => setPreviewImage(null)}>
          <button className="lightbox-close" type="button" onClick={() => setPreviewImage(null)} aria-label="关闭大图">关闭</button>
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
    "新手增肌一周怎么安排？",
    "卧推肩前侧疼，可以替换什么动作？",
    "减脂期碳水应该怎么分配？",
    "练完第二天酸痛还能继续练吗？",
  ];

  return (
    <section className="wide ai-coach">
      <Header code="AI COACH" title="健身AI问答" right={loading ? "思考中" : "DeepSeek / fallback"} />
      <div className="chat-shell">
        <div className="chat-log" aria-live="polite">
          {messages.map((message, index) => (
            <article className={message.role === "user" ? "chat-bubble user" : "chat-bubble assistant"} key={`${message.role}-${index}`}>
              <span>{message.role === "user" ? "你" : "GymPath AI"}</span>
              <p>{message.content}</p>
            </article>
          ))}
        </div>
        <div className="prompt-row">
          {examples.map((example) => (
            <button className="ghost" type="button" key={example} onClick={() => setInput(example)}>
              {example}
            </button>
          ))}
        </div>
        <form className="chat-form" onSubmit={onSubmit}>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="输入你的健身问题，例如：今天肩疼还能不能练胸？"
            rows={4}
          />
          <button className="primary" type="submit" disabled={loading || !input.trim()}>
            {loading ? "正在生成回答" : "发送给AI教练"}
          </button>
        </form>
        <p className="ai-meta">
          {meta || "提示：AI回答用于健身教育和训练决策参考，不替代医生、康复师或线下教练诊断。"}
        </p>
      </div>
    </section>
  );
}

function KnowledgeView({ topic, card, load }: { topic: string; card: Knowledge | null; load: (topic: string) => Promise<void> }) {
  const topics = [
    ["spot_reduction", "局部减脂"],
    ["bmi_limits", "BMI 局限"],
    ["full_body_vs_split", "新手分化"],
    ["pain_rules", "疼痛规则"],
    ["calorie_deficit", "热量缺口"],
    ["protein_target", "蛋白目标"],
    ["carb_cycle", "碳循环"],
    ["progressive_overload", "渐进超负荷"],
    ["deload", "减载恢复"],
    ["soreness_vs_injury", "酸痛与受伤"],
    ["warmup", "热身逻辑"],
    ["restart_training", "停练重启"],
    ["supplements", "补剂认知"],
    ["photo_tracking", "照片围度"],
  ];
  return (
    <section className="wide">
      <Header code="KNOWLEDGE" title="新手认知扫盲" right="先破除错误问题" />
      <div className="topic-row">
        {topics.map(([value, label]) => (
          <button key={value} className={topic === value ? "ghost active" : "ghost"} type="button" onClick={() => void load(value)}>{label}</button>
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
        <h2>{title}</h2>
      </div>
      <span>{right}</span>
    </div>
  );
}

function Metric({ label, value, suffix, note }: { label: string; value: string; suffix: string; note: string }) {
  return (
    <article className="metric">
      <span>{label}</span>
      <strong>{value}<small>{suffix}</small></strong>
      <p>{note}</p>
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
      <h2>{title}</h2>
      <p>{text}</p>
    </section>
  );
}

function labelOf<T extends string>(options: { value: T; label: string }[], value: T) {
  return options.find((item) => item.value === value)?.label ?? value;
}

function tx(map: Record<string, string>, value: string) {
  return map[value] ?? value;
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
    label: "今日基准",
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
  return food.states.find((item) => item.key === stateKey)?.label ?? food.states[0]?.label ?? "默认";
}

function stateCalories(food: FoodItem, stateKey: string) {
  const state = food.states.find((item) => item.key === stateKey) ?? food.states[0];
  return state ? Math.round(state.calories_per_100g) : food.calories;
}

function formatRest(seconds: number) {
  if (seconds >= 60 && seconds % 60 === 0) return `${seconds / 60} 分钟以上`;
  if (seconds >= 120) return `${Math.floor(seconds / 60)} 分钟 ${seconds % 60} 秒以上`;
  return "2 分钟以上";
}

function sessionNote(note: string) {
  const map: Record<string, string> = {
    "Beginner four-day split: chest, shoulders, and triceps. Learn the video sequence before adding load.": "新手四分化：胸、肩、三头。先跟视频学顺序，再逐步加重量。",
    "Beginner four-day split: back and biceps. Start by feeling the lats before heavy pulling.": "新手四分化：背、二头。先找到背阔肌发力，再追求重量。",
    "Beginner four-day split: lower body. Keep balance and joint control ahead of load.": "新手四分化：下肢。先保证平衡和关节控制，再加负重。",
    "Recovery day: no hard training.": "恢复日：不安排高强度训练，给身体恢复窗口。",
    "Beginner four-day split: shoulders and arms. Keep shoulder positions stable and avoid swinging.": "新手四分化：肩和手臂。肩位保持稳定，避免借力乱甩。",
    "Short session: prioritize the first three exercises and keep execution focused.": "时间短时优先完成前三个动作，保持执行专注。",
    "Technique first. Stop sets with 1-3 reps in reserve.": "技术优先，大多数动作保留 1-3 次余力。",
    "Put compound lifts first and keep reps powerful.": "复合动作优先，保证每次发力质量。",
    "Use steady progression and adjust if fatigue or pain rises.": "稳定渐进。如果疲劳或疼痛升高，及时调整。",
  };
  return map[note] ?? note;
}

function painCategory(category: PainResult["assessment"]["category"]) {
  return {
    stop: "今天停止该动作",
    modify_or_replace: "降重或替换动作",
    continue_with_cues: "可谨慎继续",
  }[category];
}

function painAction(action: string) {
  if (action.includes("Stop")) return "今天停止这个动作。如果症状持续，建议找合格专业人士处理。";
  if (action.includes("Reduce")) return "先降重量、缩短幅度、放慢节奏，或换成更稳定的替代动作。";
  return "可以谨慎继续，但必须控制动作，并重新检查起始姿态。";
}

function feedbackNote(note: string) {
  const map: Record<string, string> = {
    "Next session should be shorter and easier to complete.": "下次训练应该更短、更容易完成。",
    "Reduce total sets by about 25% for the next similar workout.": "下次同类训练总组数减少约 25%。",
    "Workout felt manageable. Consider a small load or rep increase next time.": "这次训练可控，下次可以小幅加重量或加次数。",
    "Shorten accessory work to keep sessions realistic.": "减少辅助动作，让训练时长更现实。",
    "Replace or modify the painful movement before repeating this session.": "再次训练前先替换或修改疼痛动作。",
    "Keep the plan unchanged and focus on consistent execution.": "计划保持不变，重点是持续执行。",
  };
  return map[note] ?? note;
}

function trendMessage(message: string) {
  const parts = message.match(/[^.]+[.]/g) ?? [message];
  const map: Record<string, string> = {
    "Add at least two measurement entries to see a trend.": "至少添加两条记录才能看到趋势。",
    "Body weight is trending up.": "体重正在上升。",
    "Body weight is trending down.": "体重正在下降。",
    "Body weight is stable.": "体重基本稳定。",
    "Waist measurement is decreasing.": "腰围正在下降。",
    "Waist measurement is increasing.": "腰围正在上升。",
    "Waist measurement is stable.": "腰围基本稳定。",
    "Body-fat estimate is trending down.": "体脂率估算正在下降。",
    "Body-fat estimate is trending up.": "体脂率估算正在上升。",
    "Body-fat estimate is stable.": "体脂率估算基本稳定。",
  };
  return parts.map((part) => map[part.trim()] ?? part.trim()).join(" ");
}

function formatCommunityTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function cleanApiError(message: string) {
  try {
    const parsed = JSON.parse(message);
    if (typeof parsed.detail === "string") return parsed.detail;
    if (Array.isArray(parsed.detail) && parsed.detail[0]?.msg) return parsed.detail[0].msg;
  } catch {
    // Keep the original text when the API did not return JSON.
  }
  return message;
}

function knowledgeTitle(title: string) {
  const map: Record<string, string> = {
    "Can I lose fat from only one body part?": "能不能只瘦一个部位？",
    "BMI is only a rough reference": "BMI 只是粗略参考",
    "Beginners usually do not need complex splits": "新手通常不需要复杂分化",
    "Beginners can use simple split plans": "新手可以使用简单分化",
    "Pain is not the same as effort": "疼痛不等于努力",
  };
  return map[title] ?? title;
}

function knowledgeContent(content: string) {
  if (content.includes("Fat loss is systemic")) return "不能。减脂是全身性的。你可以训练某块肌肉让它变大，但局部脂肪减少主要取决于整体热量平衡。";
  if (content.includes("BMI can be misleading")) return "肌肉量高的人 BMI 可能失真，要结合围度、照片、力量表现、恢复情况和体脂估计一起看。";
  if (content.includes("beginner split")) return "新手分化应该简单、固定、可重复。先学会训练顺序和动作感受，再逐步增加重量和训练量。";
  if (content.includes("Sharp")) return "肌肉灼烧和努力感可以正常，但尖锐、加重、放射或严重疼痛是停止信号。";
  return content;
}
