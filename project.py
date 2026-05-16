"""Core business logic for GymPath.

This module intentionally keeps recommendation logic separate from the
Streamlit UI so the course-required functions can be tested with pytest.
"""

from __future__ import annotations

import os
from datetime import date, datetime, timedelta
from typing import Any


VALID_GOALS = {
    "muscle_gain",
    "strength_gain",
    "fat_loss",
    "general_fitness",
    "health",
}

CHECKIN_REWARD_PRIZES = [
    "蛋白粉",
    "肌酸",
    "电解质饮料",
    "摇摇杯",
    "训练手套",
    "补剂试用装",
]

PREFERRED_VIDEO_CREATORS = [
    "凯圣王",
    "谭成义",
    "王正浩",
    "心平气和的张老师",
    "挖掘机",
    "努力的橙子",
    "gandy",
    "李诚明",
    "粗人",
    "陈石",
]

DIRECT_TEACHING_VIDEOS = {
    "Goblet Squat": {
        "title": "哑铃高脚杯深蹲保姆级教程 练臀练腿",
        "creator": "成都摸高教练王洪林",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1964y1V7Q6/",
    },
    "Dumbbell Bench Press": {
        "title": "健身动作教程｜哑铃卧推｜练胸推荐！",
        "creator": "ALEX健身频道",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1LM411z7sS/",
    },
    "Lat Pulldown": {
        "title": "谭成义的对握高位下拉",
        "creator": "谭成义",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV13TZRBJEat/",
    },
    "Romanian Deadlift": {
        "title": "透视学动作：罗马尼亚硬拉详解",
        "creator": "凯圣王",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1qF6wBaEWu/",
    },
    "Seated Cable Row": {
        "title": "女生练背｜坐姿划船｜高位下拉",
        "creator": "凯圣王",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1gy4y1o72X/",
    },
    "Leg Press": {
        "title": "腿举？应该这样做！",
        "creator": "一个热爱健身的上班族",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1bV4y1H7N1/",
    },
    "Machine Chest Press": {
        "title": "悍马机坐姿推胸保姆教学",
        "creator": "波CZB",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1AUiRYxEPp/",
    },
    "Dumbbell Shoulder Press": {
        "title": "坐姿哑铃推肩详解",
        "creator": "凯圣王",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1uw411N7MC/",
    },
    "Cable Triceps Pressdown": {
        "title": "肱三头肌绳索下压保姆级教程",
        "creator": "ALEX健身频道",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1fjMyzZEt5/",
    },
    "Dumbbell Curl": {
        "title": "哑铃弯举这么做更有效",
        "creator": "ALEX健身频道",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1anmCYNEbK/",
    },
    "Back Squat": {
        "title": "新手增肌系列：小体重深蹲干货",
        "creator": "凯圣王",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1BD4y1B7Z9/",
    },
    "Barbell Bench Press": {
        "title": "透视学动作：卧推详解",
        "creator": "凯圣王",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1ZHzMBmEtj/",
    },
    "Deadlift": {
        "title": "从零基础到做好一个硬拉",
        "creator": "凯圣王",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1fu4y1w7en/",
    },
    "Pull-up": {
        "title": "新手4步从0到1解锁引体向上",
        "creator": "风一野",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1RX8bzeEjp/",
    },
    "Incline Dumbbell Press": {
        "title": "上斜哑铃卧推保姆级教程",
        "creator": "ALEX健身频道",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1Dg4y1d75K/",
    },
    "Lateral Raise": {
        "title": "侧平举，如何避免斜方肌借力",
        "creator": "一个热爱健身的上班族",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV15e4deGEtu/",
    },
    "Walking Lunge": {
        "title": "箭步蹲正确示范",
        "creator": "ALEX健身频道",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1rd4y1p7Zi/",
    },
    "Plank": {
        "title": "平板支撑详解",
        "creator": "凯圣王",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV14w411V7Yj/",
    },
    "Push-up": {
        "title": "标准俯卧撑教学",
        "creator": "小波健身",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1Ui4y1b7Xk/",
    },
    "Bodyweight Squat": {
        "title": "新手入门系列｜徒手深蹲",
        "creator": "倪华香Yoki",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1AS4y1o7Lp/",
    },
}

BEGINNER_SESSION_VIDEOS = {
    "Beginner Chest Shoulders Triceps": {
        "title": "新手四分化训练 1：胸 + 肩 + 三头",
        "creator": "用户指定训练视频",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1S8ArzREru/",
    },
    "Beginner Back Biceps": {
        "title": "新手四分化训练 2：背 + 二头",
        "creator": "用户指定训练视频",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1mwPMzZEg8/",
    },
    "Beginner Lower Body": {
        "title": "新手四分化训练 3：下肢",
        "creator": "用户指定训练视频",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV13nPFzCENK/",
    },
    "Beginner Shoulders Arms": {
        "title": "新手四分化训练 4：肩 + 手臂",
        "creator": "用户指定训练视频",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV192Nwz4E9n/",
    },
}

HEALTH_HOME_SESSION_VIDEOS = {
    "Home Upper Body": {
        "title": "居家上肢训练",
        "creator": "用户指定训练视频",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1L2cazNELf/",
    },
    "Home Lower Body": {
        "title": "居家下肢与腹肌训练",
        "creator": "用户指定训练视频",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1LbcWzyE64/",
    },
}

WARMUP_TEACHING_VIDEOS = {
    "Beginner Chest Shoulders Triceps": {
        "title": "新手必看胸部训练教学：热身 + 激活 + 递增组",
        "creator": "小林爱健体",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1ja4y1a7BN/",
    },
    "Beginner Back Biceps": {
        "title": "背部训练前不会热身？练背前热身动作讲解",
        "creator": "EP健身",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1Ra4y1A76E/",
    },
    "Beginner Lower Body": {
        "title": "4分钟下肢动态热身",
        "creator": "刘教练体能康复",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1Gm41117EZ/",
    },
    "Beginner Shoulders Arms": {
        "title": "肩部训练前热身动作：强化肩膀灵活性与稳定性",
        "creator": "古德体育",
        "platform": "Bilibili",
        "url": "https://www.bilibili.com/video/BV1sM4m1Q7i9/",
    },
}

FAT_LOSS_FOOD_LIBRARY: dict[str, dict[str, Any]] = {
    "oats_50g": {
        "name": "燕麦片",
        "portion": "50g 干重",
        "calories": 195,
        "carbs_g": 33.0,
        "protein_g": 5.0,
        "fat_g": 3.5,
        "meal_tags": ["breakfast", "snack"],
        "source_note": "USDA-derived oats data scaled from 100g.",
    },
    "egg_1": {
        "name": "鸡蛋",
        "portion": "1 个",
        "calories": 72,
        "carbs_g": 0.4,
        "protein_g": 6.3,
        "fat_g": 4.8,
        "meal_tags": ["breakfast", "snack"],
        "source_note": "USDA-derived whole egg average.",
    },
    "egg_white_100g": {
        "name": "蛋清",
        "portion": "100g",
        "calories": 52,
        "carbs_g": 0.7,
        "protein_g": 11.0,
        "fat_g": 0.2,
        "meal_tags": ["breakfast", "snack"],
        "source_note": "USDA-derived egg white average.",
    },
    "skim_milk_250ml": {
        "name": "脱脂牛奶",
        "portion": "250ml",
        "calories": 85,
        "carbs_g": 12.0,
        "protein_g": 8.5,
        "fat_g": 0.3,
        "meal_tags": ["breakfast", "snack"],
        "source_note": "Common label average.",
    },
    "whole_wheat_bread_2": {
        "name": "全麦面包",
        "portion": "2 片",
        "calories": 160,
        "carbs_g": 28.0,
        "protein_g": 8.0,
        "fat_g": 2.0,
        "meal_tags": ["breakfast", "snack"],
        "source_note": "Common label average.",
    },
    "banana_100g": {
        "name": "香蕉",
        "portion": "100g",
        "calories": 89,
        "carbs_g": 23.0,
        "protein_g": 1.1,
        "fat_g": 0.3,
        "meal_tags": ["breakfast", "snack"],
        "source_note": "USDA-derived banana data.",
    },
    "apple_180g": {
        "name": "苹果",
        "portion": "1 个约180g",
        "calories": 95,
        "carbs_g": 25.0,
        "protein_g": 0.5,
        "fat_g": 0.3,
        "meal_tags": ["snack"],
        "source_note": "USDA-derived apple data scaled to one medium apple.",
    },
    "greek_yogurt_170g": {
        "name": "希腊酸奶",
        "portion": "170g",
        "calories": 100,
        "carbs_g": 6.0,
        "protein_g": 17.0,
        "fat_g": 0.7,
        "meal_tags": ["breakfast", "snack"],
        "source_note": "Common nonfat Greek yogurt label average.",
    },
    "whey_30g": {
        "name": "乳清蛋白",
        "portion": "30g",
        "calories": 120,
        "carbs_g": 3.0,
        "protein_g": 24.0,
        "fat_g": 2.0,
        "meal_tags": ["snack"],
        "source_note": "Common whey label average.",
    },
    "rice_150g": {
        "name": "熟白米饭",
        "portion": "150g",
        "calories": 195,
        "carbs_g": 42.9,
        "protein_g": 3.6,
        "fat_g": 0.3,
        "meal_tags": ["lunch", "dinner"],
        "source_note": "USDA-derived cooked white rice data scaled from 100g.",
    },
    "sweet_potato_200g": {
        "name": "红薯",
        "portion": "200g",
        "calories": 180,
        "carbs_g": 41.0,
        "protein_g": 4.0,
        "fat_g": 0.2,
        "meal_tags": ["lunch", "dinner"],
        "source_note": "USDA-derived sweet potato average.",
    },
    "potato_200g": {
        "name": "土豆",
        "portion": "200g",
        "calories": 174,
        "carbs_g": 40.0,
        "protein_g": 4.0,
        "fat_g": 0.2,
        "meal_tags": ["lunch", "dinner"],
        "source_note": "USDA-derived boiled potato average.",
    },
    "corn_150g": {
        "name": "玉米",
        "portion": "150g",
        "calories": 144,
        "carbs_g": 31.0,
        "protein_g": 5.0,
        "fat_g": 2.0,
        "meal_tags": ["lunch", "dinner"],
        "source_note": "USDA-derived sweet corn average.",
    },
    "chicken_breast_150g": {
        "name": "鸡胸肉",
        "portion": "150g 熟重",
        "calories": 248,
        "carbs_g": 0.0,
        "protein_g": 46.5,
        "fat_g": 5.4,
        "meal_tags": ["lunch", "dinner"],
        "source_note": "USDA cooked chicken breast data scaled from 100g.",
    },
    "lean_beef_150g": {
        "name": "瘦牛肉",
        "portion": "150g 熟重",
        "calories": 300,
        "carbs_g": 0.0,
        "protein_g": 39.0,
        "fat_g": 15.0,
        "meal_tags": ["lunch", "dinner"],
        "source_note": "USDA-derived lean cooked beef average.",
    },
    "salmon_120g": {
        "name": "三文鱼",
        "portion": "120g 熟重",
        "calories": 247,
        "carbs_g": 0.0,
        "protein_g": 26.0,
        "fat_g": 14.0,
        "meal_tags": ["lunch", "dinner"],
        "source_note": "USDA-derived cooked salmon average.",
    },
    "firm_tofu_150g": {
        "name": "北豆腐",
        "portion": "150g",
        "calories": 216,
        "carbs_g": 4.0,
        "protein_g": 25.0,
        "fat_g": 13.0,
        "meal_tags": ["lunch", "dinner"],
        "source_note": "USDA-derived firm tofu average.",
    },
    "broccoli_200g": {
        "name": "西兰花",
        "portion": "200g 熟重",
        "calories": 70,
        "carbs_g": 14.0,
        "protein_g": 5.0,
        "fat_g": 0.8,
        "meal_tags": ["lunch", "dinner"],
        "source_note": "USDA-derived cooked broccoli data scaled from 100g.",
    },
    "mixed_veg_200g": {
        "name": "混合蔬菜",
        "portion": "200g",
        "calories": 80,
        "carbs_g": 16.0,
        "protein_g": 4.0,
        "fat_g": 0.5,
        "meal_tags": ["lunch", "dinner"],
        "source_note": "Common mixed vegetable estimate.",
    },
    "olive_oil_10g": {
        "name": "橄榄油",
        "portion": "10g",
        "calories": 88,
        "carbs_g": 0.0,
        "protein_g": 0.0,
        "fat_g": 10.0,
        "meal_tags": ["lunch", "dinner"],
        "source_note": "Fat provides about 9 kcal per gram.",
    },
    "almonds_15g": {
        "name": "杏仁",
        "portion": "15g",
        "calories": 87,
        "carbs_g": 3.0,
        "protein_g": 3.0,
        "fat_g": 7.5,
        "meal_tags": ["snack"],
        "source_note": "USDA-derived almond data scaled from 100g.",
    },
}

FAT_LOSS_FOOD_LIBRARY.update(
    {
        "brown_rice_150g": {
            "name": "糙米饭",
            "portion": "150g 熟重",
            "calories": 168,
            "carbs_g": 34.5,
            "protein_g": 3.9,
            "fat_g": 1.4,
            "meal_tags": ["lunch", "dinner"],
            "source_note": "USDA-derived cooked brown rice data.",
        },
        "pasta_180g": {
            "name": "意面",
            "portion": "180g 熟重",
            "calories": 236,
            "carbs_g": 45.0,
            "protein_g": 9.4,
            "fat_g": 2.0,
            "meal_tags": ["lunch", "dinner"],
            "source_note": "USDA-derived cooked pasta data.",
        },
        "whole_wheat_pasta_180g": {
            "name": "全麦意面",
            "portion": "180g 熟重",
            "calories": 223,
            "carbs_g": 47.0,
            "protein_g": 9.5,
            "fat_g": 1.4,
            "meal_tags": ["lunch", "dinner"],
            "source_note": "USDA-derived cooked whole wheat pasta data.",
        },
        "quinoa_150g": {
            "name": "藜麦",
            "portion": "150g 熟重",
            "calories": 180,
            "carbs_g": 32.0,
            "protein_g": 6.6,
            "fat_g": 2.9,
            "meal_tags": ["lunch", "dinner"],
            "source_note": "USDA-derived cooked quinoa data.",
        },
        "buckwheat_noodles_180g": {
            "name": "荞麦面",
            "portion": "180g 熟重",
            "calories": 178,
            "carbs_g": 38.5,
            "protein_g": 9.0,
            "fat_g": 0.2,
            "meal_tags": ["lunch", "dinner"],
            "source_note": "USDA-derived cooked soba estimate.",
        },
        "pumpkin_200g": {
            "name": "南瓜",
            "portion": "200g 熟重",
            "calories": 52,
            "carbs_g": 13.0,
            "protein_g": 2.0,
            "fat_g": 0.2,
            "meal_tags": ["lunch", "dinner"],
            "source_note": "USDA-derived pumpkin data.",
        },
        "turkey_breast_150g": {
            "name": "火鸡胸",
            "portion": "150g 熟重",
            "calories": 203,
            "carbs_g": 0.0,
            "protein_g": 43.5,
            "fat_g": 2.4,
            "meal_tags": ["lunch", "dinner"],
            "source_note": "USDA-derived cooked turkey breast data.",
        },
        "shrimp_150g": {
            "name": "虾仁",
            "portion": "150g 熟重",
            "calories": 149,
            "carbs_g": 0.3,
            "protein_g": 36.0,
            "fat_g": 0.5,
            "meal_tags": ["lunch", "dinner"],
            "source_note": "USDA-derived cooked shrimp data.",
        },
        "cod_150g": {
            "name": "鳕鱼",
            "portion": "150g 熟重",
            "calories": 158,
            "carbs_g": 0.0,
            "protein_g": 34.5,
            "fat_g": 1.5,
            "meal_tags": ["lunch", "dinner"],
            "source_note": "USDA-derived cooked cod data.",
        },
        "tuna_water_100g": {
            "name": "水浸金枪鱼",
            "portion": "100g",
            "calories": 116,
            "carbs_g": 0.0,
            "protein_g": 25.5,
            "fat_g": 0.8,
            "meal_tags": ["lunch", "dinner", "snack"],
            "source_note": "USDA-derived canned tuna in water data.",
        },
        "edamame_150g": {
            "name": "毛豆",
            "portion": "150g 熟重",
            "calories": 182,
            "carbs_g": 13.5,
            "protein_g": 16.5,
            "fat_g": 7.8,
            "meal_tags": ["lunch", "dinner", "snack"],
            "source_note": "USDA-derived cooked edamame data.",
        },
        "cottage_cheese_150g": {
            "name": "低脂茅屋奶酪",
            "portion": "150g",
            "calories": 108,
            "carbs_g": 5.1,
            "protein_g": 18.0,
            "fat_g": 1.5,
            "meal_tags": ["breakfast", "snack"],
            "source_note": "USDA-derived low-fat cottage cheese data.",
        },
        "protein_bar": {
            "name": "蛋白棒",
            "portion": "1 根",
            "calories": 200,
            "carbs_g": 20.0,
            "protein_g": 20.0,
            "fat_g": 7.0,
            "meal_tags": ["snack"],
            "source_note": "Common label average; check package label first.",
        },
        "spinach_200g": {
            "name": "菠菜",
            "portion": "200g 熟重",
            "calories": 46,
            "carbs_g": 7.2,
            "protein_g": 5.8,
            "fat_g": 0.8,
            "meal_tags": ["lunch", "dinner"],
            "source_note": "USDA-derived cooked spinach data.",
        },
        "cauliflower_200g": {
            "name": "花菜",
            "portion": "200g 熟重",
            "calories": 46,
            "carbs_g": 8.2,
            "protein_g": 3.8,
            "fat_g": 0.6,
            "meal_tags": ["lunch", "dinner"],
            "source_note": "USDA-derived cauliflower data.",
        },
        "mushroom_200g": {
            "name": "蘑菇",
            "portion": "200g",
            "calories": 44,
            "carbs_g": 6.6,
            "protein_g": 6.2,
            "fat_g": 0.6,
            "meal_tags": ["lunch", "dinner"],
            "source_note": "USDA-derived mushroom data.",
        },
        "tomato_200g": {
            "name": "番茄",
            "portion": "200g",
            "calories": 36,
            "carbs_g": 7.8,
            "protein_g": 1.8,
            "fat_g": 0.4,
            "meal_tags": ["breakfast", "lunch", "dinner"],
            "source_note": "USDA-derived tomato data.",
        },
        "cucumber_200g": {
            "name": "黄瓜",
            "portion": "200g",
            "calories": 30,
            "carbs_g": 7.2,
            "protein_g": 1.4,
            "fat_g": 0.2,
            "meal_tags": ["lunch", "dinner", "snack"],
            "source_note": "USDA-derived cucumber data.",
        },
        "avocado_100g": {
            "name": "牛油果",
            "portion": "100g",
            "calories": 160,
            "carbs_g": 8.5,
            "protein_g": 2.0,
            "fat_g": 14.7,
            "meal_tags": ["breakfast", "lunch", "dinner"],
            "source_note": "USDA-derived avocado data.",
        },
        "peanut_butter_16g": {
            "name": "花生酱",
            "portion": "16g",
            "calories": 94,
            "carbs_g": 3.2,
            "protein_g": 4.0,
            "fat_g": 8.0,
            "meal_tags": ["breakfast", "snack"],
            "source_note": "USDA-derived peanut butter data.",
        },
        "walnuts_15g": {
            "name": "核桃",
            "portion": "15g",
            "calories": 98,
            "carbs_g": 2.1,
            "protein_g": 2.3,
            "fat_g": 9.8,
            "meal_tags": ["snack"],
            "source_note": "USDA-derived walnut data.",
        },
    }
)

FOOD_STATE_CONFIG: dict[str, dict[str, Any]] = {
    "oats_50g": {
        "default_grams": 50,
        "default_state": "dry",
        "states": {
            "dry": ("干重", 390, 66.0, 10.0, 7.0),
            "cooked": ("熟重", 71, 12.0, 2.5, 1.5),
        },
    },
    "rice_150g": {
        "default_grams": 150,
        "default_state": "cooked",
        "states": {
            "cooked": ("熟重", 130, 28.6, 2.4, 0.2),
            "dry": ("干重", 370, 81.7, 6.8, 0.6),
        },
    },
    "brown_rice_150g": {
        "default_grams": 150,
        "default_state": "cooked",
        "states": {
            "cooked": ("熟重", 112, 23.0, 2.6, 0.9),
            "dry": ("干重", 370, 77.0, 7.5, 2.7),
        },
    },
    "pasta_180g": {
        "default_grams": 180,
        "default_state": "cooked",
        "states": {
            "cooked": ("熟重", 131, 25.0, 5.2, 1.1),
            "dry": ("干重", 371, 74.7, 13.0, 1.5),
        },
    },
    "whole_wheat_pasta_180g": {
        "default_grams": 180,
        "default_state": "cooked",
        "states": {
            "cooked": ("熟重", 124, 26.0, 5.3, 0.8),
            "dry": ("干重", 348, 75.0, 14.6, 2.0),
        },
    },
    "quinoa_150g": {
        "default_grams": 150,
        "default_state": "cooked",
        "states": {
            "cooked": ("熟重", 120, 21.3, 4.4, 1.9),
            "dry": ("干重", 368, 64.2, 14.1, 6.1),
        },
    },
    "buckwheat_noodles_180g": {
        "default_grams": 180,
        "default_state": "cooked",
        "states": {
            "cooked": ("熟重", 99, 21.4, 5.0, 0.1),
            "dry": ("干重", 336, 70.0, 14.4, 0.7),
        },
    },
    "chicken_breast_150g": {
        "default_grams": 150,
        "default_state": "cooked",
        "states": {
            "cooked": ("熟重", 165, 0.0, 31.0, 3.6),
            "raw": ("生重", 120, 0.0, 23.0, 2.6),
        },
    },
    "turkey_breast_150g": {
        "default_grams": 150,
        "default_state": "cooked",
        "states": {
            "cooked": ("熟重", 135, 0.0, 29.0, 1.6),
            "raw": ("生重", 114, 0.0, 24.0, 1.2),
        },
    },
    "lean_beef_150g": {
        "default_grams": 150,
        "default_state": "cooked",
        "states": {
            "cooked": ("熟重", 200, 0.0, 26.0, 10.0),
            "raw": ("生重", 170, 0.0, 21.0, 9.0),
        },
    },
    "salmon_120g": {
        "default_grams": 120,
        "default_state": "cooked",
        "states": {
            "cooked": ("熟重", 206, 0.0, 21.6, 11.7),
            "raw": ("生重", 208, 0.0, 20.4, 13.4),
        },
    },
    "shrimp_150g": {
        "default_grams": 150,
        "default_state": "cooked",
        "states": {
            "cooked": ("熟重", 99, 0.2, 24.0, 0.3),
            "raw": ("生重", 85, 0.0, 20.0, 0.5),
        },
    },
    "cod_150g": {
        "default_grams": 150,
        "default_state": "cooked",
        "states": {
            "cooked": ("熟重", 105, 0.0, 23.0, 1.0),
            "raw": ("生重", 82, 0.0, 18.0, 0.7),
        },
    },
    "egg_1": {"default_grams": 50, "default_state": "default", "states": {"default": ("默认", 144, 0.8, 12.6, 9.6)}},
    "egg_white_100g": {"default_grams": 100, "default_state": "default", "states": {"default": ("默认", 52, 0.7, 11.0, 0.2)}},
    "skim_milk_250ml": {"default_grams": 250, "default_state": "default", "states": {"default": ("默认", 34, 4.8, 3.4, 0.1)}},
    "whole_wheat_bread_2": {"default_grams": 60, "default_state": "default", "states": {"default": ("默认", 267, 46.7, 13.3, 3.3)}},
    "banana_100g": {"default_grams": 100, "default_state": "default", "states": {"default": ("默认", 89, 23.0, 1.1, 0.3)}},
    "apple_180g": {"default_grams": 180, "default_state": "default", "states": {"default": ("默认", 53, 13.9, 0.3, 0.2)}},
    "greek_yogurt_170g": {"default_grams": 170, "default_state": "default", "states": {"default": ("默认", 59, 3.5, 10.0, 0.4)}},
    "whey_30g": {"default_grams": 30, "default_state": "default", "states": {"default": ("默认", 400, 10.0, 80.0, 6.7)}},
    "sweet_potato_200g": {"default_grams": 200, "default_state": "cooked", "states": {"cooked": ("熟重", 90, 20.5, 2.0, 0.1), "raw": ("生重", 86, 20.1, 1.6, 0.1)}},
    "potato_200g": {"default_grams": 200, "default_state": "cooked", "states": {"cooked": ("熟重", 87, 20.0, 2.0, 0.1), "raw": ("生重", 77, 17.5, 2.0, 0.1)}},
    "corn_150g": {"default_grams": 150, "default_state": "cooked", "states": {"cooked": ("熟重", 96, 20.7, 3.3, 1.3), "raw": ("生重", 86, 19.0, 3.2, 1.2)}},
    "firm_tofu_150g": {"default_grams": 150, "default_state": "default", "states": {"default": ("默认", 144, 2.7, 16.7, 8.7)}},
    "broccoli_200g": {"default_grams": 200, "default_state": "cooked", "states": {"cooked": ("熟重", 35, 7.0, 2.5, 0.4), "raw": ("生重", 34, 6.6, 2.8, 0.4)}},
    "mixed_veg_200g": {"default_grams": 200, "default_state": "default", "states": {"default": ("默认", 40, 8.0, 2.0, 0.25)}},
    "olive_oil_10g": {"default_grams": 10, "default_state": "default", "states": {"default": ("默认", 884, 0.0, 0.0, 100.0)}},
    "almonds_15g": {"default_grams": 15, "default_state": "default", "states": {"default": ("默认", 579, 20.0, 21.0, 50.0)}},
    "tuna_water_100g": {"default_grams": 100, "default_state": "default", "states": {"default": ("默认", 116, 0.0, 25.5, 0.8)}},
    "edamame_150g": {"default_grams": 150, "default_state": "cooked", "states": {"cooked": ("熟重", 121, 9.0, 11.0, 5.2), "raw": ("生重", 122, 8.9, 11.9, 5.2)}},
    "cottage_cheese_150g": {"default_grams": 150, "default_state": "default", "states": {"default": ("默认", 72, 3.4, 12.0, 1.0)}},
    "protein_bar": {"default_grams": 60, "default_state": "default", "states": {"default": ("默认", 333, 33.3, 33.3, 11.7)}},
    "pumpkin_200g": {"default_grams": 200, "default_state": "cooked", "states": {"cooked": ("熟重", 26, 6.5, 1.0, 0.1), "raw": ("生重", 26, 6.5, 1.0, 0.1)}},
    "spinach_200g": {"default_grams": 200, "default_state": "cooked", "states": {"cooked": ("熟重", 23, 3.6, 2.9, 0.4), "raw": ("生重", 23, 3.6, 2.9, 0.4)}},
    "cauliflower_200g": {"default_grams": 200, "default_state": "cooked", "states": {"cooked": ("熟重", 23, 4.1, 1.9, 0.3), "raw": ("生重", 25, 5.0, 1.9, 0.3)}},
    "mushroom_200g": {"default_grams": 200, "default_state": "default", "states": {"default": ("默认", 22, 3.3, 3.1, 0.3)}},
    "tomato_200g": {"default_grams": 200, "default_state": "default", "states": {"default": ("默认", 18, 3.9, 0.9, 0.2)}},
    "cucumber_200g": {"default_grams": 200, "default_state": "default", "states": {"default": ("默认", 15, 3.6, 0.7, 0.1)}},
    "avocado_100g": {"default_grams": 100, "default_state": "default", "states": {"default": ("默认", 160, 8.5, 2.0, 14.7)}},
    "peanut_butter_16g": {"default_grams": 16, "default_state": "default", "states": {"default": ("默认", 588, 20.0, 25.0, 50.0)}},
    "walnuts_15g": {"default_grams": 15, "default_state": "default", "states": {"default": ("默认", 654, 14.0, 15.0, 65.0)}},
}

FAT_LOSS_MEAL_SECTIONS = [
    {
        "key": "breakfast",
        "label": "早餐",
        "note": "优先给蛋白和稳定碳水，避免早上只喝咖啡硬扛。",
        "default_food_ids": ["oats_50g", "egg_1", "skim_milk_250ml"],
    },
    {
        "key": "lunch",
        "label": "午餐",
        "note": "把主食、优质蛋白和蔬菜搭起来，训练日可把更多碳水放在午餐。",
        "default_food_ids": ["rice_150g", "chicken_breast_150g", "broccoli_200g"],
    },
    {
        "key": "dinner",
        "label": "晚餐",
        "note": "低碳日可以减少主食，保留蛋白和蔬菜。",
        "default_food_ids": ["sweet_potato_200g", "firm_tofu_150g", "mixed_veg_200g"],
    },
    {
        "key": "snack",
        "label": "加餐",
        "note": "用于补蛋白或训练前后补一点易消化碳水。",
        "default_food_ids": ["greek_yogurt_170g", "whey_30g"],
    },
]

NUTRITION_DATA_SOURCES = [
    "USDA FoodData Central: https://fdc.nal.usda.gov/",
    "CalorieData USDA-derived oats page: https://caloriedata.org/calories-in/oats",
    "Calorie.live USDA-derived cooked white rice page: https://www.calorie.live/foods/usda-rice-white-medium-grain-cooked-unenriched",
    "Chicken breast USDA-derived calculator: https://chicken.foodnutrify.com/tools/chicken-breast-calculator",
]


def calculate_bmi(weight_kg: float, height_cm: float) -> float:
    """Calculate BMI as a basic reference value.

    BMI is useful as a rough beginner reference, but GymPath should not use it
    as a strong judgment metric for experienced lifters.
    """
    if weight_kg <= 0:
        raise ValueError("weight_kg must be greater than zero")
    if height_cm <= 0:
        raise ValueError("height_cm must be greater than zero")

    height_m = height_cm / 100
    return round(weight_kg / (height_m**2), 1)


def classify_user_level(
    training_months: int,
    weekly_frequency: int,
    consistency: str,
) -> str:
    """Classify a user as beginner, restarting, or experienced."""
    if training_months < 0:
        raise ValueError("training_months cannot be negative")
    if weekly_frequency < 0:
        raise ValueError("weekly_frequency cannot be negative")

    normalized_consistency = consistency.lower().strip()
    if normalized_consistency in {"returning", "inconsistent", "restart", "restarting"}:
        return "restarting"
    if training_months < 6 or weekly_frequency < 2:
        return "beginner"
    if training_months >= 18 and weekly_frequency >= 3 and normalized_consistency == "consistent":
        return "experienced"
    return "restarting"


def calculate_protein_target(weight_kg: float, goal: str) -> dict[str, Any]:
    """Return daily protein guidance for the selected goal."""
    if weight_kg <= 0:
        raise ValueError("weight_kg must be greater than zero")

    normalized_goal = _normalize_goal(goal)
    multipliers = {
        "muscle_gain": (1.6, 2.2),
        "strength_gain": (1.6, 2.0),
        "fat_loss": (1.8, 2.4),
        "general_fitness": (1.2, 1.6),
        "health": (1.0, 1.4),
    }
    low, high = multipliers[normalized_goal]
    return {
        "goal": normalized_goal,
        "min_grams": round(weight_kg * low),
        "max_grams": round(weight_kg * high),
        "note": "Spread protein across 3-5 meals when possible.",
    }


def calculate_calorie_target(
    weight_kg: float,
    height_cm: float,
    age: int,
    gender: str,
    goal: str,
    activity_level: str,
) -> dict[str, Any]:
    """Estimate daily calories with a simple Mifflin-St Jeor style formula."""
    if weight_kg <= 0:
        raise ValueError("weight_kg must be greater than zero")
    if height_cm <= 0:
        raise ValueError("height_cm must be greater than zero")
    if age <= 0:
        raise ValueError("age must be greater than zero")

    normalized_gender = gender.lower().strip()
    normalized_goal = _normalize_goal(goal)
    if normalized_gender in {"male", "man", "m"}:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    elif normalized_gender in {"female", "woman", "f"}:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 78

    activity_multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
    }
    multiplier = activity_multipliers.get(activity_level.lower().strip(), 1.375)
    maintenance = bmr * multiplier

    goal_adjustment = {
        "muscle_gain": 250,
        "strength_gain": 150,
        "fat_loss": -400,
        "general_fitness": 0,
        "health": -100,
    }[normalized_goal]

    target = round(maintenance + goal_adjustment)
    return {
        "maintenance_calories": round(maintenance),
        "target_calories": target,
        "goal": normalized_goal,
        "note": "Treat this as a starting estimate and adjust with progress trends.",
    }


def generate_diet_plan(
    weight_kg: float,
    goal: str,
    *,
    plan_type: str = "kaisheng_carb_cycle",
    height_cm: float | None = None,
    age: int | None = None,
    gender: str = "male",
    minutes_per_session: int = 60,
    days_per_week: int = 3,
    level: str = "beginner",
    activity_level: str = "moderate",
    carb_sensitivity: str = "standard",
    target_weight_kg: float | None = None,
    training_intensity: str = "auto",
) -> dict[str, Any]:
    """Generate a practical macro plan for the selected goal.

    The fat-loss branch uses a simple weekly carb-cycling rule:
    daily carbs = 2.0 x body weight, daily fat = 0.8 x body weight,
    daily protein = 1.3 x body weight, then weekly carbs/fat are split
    across 2 high-carb days, 3 medium-carb days, and 2 low-carb days.
    """
    if weight_kg <= 0:
        raise ValueError("weight_kg must be greater than zero")

    normalized_goal = _normalize_goal(goal)
    if normalized_goal in {"muscle_gain", "strength_gain"}:
        return _generate_performance_nutrition_plan(
            weight_kg=weight_kg,
            height_cm=height_cm,
            age=age,
            gender=gender,
            minutes_per_session=minutes_per_session,
            days_per_week=days_per_week,
            level=level,
            activity_level=activity_level,
            training_intensity=training_intensity,
            goal=normalized_goal,
        )

    if normalized_goal == "fat_loss" and plan_type in {"orange_carb_taper", "orange_taper", "chengzi_carb_taper"}:
        return _generate_orange_carb_taper_plan(
            weight_kg=weight_kg,
            height_cm=height_cm,
            age=age,
            gender=gender,
            minutes_per_session=minutes_per_session,
            level=level,
            carb_sensitivity=carb_sensitivity,
            target_weight_kg=target_weight_kg,
            training_intensity=training_intensity,
        )

    if normalized_goal == "fat_loss":
        daily_carbs = int(weight_kg * 2.0)
        daily_fat = int(weight_kg * 0.8)
        daily_protein = int(weight_kg * 1.3)
        weekly_carbs = daily_carbs * 7
        weekly_fat = daily_fat * 7
        weekly_protein = daily_protein * 7

        cycle_specs = [
            ("high_carb", "高碳日", 2, 0.50, 0.15, "放在腿、背或最累的训练日，保证训练表现。"),
            ("medium_carb", "中碳日", 3, 0.35, 0.35, "放在普通训练日或日常活动较多的日子。"),
            ("low_carb", "低碳日", 2, 0.15, 0.50, "放在休息日或低强度活动日，控制总碳水。"),
        ]

        cycle_days = []
        for key, label, days, carb_share, fat_share, timing in cycle_specs:
            raw_carbs = weekly_carbs * carb_share / days
            carbs = int(raw_carbs) if key == "low_carb" else round(raw_carbs)
            fat = round(weekly_fat * fat_share / days)
            calories = _macro_calories(carbs, daily_protein, fat)
            cycle_days.append(
                {
                    "key": key,
                    "label": label,
                    "days_per_week": days,
                    "carbs_g": carbs,
                    "protein_g": daily_protein,
                    "fat_g": fat,
                    "calories": calories,
                    "carb_share": carb_share,
                    "fat_share": fat_share,
                    "timing": timing,
                }
            )

        return {
            "type": "fat_loss_carb_cycle",
            "title": "减脂碳循环计划",
            "baseline_daily": {
                "carbs_g": daily_carbs,
                "protein_g": daily_protein,
                "fat_g": daily_fat,
                "calories": _macro_calories(daily_carbs, daily_protein, daily_fat),
            },
            "weekly_totals": {
                "carbs_g": weekly_carbs,
                "protein_g": weekly_protein,
                "fat_g": weekly_fat,
            },
            "cycle_days": cycle_days,
            "meal_timing": {
                "protein_per_meal_g": "20-40",
                "meals_per_day": "4-5",
                "meal_interval_hours": "2-3",
                "note": "每餐蛋白控制在 20-40g，分 4-5 次吃，间隔 2-3 小时更容易执行。",
            },
            "rules": [
                "先把每日蛋白吃够，再按高碳/中碳/低碳日安排碳水和脂肪。",
                "高碳日优先匹配大肌群或高强度训练，低碳日优先匹配休息日。",
                "连续两周体重、腰围和训练状态都没有变化，再微调总量。",
            ],
        }

    daily_protein = round(weight_kg * 1.8)
    daily_carbs = round(weight_kg * 3.0)
    daily_fat = round(weight_kg * 0.8)
    return {
        "type": "steady_macros",
        "title": "基础饮食计划",
        "baseline_daily": {
            "carbs_g": daily_carbs,
            "protein_g": daily_protein,
            "fat_g": daily_fat,
            "calories": _macro_calories(daily_carbs, daily_protein, daily_fat),
        },
        "weekly_totals": {
            "carbs_g": daily_carbs * 7,
            "protein_g": daily_protein * 7,
            "fat_g": daily_fat * 7,
        },
        "cycle_days": [],
        "meal_timing": {
            "protein_per_meal_g": "20-40",
            "meals_per_day": "3-5",
            "meal_interval_hours": "2-4",
            "note": "把蛋白质分散到多餐，训练前后优先安排易消化碳水。",
        },
        "rules": [
            "增肌期保持小幅热量盈余，不要用乱吃替代稳定进步。",
            "优先保证蛋白质、训练表现和睡眠，再微调碳水。",
        ],
    }


def _generate_orange_carb_taper_plan(
    *,
    weight_kg: float,
    height_cm: float | None,
    age: int | None,
    gender: str,
    minutes_per_session: int,
    level: str,
    carb_sensitivity: str,
    target_weight_kg: float | None,
    training_intensity: str,
) -> dict[str, Any]:
    if height_cm is None or height_cm <= 0:
        raise ValueError("height_cm must be provided for orange_carb_taper")
    if age is None or age <= 0:
        raise ValueError("age must be provided for orange_carb_taper")
    if minutes_per_session < 0:
        raise ValueError("minutes_per_session cannot be negative")
    if target_weight_kg is not None and target_weight_kg <= 0:
        raise ValueError("target_weight_kg must be greater than zero")

    bmr = _calculate_bmr(weight_kg, height_cm, age, gender)
    intensity = _training_intensity_factor(training_intensity, level, gender)
    training_calories = int(minutes_per_session * intensity)
    daily_expenditure = bmr + training_calories

    sensitive = carb_sensitivity in {"sensitive", "carb_sensitive", "low_carb_sensitive"}
    ratios = {
        "carbs": 0.4 if sensitive else 0.5,
        "protein": 0.4 if sensitive else 0.3,
        "fat": 0.2,
    }
    carbs = round(daily_expenditure * ratios["carbs"] / 4)
    protein = round(daily_expenditure * ratios["protein"] / 4)
    fat = round(daily_expenditure * ratios["fat"] / 9)

    target_loss_kg = max(round(weight_kg - target_weight_kg, 1), 0) if target_weight_kg else None
    conservative_monthly_loss = weight_kg * 0.03
    aggressive_monthly_loss = weight_kg * 0.05
    weekly_target_3_percent = round(conservative_monthly_loss / 4, 2)
    weekly_target_5_percent = round(aggressive_monthly_loss / 4, 2)

    timeline = None
    if target_loss_kg and target_loss_kg > 0:
        timeline = {
            "target_weight_kg": target_weight_kg,
            "target_loss_kg": target_loss_kg,
            "conservative_months_3_percent": round(target_loss_kg / conservative_monthly_loss, 1),
            "aggressive_months_5_percent": round(target_loss_kg / aggressive_monthly_loss, 1),
            "weekly_loss_target_kg_3_percent": weekly_target_3_percent,
            "weekly_loss_target_kg_5_percent": weekly_target_5_percent,
            "note": "每月下降当前体重的 3%-5% 属于较合理区间；比例越高，吃得越少，时间越短，但体感越累。",
        }

    return {
        "type": "orange_carb_taper",
        "title": "橙子碳水渐降减脂",
        "bmr": bmr,
        "training_burn": {
            "minutes": minutes_per_session,
            "intensity_factor": intensity,
            "calories": training_calories,
            "label": _training_intensity_label(intensity),
        },
        "daily_expenditure": daily_expenditure,
        "macro_ratio": {
            "carbs": ratios["carbs"],
            "protein": ratios["protein"],
            "fat": ratios["fat"],
            "label": "碳水敏感 4/4/2" if sensitive else "标准 5/3/2",
        },
        "baseline_daily": {
            "carbs_g": carbs,
            "protein_g": protein,
            "fat_g": fat,
            "calories": _macro_calories(carbs, protein, fat),
        },
        "weekly_totals": {
            "carbs_g": carbs * 7,
            "protein_g": protein * 7,
            "fat_g": fat * 7,
        },
        "cycle_days": [],
        "meal_timing": {
            "protein_per_meal_g": "20-40",
            "meals_per_day": "4-5",
            "meal_interval_hours": "2-3",
            "note": "每天早起空腹记录体重；蛋白质尽量分到 4-5 餐，每餐 20-40g。",
        },
        "target_timeline": timeline,
        "adjustment_protocol": {
            "first_check_days": 7,
            "extra_wait_days": 3,
            "weekly_loss_target_kg": weekly_target_3_percent,
            "carb_cut_if_stalled_g": "15-30",
            "rule": "7 天后若相比上次记录达到每周目标，饮食不变；若未达到，再等 3 天；仍未达到时，每日碳水降低 15-30g。",
        },
        "rules": [
            "先用基础代谢加训练消耗估算一天基础热量消耗。",
            "标准比例用碳水 50%、蛋白 30%、脂肪 20%；碳水敏感者改用碳水 40%、蛋白 40%、脂肪 20%。",
            "每天早起空腹记录体重，用 7-10 天趋势决定是否减少碳水，不要只看单日波动。",
        ],
    }


def _generate_performance_nutrition_plan(
    *,
    weight_kg: float,
    height_cm: float | None,
    age: int | None,
    gender: str,
    minutes_per_session: int,
    days_per_week: int,
    level: str,
    activity_level: str,
    training_intensity: str,
    goal: str,
) -> dict[str, Any]:
    height = height_cm or 175
    user_age = age or 22
    bmr = _calculate_harvard_bmr(weight_kg, height, user_age, gender)
    life_burn = _lifestyle_burn(activity_level)
    intensity = _training_intensity_factor(training_intensity, level, gender)
    training_calories = max(0, int(minutes_per_session)) * intensity
    maintenance_training_day = bmr + life_burn + training_calories
    maintenance_rest_day = bmr + life_burn
    training_target = max(bmr, maintenance_training_day + 250)
    rest_target = max(bmr, maintenance_rest_day - 600)
    training_day = _macro_targets_from_ratio(
        training_target,
        "training_day",
        "训练日",
        "训练日：基础代谢 + 生活消耗 + 训练消耗 + 约250 kcal 盈余。",
    )
    rest_day = _macro_targets_from_ratio(
        rest_target,
        "rest_day",
        "休息日",
        "休息日：基础代谢 + 生活消耗 - 约600 kcal，但不低于基础代谢。",
    )
    training_days = max(1, min(7, int(days_per_week or 3)))
    rest_days = max(0, 7 - training_days)
    title = "增肌营养计划" if goal == "muscle_gain" else "增力营养计划"

    return {
        "type": "performance_macros",
        "title": title,
        "bmr": bmr,
        "bmr_formula": "男性：66 + 13.7×体重kg + 5×身高cm - 6.8×年龄；女性：655 + 9.6×体重kg + 1.8×身高cm - 4.7×年龄。",
        "life_burn": life_burn,
        "life_burn_note": "生活消耗加入基础代谢；轻体力约300-500 kcal，重体力约500-800 kcal。",
        "training_burn": {
            "minutes": max(0, int(minutes_per_session)),
            "intensity_factor": intensity,
            "calories": training_calories,
            "label": _training_intensity_label(intensity),
        },
        "maintenance_calories": maintenance_training_day,
        "rest_maintenance_calories": maintenance_rest_day,
        "training_day_calories": training_target,
        "rest_day_calories": rest_target,
        "calorie_floor": bmr,
        "macro_ratio": {
            "carbs": 0.50,
            "protein": 0.25,
            "fat": 0.25,
            "label": "碳水:蛋白质:脂肪 = 5:2.5:2.5（供能比例）",
        },
        "baseline_daily": {
            "carbs_g": training_day["carbs_g"],
            "protein_g": training_day["protein_g"],
            "fat_g": training_day["fat_g"],
            "calories": training_day["calories"],
        },
        "weekly_totals": {
            "carbs_g": training_day["carbs_g"] * training_days + rest_day["carbs_g"] * rest_days,
            "protein_g": training_day["protein_g"] * training_days + rest_day["protein_g"] * rest_days,
            "fat_g": training_day["fat_g"] * training_days + rest_day["fat_g"] * rest_days,
        },
        "cycle_days": [
            {**training_day, "days_per_week": training_days},
            {**rest_day, "days_per_week": rest_days},
        ],
        "meal_timing": {
            "protein_per_meal_g": "20-40",
            "meals_per_day": "3-5",
            "meal_interval_hours": "2-4",
            "note": "蛋白质分餐摄入更利于消化吸收；训练后可以把每日约30%碳水放到训练后补糖原。",
        },
        "rules": [
            "不管增肌还是减脂，摄入热量不要低于基础代谢。",
            "训练日保持约200-300 kcal 盈余，优先保证训练表现和恢复。",
            "休息日保持约500-700 kcal 缺口，但不要低于基础代谢。",
            "三大营养素按供能比例综合计算：碳水50%，蛋白25%，脂肪25%。",
            "训练前约3小时吃正餐；来不及时可在训练前15分钟补易消化碳水。",
            "训练中掉多少体重，训练后尽量补回对应水分；尿液透明或柠檬色通常说明水分较充足。",
            "每天尽量吃一斤生蔬菜或等量蔬菜，保证膳食纤维和微量营养素。",
        ],
    }


def _macro_targets_from_ratio(calories: int, key: str, label: str, timing: str) -> dict[str, Any]:
    carbs = round(calories * 0.50 / 4)
    protein = round(calories * 0.25 / 4)
    fat = round(calories * 0.25 / 9)
    return {
        "key": key,
        "label": label,
        "carbs_g": carbs,
        "protein_g": protein,
        "fat_g": fat,
        "calories": calories,
        "timing": timing,
    }


def _calculate_harvard_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> int:
    normalized_gender = gender.lower().strip()
    if normalized_gender in {"female", "woman", "f"}:
        value = 655 + (9.6 * weight_kg) + (1.8 * height_cm) - (4.7 * age)
    else:
        value = 66 + (13.7 * weight_kg) + (5 * height_cm) - (6.8 * age)
    return round(value)


def _lifestyle_burn(activity_level: str) -> int:
    normalized = activity_level.lower().strip()
    if normalized in {"sedentary", "none"}:
        return 300
    if normalized in {"light", "low"}:
        return 400
    if normalized in {"active", "heavy", "hard"}:
        return 700
    return 500


def get_fat_loss_food_library() -> dict[str, Any]:
    """Return the selectable food database for the fat-loss meal logger."""
    foods = [_food_payload(food_id) for food_id in FAT_LOSS_FOOD_LIBRARY]
    return {
        "foods": foods,
        "meals": FAT_LOSS_MEAL_SECTIONS,
        "macro_sources": NUTRITION_DATA_SOURCES,
        "note": "Nutrition values are practical estimates for MVP meal logging; packaged food labels should override these defaults.",
    }


def calculate_meal_totals(food_ids: list[Any]) -> dict[str, Any]:
    """Calculate calories and macros for one meal from selected food ids."""
    totals = {"calories": 0, "carbs_g": 0.0, "protein_g": 0.0, "fat_g": 0.0}
    selected_foods = []
    for selection in food_ids:
        food_id, grams, state_key = _normalize_food_selection(selection)
        if food_id not in FAT_LOSS_FOOD_LIBRARY:
            raise ValueError(f"Unknown food id: {food_id}")
        food = FAT_LOSS_FOOD_LIBRARY[food_id]
        state = _food_state(food_id, state_key)
        multiplier = grams / 100
        calories = state["calories_per_100g"] * multiplier
        carbs = state["carbs_per_100g"] * multiplier
        protein = state["protein_per_100g"] * multiplier
        fat = state["fat_per_100g"] * multiplier
        selected_foods.append(
            {
                "id": food_id,
                "name": food["name"],
                "grams": grams,
                "state": state_key,
                "state_label": state["label"],
            }
        )
        totals["calories"] += calories
        totals["carbs_g"] += carbs
        totals["protein_g"] += protein
        totals["fat_g"] += fat

    return {
        "calories": int(totals["calories"] + 0.5),
        "carbs_g": round(totals["carbs_g"], 1),
        "protein_g": round(totals["protein_g"], 1),
        "fat_g": round(totals["fat_g"], 1),
        "selected_foods": selected_foods,
    }


def calculate_day_meal_totals(meals: dict[str, list[Any]]) -> dict[str, Any]:
    """Calculate meal-by-meal and full-day nutrition totals."""
    meal_results = {}
    day_totals = {"calories": 0, "carbs_g": 0.0, "protein_g": 0.0, "fat_g": 0.0}
    for meal_key, food_ids in meals.items():
        meal_total = calculate_meal_totals(food_ids)
        meal_results[meal_key] = meal_total
        day_totals["calories"] += meal_total["calories"]
        day_totals["carbs_g"] += meal_total["carbs_g"]
        day_totals["protein_g"] += meal_total["protein_g"]
        day_totals["fat_g"] += meal_total["fat_g"]

    return {
        "meals": meal_results,
        "daily_total": {
            "calories": round(day_totals["calories"]),
            "carbs_g": round(day_totals["carbs_g"], 1),
            "protein_g": round(day_totals["protein_g"], 1),
            "fat_g": round(day_totals["fat_g"], 1),
        },
    }


def _food_payload(food_id: str) -> dict[str, Any]:
    food = FAT_LOSS_FOOD_LIBRARY[food_id]
    config = FOOD_STATE_CONFIG[food_id]
    states = [_food_state(food_id, state_key) for state_key in config["states"]]
    return {
        "id": food_id,
        **food,
        "default_grams": config["default_grams"],
        "default_state": config["default_state"],
        "states": states,
    }


def _food_state(food_id: str, state_key: str) -> dict[str, Any]:
    config = FOOD_STATE_CONFIG[food_id]
    states = config["states"]
    if state_key not in states:
        state_key = config["default_state"]
    label, calories, carbs, protein, fat = states[state_key]
    return {
        "key": state_key,
        "label": label,
        "calories_per_100g": calories,
        "carbs_per_100g": carbs,
        "protein_per_100g": protein,
        "fat_per_100g": fat,
    }


def _normalize_food_selection(selection: Any) -> tuple[str, float, str]:
    if isinstance(selection, str):
        food_id = selection
        config = FOOD_STATE_CONFIG[food_id]
        return food_id, float(config["default_grams"]), str(config["default_state"])
    if not isinstance(selection, dict):
        raise ValueError("Food selection must be a food id or object")

    food_id = str(selection.get("food_id") or selection.get("id") or "")
    if food_id not in FAT_LOSS_FOOD_LIBRARY:
        raise ValueError(f"Unknown food id: {food_id}")
    config = FOOD_STATE_CONFIG[food_id]
    grams = float(selection.get("grams", config["default_grams"]))
    if grams <= 0:
        raise ValueError("grams must be greater than zero")
    state = str(selection.get("state", config["default_state"]))
    if state not in config["states"]:
        state = str(config["default_state"])
    return food_id, grams, state


def recommend_training_split(level: str, goal: str, days_per_week: int) -> dict[str, Any]:
    """Recommend a training split based on level, goal, and weekly days."""
    if days_per_week < 1 or days_per_week > 7:
        raise ValueError("days_per_week must be between 1 and 7")

    normalized_level = _normalize_level(level)
    normalized_goal = _normalize_goal(goal)

    if normalized_goal == "health":
        effective_days = max(2, days_per_week)
        return {
            "split_name": "Home Upper Lower Health",
            "days": effective_days,
            "reason": "Health-focused users get a low-barrier home plan split into upper body and lower body/core sessions.",
            "notes": [
                "Alternate upper-body and lower-body sessions.",
                "Use bottles, a chair, or bodyweight when gym equipment is unavailable.",
                "Stop if joint pain feels sharp or worsening.",
            ],
        }

    if normalized_level == "beginner":
        return {
            "split_name": "Beginner Four-Day Split",
            "days": 4,
            "reason": "Beginners use a guided four-day split with fixed videos to reduce decision cost and follow a clear progression.",
            "notes": [
                "Follow the four sessions in order.",
                "Rest one day after the lower-body session before the shoulder and arms session.",
                "Keep loads conservative while learning movement patterns.",
            ],
        }

    if normalized_level == "restarting":
        return {
            "split_name": "Push Pull Legs Restart" if days_per_week <= 3 else "Upper Lower Restart",
            "days": days_per_week,
            "reason": "Restarting users need enough stimulus without making the first week feel punishing.",
            "notes": ["Start with fewer sets.", "Increase only after consistency returns."],
        }

    if days_per_week >= 5:
        return {
            "split_name": "Push Pull Legs",
            "days": days_per_week,
            "reason": "Experienced lifters can benefit from higher frequency and more specialization.",
            "notes": ["Track recovery.", "Use substitutions when a movement does not feel right."],
        }

    if days_per_week == 4:
        return {
            "split_name": "Upper Lower",
            "days": days_per_week,
            "reason": "Upper/lower training balances frequency, recovery, and progression.",
            "notes": ["Use progressive overload.", "Keep one or two reps in reserve on most sets."],
        }

    return {
        "split_name": "Push Pull Legs",
        "days": days_per_week,
        "reason": "Fewer weekly sessions can still rotate push, pull, and legs without a mixed whole-session template.",
        "notes": ["Rotate the next split day each session.", "Keep accessory work focused."],
    }


def generate_workout_plan(
    level: str,
    goal: str,
    days_per_week: int,
    minutes_per_session: int = 60,
    strength_plan_type: str = "auto",
    muscle_gain_plan_type: str = "auto",
) -> dict[str, Any]:
    """Generate a simple weekly training plan."""
    if minutes_per_session < 15:
        raise ValueError("minutes_per_session must be at least 15")
    if days_per_week < 1 or days_per_week > 7:
        raise ValueError("days_per_week must be between 1 and 7")

    normalized_level = _normalize_level(level)
    normalized_goal = _normalize_goal(goal)
    if normalized_goal == "health":
        split = recommend_training_split(normalized_level, normalized_goal, days_per_week)
        effective_days = int(split["days"])
        return {
            "level": normalized_level,
            "goal": normalized_goal,
            "days_per_week": effective_days,
            "minutes_per_session": minutes_per_session,
            "split": split,
            "weekly_schedule": _health_home_schedule(effective_days, minutes_per_session),
            "safety_note": "GymPath gives fitness education, not medical diagnosis. Stop for sharp or worsening pain.",
        }

    if normalized_goal == "strength_gain":
        return _strength_workout_plan(
            level=normalized_level,
            days_per_week=days_per_week,
            minutes_per_session=minutes_per_session,
            strength_plan_type=strength_plan_type,
        )
    if normalized_goal == "muscle_gain":
        return _muscle_gain_workout_plan(
            level=normalized_level,
            days_per_week=days_per_week,
            minutes_per_session=minutes_per_session,
            muscle_gain_plan_type=muscle_gain_plan_type,
        )

    split = recommend_training_split(normalized_level, normalized_goal, days_per_week)
    if normalized_level == "beginner":
        weekly_schedule = _beginner_four_day_schedule(minutes_per_session)
        return {
            "level": normalized_level,
            "goal": normalized_goal,
            "days_per_week": 4,
            "minutes_per_session": minutes_per_session,
            "split": split,
            "weekly_schedule": weekly_schedule,
            "safety_note": "GymPath gives fitness education, not medical diagnosis. Stop for sharp or worsening pain.",
        }

    templates = _plan_templates(normalized_level, normalized_goal, split["split_name"])
    max_exercises = 4 if minutes_per_session < 50 else 5 if minutes_per_session < 75 else 6

    weekly_schedule: list[dict[str, Any]] = []
    for index in range(days_per_week):
        template = templates[index % len(templates)]
        exercises = [_exercise(name) for name in template["exercises"][:max_exercises]]
        weekly_schedule.append(
            {
                "day": f"Day {index + 1}",
                "focus": template["focus"],
                "warmup": _warmup_for_focus(template["focus"]),
                "exercises": exercises,
                "rest_policy": _session_rest_policy(exercises),
                "session_note": _session_note(normalized_level, normalized_goal, minutes_per_session),
            }
        )

    return {
        "level": normalized_level,
        "goal": normalized_goal,
        "days_per_week": days_per_week,
        "minutes_per_session": minutes_per_session,
        "split": split,
        "weekly_schedule": weekly_schedule,
        "safety_note": "GymPath gives fitness education, not medical diagnosis. Stop for sharp or worsening pain.",
    }


def assess_pain_response(pain_location: str, pain_type: str, pain_level: int) -> dict[str, str]:
    """Classify discomfort and return cautious training guidance."""
    if pain_level < 0 or pain_level > 10:
        raise ValueError("pain_level must be between 0 and 10")

    normalized_type = pain_type.lower().strip()
    risky_types = {"sharp", "numbness", "radiating", "worsening", "electric"}
    form_related_types = {"pinch", "unstable", "pressure", "joint"}

    if pain_level >= 8 or normalized_type in risky_types:
        return {
            "category": "stop",
            "action": "Stop this exercise today. If symptoms continue, seek help from a qualified professional.",
            "explanation": "Sharp, severe, radiating, or worsening pain is not a normal training target.",
            "medical_note": "GymPath does not diagnose injuries or medical conditions.",
        }

    if pain_level >= 5 or normalized_type in form_related_types:
        return {
            "category": "modify_or_replace",
            "action": "Reduce load, shorten range of motion, slow the tempo, or choose a substitute movement.",
            "explanation": f"Moderate discomfort around {pain_location or 'the reported area'} may need technique changes.",
            "medical_note": "If pain worsens or feels unusual, stop the movement.",
        }

    return {
        "category": "continue_with_cues",
        "action": "Continue carefully with controlled reps and better setup cues.",
        "explanation": "Mild discomfort or normal muscle burn can often be monitored while keeping technique strict.",
        "medical_note": "Stop if the sensation becomes sharp, severe, or unusual.",
    }


def suggest_exercise_substitution(
    exercise_name: str,
    pain_location: str,
    goal: str,
) -> dict[str, Any]:
    """Suggest a substitute exercise for common gym movements."""
    normalized_name = exercise_name.lower().strip()
    normalized_pain = pain_location.lower().strip()
    _normalize_goal(goal)

    substitutions = {
        "barbell bench press": {
            "shoulder": ["Dumbbell Bench Press", "Machine Chest Press", "Push-up"],
            "wrist": ["Dumbbell Bench Press", "Neutral-Grip Machine Press"],
            "default": ["Dumbbell Bench Press", "Machine Chest Press"],
        },
        "back squat": {
            "knee": ["Box Squat", "Leg Press", "Goblet Squat"],
            "back": ["Goblet Squat", "Leg Press", "Hack Squat"],
            "default": ["Goblet Squat", "Leg Press"],
        },
        "deadlift": {
            "back": ["Romanian Deadlift with lighter load", "Hip Thrust", "Cable Pull-through"],
            "default": ["Romanian Deadlift", "Hip Thrust"],
        },
        "overhead press": {
            "shoulder": ["Landmine Press", "Machine Shoulder Press", "Lateral Raise"],
            "default": ["Landmine Press", "Machine Shoulder Press"],
        },
    }

    options = substitutions.get(normalized_name, {})
    suggested = options.get(normalized_pain, options.get("default", ["Machine variation", "Cable variation"]))
    return {
        "exercise": exercise_name,
        "pain_location": pain_location,
        "suggestions": suggested,
        "note": "Pick the option that feels stable and pain-free. Stop if pain escalates.",
    }


JOINT_PAIN_GUIDANCE: dict[str, dict[str, Any]] = {
    "shoulder": {
        "label": "肩关节",
        "substitutions": ["Machine Chest Press", "Dumbbell Bench Press", "Cable Fly", "Landmine Press"],
        "relief_methods": [
            "当天先避开明显夹挤、尖锐或越练越痛的角度。",
            "卧推、推肩类动作先改成器械或哑铃中立握，让肩部有更自由的活动轨迹。",
            "训练前用弹力带外旋、面拉、肩胛俯卧撑做 6-8 分钟激活，再进入正式组。",
        ],
        "rehab_drills": [
            "弹力带外旋 2-3 组 × 12-15 次",
            "墙滑 2-3 组 × 10 次",
            "肩胛俯卧撑 2-3 组 × 10 次",
        ],
        "video_links": [
            {"label": "肩部热身激活", "url": "https://www.bilibili.com/video/BV1sM4m1Q7i9/"},
            {"label": "肩袖外旋康复", "url": "https://search.bilibili.com/all?keyword=%E8%82%A9%E8%A2%96%E5%A4%96%E6%97%8B%E5%BA%B7%E5%A4%8D"},
        ],
        "medical_note": "如果有夜间痛、明显无力、放射麻木或疼痛持续加重，应停止训练并寻求专业帮助。",
    },
    "elbow": {
        "label": "肘关节",
        "substitutions": ["Cable Triceps Pressdown", "Dumbbell Curl", "Neutral-Grip Machine Press", "Cable Curl"],
        "relief_methods": [
            "先减少过度伸直锁死和大重量窄握推举。",
            "手臂训练改成绳索或哑铃中立握，降低肘关节扭矩。",
            "疼痛期把弯举和臂屈伸总组数减半，保留无痛范围。",
        ],
        "rehab_drills": [
            "腕伸肌离心 2-3 组 × 12 次",
            "轻重量旋前旋后 2-3 组 × 12 次",
            "绳索下压轻重量泵感组 2 组 × 15 次",
        ],
        "video_links": [
            {"label": "网球肘/肘痛康复", "url": "https://search.bilibili.com/all?keyword=%E8%82%98%E7%97%9B%20%E5%BA%B7%E5%A4%8D%20%E5%81%A5%E8%BA%AB"},
        ],
        "medical_note": "若肘部刺痛、麻木或握力明显下降，不建议硬顶训练。",
    },
    "wrist": {
        "label": "手腕",
        "substitutions": ["Dumbbell Bench Press", "Neutral-Grip Machine Press", "Cable Curl", "Push-up Handle Variation"],
        "relief_methods": [
            "避免手腕过度后伸，推类动作改中立握或使用护腕。",
            "卧推时让拳眼、腕、肘尽量在一条受力线上。",
            "疼痛明显时减少杠铃直杆弯举，改绳索或哑铃。",
        ],
        "rehab_drills": [
            "腕屈伸轻重量 2-3 组 × 15 次",
            "米桶抓握或握力球 2-3 组 × 30 秒",
            "前臂旋前旋后 2-3 组 × 12 次",
        ],
        "video_links": [
            {"label": "手腕康复训练", "url": "https://search.bilibili.com/all?keyword=%E6%89%8B%E8%85%95%E5%BA%B7%E5%A4%8D%E8%AE%AD%E7%BB%83"},
        ],
        "medical_note": "如果手腕肿胀、持续刺痛或支撑体重困难，应先暂停相关动作。",
    },
    "back": {
        "label": "下背/腰椎",
        "substitutions": ["Leg Press", "Goblet Squat", "Hip Thrust", "Romanian Deadlift with lighter load"],
        "relief_methods": [
            "当天避开硬拉、深蹲等会明显诱发下背痛的高轴向负荷。",
            "腿部训练可改腿举、保加利亚深蹲、臀桥，先保留训练刺激。",
            "重新检查髋铰链、腹压和动作幅度，不用疼痛换训练量。",
        ],
        "rehab_drills": [
            "猫牛式 2 组 × 8 次",
            "死虫 2-3 组 × 8-10 次",
            "鸟狗 2-3 组 × 8-10 次",
        ],
        "video_links": [
            {"label": "下背疼痛缓解", "url": "https://search.bilibili.com/all?keyword=%E4%B8%8B%E8%83%8C%E7%97%9B%20%E5%BA%B7%E5%A4%8D%20%E5%81%A5%E8%BA%AB"},
        ],
        "medical_note": "若出现腿部放射痛、麻木、无力或大小便异常，应立即停止训练并就医。",
    },
    "hip": {
        "label": "髋关节",
        "substitutions": ["Leg Press", "Goblet Squat", "Hip Thrust", "Cable Pull-through"],
        "relief_methods": [
            "深蹲出现髋前侧夹挤时，先减少深度并调整站距和脚尖角度。",
            "用臀桥、腿举、分腿蹲替代会卡髋的动作。",
            "训练前做髋屈肌动态活动和臀中肌激活。",
        ],
        "rehab_drills": [
            "90/90 髋旋转 2 组 × 8 次",
            "蚌式开合 2-3 组 × 12 次",
            "臀桥 2-3 组 × 12 次",
        ],
        "video_links": [
            {"label": "髋关节灵活性", "url": "https://search.bilibili.com/all?keyword=%E9%AB%8B%E5%85%B3%E8%8A%82%E7%81%B5%E6%B4%BB%E6%80%A7%20%E5%81%A5%E8%BA%AB"},
        ],
        "medical_note": "髋部深层疼痛、弹响伴痛或走路痛明显时，应减少负荷并寻求专业评估。",
    },
    "knee": {
        "label": "膝关节",
        "substitutions": ["Box Squat", "Leg Press", "Goblet Squat", "Romanian Deadlift"],
        "relief_methods": [
            "膝痛明显时先减少深蹲深度或改箱式深蹲。",
            "用腿举、髋主导训练和可控弓步保留腿部刺激。",
            "训练前做踝、髋活动和股四头肌轻泵感激活。",
        ],
        "rehab_drills": [
            "靠墙静蹲 2-3 组 × 30-45 秒",
            "台阶下放 2-3 组 × 8 次",
            "弹力带终末伸膝 2-3 组 × 15 次",
        ],
        "video_links": [
            {"label": "膝盖康复训练", "url": "https://search.bilibili.com/all?keyword=%E8%86%9D%E7%97%9B%20%E5%BA%B7%E5%A4%8D%20%E5%81%A5%E8%BA%AB"},
        ],
        "medical_note": "膝盖肿胀、卡住、打软腿或疼痛持续升级时，不建议继续腿部负重训练。",
    },
    "ankle": {
        "label": "踝关节",
        "substitutions": ["Leg Press", "Goblet Squat", "Seated Calf Raise", "Hip Thrust"],
        "relief_methods": [
            "踝前侧卡住时减少深蹲深度，先用腿举或高脚杯深蹲。",
            "训练前做踝背屈活动，避免硬压疼痛角度。",
            "小腿训练先用坐姿提踵或轻重量站姿提踵。",
        ],
        "rehab_drills": [
            "膝盖触墙踝背屈 2-3 组 × 10 次",
            "弹力带踝外翻 2-3 组 × 12 次",
            "单脚平衡 2-3 组 × 30 秒",
        ],
        "video_links": [
            {"label": "踝关节灵活性", "url": "https://search.bilibili.com/all?keyword=%E8%B8%9D%E5%85%B3%E8%8A%82%E7%81%B5%E6%B4%BB%E6%80%A7%20%E5%81%A5%E8%BA%AB"},
        ],
        "medical_note": "扭伤后明显肿胀、淤青或无法承重时，应先停止训练并处理伤情。",
    },
}


def get_joint_pain_guidance(pain_location: str, goal: str = "muscle_gain") -> dict[str, Any]:
    """Return joint-specific substitution, relief, rehab, and video guidance."""
    _normalize_goal(goal)
    key = pain_location.lower().strip()
    return JOINT_PAIN_GUIDANCE.get(key, JOINT_PAIN_GUIDANCE["shoulder"])


def adjust_plan_after_feedback(plan: dict[str, Any], feedback: dict[str, Any]) -> dict[str, Any]:
    """Create a light adjustment recommendation after a workout."""
    fatigue = int(feedback.get("fatigue_level", 0) or 0)
    duration = int(feedback.get("duration_min", 0) or 0)
    pain_level = int(feedback.get("pain_level", 0) or 0)
    completed = bool(feedback.get("completed", False))

    adjustment = {
        "volume_multiplier": 1.0,
        "rest_adjustment_seconds": 0,
        "recommended_rest_seconds": 120,
        "replace_exercise": False,
        "next_session_focus": "keep_plan",
        "notes": [],
    }

    if not completed:
        adjustment["volume_multiplier"] = 0.8
        adjustment["next_session_focus"] = "restart_simpler"
        adjustment["notes"].append("Next session should be shorter and easier to complete.")

    if fatigue >= 8:
        adjustment["volume_multiplier"] = min(adjustment["volume_multiplier"], 0.75)
        adjustment["recommended_rest_seconds"] = 240 if fatigue >= 9 else 180
        adjustment["rest_adjustment_seconds"] = adjustment["recommended_rest_seconds"] - 120
        adjustment["next_session_focus"] = "reduce_fatigue"
        adjustment["notes"].append("Reduce total sets by about 25% for the next similar workout.")
    elif fatigue <= 3 and completed and pain_level <= 2:
        adjustment["notes"].append("Workout felt manageable. Consider a small load or rep increase next time.")

    if duration >= 90:
        adjustment["notes"].append("Shorten accessory work to keep sessions realistic.")

    if pain_level >= 5:
        adjustment["replace_exercise"] = True
        adjustment["next_session_focus"] = "substitute_painful_movement"
        adjustment["notes"].append("Replace or modify the painful movement before repeating this session.")

    if not adjustment["notes"]:
        adjustment["notes"].append("Keep the plan unchanged and focus on consistent execution.")

    adjustment["plan_split"] = plan.get("split", {}).get("split_name", "Unknown")
    return adjustment


def calculate_checkin_streak(checkin_dates: list[str], today: str | None = None) -> int:
    """Calculate the current consecutive-day check-in streak."""
    if not checkin_dates:
        return 0

    parsed_dates = {_parse_date(value) for value in checkin_dates}
    current = _parse_date(today) if today else date.today()

    streak = 0
    while current in parsed_dates:
        streak += 1
        current -= timedelta(days=1)
    return streak


def get_checkin_reward_status(checkin_dates: list[str], today: str | None = None) -> dict[str, Any]:
    """Return streak and supplement-lottery eligibility for workout check-ins."""
    parsed_dates = sorted({_parse_date(value) for value in checkin_dates})
    normalized_dates = [value.isoformat() for value in parsed_dates]
    current_day = _parse_date(today) if today else date.today()
    streak = calculate_checkin_streak(normalized_dates, today=current_day.isoformat())
    if streak == 0 and current_day not in parsed_dates and current_day - timedelta(days=1) in parsed_dates:
        streak = calculate_checkin_streak(normalized_dates, today=(current_day - timedelta(days=1)).isoformat())
    reward_tickets = streak // 7
    first_ticket_remaining = max(0, 7 - streak)
    cycle_progress = 7 if streak > 0 and streak % 7 == 0 else streak % 7

    return {
        "streak": streak,
        "eligible": reward_tickets > 0,
        "reward_tickets": reward_tickets,
        "days_until_lottery": first_ticket_remaining,
        "cycle_progress": cycle_progress,
        "cycle_goal": 7,
        "prizes": CHECKIN_REWARD_PRIZES,
        "message": "已获得补剂抽奖资格。" if reward_tickets > 0 else f"再打卡 {first_ticket_remaining} 天可获得补剂抽奖资格。",
    }


def summarize_progress_trend(measurements: list[dict[str, Any]]) -> dict[str, Any]:
    """Summarize simple progress from measurement entries."""
    if len(measurements) < 2:
        return {
            "status": "not_enough_data",
            "message": "Add at least two measurement entries to see a trend.",
        }

    sorted_entries = sorted(measurements, key=lambda item: item.get("date", ""))
    first = sorted_entries[0]
    last = sorted_entries[-1]
    weight_change = _optional_delta(first.get("weight_kg"), last.get("weight_kg"))
    waist_change = _optional_delta(first.get("waist_cm"), last.get("waist_cm"))
    body_fat_change = _optional_delta(first.get("body_fat_percent"), last.get("body_fat_percent"))

    return {
        "status": "ok",
        "entries": len(measurements),
        "weight_change_kg": weight_change,
        "waist_change_cm": waist_change,
        "body_fat_change_percent": body_fat_change,
        "message": _trend_message(weight_change, waist_change, body_fat_change),
    }


def get_knowledge_card(topic: str) -> dict[str, str]:
    """Return a short beginner education card."""
    cards = {
        "spot_reduction": {
            "title": "不能只瘦某一个部位",
            "content": "局部减脂是最常见的误区之一。你可以训练腹肌、手臂或腿让该部位肌肉更强，但脂肪下降主要由整体热量缺口决定。想让某个部位更好看，正确路径是全身减脂 + 目标肌肉训练 + 长期记录围度变化。",
        },
        "bmi_limits": {
            "title": "BMI 只适合粗略参考",
            "content": "健身老手肌肉量更高，BMI 可能把肌肉误判成超重。判断体型要同时看体重、腰围、体脂率估算、照片、力量表现和恢复状态。对老手来说，腰围趋势和体脂趋势通常比单个 BMI 数字更有意义。",
        },
        "full_body_vs_split": {
            "title": "新手也可以做简单分化",
            "content": "新手不一定只能做全身训练，但分化必须足够简单、固定、可重复。GymPath 的新手四分化重点不是炫技，而是让用户按顺序跟练，先学会热身、动作路线和目标肌肉感受，再逐步增加重量。",
        },
        "pain_rules": {
            "title": "疼痛不等于努力",
            "content": "肌肉酸胀、泵感和接近力竭的努力感可以是训练的一部分，但尖锐痛、放射痛、麻木、越来越痛、关节深处痛不是正常目标。出现这类信号时，应降重、缩短幅度、换动作或停止当天训练。",
        },
        "calorie_deficit": {
            "title": "减脂先看热量缺口",
            "content": "减脂不是只靠少吃某一种食物，而是让长期平均摄入低于消耗。碳水、脂肪和蛋白质都可以吃，关键是总热量、蛋白质足够、训练能坚持。极端节食往往让训练崩掉，也更难长期维持。",
        },
        "protein_target": {
            "title": "蛋白质是恢复底线",
            "content": "增肌和减脂都需要足够蛋白质。减脂期蛋白质更重要，因为它能帮助保留肌肉和提高饱腹感。实操上可以把蛋白分到 4-5 餐，每餐 20-40g，比一天只补一顿更容易执行。",
        },
        "carb_cycle": {
            "title": "高碳日不是放纵日",
            "content": "碳循环的核心是把更多碳水放在高强度训练日前后，把低碳日放在休息或轻训练日。高碳日不是随便吃，而是提高训练表现；低碳日也不是断碳，而是控制总量。",
        },
        "progressive_overload": {
            "title": "进步来自可记录的渐进",
            "content": "训练不是每次都练到崩溃，而是在动作质量稳定的前提下，让重量、次数、组数、控制能力或训练密度慢慢变好。只要能记录，就能判断自己是不是真的进步。",
        },
        "deload": {
            "title": "减载不是退步",
            "content": "当训练热情连续下降、睡眠变差、重量明显掉、关节不舒服时，减载一周反而能让你走得更远。减载可以降重量、砍组数或减少高强度动作，它的目的不是偷懒，而是恢复系统。",
        },
        "soreness_vs_injury": {
            "title": "酸痛和受伤要分开",
            "content": "延迟性酸痛通常是大面积、钝痛、活动后会缓解；受伤风险更像局部尖锐痛、关节痛、放射痛或越练越痛。新手最该学会的不是硬扛，而是判断今天该练、该改还是该停。",
        },
        "warmup": {
            "title": "热身是为了进入训练状态",
            "content": "有效热身不只是跑步出汗，而是让当天要练的关节、目标肌肉和动作模式准备好。练胸肩三头要做肩胛和肩袖激活，练腿要做髋、踝和膝的动态活动，再用正式动作逐步加重量。",
        },
        "restart_training": {
            "title": "停练后不要按巅峰期重启",
            "content": "间歇性训练者最容易高估自己。停练两周以上，前几次训练先降重量和组数，把动作手感、恢复和打卡节奏找回来。能持续重启，比一次练爆更重要。",
        },
        "supplements": {
            "title": "补剂不是基础的替代品",
            "content": "肌酸、乳清、咖啡因等补剂可以提高便利性或训练表现，但不能替代训练计划、蛋白质、睡眠和热量管理。预算有限时，先把饮食和训练执行稳定，再考虑补剂。",
        },
        "photo_tracking": {
            "title": "照片和围度能给你正反馈",
            "content": "体重每天波动很正常，单看体重容易焦虑。固定光线、固定角度、每周记录体重、腰围和体脂率估算，更容易看到真实趋势，也能帮助判断饮食计划是否需要调整。",
        },
    }
    return cards.get(
        topic,
        {
            "title": "Build the basics first",
            "content": "Train consistently, eat enough protein, sleep well, and adjust based on feedback.",
        },
    )


def main() -> dict[str, Any]:
    """Return a sample plan so `python project.py` demonstrates useful logic."""
    return generate_workout_plan(
        level="beginner",
        goal="muscle_gain",
        days_per_week=3,
        minutes_per_session=60,
    )


def _normalize_goal(goal: str) -> str:
    normalized = goal.lower().strip().replace("-", "_").replace(" ", "_")
    aliases = {
        "gain_muscle": "muscle_gain",
        "build_muscle": "muscle_gain",
        "strength": "strength_gain",
        "lose_fat": "fat_loss",
        "weight_loss": "fat_loss",
        "fitness": "general_fitness",
        "general": "general_fitness",
        "healthy": "health",
    }
    normalized = aliases.get(normalized, normalized)
    if normalized not in VALID_GOALS:
        raise ValueError(f"Unsupported goal: {goal}")
    return normalized


def _normalize_level(level: str) -> str:
    normalized = level.lower().strip().replace("-", "_").replace(" ", "_")
    aliases = {
        "new": "beginner",
        "novice": "beginner",
        "intermediate": "restarting",
        "inconsistent": "restarting",
        "restart": "restarting",
        "advanced": "experienced",
        "veteran": "experienced",
    }
    normalized = aliases.get(normalized, normalized)
    if normalized not in {"beginner", "restarting", "experienced"}:
        raise ValueError(f"Unsupported level: {level}")
    return normalized


def _macro_calories(carbs_g: int, protein_g: int, fat_g: int) -> int:
    return carbs_g * 4 + protein_g * 4 + fat_g * 9


def _calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> int:
    normalized_gender = gender.lower().strip()
    if normalized_gender in {"female", "woman", "f"}:
        value = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
    else:
        value = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    return round(value)


def _training_intensity_factor(training_intensity: str, level: str, gender: str) -> int:
    normalized = training_intensity.lower().strip()
    if normalized in {"beginner_or_female", "beginner", "female", "low"}:
        return 5
    if normalized in {"fitness_enthusiast", "enthusiast", "moderate"}:
        return 8
    if normalized in {"high_intensity", "high", "hard"}:
        return 10

    normalized_level = _normalize_level(level)
    normalized_gender = gender.lower().strip()
    if normalized_gender in {"female", "woman", "f"} or normalized_level == "beginner":
        return 5
    if normalized_level == "experienced":
        return 8
    return 8


def _training_intensity_label(intensity: int) -> str:
    if intensity <= 5:
        return "新手或女生训练强度"
    if intensity >= 10:
        return "大强度训练"
    return "健身爱好者训练强度"


MIN_REST_SECONDS = 120
LONG_REST_SECONDS = 180

HEAVY_REST_EXERCISES = {
    "Back Squat",
    "Barbell Bench Press",
    "Deadlift",
    "Pull-up",
    "Romanian Deadlift",
    "Single-Leg Dumbbell Romanian Deadlift",
    "Walking Lunge",
    "Rotational Lunge",
    "Leg Press",
    "Incline Machine Chest Press",
    "Barbell Overhead Press",
}


def _recommended_rest_seconds(name: str, requested_rest_seconds: int) -> int:
    rest_seconds = max(int(requested_rest_seconds), MIN_REST_SECONDS)
    if name in HEAVY_REST_EXERCISES:
        return max(rest_seconds, LONG_REST_SECONDS)
    return rest_seconds


def _exercise(
    name: str,
    *,
    sets_override: int | None = None,
    reps_override: str | None = None,
    rest_override: int | None = None,
    note_override: str | None = None,
    phase: str | None = None,
    teaching_video: dict[str, str] | None = None,
) -> dict[str, Any]:
    library = {
        "Cable Fly": ("4", "12", 60, "Chest", "Keep shoulders down and squeeze the chest without shrugging."),
        "Goblet Squat": ("3", "8-12", 90, "Legs", "Keep torso tall and knees tracking over toes."),
        "Dumbbell Bench Press": ("3", "8-12", 90, "Chest", "Use a stable shoulder position and controlled range."),
        "Lat Pulldown": ("3", "10-12", 75, "Back", "Pull elbows down and avoid shrugging."),
        "Romanian Deadlift": ("3", "8-10", 120, "Hamstrings", "Hinge at hips and keep the back neutral."),
        "Seated Cable Row": ("3", "10-12", 75, "Back", "Drive elbows back and pause briefly."),
        "Single-Arm Seated Cable Row": ("4", "12", 75, "Back", "Keep torso quiet and pull the elbow toward the hip."),
        "Close-Grip Seated Cable Row": ("4", "12", 75, "Back", "Pull through the elbows and pause without leaning back."),
        "Straight-Arm Pulldown": ("4", "12-15", 60, "Lats", "Keep arms nearly straight and drive the bar toward the thighs."),
        "Leg Press": ("3", "10-15", 90, "Legs", "Use a controlled depth without hip rounding."),
        "Machine Chest Press": ("3", "8-12", 90, "Chest", "Keep shoulder blades stable."),
        "Incline Machine Chest Press": ("4", "12", 90, "Upper Chest", "Keep shoulders packed and press along the machine path."),
        "Dumbbell Shoulder Press": ("3", "8-12", 90, "Shoulders", "Press smoothly without leaning back."),
        "Seated Overhead Press": ("3", "8-12", 120, "Shoulders", "Press from a stable seated position."),
        "Barbell Overhead Press": ("4", "12", 120, "Shoulders", "Brace hard and keep the bar path close."),
        "Pendlay Row": ("5", "5", 150, "Back", "Reset each rep from the floor."),
        "Chin-up": ("3", "5-8", 120, "Back", "Use a controlled full range."),
        "Overhead Cable Triceps Extension": ("4", "12", 60, "Triceps", "Keep elbows pointed forward and stretch the long head under control."),
        "Cable Triceps Pressdown": ("2", "10-15", 60, "Arms", "Keep elbows pinned and control the return."),
        "Dumbbell Curl": ("2", "10-15", 60, "Arms", "Avoid swinging and squeeze at the top."),
        "Cable Curl": ("4", "12", 60, "Biceps", "Keep elbows still and control the return."),
        "Barbell Curl": ("4", "12", 60, "Biceps", "Avoid hip swing and keep wrists stacked."),
        "Back Squat": ("4", "5-8", 150, "Legs", "Brace before each rep and keep balance mid-foot."),
        "Barbell Bench Press": ("4", "5-8", 150, "Chest", "Set shoulder blades and use a consistent touch point."),
        "Deadlift": ("3", "3-5", 180, "Posterior Chain", "Keep the bar close and brace hard."),
        "Pull-up": ("3", "6-10", 120, "Back", "Use full control and avoid swinging."),
        "Incline Dumbbell Press": ("3", "8-12", 90, "Upper Chest", "Use a comfortable angle and controlled reps."),
        "Lateral Raise": ("3", "12-20", 45, "Shoulders", "Lead with elbows and avoid heavy swinging."),
        "Seated Reverse Fly": ("4", "12", 60, "Rear Delts", "Open from the rear delts and avoid shrugging."),
        "Cable Face Pull": ("4", "10", 60, "Rear Delts", "Pull toward the face with elbows high and external rotation."),
        "Front Raise": ("4", "10", 60, "Front Delts", "Raise under control without leaning back."),
        "Barbell Front Raise": ("3", "10-12", 60, "Front Delts", "Raise under control."),
        "Machine Fly": ("3", "10-12", 75, "Chest", "Use a stable machine path."),
        "Shoulder Stability Drill": ("3", "12-15", 60, "Shoulders", "Use light controlled reps."),
        "Back Extension": ("3", "12-15", 75, "Posterior Chain", "Use a controlled range."),
        "Wall Sit": ("3", "45-60 sec", 60, "Legs", "Hold a stable knee angle."),
        "Hip Adduction Machine / Copenhagen Plank": ("4", "15 or 20-30 sec", 60, "Adductors", "Choose the machine or Copenhagen plank based on control and comfort."),
        "Single-Leg Dumbbell Romanian Deadlift": ("3", "12 each side", 90, "Hamstrings", "Hinge on one leg and keep hips square."),
        "Walking Lunge": ("3", "10 each side", 90, "Legs", "Step long enough to stay balanced."),
        "Rotational Lunge": ("3", "10 each side", 75, "Legs", "Rotate with control and keep the front knee tracking well."),
        "Standing Calf Raise": ("3", "15", 60, "Calves", "Pause at the top and control the stretch at the bottom."),
        "Plank": ("3", "30-60 sec", 45, "Core", "Keep ribs down and glutes lightly squeezed."),
        "Push-up": ("3", "6-15", 60, "Chest", "Keep a straight line and control the bottom."),
        "Bodyweight Squat": ("3", "10-20", 60, "Legs", "Move smoothly and keep feet planted."),
        "Incline Push-up": ("4", "near failure", 120, "Upper Chest", "Elevate the feet or use a bed/chair setup based on control."),
        "Rear Delt Bottle Raise": ("4", "near failure", 120, "Rear Delts", "Use bottles or light dumbbells and stop when the rear delts lose control."),
        "Bottle Lateral Raise": ("4", "near failure", 120, "Side Delts", "Raise through the elbows with a light household load."),
        "Bottle Front Raise": ("4", "near failure", 120, "Front Delts", "Use a neutral grip if the shoulder feels stressed."),
        "Bench Dips": ("4", "about 24", 120, "Triceps", "Use a chair or bench and adjust foot position for difficulty."),
        "Kneeling Ab Wheel": ("4", "near failure", 120, "Core / Back", "Use a kneeling setup and keep range controllable."),
        "Bent-Over Dumbbell Row": ("4", "until back has a clear pump", 120, "Back", "Use dumbbells, bottles, or another safe household load."),
        "Arm-Reach Crunch": ("4", "near failure", 120, "Abs", "Reach arms upward and keep the movement small enough to protect the low back."),
        "Single-Leg Hamstring Activation": ("4", "10 each side", 120, "Hamstrings", "Use a light object and focus on the back-side stretch."),
        "Chair Hip Hinge": ("4", "15-16 each side", 120, "Glutes / Hips", "Use a chair or wall for support and keep tension in the hip."),
        "Groin Mobility Split Squat": ("3", "10-12 each side", 120, "Hips / Adductors", "Use a small range at first and build hip comfort."),
        "Elevated Calf Raise": ("4", "20", 120, "Calves", "Elevate the forefoot and use slow lowering with a quick rise."),
        "Dips": ("4", "12 or near failure", 120, "Chest / Triceps", "Use assistance if needed."),
        "Lying Triceps Extension": ("4", "15", 120, "Triceps", "Use a controllable stretch."),
        "Y-Raise Lateral Raise": ("3", "10 + 10 to failure", 120, "Side Delts", "Use light dumbbells."),
        "Single-Arm Cable Pulldown": ("4", "12 + 10 to failure + 5", 120, "Lats", "Use one side at a time."),
        "Neutral-Grip Pulldown": ("4", "12-8", 120, "Back", "Choose a load you can control."),
        "Single-Arm Machine Row": ("4", "10", 120, "Back", "Train each side evenly."),
        "Open-Elbow Seated Row": ("4", "15-12", 120, "Upper Back", "Open the elbows to bias upper back."),
        "Bulgarian Split Squat": ("4", "10", 120, "Glutes / Quads", "Use support if balance limits output."),
        "Front Squat": ("3", "15", 150, "Quads", "Keep the load conservative."),
        "Straight-Leg Barbell Bench Press": ("4", "8", 150, "Chest", "Use the requested percent-based load."),
        "Incline Barbell Bench Press": ("4", "8", 150, "Upper Chest", "Use steady bar speed."),
        "Seal Row": ("4", "10", 120, "Back", "Use a chest-supported setup."),
        "Reverse-Grip Machine Row": ("4", "10", 120, "Back", "Keep the handle close to the body."),
        "Reverse-Grip Lat Pulldown": ("4", "10-13", 120, "Lats", "Use a controlled grip."),
        "Bent-Over Dumbbell Reverse Fly": ("4", "12", 120, "Rear Delts", "Use a light load."),
        "Reverse Pec Deck": ("4", "10-12", 120, "Rear Delts", "Use a controlled machine path."),
        "Incline Bench Lateral Raise": ("4", "10", 120, "Side Delts", "Use the bench to limit cheating."),
        "Seated Lateral Raise": ("4", "12-15", 120, "Side Delts", "Keep the load strict."),
        "Hammer Dumbbell Curl": ("4", "10", 120, "Biceps / Brachialis", "Use neutral grip."),
        "Incline Barbell Triceps Extension": ("4", "10", 120, "Triceps", "Use a controllable stretch."),
        "Cable Crunch": ("4", "12-15", 120, "Core", "Curl through the abs."),
        "Plate Crunch": ("4", "12-15", 120, "Core", "Hold the plate under control."),
        "Deficit Deadlift": ("3", "3", 180, "Posterior Chain", "Use the programmed percentage."),
        "T-Bar Row": ("4", "10", 120, "Back", "Keep reps controlled."),
        "Kneeling Cable Crunch": ("4", "15", 120, "Core", "Use a stable kneeling setup."),
        "Side Cable Crunch": ("4", "12", 120, "Core", "Train each side evenly."),
    }
    sets, reps, rest, muscle, notes = library[name]
    selected_video = teaching_video or _teaching_video(name)
    requested_rest = rest_override if rest_override is not None else rest
    rest_seconds = _recommended_rest_seconds(name, int(requested_rest))
    exercise = {
        "name": name,
        "sets": sets_override if sets_override is not None else int(sets),
        "reps": reps_override or reps,
        "rest_seconds": rest_seconds,
        "target_muscle": muscle,
        "notes": note_override or notes,
        "teaching_url": selected_video["url"],
        "substitutions": _default_substitutions(name),
    }
    if phase:
        exercise["phase"] = phase
    return exercise


def _muscle_gain_workout_plan(
    *,
    level: str,
    days_per_week: int,
    minutes_per_session: int,
    muscle_gain_plan_type: str,
) -> dict[str, Any]:
    selected = _normalize_muscle_gain_plan_type(muscle_gain_plan_type, level)
    if selected == "tan_chengyi_beginner_follow":
        split = {
            "split_name": "Tan Chengyi Beginner Follow Along",
            "days": 4,
            "reason": "把原来的新手增肌计划命名为谭成义新手跟练，用固定四次训练降低决策成本。",
            "notes": ["按视频顺序执行。", "下肢后休息一天。", "先学会动作顺序，再逐步增加重量。"],
        }
        schedule = _beginner_four_day_schedule(minutes_per_session)
    elif selected == "tan_kaisheng_three_split":
        split = {
            "split_name": "Tan Chengyi Kaisheng Three-Day Split",
            "days": 3,
            "reason": "三分化线性增肌计划：胸肩三头、背后束二头、臀腿后链，适合想更像健身房训练的人。",
            "notes": ["每周按三天循环。", "先完成规定组次，再考虑加重量。", "动作感受差时优先替换同部位动作。"],
        }
        schedule = _tan_kaisheng_three_split_schedule(minutes_per_session)
    else:
        split = {
            "split_name": "Orange Three-Phase Hypertrophy",
            "days": 5,
            "reason": "橙子增肌计划按肌肥大、增肌增力、增力三个阶段推进，适合想用周期训练突破的人。",
            "notes": ["先跑完第一阶段三周。", "第二阶段提高卧推和深蹲强度。", "第三阶段用更高百分比转化力量。"],
        }
        schedule = _orange_hypertrophy_schedule(minutes_per_session)

    return {
        "level": level,
        "goal": "muscle_gain",
        "days_per_week": split["days"],
        "minutes_per_session": minutes_per_session,
        "split": split,
        "muscle_gain_plan": _muscle_gain_plan_brief(selected),
        "weekly_schedule": schedule,
        "safety_note": "GymPath gives fitness education, not medical diagnosis. Stop for sharp or worsening pain.",
    }


def _normalize_muscle_gain_plan_type(plan_type: str, level: str) -> str:
    normalized = plan_type.lower().strip().replace("-", "_").replace(" ", "_")
    aliases = {
        "auto": "",
        "beginner": "tan_chengyi_beginner_follow",
        "tan_chengyi": "tan_chengyi_beginner_follow",
        "tan_chengyi_beginner": "tan_chengyi_beginner_follow",
        "three_split": "tan_kaisheng_three_split",
        "tan_kaisheng": "tan_kaisheng_three_split",
        "tan_chengyi_kaisheng": "tan_kaisheng_three_split",
        "orange": "orange_hypertrophy",
        "orange_bulk": "orange_hypertrophy",
    }
    normalized = aliases.get(normalized, normalized)
    if not normalized:
        if level == "beginner":
            return "tan_chengyi_beginner_follow"
        return "tan_kaisheng_three_split"
    if normalized not in {"tan_chengyi_beginner_follow", "tan_kaisheng_three_split", "orange_hypertrophy"}:
        raise ValueError(f"Unsupported muscle gain plan type: {plan_type}")
    return normalized


def _muscle_day(
    *,
    day: str,
    focus: str,
    exercises: list[tuple[str, str, int, str, int]],
    session_note: str,
    warmup: list[str],
    learning_points: list[str] | None = None,
    minutes_target: int,
) -> dict[str, Any]:
    built_exercises = [
        _exercise(
            name,
            sets_override=sets,
            reps_override=reps,
            rest_override=rest,
            phase=phase,
        )
        for phase, name, sets, reps, rest in exercises
    ]
    day_plan = {
        "day": day,
        "focus": focus,
        "warmup": warmup,
        "exercises": built_exercises,
        "rest_policy": _session_rest_policy(built_exercises),
        "session_note": session_note,
        "minutes_target": minutes_target,
    }
    if learning_points:
        day_plan["learning_points"] = learning_points
    return day_plan


def _program_rest_day(day: str, note: str) -> dict[str, Any]:
    return {
        "day": day,
        "focus": "恢复日",
        "is_rest_day": True,
        "rest_note": note,
        "session_note": "Recovery day: no hard training.",
        "warmup": [],
        "exercises": [],
    }


def _tan_kaisheng_three_split_schedule(minutes_per_session: int) -> list[dict[str, Any]]:
    return [
        _muscle_day(
            day="训练日 1",
            focus="胸 + 三角肌中束 + 三头肌",
            warmup=["5 min upper-body cardio", "Band chest openers", "Bench press ramp-up sets"],
            session_note="三分化线性训练：胸、三角肌中束、三头肌。卧推先热身，再进入正式递减次数组。",
            learning_points=["卧推完成规定次数后，下次优先小幅加重量。", "侧平举用力竭组补足三角肌中束刺激。"],
            minutes_target=minutes_per_session,
            exercises=[
                ("主项", "Barbell Bench Press", 4, "15热身 + 12-10-8正式", 150),
                ("主项", "Incline Dumbbell Press", 4, "12", 120),
                ("主项", "Dips", 4, "12或力竭", 120),
                ("辅项", "Lying Triceps Extension", 4, "15", 120),
                ("辅项", "Y-Raise Lateral Raise", 3, "10 + 10力竭", 120),
            ],
        ),
        _muscle_day(
            day="训练日 2",
            focus="背 + 三角肌后束 + 二头肌",
            warmup=["5 min easy rower", "Straight-arm pulldown warm-up", "Light cable row ramp-up sets"],
            session_note="三分化线性训练：背、后束、二头。先用单侧下拉找背阔，再进入划船和弯举。",
            learning_points=["背部训练先找目标肌肉，再加重量。", "划船和下拉都完成后，再用弯举补二头。"],
            minutes_target=minutes_per_session,
            exercises=[
                ("主项", "Single-Arm Cable Pulldown", 4, "12 + 10力竭 + 5", 120),
                ("主项", "Neutral-Grip Pulldown", 4, "12-8", 120),
                ("主项", "Single-Arm Machine Row", 4, "10", 120),
                ("主项", "Open-Elbow Seated Row", 4, "15-12", 120),
                ("辅项", "Cable Curl", 3, "12", 120),
            ],
        ),
        _muscle_day(
            day="训练日 3",
            focus="臀 + 股四头肌 + 腘绳肌",
            warmup=["5 min incline walk or bike", "Hip circles", "Bodyweight lunges", "Bodyweight squat ramp-up"],
            session_note="三分化线性训练：臀、股四头肌、腘绳肌。以单腿控制和髋膝稳定为主。",
            learning_points=["单腿动作先保证平衡。", "硬拉类动作放在能控制后链张力的重量。"],
            minutes_target=minutes_per_session,
            exercises=[
                ("主项", "Single-Leg Dumbbell Romanian Deadlift", 4, "12", 120),
                ("主项", "Bulgarian Split Squat", 4, "10", 120),
                ("主项", "Front Squat", 3, "15", 150),
                ("主项", "Romanian Deadlift", 3, "12", 150),
                ("辅项", "Back Extension", 3, "8", 120),
            ],
        ),
    ]


def _orange_hypertrophy_schedule(minutes_per_session: int) -> list[dict[str, Any]]:
    phase_one = [
        _muscle_day(
            day="第一阶段 第一天",
            focus="胸",
            warmup=["5 min upper-body cardio", "Band chest openers", "Bench press ramp-up sets"],
            session_note="第一阶段肌肥大训练：胸部，连续三周，注意控制动作和重量。",
            learning_points=["第一阶段以70%左右重量完成容量。", "每组都保留稳定动作质量。"],
            minutes_target=minutes_per_session,
            exercises=[
                ("第一阶段", "Straight-Leg Barbell Bench Press", 4, "8（70%）", 150),
                ("第一阶段", "Incline Barbell Bench Press", 4, "8", 150),
                ("第一阶段", "Incline Dumbbell Press", 4, "10", 120),
                ("第一阶段", "Machine Fly", 4, "10", 120),
            ],
        ),
        _muscle_day(
            day="第一阶段 第二天",
            focus="背部",
            warmup=["5 min easy rower", "Straight-arm pulldown warm-up", "Light row ramp-up sets"],
            session_note="第一阶段肌肥大训练：背部，优先稳定划船和下拉容量。",
            minutes_target=minutes_per_session,
            exercises=[
                ("第一阶段", "Seal Row", 4, "10", 120),
                ("第一阶段", "Reverse-Grip Machine Row", 4, "10", 120),
                ("第一阶段", "Neutral-Grip Pulldown", 4, "10-12", 120),
                ("第一阶段", "Reverse-Grip Lat Pulldown", 4, "10-13", 120),
            ],
        ),
        _muscle_day(
            day="第一阶段 第三天",
            focus="肩膀",
            warmup=["5 min upper-body cardio", "Band external rotations", "Face pull warm-up set"],
            session_note="第一阶段肌肥大训练：肩膀，注意控制，不追求甩大重量。",
            minutes_target=minutes_per_session,
            exercises=[
                ("第一阶段", "Bent-Over Dumbbell Reverse Fly", 4, "12", 120),
                ("第一阶段", "Reverse Pec Deck", 4, "10-12", 120),
                ("第一阶段", "Incline Bench Lateral Raise", 4, "10", 120),
                ("第一阶段", "Seated Lateral Raise", 4, "12-15", 120),
            ],
        ),
        _program_rest_day("第一阶段 第四天", "休息一天，准备胸和手臂训练。"),
        _muscle_day(
            day="第一阶段 第五天",
            focus="胸 + 手臂",
            warmup=["5 min upper-body cardio", "Bench press ramp-up sets", "Light curl and pressdown warm-up"],
            session_note="第一阶段肌肥大训练：胸和手臂，卧推按极限72.5%左右安排。",
            minutes_target=minutes_per_session,
            exercises=[
                ("第一阶段", "Straight-Leg Barbell Bench Press", 4, "8（极限72.5%）", 150),
                ("第一阶段", "Hammer Dumbbell Curl", 4, "10", 120),
                ("第一阶段", "Incline Barbell Triceps Extension", 4, "10", 120),
                ("第一阶段", "Barbell Curl", 4, "10", 120),
                ("第一阶段", "Cable Triceps Pressdown", 4, "10", 120),
            ],
        ),
        _muscle_day(
            day="第一阶段 第六天",
            focus="腿 + 核心",
            warmup=["5 min incline walk or bike", "Hip circles", "Bodyweight squat ramp-up"],
            session_note="第一阶段肌肥大训练：深蹲和罗马尼亚硬拉按70%左右重量完成容量。",
            minutes_target=minutes_per_session,
            exercises=[
                ("第一阶段", "Back Squat", 4, "8（70%）", 150),
                ("第一阶段", "Romanian Deadlift", 4, "8", 150),
                ("核心", "Cable Crunch", 4, "12", 120),
                ("核心", "Plate Crunch", 4, "12-15", 120),
            ],
        ),
        _program_rest_day("第一阶段 第七天", "休息一天，完成第一阶段循环。"),
    ]

    phase_two = [
        _muscle_day(
            day="第二阶段 第一天",
            focus="胸 + 肩中束",
            warmup=["5 min upper-body cardio", "Bench press ramp-up sets", "Lateral raise warm-up set"],
            session_note="第二阶段增肌增力：卧推先做83%低次数，再做72.5%容量组。",
            learning_points=["卧推专项第一周从83%开始。", "后续每周按计划提高百分比。"],
            minutes_target=minutes_per_session,
            exercises=[
                ("第二阶段", "Barbell Bench Press", 3, "4（83%）", 180),
                ("第二阶段", "Barbell Bench Press", 3, "7（72.5%）", 150),
                ("第二阶段", "Lateral Raise", 4, "10-12", 120),
                ("第二阶段", "Seated Lateral Raise", 4, "10-12", 120),
            ],
        ),
        _muscle_day(
            day="第二阶段 第二天",
            focus="背部 + 肩后束",
            warmup=["5 min easy rower", "Hip hinge ramp-up", "Light pulldown warm-up"],
            session_note="第二阶段增肌增力：超程硬拉从65%开始，每次增加5公斤。",
            minutes_target=minutes_per_session,
            exercises=[
                ("第二阶段", "Deficit Deadlift", 3, "3（65%，每次+5kg）", 180),
                ("第二阶段", "T-Bar Row", 4, "10", 120),
                ("第二阶段", "Neutral-Grip Pulldown", 4, "10", 120),
                ("第二阶段", "Bent-Over Dumbbell Reverse Fly", 4, "12", 120),
                ("第二阶段", "Reverse Pec Deck", 4, "10", 120),
            ],
        ),
        _program_rest_day("第二阶段 第三天", "休息一天，保留神经和关节恢复空间。"),
        _muscle_day(
            day="第二阶段 第四天",
            focus="胸 + 手臂",
            warmup=["5 min upper-body cardio", "Bench press ramp-up sets", "Arm warm-up sets"],
            session_note="第二阶段增肌增力：第二个卧推训练日提高到84%，再补手臂容量。",
            minutes_target=minutes_per_session,
            exercises=[
                ("第二阶段", "Barbell Bench Press", 3, "4（84%）", 180),
                ("第二阶段", "Barbell Bench Press", 3, "7（72.5%）", 150),
                ("第二阶段", "Hammer Dumbbell Curl", 4, "10", 120),
                ("第二阶段", "Incline Barbell Triceps Extension", 4, "10", 120),
                ("第二阶段", "Cable Triceps Pressdown", 4, "12", 120),
            ],
        ),
        _muscle_day(
            day="第二阶段 第五天",
            focus="腿 + 核心",
            warmup=["5 min incline walk or bike", "Bodyweight squat ramp-up", "Cable crunch warm-up set"],
            session_note="第二阶段增肌增力：深蹲先做83%低次数，再做72.5%容量组。",
            minutes_target=minutes_per_session,
            exercises=[
                ("第二阶段", "Back Squat", 3, "4（83%）", 180),
                ("第二阶段", "Back Squat", 3, "7（72.5%）", 150),
                ("核心", "Kneeling Cable Crunch", 4, "15", 120),
                ("核心", "Plate Crunch", 4, "12-15", 120),
            ],
        ),
        _program_rest_day("第二阶段 第六至七天", "休息2天。卧推专项：第1-3周83%-88%，第4周减载，第5-7周90%-95%，第8周减载后测极限。"),
    ]

    phase_three = [
        _muscle_day(
            day="第三阶段 第一天",
            focus="胸",
            warmup=["5 min upper-body cardio", "Bench press ramp-up sets", "Incline press warm-up set"],
            session_note="第三阶段增力：卧推进入90%低次数，再用78%回补容量。",
            learning_points=["卧推专项从87%开始，每周增加1.5%。", "后半程进入单次冲刺前必须安排减载。"],
            minutes_target=minutes_per_session,
            exercises=[
                ("第三阶段", "Barbell Bench Press", 3, "2（90%）", 180),
                ("第三阶段", "Barbell Bench Press", 3, "5（78%）", 150),
                ("第三阶段", "Incline Dumbbell Press", 3, "8", 120),
                ("第三阶段", "Seated Lateral Raise", 3, "10-12", 120),
            ],
        ),
        _muscle_day(
            day="第三阶段 第二天",
            focus="背部 + 后束",
            warmup=["5 min easy rower", "Hip hinge ramp-up", "Light row warm-up sets"],
            session_note="第三阶段增力：硬拉和划船维持高质量输出，后束补容量。",
            minutes_target=minutes_per_session,
            exercises=[
                ("第三阶段", "Deficit Deadlift", 3, "3", 180),
                ("第三阶段", "T-Bar Row", 4, "10", 120),
                ("第三阶段", "Neutral-Grip Pulldown", 4, "10", 120),
                ("第三阶段", "Reverse Pec Deck", 4, "12", 120),
            ],
        ),
        _program_rest_day("第三阶段 第三天", "休息一天，准备第二个卧推训练日。"),
        _muscle_day(
            day="第三阶段 第四天",
            focus="胸 + 手臂",
            warmup=["5 min upper-body cardio", "Bench press ramp-up sets", "Arm warm-up sets"],
            session_note="第三阶段增力：第二个卧推日继续高强度，手臂只做必要容量。",
            minutes_target=minutes_per_session,
            exercises=[
                ("第三阶段", "Barbell Bench Press", 3, "2（90%）", 180),
                ("第三阶段", "Barbell Bench Press", 3, "5", 150),
                ("第三阶段", "Barbell Curl", 4, "10", 120),
                ("第三阶段", "Cable Triceps Pressdown", 4, "12", 120),
            ],
        ),
        _muscle_day(
            day="第三阶段 第五天",
            focus="腿 + 核心",
            warmup=["5 min incline walk or bike", "Bodyweight squat ramp-up", "Core warm-up"],
            session_note="第三阶段增力：深蹲用83%低次数和78%回补容量。",
            minutes_target=minutes_per_session,
            exercises=[
                ("第三阶段", "Back Squat", 3, "2（83%）", 180),
                ("第三阶段", "Back Squat", 3, "5（78%）", 150),
                ("核心", "Kneeling Cable Crunch", 4, "15", 120),
                ("核心", "Side Cable Crunch", 4, "12", 120),
            ],
        ),
        _program_rest_day("第三阶段 第六至七天", "休息2天。卧推专项：第1-3周87%-94.5%，第4周减载，第5-7周97.5%-102.5%，第8周测极限后减载。"),
    ]

    return phase_one + phase_two + phase_three


def _muscle_gain_plan_brief(plan_type: str) -> dict[str, Any]:
    briefs = {
        "tan_chengyi_beginner_follow": {
            "title": "谭成义新手跟练",
            "audience": "刚开始增肌、需要直接照视频练、不想自己排计划的新手。",
            "source_basis": "原新手四分化计划重命名为谭成义新手跟练。",
            "logic_points": ["固定四次训练降低选择成本。", "胸肩三头、背二头、下肢、肩手臂按顺序推进。", "下肢后插入休息日。"],
            "progression_rules": ["先完成视频动作顺序。", "动作稳定后再小幅加重量。", "训练反馈太累时减少组数或延长周期。"],
            "warnings": ["明显疼痛时不要硬顶。", "新手先学动作，不把重量当成唯一目标。"],
        },
        "tan_kaisheng_three_split": {
            "title": "谭成义+凯圣王三分化",
            "audience": "想进入健身房分化训练、追求增肌和线性进步的用户。",
            "source_basis": "来自用户提供的视频总结：三分化线性训练计划。",
            "logic_points": ["训练日1练胸、三角肌中束、三头。", "训练日2练背、三角肌后束、二头。", "训练日3练臀、股四头肌、腘绳肌。"],
            "progression_rules": ["每周循环三天。", "规定组次能稳定完成后再加重量。", "单侧动作左右都要完成同样质量。"],
            "warnings": ["双杠臂屈伸可退阶。", "力竭组只放在计划指定动作上，不要每个动作都硬力竭。"],
        },
        "orange_hypertrophy": {
            "title": "橙子增肌计划",
            "audience": "已经能稳定训练，想用阶段化计划同时提升维度和力量的人。",
            "source_basis": "来自用户提供的视频总结：三阶段力量训练计划。",
            "logic_points": ["第一阶段三周肌肥大。", "第二阶段三周增肌增力。", "第三阶段两周增力。", "卧推专项按百分比逐周推进并安排减载。"],
            "progression_rules": ["第一阶段使用70%-72.5%左右容量。", "第二阶段卧推从83%推进到88%，后续减载再冲90%-95%。", "第三阶段从87%双次推进，后续进入单次高百分比。"],
            "warnings": ["百分比训练必须基于真实可控极限，不要虚报1RM。", "第4周和第8周减载不能省。", "状态崩盘时先减载。"],
        },
    }
    return briefs[plan_type]


def _strength_workout_plan(
    *,
    level: str,
    days_per_week: int,
    minutes_per_session: int,
    strength_plan_type: str,
) -> dict[str, Any]:
    selected = _normalize_strength_plan_type(strength_plan_type, level)
    if selected == "beginner_ab_linear":
        split = {
            "split_name": "Beginner AB Linear Strength",
            "days": min(max(days_per_week, 2), 4),
            "reason": "小白先用 A/B 轮换学习深蹲、卧推、硬拉、实力推，练一休一，动作质量优先于重量。",
            "notes": ["从空杆开始。", "完成标准后线性加重。", "动作质量是上重量的前提。"],
        }
        schedule = _beginner_ab_strength_schedule(split["days"])
        strength_plan = _strength_plan_brief("beginner_ab_linear")
    elif selected == "advanced_linear_5x5":
        split = {
            "split_name": "Advanced Linear Strength",
            "days": min(max(days_per_week, 3), 5),
            "reason": "老手或重训者用 70% 1RM 起步、每周线性递增，并用轻训日和减载管理疲劳。",
            "notes": ["每周至少两次主项。", "一次正常推进，一次轻训。", "疲劳上来先砍三小项。"],
        }
        schedule = _advanced_linear_strength_schedule(split["days"])
        strength_plan = _strength_plan_brief("advanced_linear_5x5")
    else:
        split = {
            "split_name": "Universal 5x5 Strength Split",
            "days": min(max(days_per_week, 3), 6),
            "reason": "5x5 兼顾力量与肌肥大，用推、拉、蹲三分化覆盖主项与辅助训练。",
            "notes": ["储备周 RPE7-8。", "转化周 RPE8-9.5。", "每次最多加 2.5kg。"],
        }
        schedule = _universal_5x5_strength_schedule(split["days"])
        strength_plan = _strength_plan_brief("universal_5x5_split")

    return {
        "level": level,
        "goal": "strength_gain",
        "days_per_week": split["days"],
        "minutes_per_session": minutes_per_session,
        "split": split,
        "strength_plan": strength_plan,
        "weekly_schedule": schedule,
        "safety_note": "力量训练需要动作学习。明显疼痛、动作失控或恢复崩盘时，应停止硬顶并寻求合格教练帮助。",
    }


def _normalize_strength_plan_type(strength_plan_type: str, level: str) -> str:
    normalized = strength_plan_type.lower().strip().replace("-", "_").replace(" ", "_")
    aliases = {
        "auto": "",
        "beginner": "beginner_ab_linear",
        "beginner_ab": "beginner_ab_linear",
        "ab_linear": "beginner_ab_linear",
        "advanced": "advanced_linear_5x5",
        "advanced_linear": "advanced_linear_5x5",
        "linear_5x5": "advanced_linear_5x5",
        "universal": "universal_5x5_split",
        "universal_5x5": "universal_5x5_split",
        "five_by_five": "universal_5x5_split",
    }
    normalized = aliases.get(normalized, normalized)
    if not normalized:
        if level == "beginner":
            return "beginner_ab_linear"
        if level == "experienced":
            return "advanced_linear_5x5"
        return "universal_5x5_split"
    if normalized not in {"beginner_ab_linear", "advanced_linear_5x5", "universal_5x5_split"}:
        raise ValueError(f"Unsupported strength plan type: {strength_plan_type}")
    return normalized


def _strength_exercise(
    name: str,
    sets: int,
    reps: str,
    *,
    phase: str = "主项",
    rest: int = 180,
    note: str = "",
) -> dict[str, Any]:
    exercise = _exercise(name, sets_override=sets, reps_override=reps, rest_override=rest, note_override=note, phase=phase)
    if note:
        exercise["strength_note"] = note
    return exercise


def _strength_day(day: str, focus: str, exercises: list[dict[str, Any]], session_note: str, learning_points: list[str]) -> dict[str, Any]:
    return {
        "day": day,
        "focus": focus,
        "warmup": _warmup_for_focus(focus),
        "exercises": exercises,
        "rest_policy": _session_rest_policy(exercises),
        "session_note": session_note,
        "learning_points": learning_points,
    }


def _beginner_ab_strength_schedule(days: int) -> list[dict[str, Any]]:
    templates = [
        (
            "A轮：深蹲 + 卧推 + 硬拉",
            [
                _strength_exercise("Back Squat", 5, "5", note="从空杆开始；完成 5x5 后，第 5 组能做 7 次再加重。"),
                _strength_exercise("Barbell Bench Press", 5, "5", note="上肢加重标准为 2.5kg。"),
                _strength_exercise("Deadlift", 3, "5", note="硬拉 3x5；平台期不要简单套 5x8，单独降低疲劳。"),
            ],
            "A轮强调深蹲、卧推、硬拉的基础动作模式；训练后休息一天。",
        ),
        (
            "B轮：深蹲 + 实力推 + 硬拉",
            [
                _strength_exercise("Back Squat", 5, "5", note="下肢加重标准为 5kg。"),
                _strength_exercise("Barbell Overhead Press", 5, "5", note="上肢加重标准为 2.5kg。"),
                _strength_exercise("Deadlift", 3, "5", note="硬拉保持低容量高质量。"),
            ],
            "B轮用实力推补齐垂直推力量；A/B 轮换，练一休一。",
        ),
    ]
    schedule = []
    for index in range(days):
        focus, exercises, note = templates[index % 2]
        schedule.append(
            _strength_day(
                f"Day {index + 1}",
                focus,
                exercises,
                note,
                ["动作质量优先于训练重量。", "22法则：5x5完成后，第五组做7次即可加重。", "卡住1-2周后进入退行储备。"],
            )
        )
    return schedule


def _advanced_linear_strength_schedule(days: int) -> list[dict[str, Any]]:
    templates = [
        (
            "卧推正常推进",
            [
                _strength_exercise("Barbell Bench Press", 5, "5 @ 70% 1RM起步", note="每周递增 2.5%。"),
                _strength_exercise("Pendlay Row", 5, "5", phase="三小项", note="疲劳高时优先砍掉三小项。"),
                _strength_exercise("Chin-up", 3, "5-8", phase="三小项"),
            ],
        ),
        (
            "深蹲正常推进",
            [
                _strength_exercise("Back Squat", 5, "5 @ 70% 1RM起步", note="每周递增 2.5%。"),
                _strength_exercise("Barbell Overhead Press", 5, "5", phase="三小项"),
                _strength_exercise("Romanian Deadlift", 3, "8", phase="辅助"),
            ],
        ),
        (
            "卧推轻训",
            [
                _strength_exercise("Barbell Bench Press", 5, "5 @ 正常日70%", note="轻训是主动划水，不是偷懒。"),
                _strength_exercise("Seated Cable Row", 4, "8-10", phase="辅助"),
                _strength_exercise("Barbell Overhead Press", 3, "5 @ 轻重量", phase="三小项"),
            ],
        ),
        (
            "硬拉正常推进 + 深蹲轻训",
            [
                _strength_exercise("Deadlift", 3, "3-5 @ 70% 1RM起步", note="硬拉单独管理疲劳。"),
                _strength_exercise("Back Squat", 3, "5 @ 正常日70%", note="轻训帮助维持技术频率。"),
                _strength_exercise("Pendlay Row", 3, "5", phase="三小项"),
            ],
        ),
        (
            "主项补强日",
            [
                _strength_exercise("Barbell Bench Press", 3, "3 @ 当周推进重量", note="5x5失败后可降为3x3继续推进。"),
                _strength_exercise("Back Squat", 3, "3 @ 当周推进重量", note="注意保留余量，避免力竭。"),
                _strength_exercise("Pull-up", 3, "5-8", phase="三小项"),
            ],
        ),
    ]
    schedule = []
    for index in range(days):
        focus, exercises = templates[index % len(templates)]
        schedule.append(
            _strength_day(
                f"Day {index + 1}",
                focus,
                exercises,
                "老手线性增力：低开、每周递增、轻训维持频率，3-5周后按状态减载。",
                ["5x5无法完成时降为3x3，再到2x2，最后到5x1。", "热情连续下滑3天或睡眠异常，立即减载。", "疲劳积累时优先砍三小项，保三大项。"],
            )
        )
    return schedule


def _universal_5x5_strength_schedule(days: int) -> list[dict[str, Any]]:
    templates = [
        (
            "推日：卧推5x5",
            [
                _strength_exercise("Barbell Bench Press", 5, "5", note="不要用5RM做5x5，建议用8RM重量开始。"),
                _strength_exercise("Seated Overhead Press", 3, "8-10", phase="辅项"),
                _strength_exercise("Barbell Front Raise", 3, "10-12", phase="辅项"),
                _strength_exercise("Machine Fly", 3, "10-12", phase="辅项"),
                _strength_exercise("Straight-Arm Pulldown", 3, "12", phase="辅项"),
                _strength_exercise("Shoulder Stability Drill", 3, "12-15", phase="辅项"),
            ],
            ["前三周储备周 RPE7-8，第四周转化周 RPE8-9.5。", "每次最多加 2.5kg。"],
        ),
        (
            "拉日：罗马尼亚硬拉5x5",
            [
                _strength_exercise("Romanian Deadlift", 5, "5", note="新手不优先传统硬拉，用罗马尼亚硬拉建立后侧链。"),
                _strength_exercise("Seated Cable Row", 4, "8-10", phase="辅项"),
                _strength_exercise("Lat Pulldown", 4, "8-10", phase="辅项"),
                _strength_exercise("Close-Grip Seated Cable Row", 3, "10-12", phase="辅项"),
                _strength_exercise("Back Extension", 3, "12-15", phase="辅项"),
            ],
            ["5次训练同时刺激力量与维度。", "恢复不足时神经疲劳会影响力量表现。"],
        ),
        (
            "蹲日：深蹲5x5",
            [
                _strength_exercise("Back Squat", 5, "5", note="重量是检验动作质量的工具，不是目的。"),
                _strength_exercise("Walking Lunge", 3, "8-10 each side", phase="辅项"),
                _strength_exercise("Goblet Squat", 3, "10-12", phase="辅项"),
                _strength_exercise("Wall Sit", 3, "45-60 sec", phase="辅项"),
            ],
            ["新手练1-2天休1天，有经验者练3天休1天。", "拉伸、饮食、睡眠一起决定超量恢复。"],
        ),
    ]
    schedule = []
    for index in range(days):
        focus, exercises, learning_points = templates[index % 3]
        schedule.append(
            _strength_day(
                f"Day {index + 1}",
                focus,
                exercises,
                "全人群5x5：用四周小周期管理强度，兼顾力量、神经适应和肌肥大。",
                learning_points,
            )
        )
    return schedule


def _strength_plan_brief(plan_type: str) -> dict[str, Any]:
    briefs = {
        "beginner_ab_linear": {
            "title": "小白A/B轮线性力量",
            "audience": "健身小白、动作基础薄弱者、长期停滞但还没建立力量模型的人。",
            "source_basis": "来自视频总结：先学底层逻辑，再执行A/B轮换。",
            "logic_points": [
                "核心动作是深蹲、卧推、硬拉、实力推。",
                "从空杆开始，动作质量优先于训练重量。",
                "训练安排是A/B轮换，练一休一。",
            ],
            "progression_rules": [
                "深蹲/卧推5x5，硬拉3x5。",
                "22法则：完成5x5后，第五组能做7次才加重。",
                "上肢每次加2.5kg，下肢每次加5kg。",
            ],
            "stall_strategy": [
                "前期持续线性加重，不急着减载。",
                "重量卡住1-2周后，进入退行储备。",
                "下调重量做高次数，例如5x8；硬拉单独处理。",
            ],
            "warnings": ["建议找合格教练学习基础动作模式。", "错误动作会导致伤病和停滞。"],
        },
        "advanced_linear_5x5": {
            "title": "老手线性5x5增力",
            "audience": "长期训练者、力量停滞者、重训者。",
            "source_basis": "来自视频总结：储备期后用线性计划把肌肉和容量转化为力量。",
            "logic_points": [
                "核心项目是三大项：深蹲、硬拉、卧推；三小项：实力推、潘德伦划船、引体向上。",
                "增力计划的核心是每周必须增加重量。",
                "用1RM计算起始重量，从70%极限重量低开。",
            ],
            "progression_rules": [
                "除硬拉外，主项采用5x5。",
                "每周递增2.5%。",
                "每周至少训练两次主项：一次正常推进，一次轻训；轻训为主项重量的7折。",
            ],
            "stall_strategy": [
                "3-5周后根据状态减载，重量降到80%或容量砍半。",
                "5x5无法完成时降到3x3，继续线性推进。",
                "再困难可降为2x2直至5x1；最后一组感受余量，避免力竭。",
            ],
            "warnings": ["训练热情连续下滑3天以上或睡眠异常，立即减载。", "疲劳积累时优先砍三小项，保证三大项推进。"],
        },
        "universal_5x5_split": {
            "title": "全人群5x5三分化",
            "audience": "想用5x5提高力量和维度的新手、熟练者、重启训练者。",
            "source_basis": "来自视频总结：5x5兼顾力量与肌肥大，适合作为储备到转化的核心结构。",
            "logic_points": [
                "4x4神经疲劳大且容量不足，6x6训练量偏大，5x5居中。",
                "力量提升来自协调性适应、神经适应、肌肉横截面积增加。",
                "不要用5RM做5x5，推荐用8RM重量开始。",
            ],
            "progression_rules": [
                "四周周期：前三周储备周，第四周转化周。",
                "储备周RPE7-8，转化周RPE8-9.5。",
                "根据RPE变化调整重量，每次最多增加2.5kg。",
            ],
            "stall_strategy": [
                "辅助训练用于补短板，不要抢主项恢复。",
                "神经疲劳明显时优先恢复睡眠、饮食和放松。",
            ],
            "warnings": ["新手不推荐传统硬拉，优先罗马尼亚硬拉。", "盲目追重量会破坏动作质量。"],
        },
    }
    return briefs[plan_type]


def _plan_templates(level: str, goal: str, split_name: str) -> list[dict[str, Any]]:
    if goal == "health":
        return [
            {"focus": "Home Upper Body", "exercises": ["Push-up", "Incline Push-up", "Bench Dips", "Arm-Reach Crunch"]},
            {"focus": "Home Lower Body", "exercises": ["Single-Leg Hamstring Activation", "Bulgarian Split Squat", "Elevated Calf Raise", "Arm-Reach Crunch"]},
        ]

    if "Upper Lower" in split_name:
        return [
            {"focus": "Upper A", "exercises": ["Barbell Bench Press", "Seated Cable Row", "Dumbbell Shoulder Press", "Lat Pulldown", "Cable Triceps Pressdown"]},
            {"focus": "Lower A", "exercises": ["Back Squat", "Romanian Deadlift", "Leg Press", "Walking Lunge", "Plank"]},
            {"focus": "Upper B", "exercises": ["Incline Dumbbell Press", "Pull-up", "Machine Chest Press", "Lateral Raise", "Dumbbell Curl"]},
            {"focus": "Lower B", "exercises": ["Deadlift", "Goblet Squat", "Leg Press", "Romanian Deadlift", "Plank"]},
        ]

    return [
        {"focus": "Push", "exercises": ["Barbell Bench Press", "Incline Dumbbell Press", "Dumbbell Shoulder Press", "Lateral Raise", "Cable Triceps Pressdown"]},
        {"focus": "Pull", "exercises": ["Pull-up", "Seated Cable Row", "Lat Pulldown", "Romanian Deadlift", "Dumbbell Curl"]},
        {"focus": "Legs", "exercises": ["Back Squat", "Leg Press", "Romanian Deadlift", "Walking Lunge", "Plank"]},
    ]


def _health_home_schedule(days_per_week: int, minutes_per_session: int) -> list[dict[str, Any]]:
    session_specs = [
        {
            "focus": "Home Upper Body",
            "session_note": "居家上肢：胸、肩、手臂、背部和核心。没有哑铃时可用水瓶或安全重物。",
            "video": HEALTH_HOME_SESSION_VIDEOS["Home Upper Body"],
            "warmup": ["Rocking Plank", "Wrist preparation", "Light shoulder circles"],
            "learning_points": [
                "俯卧撑按能力选择标准、前撑或垫高变式。",
                "肩部动作优先用轻重量，做到后束、中束、前束都有感觉。",
                "每个动作以接近力竭为主，但关节疼痛时立刻降阶。",
            ],
            "exercises": [
                ("胸部", "Push-up", 4, "near failure", 120),
                ("上胸", "Incline Push-up", 4, "near failure", 120),
                ("肩后束", "Rear Delt Bottle Raise", 4, "near failure", 120),
                ("肩中束", "Bottle Lateral Raise", 4, "near failure", 120),
                ("肩前束", "Bottle Front Raise", 4, "near failure", 120),
                ("肱三头", "Bench Dips", 4, "about 24", 120),
                ("核心/背部", "Kneeling Ab Wheel", 4, "near failure", 120),
                ("背部", "Bent-Over Dumbbell Row", 4, "until back has a clear pump", 120),
                ("腹部", "Arm-Reach Crunch", 4, "near failure", 120),
            ],
        },
        {
            "focus": "Home Lower Body",
            "session_note": "居家下肢与腹肌：后侧链、臀腿、髋关节、小腿和核心。没有器械时用水瓶或背包装重物。",
            "video": HEALTH_HOME_SESSION_VIDEOS["Home Lower Body"],
            "warmup": ["Hip hinge rehearsal", "Ankle rocks", "Bodyweight squats"],
            "learning_points": [
                "先激活大腿后侧和髋关节，再做保加利亚蹲。",
                "小腿训练用慢下快起，前脚掌踩实。",
                "腹肌动作以能控制腰部为前提，不追求大幅度。",
            ],
            "exercises": [
                ("后侧激活", "Single-Leg Hamstring Activation", 4, "10 each side", 120),
                ("臀髋", "Chair Hip Hinge", 4, "15-16 each side", 120),
                ("腿部", "Bulgarian Split Squat", 4, "10 each side", 120),
                ("髋/腹股沟", "Groin Mobility Split Squat", 3, "10-12 each side", 120),
                ("小腿", "Elevated Calf Raise", 4, "20", 120),
                ("核心/背部", "Kneeling Ab Wheel", 4, "near failure", 120),
                ("腹部", "Arm-Reach Crunch", 4, "near failure", 120),
            ],
        },
    ]

    schedule: list[dict[str, Any]] = []
    for index in range(days_per_week):
        spec = session_specs[index % len(session_specs)]
        exercises = [
            _exercise(
                exercise_name,
                sets_override=sets,
                reps_override=reps,
                rest_override=rest,
                phase=phase,
                teaching_video=spec["video"],
            )
            for phase, exercise_name, sets, reps, rest in spec["exercises"]
        ]
        schedule.append(
            {
                "day": f"Day {index + 1}",
                "focus": spec["focus"],
                "warmup": spec["warmup"],
                "session_video_url": spec["video"]["url"],
                "warmup_video_url": spec["video"]["url"],
                "exercises": exercises,
                "rest_policy": _session_rest_policy(exercises),
                "session_note": spec["session_note"],
                "learning_points": spec["learning_points"],
                "minutes_target": minutes_per_session,
            }
        )
    return schedule


def _beginner_four_day_schedule(minutes_per_session: int) -> list[dict[str, Any]]:
    session_specs = [
        {
            "day": "Day 1",
            "focus": "Beginner Chest Shoulders Triceps",
            "session_note": "Beginner four-day split: chest, shoulders, and triceps. Learn the video sequence before adding load.",
            "warmup": [
                "5 min upper-body cardio",
                "Band chest openers",
                "Scapular push-ups",
                "Cable fly warm-up set",
                "Bench press ramp-up sets",
            ],
            "exercises": [
                ("main", "Cable Fly", 4, "12", 60),
                ("main", "Barbell Bench Press", 6, "10", 120),
                ("main", "Incline Machine Chest Press", 4, "12", 90),
                ("accessory", "Barbell Overhead Press", 4, "12", 120),
                ("accessory", "Overhead Cable Triceps Extension", 4, "12", 60),
            ],
        },
        {
            "day": "Day 2",
            "focus": "Beginner Back Biceps",
            "session_note": "Beginner four-day split: back and biceps. Start by feeling the lats before heavy pulling.",
            "warmup": [
                "5 min easy rower",
                "Shoulder blade depression drills",
                "Straight-arm pulldown warm-up",
                "Light cable row ramp-up sets",
            ],
            "exercises": [
                ("main", "Straight-Arm Pulldown", 4, "12-15", 60),
                ("main", "Single-Arm Seated Cable Row", 4, "12", 75),
                ("main", "Pull-up", 4, "10", 120),
                ("main", "Close-Grip Seated Cable Row", 4, "12", 75),
                ("main", "Lat Pulldown", 4, "12", 75),
                ("main", "Barbell Curl", 4, "12", 60),
            ],
        },
        {
            "day": "Day 3",
            "focus": "Beginner Lower Body",
            "session_note": "Beginner four-day split: lower body. Keep balance and joint control ahead of load.",
            "warmup": [
                "5 min incline walk or bike",
                "Hip circles",
                "Adductor rockbacks",
                "Bodyweight lunges",
                "Calf ankle rocks",
            ],
            "exercises": [
                ("main", "Hip Adduction Machine / Copenhagen Plank", 4, "15 or 20-30 sec", 60),
                ("main", "Single-Leg Dumbbell Romanian Deadlift", 3, "12 each side", 90),
                ("main", "Walking Lunge", 4, "12 each side", 90),
                ("main", "Rotational Lunge", 3, "10 each side", 75),
                ("main", "Standing Calf Raise", 3, "15", 60),
            ],
        },
        {
            "day": "Rest Day",
            "focus": "Beginner Recovery Day",
            "is_rest_day": True,
            "rest_note": "Rest one day after the lower-body session. Keep steps easy, sleep enough, and do light mobility only if it feels good.",
            "session_note": "Recovery day: no hard training.",
            "warmup": [],
            "exercises": [],
        },
        {
            "day": "Day 4",
            "focus": "Beginner Shoulders Arms",
            "session_note": "Beginner four-day split: shoulders and arms. Keep shoulder positions stable and avoid swinging.",
            "warmup": [
                "5 min upper-body cardio",
                "Band external rotations",
                "Face pull warm-up set",
                "Light overhead press ramp-up sets",
            ],
            "exercises": [
                ("main", "Seated Reverse Fly", 4, "12", 60),
                ("main", "Barbell Overhead Press", 5, "10", 120),
                ("main", "Cable Face Pull", 4, "10", 60),
                ("main", "Front Raise", 4, "10", 60),
                ("main", "Overhead Cable Triceps Extension", 4, "12", 60),
                ("main", "Cable Curl", 4, "12", 60),
            ],
        },
    ]

    schedule: list[dict[str, Any]] = []
    for spec in session_specs:
        if spec.get("is_rest_day"):
            schedule.append(dict(spec))
            continue

        focus = str(spec["focus"])
        session_video = BEGINNER_SESSION_VIDEOS[focus]
        warmup_video = WARMUP_TEACHING_VIDEOS[focus]
        exercises = [
            _exercise(
                exercise_name,
                sets_override=sets,
                reps_override=reps,
                rest_override=rest,
                phase="主项" if phase == "main" else "辅项",
                teaching_video=session_video,
            )
            for phase, exercise_name, sets, reps, rest in spec["exercises"]
        ]
        schedule.append(
            {
                "day": spec["day"],
                "focus": focus,
                "warmup": spec["warmup"],
                "warmup_video_url": warmup_video["url"],
                "session_video_url": session_video["url"],
                "exercises": exercises,
                "rest_policy": _session_rest_policy(exercises),
                "session_note": spec["session_note"],
                "minutes_target": minutes_per_session,
            }
        )
    return schedule


def _warmup_for_focus(focus: str) -> list[str]:
    lower_focus = focus.lower()
    base = ["3-5 min easy cardio", "Dynamic joint circles", "Two light ramp-up sets"]
    if "upper" in lower_focus or "push" in lower_focus or "pull" in lower_focus:
        return base + ["Band pull-aparts", "Scapular push-ups"]
    if "lower" in lower_focus or "legs" in lower_focus:
        return base + ["Glute bridges", "Bodyweight squats"]
    return base + ["Bodyweight squats", "Band pull-aparts"]


def _session_rest_policy(exercises: list[dict[str, Any]]) -> str:
    longest_rest = max((int(exercise.get("rest_seconds", MIN_REST_SECONDS)) for exercise in exercises), default=MIN_REST_SECONDS)
    if longest_rest >= LONG_REST_SECONDS:
        return "本日休息规则：所有动作组间至少 2 分钟；大重量复合动作按 3 分钟以上，先保证下一组动作质量。"
    return "本日休息规则：所有动作组间至少 2 分钟，先保证动作质量和目标肌肉感受。"


def _session_note(level: str, goal: str, minutes_per_session: int) -> str:
    if minutes_per_session < 45:
        return "Short session: prioritize the first three exercises and keep execution focused."
    if level == "beginner":
        return "Technique first. Stop sets with 1-3 reps in reserve."
    if goal == "strength_gain":
        return "Put compound lifts first and keep reps powerful."
    return "Use steady progression and adjust if fatigue or pain rises."


def _teaching_url(name: str) -> str:
    return _teaching_video(name)["url"]


def _teaching_video(name: str) -> dict[str, str]:
    return DIRECT_TEACHING_VIDEOS.get(
        name,
        {
            "title": "凯圣王新手增肌系列",
            "creator": "凯圣王",
            "platform": "Bilibili",
            "url": "https://www.bilibili.com/video/BV1Qd4y1Z75J/",
        },
    )


def _default_substitutions(name: str) -> list[str]:
    substitutions = {
        "Barbell Bench Press": ["Dumbbell Bench Press", "Machine Chest Press"],
        "Back Squat": ["Goblet Squat", "Leg Press"],
        "Deadlift": ["Romanian Deadlift", "Hip Thrust"],
        "Dumbbell Shoulder Press": ["Machine Shoulder Press", "Landmine Press"],
        "Pull-up": ["Lat Pulldown", "Assisted Pull-up"],
    }
    return substitutions.get(name, [])


AI_FITNESS_SYSTEM_PROMPT = """
你是 GymPath 的中文健身问答助手。你的目标是帮助用户减少健身决策成本，建立正确认知，并给出可执行的训练、饮食、恢复建议。

回答规则：
1. 优先使用中文，语气直接、专业、鼓励，但不要夸大效果。
2. 先给结论，再给具体做法；避免空泛鸡汤。
3. 如果问题涉及疼痛、伤病、疾病、用药或明显异常症状，必须提醒这不是医疗诊断，并建议严重或持续情况找医生/康复师。
4. 不要承诺局部减脂、快速暴瘦、无风险突破极限等不科学内容。
5. 根据用户水平区分建议：新手要安全启动，重启者要降低门槛，老手要给进阶变量。
6. 尽量把回答落到动作替代、组数次数、饮食宏量营养素、热身、恢复或下一步记录。
""".strip()


def get_ai_fitness_reply(
    messages: list[dict[str, str]],
    profile: dict[str, Any] | None = None,
    *,
    api_key: str | None = None,
    base_url: str | None = None,
    model: str | None = None,
) -> dict[str, Any]:
    """Ask the configured LLM for fitness guidance, with a safe local fallback."""
    cleaned_messages = _clean_ai_messages(messages)
    if not cleaned_messages:
        raise ValueError("messages must include at least one user message")

    key = api_key or os.environ.get("DEEPSEEK_API_KEY")
    selected_base_url = base_url or os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
    selected_model = model or os.environ.get("DEEPSEEK_MODEL", "deepseek-v4-pro")
    profile_context = _ai_profile_context(profile or {})
    llm_messages = [
        {"role": "system", "content": AI_FITNESS_SYSTEM_PROMPT},
        {"role": "system", "content": profile_context},
        *cleaned_messages,
    ]

    if not key:
        return {
            "reply": _local_fitness_reply(cleaned_messages[-1]["content"], profile or {}),
            "provider": "local_fallback",
            "model": "rule_based",
            "used_api": False,
            "warning": "未配置 DEEPSEEK_API_KEY，已使用本地兜底回答。",
        }

    try:
        from openai import OpenAI

        client = OpenAI(api_key=key, base_url=selected_base_url)
        response = client.chat.completions.create(
            model=selected_model,
            messages=llm_messages,
            stream=False,
            reasoning_effort="high",
            extra_body={"thinking": {"type": "enabled"}},
        )
        content = response.choices[0].message.content or ""
        return {
            "reply": content.strip() or _local_fitness_reply(cleaned_messages[-1]["content"], profile or {}),
            "provider": "deepseek",
            "model": selected_model,
            "used_api": True,
        }
    except TypeError:
        return _retry_ai_without_reasoning(key, selected_base_url, selected_model, llm_messages, cleaned_messages, profile or {})
    except Exception as error:
        return {
            "reply": _local_fitness_reply(cleaned_messages[-1]["content"], profile or {}),
            "provider": "local_fallback",
            "model": "rule_based",
            "used_api": False,
            "warning": f"AI API 调用失败，已使用本地兜底回答：{type(error).__name__}",
        }


def _retry_ai_without_reasoning(
    key: str,
    base_url: str,
    model: str,
    llm_messages: list[dict[str, str]],
    cleaned_messages: list[dict[str, str]],
    profile: dict[str, Any],
) -> dict[str, Any]:
    from openai import OpenAI

    try:
        client = OpenAI(api_key=key, base_url=base_url)
        response = client.chat.completions.create(
            model=model,
            messages=llm_messages,
            stream=False,
        )
        content = response.choices[0].message.content or ""
        return {
            "reply": content.strip() or _local_fitness_reply(cleaned_messages[-1]["content"], profile),
            "provider": "deepseek",
            "model": model,
            "used_api": True,
            "warning": "当前 SDK 或模型不支持 reasoning_effort，已自动降级为普通对话。",
        }
    except Exception as error:
        return {
            "reply": _local_fitness_reply(cleaned_messages[-1]["content"], profile),
            "provider": "local_fallback",
            "model": "rule_based",
            "used_api": False,
            "warning": f"AI API 降级调用失败，已使用本地兜底回答：{type(error).__name__}",
        }


def _clean_ai_messages(messages: list[dict[str, str]]) -> list[dict[str, str]]:
    cleaned: list[dict[str, str]] = []
    for message in messages[-12:]:
        role = str(message.get("role", "")).strip().lower()
        content = str(message.get("content", "")).strip()
        if role not in {"user", "assistant"} or not content:
            continue
        cleaned.append({"role": role, "content": content[:1600]})
    return cleaned


def _ai_profile_context(profile: dict[str, Any]) -> str:
    if not profile:
        return "用户未提供训练画像。回答时先询问必要信息，但仍给出可执行的安全建议。"
    return (
        "用户训练画像："
        f"水平={profile.get('level', 'unknown')}；"
        f"目标={profile.get('goal', 'unknown')}；"
        f"单次训练时长={profile.get('minutes_per_session', 'unknown')}分钟；"
        f"体重={profile.get('weight_kg', 'unknown')}kg；"
        f"身高={profile.get('height_cm', 'unknown')}cm；"
        f"年龄={profile.get('age', 'unknown')}；"
        f"日常活动={profile.get('activity_level', 'unknown')}。"
    )


def _local_fitness_reply(question: str, profile: dict[str, Any]) -> str:
    lower_question = question.lower()
    level = str(profile.get("level", "beginner"))
    goal = str(profile.get("goal", "muscle_gain"))
    if any(word in question for word in ["疼", "痛", "受伤", "伤病", "麻", "刺痛"]):
        return (
            "先判断疼痛性质：如果是尖锐痛、放射痛、麻木、越来越痛，今天不要硬练这个动作，建议改成无痛范围内的替代动作；"
            "如果只是轻微不适，先降重量、缩短幅度、放慢节奏。这个建议不是医疗诊断，持续疼痛要找医生或康复师。"
        )
    if any(word in question for word in ["减脂", "瘦", "热量", "碳水"]):
        return (
            "减脂先抓三件事：每天蛋白吃够、热量保持小幅亏空、训练表现不要崩。"
            "不要追求只瘦某个部位；连续7-10天体重和腰围都不动，再小幅下调碳水或总热量。"
        )
    if any(word in question for word in ["增肌", "肌肥大", "长肌肉"]):
        return (
            "增肌的核心是稳定训练容量 + 渐进超负荷 + 足够热量。"
            f"你当前目标是 {goal}，如果动作感受差，优先换同部位动作，而不是盲目加重量；每个主练动作保留1-3次余力更适合长期进步。"
        )
    if any(word in question for word in ["增力", "力量", "卧推", "深蹲", "硬拉"]):
        return (
            "增力先固定主项，再控制疲劳。主项可以用5x5或3x3线性推进；卡住1-2周时先减载或降容量，"
            "不要靠每次硬顶力竭解决平台。"
        )
    if level == "beginner":
        return "新手先别追求复杂理论：固定计划、练前热身、动作不痛、每次完成后记录感受。先连续完成2-4周，比频繁换计划更重要。"
    return "先把问题拆成训练、饮食、恢复三块看。告诉我你的目标、当前计划、最近一周训练表现和卡住的动作，我可以帮你做更具体的调整。"


def _parse_date(value: str | date) -> date:
    if isinstance(value, date):
        return value
    return datetime.strptime(value, "%Y-%m-%d").date()


def _optional_delta(first: Any, last: Any) -> float | None:
    if first is None or last is None:
        return None
    return round(float(last) - float(first), 1)


def _trend_message(
    weight_change: float | None,
    waist_change: float | None,
    body_fat_change: float | None = None,
) -> str:
    if weight_change is None and waist_change is None and body_fat_change is None:
        return "Keep logging measurements to reveal a clearer trend."
    messages: list[str] = []
    if weight_change is not None:
        if weight_change > 0:
            messages.append("Body weight is trending up.")
        elif weight_change < 0:
            messages.append("Body weight is trending down.")
        else:
            messages.append("Body weight is stable.")
    if waist_change is not None:
        if waist_change < 0:
            messages.append("Waist measurement is decreasing.")
        elif waist_change > 0:
            messages.append("Waist measurement is increasing.")
        else:
            messages.append("Waist measurement is stable.")
    if body_fat_change is not None:
        if body_fat_change < 0:
            messages.append("Body-fat estimate is trending down.")
        elif body_fat_change > 0:
            messages.append("Body-fat estimate is trending up.")
        else:
            messages.append("Body-fat estimate is stable.")
    return " ".join(messages)


if __name__ == "__main__":
    sample_plan = main()
    print(f"Generated {sample_plan['split']['split_name']} plan with {len(sample_plan['weekly_schedule'])} days.")
