'use strict';

// ==================== 常量配置 ====================
const KEYS = ['d', 'f', 'j', 'k'];
const LANE_COUNT = 4;

const JUDGE_WINDOWS = {
    perfect: 50,   // ms
    great: 120,
    good: 180,
    miss: 220
};

const SCORE_VALUES = {
    perfect: 1000,
    great: 700,
    good: 400,
    miss: 0
};

const COMBO_BONUS_STEP = 10;
const COMBO_BONUS_PER_STEP = 0.1;
const MAX_COMBO_BONUS = 1.5;

const MAX_HP = 100;
const HP_DAMAGE_MISS = 10;
const HP_DAMAGE_BAD = 15;
const HP_DAMAGE_EMPTY = 5;
const HP_HEAL_PERFECT = 2;

const NOTE_TRAVEL_TIME = 2000; // ms, 音符从顶落到底的时间

const FOOD_EMOJIS_GOOD = ['🥬', '🥕', '🥔', '🍅', '🥒', '🌽', '🧅', '🥦', '🥩', '🍗', '🐟', '🍤', '🍳', '🧀', '🥚', '🌶️'];
const FOOD_EMOJIS_BAD = ['🦠', '💀', '🪳', '☣️', '🧟'];

// ==================== 关卡定义 ====================
function generateLevel1() {
    const notes = [];
    const bpm = 90;
    const beat = 60000 / bpm;
    for (let i = 0; i < 40; i++) {
        notes.push({
            time: 2000 + i * beat,
            lane: i % 4,
            type: i % 12 === 5 ? 'bad' : 'good',
            food: i % 12 === 5 ? randBad() : randGood()
        });
    }
    return { bpm, notes };
}

function generateLevel2() {
    const notes = [];
    const bpm = 105;
    const beat = 60000 / bpm;
    for (let i = 0; i < 60; i++) {
        const t = 2000 + i * beat * 0.5;
        const skip = Math.random() < 0.25 ? beat * 0.5 : 0;
        notes.push({
            time: t + skip,
            lane: Math.floor(Math.random() * 4),
            type: i % 8 === 3 ? 'bad' : 'good',
            food: i % 8 === 3 ? randBad() : randGood()
        });
    }
    return { bpm, notes };
}

function generateLevel3() {
    const notes = [];
    const bpm = 120;
    const beat = 60000 / bpm;
    for (let i = 0; i < 80; i++) {
        const base = 2000 + Math.floor(i / 2) * beat * 0.5;
        const offset = i % 2 === 0 ? 0 : beat * 0.25;
        let lane1 = Math.floor(Math.random() * 4);
        let lane2;
        do { lane2 = Math.floor(Math.random() * 4); } while (lane2 === lane1);
        if (i % 3 === 0) {
            notes.push({ time: base + offset, lane: lane1, type: 'good', food: randGood() });
        } else if (i % 3 === 1) {
            notes.push({ time: base + offset, lane: lane1, type: 'good', food: randGood() });
            notes.push({ time: base + offset, lane: lane2, type: 'good', food: randGood() });
        } else {
            notes.push({ time: base + offset, lane: lane1, type: 'bad', food: randBad() });
            notes.push({ time: base + offset + beat * 0.5, lane: lane2, type: 'good', food: randGood() });
        }
    }
    return { bpm, notes };
}

function generateLevel4() {
    const notes = [];
    const bpm = 140;
    const beat = 60000 / bpm;
    for (let i = 0; i < 100; i++) {
        const base = 2000 + i * beat * 0.25;
        const pattern = i % 6;
        if (pattern === 0) {
            notes.push({ time: base, lane: 0, type: 'good', food: randGood() });
            notes.push({ time: base, lane: 3, type: 'good', food: randGood() });
        } else if (pattern === 1) {
            notes.push({ time: base, lane: 1, type: 'good', food: randGood() });
            notes.push({ time: base, lane: 2, type: 'good', food: randGood() });
        } else if (pattern === 2) {
            notes.push({ time: base, lane: 0, type: 'good', food: randGood() });
            notes.push({ time: base, lane: 1, type: 'good', food: randGood() });
            notes.push({ time: base, lane: 2, type: 'good', food: randGood() });
        } else if (pattern === 3) {
            notes.push({ time: base, lane: Math.floor(Math.random() * 4), type: 'bad', food: randBad() });
        } else if (pattern === 4) {
            notes.push({ time: base, lane: 1, type: 'good', food: randGood() });
        } else {
            notes.push({ time: base, lane: 2, type: 'good', food: randGood() });
        }
    }
    return { bpm, notes };
}

function generateLevel5() {
    const notes = [];
    const bpm = 160;
    const beat = 60000 / bpm;
    for (let i = 0; i < 140; i++) {
        const base = 2000 + i * beat * 0.25;
        const r = Math.random();
        if (r < 0.5) {
            notes.push({ time: base, lane: Math.floor(Math.random() * 4), type: 'good', food: randGood() });
        } else if (r < 0.75) {
            const l1 = Math.floor(Math.random() * 4);
            let l2;
            do { l2 = Math.floor(Math.random() * 4); } while (l2 === l1);
            notes.push({ time: base, lane: l1, type: 'good', food: randGood() });
            notes.push({ time: base, lane: l2, type: 'good', food: randGood() });
        } else if (r < 0.9) {
            notes.push({ time: base, lane: Math.floor(Math.random() * 4), type: 'bad', food: randBad() });
        } else {
            for (let l = 0; l < 4; l++) {
                notes.push({ time: base, lane: l, type: 'good', food: randGood() });
            }
        }
    }
    return { bpm, notes };
}

const LEVELS = [
    {
        id: 1,
        name: '入门切菜',
        recipe: '🥗 清爽蔬菜沙拉',
        dishName: '清爽蔬菜沙拉',
        customer: '健身达人小美',
        orderNo: 'ORD-001',
        price: 28,
        timeLimit: 60000,
        badFoodTolerance: 3,
        difficulty: 'easy',
        difficultyLabel: '简单',
        targetScore: 15000,
        targetPercent: 0.6,
        noteCount: 40,
        starCriteria: {
            star1: { accuracy: 0.5, hp: 20, badCuts: 5 },
            star2: { accuracy: 0.7, hp: 40, badCuts: 3 },
            star3: { accuracy: 0.9, hp: 70, badCuts: 1 }
        },
        data: null
    },
    {
        id: 2,
        name: '家常小炒',
        recipe: '🍳 番茄炒蛋',
        dishName: '番茄炒蛋',
        customer: '程序员小李',
        orderNo: 'ORD-002',
        price: 32,
        timeLimit: 75000,
        badFoodTolerance: 3,
        difficulty: 'normal',
        difficultyLabel: '普通',
        targetScore: 25000,
        targetPercent: 0.65,
        noteCount: 60,
        starCriteria: {
            star1: { accuracy: 0.55, hp: 20, badCuts: 5 },
            star2: { accuracy: 0.72, hp: 45, badCuts: 3 },
            star3: { accuracy: 0.92, hp: 75, badCuts: 1 }
        },
        data: null
    },
    {
        id: 3,
        name: '主厨挑战',
        recipe: '🍖 红烧排骨',
        dishName: '红烧排骨',
        customer: '美食家老王',
        orderNo: 'ORD-003',
        price: 68,
        timeLimit: 90000,
        badFoodTolerance: 2,
        difficulty: 'hard',
        difficultyLabel: '困难',
        targetScore: 40000,
        targetPercent: 0.7,
        noteCount: 80,
        starCriteria: {
            star1: { accuracy: 0.6, hp: 25, badCuts: 5 },
            star2: { accuracy: 0.78, hp: 50, badCuts: 2 },
            star3: { accuracy: 0.95, hp: 80, badCuts: 0 }
        },
        data: null
    },
    {
        id: 4,
        name: '快速刀工',
        recipe: '🍣 寿司拼盘',
        dishName: '寿司拼盘',
        customer: '日料爱好者Tony',
        orderNo: 'ORD-004',
        price: 88,
        timeLimit: 100000,
        badFoodTolerance: 2,
        difficulty: 'hard',
        difficultyLabel: '困难',
        targetScore: 55000,
        targetPercent: 0.75,
        noteCount: 100,
        starCriteria: {
            star1: { accuracy: 0.65, hp: 25, badCuts: 4 },
            star2: { accuracy: 0.8, hp: 55, badCuts: 2 },
            star3: { accuracy: 0.95, hp: 85, badCuts: 0 }
        },
        data: null
    },
    {
        id: 5,
        name: '终极料理',
        recipe: '🍱 怀石料理套餐',
        dishName: '怀石料理套餐',
        customer: '米其林评审员',
        orderNo: 'ORD-005',
        price: 188,
        timeLimit: 120000,
        badFoodTolerance: 1,
        difficulty: 'expert',
        difficultyLabel: '专家',
        targetScore: 80000,
        targetPercent: 0.8,
        noteCount: 140,
        starCriteria: {
            star1: { accuracy: 0.7, hp: 30, badCuts: 3 },
            star2: { accuracy: 0.85, hp: 60, badCuts: 1 },
            star3: { accuracy: 0.97, hp: 90, badCuts: 0 }
        },
        data: null
    }
];

// ==================== 工具函数 ====================
function randGood() { return FOOD_EMOJIS_GOOD[Math.floor(Math.random() * FOOD_EMOJIS_GOOD.length)]; }
function randBad() { return FOOD_EMOJIS_BAD[Math.floor(Math.random() * FOOD_EMOJIS_BAD.length)]; }

function loadLevelData() {
    LEVELS[0].data = generateLevel1();
    LEVELS[1].data = generateLevel2();
    LEVELS[2].data = generateLevel3();
    LEVELS[3].data = generateLevel4();
    LEVELS[4].data = generateLevel5();
}

const LEVEL_HINTS = {
    2: '节奏加快了！注意轨道会出现随机位置的好食材，还有更多坏食材混入，保持专注！',
    3: '双键同按来了！有时需要同时按下两个键，注意观察同时出现的食材。坏食材也会成对出现，小心躲避！',
    4: '高速模式！节奏飞快，会出现三键同时按和对称图案。专注判断线，提前预判是关键！',
    5: '终极挑战！全轨道齐发、随机节奏、高密度坏食材……只有真正的节奏大师才能通关！'
};

const ACHIEVEMENTS = [
    {
        id: 'combo_10',
        name: '初露锋芒',
        description: '达成10连击',
        icon: '⭐',
        category: 'combo',
        condition: { type: 'combo', value: 10 },
        title: '连击新手'
    },
    {
        id: 'combo_30',
        name: '连击达人',
        description: '达成30连击',
        icon: '🌟',
        category: 'combo',
        condition: { type: 'combo', value: 30 },
        title: '连击达人'
    },
    {
        id: 'combo_50',
        name: '连击大师',
        description: '达成50连击',
        icon: '💫',
        category: 'combo',
        condition: { type: 'combo', value: 50 },
        title: '连击大师'
    },
    {
        id: 'combo_100',
        name: '连击之神',
        description: '达成100连击',
        icon: '🔥',
        category: 'combo',
        condition: { type: 'combo', value: 100 },
        title: '连击之神'
    },
    {
        id: 'dodge_10',
        name: '火眼金睛',
        description: '成功闪避10个坏食材',
        icon: '👁️',
        category: 'dodge',
        condition: { type: 'dodge', value: 10 },
        title: '火眼金睛'
    },
    {
        id: 'dodge_30',
        name: '闪避高手',
        description: '成功闪避30个坏食材',
        icon: '🎯',
        category: 'dodge',
        condition: { type: 'dodge', value: 30 },
        title: '闪避高手'
    },
    {
        id: 'dodge_50',
        name: '完美避障',
        description: '成功闪避50个坏食材',
        icon: '🏆',
        category: 'dodge',
        condition: { type: 'dodge', value: 50 },
        title: '完美避障'
    },
    {
        id: 's_rank_1',
        name: 'S级入门',
        description: '第1关获得S评级',
        icon: '🥇',
        category: 'srank',
        condition: { type: 'srank', level: 1 },
        title: 'S级新人'
    },
    {
        id: 's_rank_3',
        name: 'S级主厨',
        description: '第3关获得S评级',
        icon: '👨‍🍳',
        category: 'srank',
        condition: { type: 'srank', level: 3 },
        title: 'S级主厨'
    },
    {
        id: 's_rank_5',
        name: 'S级宗师',
        description: '第5关获得S评级',
        icon: '👑',
        category: 'srank',
        condition: { type: 'srank', level: 5 },
        title: 'S级宗师'
    }
];

const TITLE_CATEGORIES = {
    combo: '连击称号',
    dodge: '闪避称号',
    srank: '评级称号'
};

function showLevelHintCard(levelId) {
    const save = getSaveData();
    if (save.seenHints.includes(levelId)) return;

    const activeScreen = document.querySelector('.screen.active');
    if (!activeScreen || (activeScreen.id !== 'level-select' && activeScreen.id !== 'result')) return;

    const lvl = LEVELS.find(l => l.id === levelId);
    if (!lvl) return;

    document.getElementById('hint-level-num').textContent = '第 ' + lvl.id + ' 关';
    document.getElementById('hint-level-name').textContent = lvl.name;
    document.getElementById('hint-level-recipe').textContent = lvl.recipe;

    const diffEl = document.getElementById('hint-level-diff');
    diffEl.textContent = lvl.difficultyLabel;
    diffEl.className = 'level-hint-diff diff-' + lvl.difficulty;

    document.getElementById('hint-level-target').textContent = '🎯 目标: ' + lvl.targetScore.toLocaleString();
    document.getElementById('hint-level-tip').textContent = LEVEL_HINTS[levelId] || '新的挑战在等着你！';

    const overlay = document.getElementById('level-hint-overlay');
    const card = document.getElementById('level-hint-card');
    overlay.style.display = '';
    card.classList.remove('hint-enter');
    void card.offsetWidth;
    card.classList.add('hint-enter');

    save.seenHints.push(levelId);
    saveData(save);
}

function dismissLevelHint() {
    document.getElementById('level-hint-overlay').style.display = 'none';
}

// ==================== 存储系统 ====================
const SAVE_KEY = 'rhythm-chef-save';

function getSaveData() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return { unlocked: 1, bestScores: {}, replays: {}, lastReplays: {}, seenHints: [], achievements: {}, equippedTitle: null, totalDodges: 0, maxComboEver: 0, levelBestRanks: {}, levelStars: {}, totalIncome: 0, totalOrders: 0, lastOrderDate: null };
        const data = JSON.parse(raw);
        return {
            unlocked: data.unlocked || 1,
            bestScores: data.bestScores || {},
            replays: data.replays || {},
            lastReplays: data.lastReplays || {},
            seenHints: data.seenHints || [],
            achievements: data.achievements || {},
            equippedTitle: data.equippedTitle || null,
            totalDodges: data.totalDodges || 0,
            maxComboEver: data.maxComboEver || 0,
            levelBestRanks: data.levelBestRanks || {},
            levelStars: data.levelStars || {},
            totalIncome: data.totalIncome || 0,
            totalOrders: data.totalOrders || 0,
            lastOrderDate: data.lastOrderDate || null
        };
    } catch {
        return { unlocked: 1, bestScores: {}, replays: {}, lastReplays: {}, seenHints: [], achievements: {}, equippedTitle: null, totalDodges: 0, maxComboEver: 0, levelBestRanks: {}, levelStars: {}, totalIncome: 0, totalOrders: 0, lastOrderDate: null };
    }
}

function saveData(data) {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('保存失败', e);
    }
}

function updateMaxCombo(combo) {
    const save = getSaveData();
    if (combo > (save.maxComboEver || 0)) {
        save.maxComboEver = combo;
        saveData(save);
    }
}

function updateLevelBestRank(levelId, rank, accuracy, hp) {
    const save = getSaveData();
    const prev = save.levelBestRanks[levelId];
    const rankOrder = { F: 0, C: 1, B: 2, A: 3, S: 4 };
    const prevRankOrder = prev ? (rankOrder[prev.rank] || 0) : -1;
    const newRankOrder = rankOrder[rank] || 0;
    const accuracyPercent = Math.round(accuracy * 10000) / 100;
    const hpRounded = Math.round(hp);
    const isBetterRank = newRankOrder > prevRankOrder;
    const isSameRankBetterAcc = newRankOrder === prevRankOrder && accuracyPercent > (prev.accuracy || 0);
    const isSameRankSameAccBetterHp = newRankOrder === prevRankOrder
        && Math.abs(accuracyPercent - (prev.accuracy || 0)) < 0.01
        && hpRounded > (prev.hp || 0);
    if (!prev || isBetterRank || isSameRankBetterAcc || isSameRankSameAccBetterHp) {
        save.levelBestRanks[levelId] = {
            rank,
            accuracy: accuracyPercent,
            hp: hpRounded,
            updatedAt: Date.now()
        };
        saveData(save);
    }
}

function unlockAchievement(achievementId) {
    const save = getSaveData();
    if (save.achievements[achievementId]) return null;
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return null;
    save.achievements[achievementId] = { unlockedAt: Date.now() };
    saveData(save);
    return achievement;
}

function checkComboAchievements(combo) {
    updateMaxCombo(combo);
    const newlyUnlocked = [];
    const latestSave = getSaveData();
    for (const ach of ACHIEVEMENTS) {
        if (ach.condition.type === 'combo' && !latestSave.achievements[ach.id]) {
            if (combo >= ach.condition.value) {
                const unlocked = unlockAchievement(ach.id);
                if (unlocked) newlyUnlocked.push(unlocked);
            }
        }
    }
    return newlyUnlocked;
}

function checkDodgeAchievements(dodgeCount) {
    const newlyUnlocked = [];
    const latestSave = getSaveData();
    const totalDodges = (latestSave.totalDodges || 0) + dodgeCount;
    latestSave.totalDodges = totalDodges;
    saveData(latestSave);
    for (const ach of ACHIEVEMENTS) {
        if (ach.condition.type === 'dodge' && !latestSave.achievements[ach.id]) {
            if (totalDodges >= ach.condition.value) {
                const unlocked = unlockAchievement(ach.id);
                if (unlocked) newlyUnlocked.push(unlocked);
            }
        }
    }
    return newlyUnlocked;
}

function checkSRankAchievements(levelId, rank) {
    const newlyUnlocked = [];
    if (rank !== 'S') return newlyUnlocked;
    for (const ach of ACHIEVEMENTS) {
        if (ach.condition.type === 'srank' && ach.condition.level === levelId) {
            const unlocked = unlockAchievement(ach.id);
            if (unlocked) newlyUnlocked.push(unlocked);
        }
    }
    return newlyUnlocked;
}

function showAchievementPopup(achievement) {
    let popup = document.getElementById('achievement-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'achievement-popup';
        popup.className = 'achievement-popup';
        document.body.appendChild(popup);
    }
    popup.innerHTML = `
        <div class="achievement-popup-content">
            <div class="achievement-popup-badge">🏅</div>
            <div class="achievement-popup-info">
                <div class="achievement-popup-title">成就解锁！</div>
                <div class="achievement-popup-icon">${achievement.icon}</div>
                <div class="achievement-popup-name">${achievement.name}</div>
                <div class="achievement-popup-desc">${achievement.description}</div>
            </div>
        </div>
    `;
    popup.classList.add('show');
    setTimeout(() => {
        popup.classList.remove('show');
    }, 3000);
}

function getEquippedTitle() {
    const save = getSaveData();
    if (!save.equippedTitle) return null;
    const ach = ACHIEVEMENTS.find(a => a.id === save.equippedTitle);
    return ach ? ach.title : null;
}

function equipTitle(achievementId) {
    const save = getSaveData();
    if (!save.achievements[achievementId]) return false;
    save.equippedTitle = achievementId;
    saveData(save);
    return true;
}

function unequipTitle() {
    const save = getSaveData();
    save.equippedTitle = null;
    saveData(save);
}

let currentAchCategory = 'all';

function renderAchievementsPage() {
    const save = getSaveData();
    const unlockedCount = Object.keys(save.achievements).length;
    const totalCount = ACHIEVEMENTS.length;

    document.getElementById('ach-unlocked-count').textContent = unlockedCount;
    document.getElementById('ach-total-count').textContent = totalCount;

    const currentTitle = getEquippedTitle();
    document.getElementById('ach-current-title').textContent = currentTitle || '无';

    renderAchievementsList();
    renderTitlesList();
    updateUnequipButton();
}

function getAchievementProgressHTML(ach, save) {
    const condition = ach.condition;
    let current = 0;
    let target = 0;
    let progressHTML = '';
    let diffText = '';

    if (condition.type === 'combo') {
        target = condition.value;
        current = save.maxComboEver || 0;
        const diff = Math.max(0, target - current);
        diffText = diff > 0 ? `还差 ${diff} 连击` : '已达成！';
    } else if (condition.type === 'dodge') {
        target = condition.value;
        current = save.totalDodges || 0;
        const diff = Math.max(0, target - current);
        diffText = diff > 0 ? `还差 ${diff} 次闪避` : '已达成！';
    } else if (condition.type === 'srank') {
        const levelId = condition.level;
        const best = save.levelBestRanks && save.levelBestRanks[levelId];
        if (best) {
            const S_ACC_TARGET = 95;
            const S_HP_TARGET = 51;
            const accProgress = Math.min(100, (best.accuracy / S_ACC_TARGET) * 100);
            const hpProgress = Math.min(100, (best.hp / S_HP_TARGET) * 100);
            const accSatisfied = best.accuracy >= S_ACC_TARGET;
            const hpSatisfied = best.hp >= S_HP_TARGET;
            if (best.rank === 'S' || (accSatisfied && hpSatisfied)) {
                current = 100;
                diffText = '已达成S级！';
            } else {
                current = Math.floor(Math.min(accProgress, hpProgress));
                current = Math.min(current, 99);
                const accDiff = Math.max(0, S_ACC_TARGET - best.accuracy);
                const hpDiff = Math.max(0, S_HP_TARGET - best.hp);
                const diffs = [];
                if (accDiff > 0) diffs.push(`准确率差 ${accDiff.toFixed(1)}%`);
                if (hpDiff > 0) diffs.push(`生命差 ${hpDiff}`);
                diffText = diffs.length > 0 ? diffs.join('，') : '已达成S级条件！';
            }
        } else {
            current = 0;
            diffText = '尚未通关此关卡';
        }
        target = 100;
    }

    const percent = Math.min(100, Math.max(0, target > 0 ? Math.floor((current / target) * 100) : current));

    progressHTML = `
        <div class="achievement-progress-wrap">
            <div class="achievement-progress-bar">
                <div class="achievement-progress-fill" style="width: ${percent}%"></div>
            </div>
            <div class="achievement-progress-text">
                <span class="progress-current">${condition.type === 'srank' ? percent + '%' : current}</span>
                <span class="progress-sep">/</span>
                <span class="progress-target">${condition.type === 'srank' ? '100%' : target}</span>
            </div>
            <div class="achievement-diff">${diffText}</div>
        </div>
    `;

    return progressHTML;
}

function renderAchievementsList() {
    const save = getSaveData();
    const listEl = document.getElementById('achievements-list');
    listEl.innerHTML = '';

    const filtered = currentAchCategory === 'all'
        ? ACHIEVEMENTS
        : ACHIEVEMENTS.filter(a => a.category === currentAchCategory);

    filtered.forEach(ach => {
        const unlocked = !!save.achievements[ach.id];
        const card = document.createElement('div');
        card.className = 'achievement-card ' + (unlocked ? 'unlocked' : 'locked');
        const progressHTML = unlocked ? '' : getAchievementProgressHTML(ach, save);
        card.innerHTML = `
            <div class="achievement-icon">${unlocked ? ach.icon : '🔒'}</div>
            <div class="achievement-info">
                <div class="achievement-name">${ach.name}</div>
                <div class="achievement-desc">${ach.description}</div>
                ${progressHTML}
            </div>
            <span class="achievement-status ${unlocked ? 'unlocked' : 'locked'}">${unlocked ? '已解锁' : '未解锁'}</span>
        `;
        listEl.appendChild(card);
    });
}

function renderTitlesList() {
    const save = getSaveData();
    const listEl = document.getElementById('titles-list');
    listEl.innerHTML = '';

    ACHIEVEMENTS.forEach(ach => {
        const unlocked = !!save.achievements[ach.id];
        const equipped = save.equippedTitle === ach.id;
        const badge = document.createElement('div');
        let cls = 'title-badge';
        if (equipped) cls += ' equipped';
        else if (unlocked) cls += ' available';
        else cls += ' locked';
        badge.className = cls;
        badge.textContent = unlocked ? ach.title : '???';
        if (unlocked) {
            badge.addEventListener('click', () => {
                if (equipped) {
                    unequipTitle();
                } else {
                    equipTitle(ach.id);
                }
                renderTitlesList();
                updateUnequipButton();
                const currentTitle = getEquippedTitle();
                document.getElementById('ach-current-title').textContent = currentTitle || '无';
            });
        }
        listEl.appendChild(badge);
    });
}

function updateUnequipButton() {
    const save = getSaveData();
    const btn = document.getElementById('btn-unequip-title');
    if (btn) {
        btn.style.display = save.equippedTitle ? '' : 'none';
    }
}

function updateMenuTitle() {
    const title = getEquippedTitle();
    const el = document.getElementById('equipped-title-display');
    if (el && title) {
        el.textContent = '🎖️ ' + title;
        el.style.display = 'inline-block';
    } else if (el) {
        el.style.display = 'none';
    }
}

// ==================== 屏幕切换 ====================
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (id === 'level-select') renderLevelSelect();
    if (id === 'achievements') renderAchievementsPage();
    if (id === 'menu') updateMenuTitle();
}

// ==================== 关卡选择（餐厅订单模式）====================
let pendingOrderLevelId = null;

function renderLevelSelect() {
    const save = getSaveData();
    updateRestaurantStats(save);

    const list = document.getElementById('level-list');
    list.innerHTML = '';
    LEVELS.forEach(lvl => {
        const unlocked = lvl.id <= save.unlocked;
        const best = save.bestScores[lvl.id] || 0;
        const stars = save.levelStars[lvl.id] || 0;
        const card = document.createElement('div');
        card.className = 'order-card' + (unlocked ? '' : ' locked');

        const starsHTML = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
        const timeLimitStr = formatTime(lvl.timeLimit);

        card.innerHTML = `
            <div class="order-card-top">
                <div class="order-no">📋 ${lvl.orderNo}</div>
                <span class="level-diff diff-${lvl.difficulty}">${lvl.difficultyLabel}</span>
            </div>
            <div class="order-dish">${lvl.recipe}</div>
            <div class="order-customer">👤 ${lvl.customer}</div>
            <div class="order-req-grid">
                <div class="order-req">
                    <span class="req-icon">⏱️</span>
                    <span class="req-text">限时 ${timeLimitStr}</span>
                </div>
                <div class="order-req">
                    <span class="req-icon">🥀</span>
                    <span class="req-text">容错 ${lvl.badFoodTolerance} 次</span>
                </div>
                <div class="order-req">
                    <span class="req-icon">🎯</span>
                    <span class="req-text">${lvl.targetScore.toLocaleString()}</span>
                </div>
                <div class="order-req">
                    <span class="req-icon">💰</span>
                    <span class="req-text">¥${lvl.price}</span>
                </div>
            </div>
            <div class="order-stars-row">
                <span class="order-stars">${starsHTML}</span>
            </div>
            ${best > 0 ? `<div class="best-income">💵 最高 ¥${best.toLocaleString()}</div>` : ''}
            ${!unlocked ? '<div class="locked-icon">🔒</div><div class="order-locked-text">完成上一单解锁</div>' : '<button class="accept-order-btn">🚀 接单</button>'}
        `;
        if (unlocked) {
            const btn = card.querySelector('.accept-order-btn');
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showOrderConfirm(lvl.id);
                });
            }
            card.addEventListener('click', () => showOrderConfirm(lvl.id));
        }
        list.appendChild(card);
    });

    for (let i = 2; i <= save.unlocked; i++) {
        if (!save.seenHints.includes(i)) {
            setTimeout(() => showLevelHintCard(i), 300);
            break;
        }
    }
}

function updateRestaurantStats(save) {
    const today = new Date().toDateString();
    let todayOrders = 0;
    if (save.lastOrderDate === today) {
        todayOrders = save._todayOrders || 0;
    }
    document.getElementById('rest-today-orders').textContent = todayOrders;
    document.getElementById('rest-total-income').textContent = '¥' + save.totalIncome.toLocaleString();
    const totalStars = Object.values(save.levelStars).reduce((a, b) => a + b, 0);
    const avgStars = Object.keys(save.levelStars).length > 0 ? (totalStars / Object.keys(save.levelStars).length).toFixed(1) : '0.0';
    document.getElementById('rest-avg-stars').textContent = '⭐' + avgStars;
}

function formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function showOrderConfirm(levelId) {
    const lvl = LEVELS.find(l => l.id === levelId);
    if (!lvl) return;
    pendingOrderLevelId = levelId;

    document.getElementById('confirm-order-no').textContent = '📋 订单号：' + lvl.orderNo;
    document.getElementById('confirm-dish').innerHTML = lvl.recipe + ' · ' + lvl.dishName;
    document.getElementById('confirm-customer').textContent = lvl.customer;
    document.getElementById('confirm-timelimit').textContent = formatTime(lvl.timeLimit);
    document.getElementById('confirm-tolerance').textContent = '最多 ' + lvl.badFoodTolerance + ' 次';
    document.getElementById('confirm-target').textContent = lvl.targetScore.toLocaleString();
    document.getElementById('confirm-price').textContent = '¥' + lvl.price;
    const diffEl = document.getElementById('confirm-difficulty');
    diffEl.textContent = lvl.difficultyLabel;
    diffEl.className = 'confirm-difficulty diff-' + lvl.difficulty;

    document.getElementById('order-confirm').style.display = 'flex';
}

function dismissOrderConfirm() {
    document.getElementById('order-confirm').style.display = 'none';
    pendingOrderLevelId = null;
}

function acceptPendingOrder() {
    if (pendingOrderLevelId !== null) {
        const id = pendingOrderLevelId;
        dismissOrderConfirm();
        startLevel(id);
    }
}

function calcStars(level, accuracy, hp, badCuts) {
    const c = level.starCriteria;
    if (accuracy >= c.star3.accuracy && hp >= c.star3.hp && badCuts <= c.star3.badCuts) return 3;
    if (accuracy >= c.star2.accuracy && hp >= c.star2.hp && badCuts <= c.star2.badCuts) return 2;
    if (accuracy >= c.star1.accuracy && hp >= c.star1.hp && badCuts <= c.star1.badCuts) return 1;
    return 0;
}

function renderStars(stars) {
    return '<span class="star star-on">⭐</span>'.repeat(stars) +
           '<span class="star star-off">☆</span>'.repeat(3 - stars);
}

function generateVerificationToken(levelId, stars, score, timestamp) {
    const raw = `RC-${levelId}-${stars}-${score}-${timestamp}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) - hash) + raw.charCodeAt(i);
        hash |= 0;
    }
    return `${raw}-${Math.abs(hash).toString(36).toUpperCase()}`;
}

function verifyToken(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('-');
    if (parts.length < 6) return null;
    const [, levelIdStr, starsStr, scoreStr, timestampStr, checksum] = parts;
    const levelId = parseInt(levelIdStr, 10);
    const stars = parseInt(starsStr, 10);
    const score = parseInt(scoreStr, 10);
    const timestamp = parseInt(timestampStr, 10);
    const raw = `RC-${levelId}-${stars}-${score}-${timestamp}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) - hash) + raw.charCodeAt(i);
        hash |= 0;
    }
    if (Math.abs(hash).toString(36).toUpperCase() !== checksum) return null;
    return { levelId, stars, score, timestamp, valid: true };
}

function checkURLVerification() {
    try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('verify');
        if (token) {
            const result = verifyToken(token);
            if (result) {
                const lvl = LEVELS.find(l => l.id === result.levelId);
                const dish = lvl ? lvl.dishName : '未知菜品';
                const date = new Date(result.timestamp);
                const msg = `✅ 浏览器验证通过：[${dish}] ⭐${result.stars}星 / ¥${result.score}`;
                console.log(msg, result);
                try {
                    sessionStorage.setItem('verify_result', JSON.stringify(result));
                } catch (e) {}
            }
        }
    } catch (e) {}
}

function updateLevelStars(levelId, stars) {
    const save = getSaveData();
    const prev = save.levelStars[levelId] || 0;
    if (stars > prev) {
        save.levelStars[levelId] = stars;
        saveData(save);
    }
}

// ==================== 游戏引擎 ====================
class GameEngine {
    constructor(replayMode = false) {
        this.replayMode = replayMode;
        this.prefix = replayMode ? 'replay-' : '';
        this.running = false;
        this.paused = false;
        this.startTime = 0;
        this.pauseTime = 0;
        this.pauseOffset = 0;
        this.rafId = null;

        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.hp = MAX_HP;
        this.judges = { perfect: 0, great: 0, good: 0, miss: 0, bad: 0 };

        this.level = null;
        this.notesData = [];
        this.activeNotes = [];
        this.passedGoodNotes = new Set();
        this.passedBadNotes = new Set();
        this.judgedNotes = new Set();

        this.replay = null;
        this.currentReplayIndex = 0;

        this.keydownReplayFrames = [];

        this.dodgeCount = 0;
        this.badCutsCount = 0;
        this.newlyUnlockedAchievements = [];

        this.timelineDuration = 0;
        this.timelineSeekable = false;
        this.isDraggingTimeline = false;

        this.timeRemaining = 0;
        this.timeLimit = 0;
        this.badFoodTolerance = 0;
        this.levelEndReason = null;
    }

    start(levelId, replayData = null) {
        this.level = LEVELS.find(l => l.id === levelId);
        if (replayData && replayData.chart) {
            this.notesData = JSON.parse(JSON.stringify(replayData.chart));
        } else {
            this.notesData = JSON.parse(JSON.stringify(this.level.data.notes));
        }
        this.notesData = this.notesData.sort((a, b) => a.time - b.time);
        this.notesData.forEach((n, i) => n._id = i);

        this.activeNotes = [];
        this.passedGoodNotes = new Set();
        this.passedBadNotes = new Set();
        this.judgedNotes = new Set();
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.hp = MAX_HP;
        this.judges = { perfect: 0, great: 0, good: 0, miss: 0, bad: 0 };
        this.dodgeCount = 0;
        this.badCutsCount = 0;
        this.newlyUnlockedAchievements = [];
        this.replay = replayData;
        this.currentReplayIndex = 0;
        this.replayActions = replayData ? (replayData.actions || []) : [];
        this.recordedActions = [];
        this.recordedHits = [];

        this.timeLimit = this.level.timeLimit;
        this.timeRemaining = this.timeLimit;
        this.badFoodTolerance = this.level.badFoodTolerance;
        this.levelEndReason = null;

        this.clearVisuals();
        this.updateHUD();
        this.updateLevelInfo();

        this.running = true;
        this.paused = false;
        this.pauseOffset = 0;
        this.startTime = performance.now();
        this.lastFrameTime = this.startTime;

        if (this.replayMode && replayData) {
            this.initTimeline(replayData);
        }

        this.loop();
    }

    stop() {
        this.running = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        document.querySelectorAll('.lane').forEach(l => l.classList.remove('active'));
    }

    pause() {
        if (!this.running || this.paused) return;
        this.paused = true;
        this.pauseTime = performance.now();
        if (this.rafId) cancelAnimationFrame(this.rafId);
    }

    resume() {
        if (!this.paused) return;
        this.pauseOffset += performance.now() - this.pauseTime;
        this.paused = false;
        this.lastFrameTime = performance.now();
        this.loop();
    }

    getCurrentTime() {
        return (this.paused ? this.pauseTime : performance.now()) - this.startTime - this.pauseOffset;
    }

    clearVisuals() {
        document.querySelectorAll(`#${this.prefix}lanes .note-container`).forEach(nc => nc.innerHTML = '');
        document.getElementById(`${this.prefix}fx-layer`).innerHTML = '';
        document.getElementById(`${this.prefix}judge-text`).className = 'judge-text';
    }

    updateHUD() {
        document.getElementById(`${this.prefix}score`).textContent = Math.floor(this.score).toLocaleString();
        const comboEl = document.getElementById(`${this.prefix}combo`);
        comboEl.textContent = this.combo;
        if (this.combo > 0 && this.combo % 10 === 0) {
            comboEl.classList.remove('pulse');
            void comboEl.offsetWidth;
            comboEl.classList.add('pulse');
        }
        const maxComboEl = document.getElementById(`${this.prefix}max-combo`);
        if (maxComboEl) maxComboEl.textContent = this.maxCombo;
        this.updateHP();
        this.updateGoal();
        if (this.prefix === '') {
            this.updateTimer();
            this.updateBadTolerance();
        }
    }

    updateTimer() {
        const timerEl = document.getElementById('timer');
        if (!timerEl) return;
        const remaining = Math.max(0, this.timeRemaining);
        const totalSec = Math.ceil(remaining / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        timerEl.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        timerEl.classList.remove('timer-warn', 'timer-danger');
        const ratio = remaining / this.timeLimit;
        if (ratio <= 0.2) timerEl.classList.add('timer-danger');
        else if (ratio <= 0.4) timerEl.classList.add('timer-warn');
    }

    updateBadTolerance() {
        const fillEl = document.getElementById('bad-tolerance');
        const textEl = document.getElementById('bad-tolerance-text');
        if (!fillEl || !textEl) return;
        const used = Math.min(this.badCutsCount, this.badFoodTolerance);
        const percent = this.badFoodTolerance > 0 ? (used / this.badFoodTolerance) * 100 : 0;
        fillEl.style.width = percent + '%';
        fillEl.classList.remove('tolerance-warn', 'tolerance-danger');
        if (used >= this.badFoodTolerance) fillEl.classList.add('tolerance-danger');
        else if (used >= Math.max(0, this.badFoodTolerance - 1)) fillEl.classList.add('tolerance-warn');
        textEl.textContent = `${used} / ${this.badFoodTolerance}`;
    }

    updateHP() {
        const hp = Math.max(0, Math.min(MAX_HP, this.hp));
        const fill = document.getElementById(`${this.prefix === '' ? '' : ''}hp`);
        if (!fill && this.prefix !== '') {
            // replay mode no hp
            return;
        }
        if (fill) {
            fill.style.width = (hp / MAX_HP * 100) + '%';
            fill.classList.remove('warning', 'danger');
            if (hp <= 25) fill.classList.add('danger');
            else if (hp <= 50) fill.classList.add('warning');
        }
    }

    updateGoal() {
        if (this.prefix !== '') return;
        const max = this.level.targetScore;
        const cur = Math.min(this.score, max);
        const progress = cur / max * 100;
        document.getElementById('goal-progress').style.width = progress + '%';
        document.getElementById('goal-text').textContent = `${Math.floor(cur).toLocaleString()} / ${max.toLocaleString()}`;
    }

    updateLevelInfo() {
        const nameEl = document.getElementById(`${this.prefix}level-name`);
        if (nameEl) nameEl.textContent = `第${this.level.id}关 · ${this.level.name}`;
    }

    loop = () => {
        if (!this.running || this.paused) return;
        const now = this.getCurrentTime();
        const frameTime = performance.now();

        if (!this.replayMode) {
            this.timeRemaining = this.timeLimit - now;
            if (this.timeRemaining <= 0) {
                this.timeRemaining = 0;
                this.running = false;
                this.levelEndReason = 'timeout';
                setTimeout(() => onLevelComplete(this), 500);
                return;
            }
        }

        if (this.replayMode && this.replayActions) {
            while (this.currentReplayIndex < this.replayActions.length &&
                   this.replayActions[this.currentReplayIndex].time <= now) {
                const act = this.replayActions[this.currentReplayIndex];
                this.currentReplayIndex++;
                if (act.type === 'down') {
                    this.handleKeyDown(act.lane, act.time);
                }
            }
        }

        this.updateNotes(now);
        this.checkMissedNotes(now);
        this.updateHUD();

        if (this.replayMode) {
            this.updateTimelinePlayhead(now);
        }

        if (this.allNotesPassed(now) && this.activeNotes.length === 0) {
            this.running = false;
            this.levelEndReason = 'complete';
            if (this.replayMode) {
                this.updateTimelinePlayhead(this.timelineDuration);
            } else {
                setTimeout(() => onLevelComplete(this), 500);
            }
            return;
        }

        if (!this.replayMode && this.hp <= 0) {
            this.running = false;
            this.levelEndReason = 'dead';
            setTimeout(() => onLevelComplete(this), 500);
            return;
        }

        if (!this.replayMode && this.badCutsCount > this.badFoodTolerance) {
            this.running = false;
            this.levelEndReason = 'badfood';
            setTimeout(() => onLevelComplete(this), 500);
            return;
        }

        this.rafId = requestAnimationFrame(this.loop);
    }

    updateNotes(now) {
        // 生成新音符
        const spawnThreshold = now + NOTE_TRAVEL_TIME;
        while (this.notesData.length > 0 && this.notesData[0].time <= spawnThreshold) {
            const note = this.notesData.shift();
            this.spawnNote(note);
        }

        // 更新位置 & 移除已判定
        const lanes = document.querySelectorAll(`#${this.prefix}lanes .lane`);
        this.activeNotes = this.activeNotes.filter(n => {
            if (n.removed) return false;
            const progress = (now - (n.data.time - NOTE_TRAVEL_TIME)) / NOTE_TRAVEL_TIME;
            if (n.el) {
                const stage = document.getElementById(`${this.prefix}stage`);
                const laneEl = lanes[n.data.lane];
                const laneHeight = laneEl.clientHeight;
                const judgeY = laneHeight - 80;
                const top = -68 + progress * (judgeY + 68);
                n.el.style.top = top + 'px';
            }
            return true;
        });
    }

    spawnNote(data) {
        const laneEl = document.querySelectorAll(`#${this.prefix}lanes .lane`)[data.lane];
        const container = laneEl.querySelector('.note-container');
        const el = document.createElement('div');
        el.className = 'note ' + (data.type === 'bad' ? 'bad-food' : 'good-food');
        el.textContent = data.food;
        el.style.top = '-68px';
        container.appendChild(el);
        this.activeNotes.push({ data, el, removed: false });
    }

    checkMissedNotes(now) {
        for (let i = this.activeNotes.length - 1; i >= 0; i--) {
            const note = this.activeNotes[i];
            if (note.removed) continue;
            const diff = now - note.data.time;
            if (diff > JUDGE_WINDOWS.miss) {
                if (note.data.type === 'good') {
                    this.handleJudge('miss', note, now);
                } else {
                    this.handleJudge('bad-dodge', note, now);
                }
            }
        }
    }

    allNotesPassed(now) {
        if (this.notesData.length > 0) return false;
        if (this.activeNotes.length === 0) return true;
        const last = this.activeNotes[this.activeNotes.length - 1];
        return now - last.data.time > JUDGE_WINDOWS.miss + 200;
    }

    handleKeyDown(lane, now = null) {
        if (!this.running || this.paused) return;
        if (lane < 0 || lane >= LANE_COUNT) return;
        now = now ?? this.getCurrentTime();

        // 视觉反馈
        const laneEl = document.querySelectorAll(`#${this.prefix}lanes .lane`)[lane];
        laneEl.classList.add('active');
        setTimeout(() => laneEl.classList.remove('active'), 100);

        // 记录（非回放）
        if (!this.replayMode) {
            this.recordedActions.push({ type: 'down', lane, time: now });
        }

        // 找最近的可判定音符
        let closest = null;
        let closestDiff = Infinity;
        for (const note of this.activeNotes) {
            if (note.removed) continue;
            if (note.data.lane !== lane) continue;
            const diff = Math.abs(now - note.data.time);
            if (diff <= JUDGE_WINDOWS.miss && diff < closestDiff) {
                closestDiff = diff;
                closest = note;
            }
        }

        if (!closest) {
            if (!this.replayMode) {
                this.combo = 0;
                this.hp -= HP_DAMAGE_EMPTY;
                this.showJudge('MISS', 'miss');
            }
            return;
        }

        if (closest.data.type === 'bad') {
            this.handleJudge('bad-cut', closest, now);
        } else {
            const diff = Math.abs(now - closest.data.time);
            let judge;
            if (diff <= JUDGE_WINDOWS.perfect) judge = 'perfect';
            else if (diff <= JUDGE_WINDOWS.great) judge = 'great';
            else if (diff <= JUDGE_WINDOWS.good) judge = 'good';
            else judge = 'miss';
            this.handleJudge(judge, closest, now);
        }
    }

    handleJudge(judge, note, now) {
        if (this.judgedNotes.has(note.data._id)) return;
        this.judgedNotes.add(note.data._id);
        note.removed = true;

        // 移除元素
        if (note.el) {
            note.el.classList.add('hit');
            setTimeout(() => note.el.remove(), 300);
        }

        switch (judge) {
            case 'perfect':
                this.combo++;
                this.maxCombo = Math.max(this.maxCombo, this.combo);
                if (!this.replayMode) {
                    const unlocked = checkComboAchievements(this.combo);
                    unlocked.forEach(ach => {
                        this.newlyUnlockedAchievements.push(ach);
                        showAchievementPopup(ach);
                    });
                }
                {
                    const steps = Math.floor(this.combo / COMBO_BONUS_STEP);
                    const bonusPerfect = 1 + Math.min(steps * COMBO_BONUS_PER_STEP, MAX_COMBO_BONUS - 1);
                    this.score += SCORE_VALUES.perfect * bonusPerfect;
                }
                this.judges.perfect++;
                this.hp = Math.min(MAX_HP, this.hp + HP_HEAL_PERFECT);
                this.showJudge('PERFECT', 'perfect');
                this.showHitFx(note.data.lane, 'perfect');
                break;
            case 'great':
                this.combo++;
                this.maxCombo = Math.max(this.maxCombo, this.combo);
                if (!this.replayMode) {
                    const unlocked = checkComboAchievements(this.combo);
                    unlocked.forEach(ach => {
                        this.newlyUnlockedAchievements.push(ach);
                        showAchievementPopup(ach);
                    });
                }
                {
                    const steps = Math.floor(this.combo / COMBO_BONUS_STEP);
                    const bonusGreat = 1 + Math.min(steps * COMBO_BONUS_PER_STEP, MAX_COMBO_BONUS - 1);
                    this.score += SCORE_VALUES.great * bonusGreat;
                }
                this.judges.great++;
                this.showJudge('GREAT', 'great');
                this.showHitFx(note.data.lane, 'great');
                break;
            case 'good':
                this.combo++;
                this.maxCombo = Math.max(this.maxCombo, this.combo);
                if (!this.replayMode) {
                    const unlocked = checkComboAchievements(this.combo);
                    unlocked.forEach(ach => {
                        this.newlyUnlockedAchievements.push(ach);
                        showAchievementPopup(ach);
                    });
                }
                {
                    const steps = Math.floor(this.combo / COMBO_BONUS_STEP);
                    const bonusGood = 1 + Math.min(steps * COMBO_BONUS_PER_STEP, MAX_COMBO_BONUS - 1);
                    this.score += SCORE_VALUES.good * bonusGood;
                }
                this.judges.good++;
                this.showJudge('GOOD', 'good');
                this.showHitFx(note.data.lane, 'good');
                break;
            case 'miss':
                this.combo = 0;
                this.judges.miss++;
                this.hp -= HP_DAMAGE_MISS;
                this.showJudge('MISS', 'miss');
                break;
            case 'bad-cut':
                this.combo = 0;
                this.judges.bad++;
                this.badCutsCount++;
                this.score = Math.max(0, this.score - 800);
                this.hp -= HP_DAMAGE_BAD;
                this.showJudge('BAD CUT!', 'bad');
                this.showHitFx(note.data.lane, 'bad');
                break;
            case 'bad-dodge':
                // 坏食材成功躲避：少量加分
                this.judges.bad++;
                this.score += 50;
                this.dodgeCount++;
                break;
        }

        // 记录命中
        if (!this.replayMode) {
            this.recordedHits.push({
                noteId: note.data._id,
                judge,
                time: now,
                lane: note.data.lane
            });
        }
    }

    showJudge(text, cls) {
        const el = document.getElementById(`${this.prefix}judge-text`);
        el.textContent = text;
        el.className = 'judge-text';
        void el.offsetWidth;
        el.classList.add('show', cls);
    }

    showHitFx(laneIdx, type) {
        const fxLayer = document.getElementById(`${this.prefix}fx-layer`);
        const lanesEl = document.getElementById(`${this.prefix}lanes`);
        const laneEl = lanesEl.children[laneIdx];
        const laneRect = laneEl.getBoundingClientRect();
        const stageRect = document.getElementById(`${this.prefix}stage`).getBoundingClientRect();
        const fx = document.createElement('div');
        fx.className = 'hit-fx ' + type;
        fx.style.left = (laneRect.left - stageRect.left + laneRect.width / 2) + 'px';
        fx.style.top = (laneRect.bottom - stageRect.top - 80) + 'px';
        fxLayer.appendChild(fx);
        setTimeout(() => fx.remove(), 600);
    }

    getReplayData() {
        return {
            levelId: this.level.id,
            duration: this.getCurrentTime(),
            chart: JSON.parse(JSON.stringify(this.level.data.notes)),
            actions: this.recordedActions,
            hits: this.recordedHits,
            finalScore: Math.floor(this.score),
            maxCombo: this.maxCombo,
            judges: { ...this.judges },
            timestamp: Date.now()
        };
    }

    initTimeline(replayData) {
        const notes = replayData.chart || [];
        const actions = replayData.actions || [];
        const hits = replayData.hits || [];

        const lastNoteTime = notes.length > 0 ? Math.max(...notes.map(n => n.time)) : 0;
        const lastActionTime = actions.length > 0 ? Math.max(...actions.map(a => a.time)) : 0;
        const lastHitTime = hits.length > 0 ? Math.max(...hits.map(h => h.time)) : 0;
        this.timelineDuration = Math.max(lastNoteTime, lastActionTime, lastHitTime) + 500;

        this.renderTimeline(notes, actions, hits);
        this.timelineSeekable = true;
        this.setupTimelineInteractions();

        const track = document.querySelector('.timeline-track');
        if (track) {
            track.scrollLeft = 0;
        }
    }

    renderTimeline(notes, actions, hits) {
        const duration = this.timelineDuration;
        const laneContents = document.querySelectorAll('.timeline-lane-content[data-lane]');
        const judgeContent = document.querySelector('.timeline-judge-content');
        const dodgeContent = document.querySelector('.timeline-dodge-content');
        const track = document.querySelector('.timeline-track');
        const wrapper = document.getElementById('timeline-content-wrapper');

        const minWidth = 800;
        const pixelsPerSecond = 150;
        const labelWidth = 40;
        const contentWidth = Math.max(minWidth, (duration / 1000) * pixelsPerSecond);
        const totalWidth = labelWidth + contentWidth;

        if (wrapper) {
            wrapper.style.width = totalWidth + 'px';
        }

        laneContents.forEach(el => {
            el.style.width = contentWidth + 'px';
        });
        if (judgeContent) judgeContent.style.width = contentWidth + 'px';
        if (dodgeContent) dodgeContent.style.width = contentWidth + 'px';

        laneContents.forEach(el => el.innerHTML = '');
        if (judgeContent) judgeContent.innerHTML = '';
        if (dodgeContent) dodgeContent.innerHTML = '';

        actions.forEach(action => {
            if (action.type === 'down') {
                const laneEl = document.querySelector(`.timeline-lane-content[data-lane="${action.lane}"]`);
                if (laneEl) {
                    const note = document.createElement('div');
                    note.className = `timeline-note key-press lane-${action.lane}`;
                    const left = (action.time / duration) * 100;
                    note.style.left = `calc(${left}% - 5px)`;
                    note.title = `按键 ${KEYS[action.lane].toUpperCase()} - ${(action.time / 1000).toFixed(2)}s`;
                    note.dataset.time = action.time;
                    note.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.seekTo(action.time);
                    });
                    laneEl.appendChild(note);
                }
            }
        });

        hits.forEach(hit => {
            if (judgeContent) {
                const judgeEl = document.createElement('div');
                let judgeClass = hit.judge;
                if (hit.judge === 'bad-cut' || hit.judge === 'bad-dodge') {
                    judgeClass = 'bad';
                }
                judgeEl.className = `timeline-judge ${judgeClass}`;
                const left = (hit.time / duration) * 100;
                judgeEl.style.left = `calc(${left}% - 5px)`;
                const judgeText = this.getJudgeLabel(hit.judge);
                judgeEl.title = `${judgeText} - ${(hit.time / 1000).toFixed(2)}s - 轨道${KEYS[hit.lane].toUpperCase()}`;
                judgeEl.dataset.time = hit.time;
                judgeEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.seekTo(hit.time);
                });
                judgeContent.appendChild(judgeEl);
            }
        });

        notes.forEach(note => {
            if (note.type === 'bad') {
                const hit = hits.find(h => h.noteId === note._id);
                if (dodgeContent) {
                    const dodgeEl = document.createElement('div');
                    const isDodged = hit && (hit.judge === 'bad-dodge');
                    dodgeEl.className = `timeline-dodge ${isDodged ? 'dodged' : 'bad-hit'}`;
                    const left = (note.time / duration) * 100;
                    dodgeEl.style.left = `calc(${left}% - 6px)`;
                    const status = isDodged ? '闪避成功' : '切到坏食材';
                    dodgeEl.title = `${status} - ${(note.time / 1000).toFixed(2)}s - 轨道${KEYS[note.lane].toUpperCase()}`;
                    dodgeEl.dataset.time = note.time;
                    dodgeEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.seekTo(note.time);
                    });
                    dodgeContent.appendChild(dodgeEl);
                }
            }
        });
    }

    getJudgeLabel(judge) {
        const labels = {
            'perfect': 'PERFECT',
            'great': 'GREAT',
            'good': 'GOOD',
            'miss': 'MISS',
            'bad-cut': 'BAD CUT',
            'bad-dodge': 'DODGED'
        };
        return labels[judge] || judge;
    }

    setupTimelineInteractions() {
        const timeline = document.getElementById('replay-timeline');
        const track = document.querySelector('.timeline-track');
        const thumb = document.getElementById('timeline-thumb');
        const scrollbar = document.getElementById('timeline-scrollbar');

        if (!timeline || !track || !thumb || !scrollbar) return;

        const getTimeFromScrollPercent = (scrollPercent) => {
            return Math.max(0, Math.min(1, scrollPercent)) * this.timelineDuration;
        };

        const handleSeekFromClientX = (clientX) => {
            const laneContent = document.querySelector('.timeline-lane-content[data-lane="0"]');
            if (!laneContent) return;
            const rect = laneContent.getBoundingClientRect();
            const x = clientX - rect.left + track.scrollLeft;
            const contentWidth = laneContent.scrollWidth;
            const percent = Math.max(0, Math.min(1, x / contentWidth));
            const time = percent * this.timelineDuration;
            this.seekTo(time);
        };

        timeline.addEventListener('click', (e) => {
            if (e.target.closest('.timeline-note') || e.target.closest('.timeline-judge') || e.target.closest('.timeline-dodge') || e.target.closest('.timeline-scrollbar')) {
                return;
            }
            handleSeekFromClientX(e.clientX);
        });

        let isDraggingThumb = false;
        let startX = 0;
        let startScrollLeft = 0;
        let lastSeekTime = 0;

        thumb.addEventListener('mousedown', (e) => {
            isDraggingThumb = true;
            this.isDraggingTimeline = true;
            startX = e.clientX;
            startScrollLeft = track.scrollLeft;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDraggingThumb) return;
            const deltaX = e.clientX - startX;
            const contentWidth = track.scrollWidth;
            const maxScroll = contentWidth - track.clientWidth;
            const thumbWidth = thumb.offsetWidth;
            const scrollbarWidth = scrollbar.clientWidth;
            const scrollPercent = deltaX / (scrollbarWidth - thumbWidth);
            track.scrollLeft = startScrollLeft + scrollPercent * maxScroll;

            const now = performance.now();
            if (now - lastSeekTime > 80) {
                const newScrollPercent = maxScroll > 0 ? track.scrollLeft / maxScroll : 0;
                this.updateTimelinePlayhead(getTimeFromScrollPercent(newScrollPercent));
                lastSeekTime = now;
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (isDraggingThumb) {
                isDraggingThumb = false;
                this.isDraggingTimeline = false;
                const contentWidth = track.scrollWidth;
                const maxScroll = contentWidth - track.clientWidth;
                const scrollPercent = maxScroll > 0 ? track.scrollLeft / maxScroll : 0;
                const targetTime = getTimeFromScrollPercent(scrollPercent);
                this.seekTo(targetTime);
            }
        });

        track.addEventListener('scroll', () => {
            this.updateThumbPosition();
        });

        setTimeout(() => this.updateThumbPosition(), 100);
    }

    updateThumbPosition() {
        const track = document.querySelector('.timeline-track');
        const thumb = document.getElementById('timeline-thumb');
        const scrollbar = document.getElementById('timeline-scrollbar');
        if (!track || !thumb || !scrollbar) return;

        const contentWidth = track.scrollWidth;
        const viewWidth = track.clientWidth;
        const scrollLeft = track.scrollLeft;
        const maxScroll = contentWidth - viewWidth;

        if (maxScroll <= 0) {
            thumb.style.width = '100%';
            thumb.style.left = '0';
            return;
        }

        const thumbWidth = Math.max(60, (viewWidth / contentWidth) * scrollbar.clientWidth);
        const thumbLeft = (scrollLeft / maxScroll) * (scrollbar.clientWidth - thumbWidth);

        thumb.style.width = thumbWidth + 'px';
        thumb.style.left = thumbLeft + 'px';
    }

    seekTo(targetTime) {
        if (!this.replayMode || !this.replay) return;
        if (!this.timelineSeekable) return;

        targetTime = Math.max(0, Math.min(targetTime, this.timelineDuration));

        const levelId = this.level.id;
        const replayData = this.replay;

        this.stop();

        this.level = LEVELS.find(l => l.id === levelId);
        this.notesData = JSON.parse(JSON.stringify(replayData.chart));
        this.notesData = this.notesData.sort((a, b) => a.time - b.time);
        this.notesData.forEach((n, i) => n._id = i);

        this.activeNotes = [];
        this.passedGoodNotes = new Set();
        this.passedBadNotes = new Set();
        this.judgedNotes = new Set();
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.hp = MAX_HP;
        this.judges = { perfect: 0, great: 0, good: 0, miss: 0, bad: 0 };
        this.dodgeCount = 0;
        this.newlyUnlockedAchievements = [];
        this.replay = replayData;
        this.currentReplayIndex = 0;
        this.replayActions = replayData.actions || [];
        this.recordedActions = [];
        this.recordedHits = [];

        this.clearVisuals();

        const now = performance.now();
        this.running = true;
        this.paused = false;
        this.pauseOffset = 0;
        this.startTime = now - targetTime;
        this.lastFrameTime = now;

        this.simulateToTime(targetTime);
        this.updateHUD();
        this.updateLevelInfo();

        this.loop();
    }

    simulateToTime(targetTime) {
        const actions = this.replayActions || [];
        const events = [];

        actions.forEach((act, idx) => {
            if (act.type === 'down' && act.time <= targetTime) {
                events.push({ time: act.time, type: 'action', data: act, index: idx });
            }
        });

        const spawnThreshold = targetTime + NOTE_TRAVEL_TIME;
        while (this.notesData.length > 0 && this.notesData[0].time <= spawnThreshold) {
            const note = this.notesData.shift();
            this.spawnNote(note);
            if (note.time + JUDGE_WINDOWS.miss <= targetTime) {
                events.push({
                    time: note.time + JUDGE_WINDOWS.miss,
                    type: 'miss',
                    data: note
                });
            }
        }

        events.sort((a, b) => {
            if (a.time !== b.time) return a.time - b.time;
            return (a.type === 'miss' ? 1 : 0) - (b.type === 'miss' ? 1 : 0);
        });

        for (const event of events) {
            if (event.type === 'action') {
                this.currentReplayIndex = event.index + 1;
                this.handleKeyDown(event.data.lane, event.time);
            } else if (event.type === 'miss') {
                for (let i = this.activeNotes.length - 1; i >= 0; i--) {
                    const note = this.activeNotes[i];
                    if (note.removed) continue;
                    if (note.data._id !== event.data._id) continue;
                    if (note.data.type === 'good') {
                        this.handleJudge('miss', note, event.time);
                    } else {
                        this.handleJudge('bad-dodge', note, event.time);
                    }
                    break;
                }
            }
        }

        this.activeNotes = this.activeNotes.filter(n => !n.removed);
    }

    updateTimelinePlayhead(currentTime) {
        const playhead = document.getElementById('timeline-playhead');
        const timeDisplay = document.getElementById('replay-time-display');
        const laneContent = document.querySelector('.timeline-lane-content[data-lane="0"]');
        const track = document.querySelector('.timeline-track');

        if (!playhead || !timeDisplay || !laneContent || !track) return;

        const duration = this.timelineDuration;
        const labelWidth = 40;
        const contentWidth = laneContent.scrollWidth;
        const percent = Math.min(1, currentTime / duration);
        const x = labelWidth + percent * contentWidth;

        playhead.style.left = x + 'px';

        const currentSec = (currentTime / 1000).toFixed(2);
        const totalSec = (duration / 1000).toFixed(2);
        timeDisplay.textContent = `${currentSec}s / ${totalSec}s`;

        if (this.running && !this.paused && !this.isDraggingTimeline) {
            const trackRect = track.getBoundingClientRect();
            const playheadRect = playhead.getBoundingClientRect();
            const playheadRelX = playheadRect.left - trackRect.left;
            const viewWidth = track.clientWidth;

            if (playheadRelX > viewWidth * 0.7 || playheadRelX < viewWidth * 0.3) {
                const targetScroll = x - viewWidth * 0.5;
                track.scrollLeft = Math.max(0, targetScroll);
            }
        }
    }
}

// ==================== 游戏状态 ====================
let game = null;
let replayGame = null;

let _levelDataLoaded = false;

// ==================== 开始关卡 ====================
function startLevel(levelId) {
    if (!_levelDataLoaded) {
        loadLevelData();
        _levelDataLoaded = true;
    }
    game = new GameEngine(false);
    showScreen('game');
    game.start(levelId);
}

// ==================== 关卡完成 ====================
function onLevelComplete(engine) {
    const level = engine.level;
    const finalScore = Math.floor(engine.score);
    const judges = engine.judges;
    const badCuts = engine.badCutsCount;
    const endReason = engine.levelEndReason;
    const timeUsed = engine.getCurrentTime();

    const totalGood = judges.perfect + judges.great + judges.good + judges.miss;
    const accuracy = totalGood > 0 ? (judges.perfect * 1 + judges.great * 0.8 + judges.good * 0.5) / totalGood : 0;
    const hpRemaining = Math.max(0, Math.round(engine.hp));

    let rank = 'F';
    if (accuracy >= 0.95 && hpRemaining > 50) rank = 'S';
    else if (accuracy >= 0.85) rank = 'A';
    else if (accuracy >= 0.7) rank = 'B';
    else if (accuracy >= 0.5) rank = 'C';
    else rank = 'F';

    const starsPass = (endReason === 'complete' || (endReason !== 'timeout' && endReason !== 'badfood' && endReason !== 'dead'));
    let passed = false;
    let stars = 0;
    if (starsPass && engine.hp > 0 && endReason !== 'timeout') {
        passed = finalScore >= level.targetScore;
        stars = passed ? calcStars(level, accuracy, hpRemaining, badCuts) : 0;
    }

    if (!engine.replayMode) {
        updateMaxCombo(engine.maxCombo);
        updateLevelBestRank(level.id, rank, accuracy, engine.hp);
        const sRankUnlocked = checkSRankAchievements(level.id, rank);
        sRankUnlocked.forEach(ach => showAchievementPopup(ach));
        const dodgeUnlocked = checkDodgeAchievements(engine.dodgeCount);
        dodgeUnlocked.forEach(ach => showAchievementPopup(ach));
    }

    const save = getSaveData();

    let newUnlock = false;
    if (passed) {
        if (level.id >= save.unlocked && level.id < LEVELS.length) {
            save.unlocked = level.id + 1;
            newUnlock = true;
        }
        const today = new Date().toDateString();
        if (save.lastOrderDate !== today) {
            save.lastOrderDate = today;
            save._todayOrders = 0;
        }
        save._todayOrders = (save._todayOrders || 0) + 1;
        save.totalOrders = (save.totalOrders || 0) + 1;
        save.totalIncome = (save.totalIncome || 0) + finalScore;
    }

    if (passed) {
        updateLevelStars(level.id, stars);
    }

    const prevBest = save.bestScores[level.id] || 0;
    const thisReplay = engine.getReplayData();
    if (!save.lastReplays) save.lastReplays = {};
    save.lastReplays[level.id] = thisReplay;
    if (finalScore > prevBest) {
        save.bestScores[level.id] = finalScore;
        save.replays[level.id] = thisReplay;
    }
    saveData(save);

    const starsEl = document.getElementById('result-stars');
    starsEl.innerHTML = renderStars(stars);

    let titleMsg = '';
    switch (endReason) {
        case 'timeout': titleMsg = '⏰ 时间耗尽，订单超时！'; break;
        case 'dead': titleMsg = '💀 生命值耗尽，订单失败！'; break;
        case 'badfood': titleMsg = `🥀 切到坏食材超过容错 (${badCuts}/${level.badFoodTolerance})！`; break;
        default: titleMsg = passed ? `🎉 订单完成！${stars > 0 ? ' 获得' + stars + '⭐' : ''}` : (rank === 'F' ? '� 未达目标分数...' : '🎉 演奏结束！目标未达成'); break;
    }
    document.getElementById('result-title').textContent = titleMsg;

    const rankEl = document.getElementById('result-rank');
    rankEl.textContent = rank;
    rankEl.className = 'result-rank rank-' + rank.toLowerCase();

    document.getElementById('result-score').textContent = finalScore.toLocaleString();
    document.getElementById('result-combo').textContent = engine.maxCombo;
    document.getElementById('result-perfect').textContent = judges.perfect;
    document.getElementById('result-great').textContent = judges.great;
    document.getElementById('result-good').textContent = judges.good;
    document.getElementById('result-miss').textContent = judges.miss + judges.bad;
    document.getElementById('result-timeused').textContent = formatTime(timeUsed);
    document.getElementById('result-badcuts').textContent = badCuts;
    document.getElementById('result-accuracy').textContent = Math.round(accuracy * 10000) / 100 + '%';
    document.getElementById('result-hp').textContent = hpRemaining;

    const verifyEl = document.getElementById('verification-msg');
    if (passed && stars > 0) {
        const timestamp = Date.now();
        const token = generateVerificationToken(level.id, stars, finalScore, timestamp);
        const verifyURL = window.location.origin + window.location.pathname + '?verify=' + encodeURIComponent(token);
        verifyEl.style.display = 'block';
        verifyEl.innerHTML = `
            <div class="verify-box">
                <div class="verify-title">🔐 通关验证凭证</div>
                <div class="verify-token" onclick="navigator.clipboard && navigator.clipboard.writeText(this.textContent);this.classList.add('copied');" title="点击复制">${token}</div>
                <div class="verify-hint">点击凭证复制，或<a href="${verifyURL}" target="_blank" class="verify-link">🔗 分享验证链接</a></div>
            </div>
        `;
    } else {
        verifyEl.style.display = 'none';
        verifyEl.innerHTML = '';
    }

    const unlockMsg = document.getElementById('unlock-msg');
    const btnNext = document.getElementById('btn-next-level');
    btnNext.classList.remove('btn-unlock-anim');
    btnNext.querySelectorAll('.btn-sparkle').forEach(el => el.remove());
    if (newUnlock) {
        const nextLvl = LEVELS.find(l => l.id === level.id + 1);
        unlockMsg.textContent = `🎊 解锁新订单：${nextLvl.orderNo} · ${nextLvl.dishName}`;
        unlockMsg.style.display = 'block';
    } else {
        unlockMsg.style.display = 'none';
    }

    const nextLvl = LEVELS.find(l => l.id === level.id + 1);
    btnNext.style.display = (passed && nextLvl && nextLvl.id <= save.unlocked) ? '' : 'none';

    if (newUnlock && nextLvl) {
        btnNext.classList.add('btn-unlock-anim');
        ['✨', '⭐', '💫', '🌟', '✨'].forEach((emoji, i) => {
            const sp = document.createElement('span');
            sp.className = 'btn-sparkle';
            sp.textContent = emoji;
            sp.style.top = '-20px';
            btnNext.appendChild(sp);
        });
        setTimeout(() => showLevelHintCard(nextLvl.id), 600);
    }

    const btnReplay = document.getElementById('btn-watch-replay');
    btnReplay.style.display = '';

    showScreen('result');
}

// ==================== 回放系统 ====================
function watchReplay(levelId, replayData = null) {
    let replay = replayData;
    if (!replay) {
        const save = getSaveData();
        replay = save.lastReplays && save.lastReplays[levelId]
            ? save.lastReplays[levelId]
            : save.replays[levelId];
    }
    if (!replay) {
        alert('没有可用的回放记录！');
        return;
    }
    if (!_levelDataLoaded) {
        loadLevelData();
        _levelDataLoaded = true;
    }
    replayGame = new GameEngine(true);
    document.getElementById('replay-watching').classList.remove('hidden-overlay');
    document.getElementById('replay-watching').classList.add('active');
    setTimeout(() => {
        replayGame.start(levelId, replay);
    }, 100);
}

function exitReplay() {
    if (replayGame) replayGame.stop();
    document.getElementById('replay-watching').classList.add('hidden-overlay');
    document.getElementById('replay-watching').classList.remove('active');
}

// ==================== 键盘输入 ====================
const keyPressed = new Set();

document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (keyPressed.has(key)) return;
    const laneIdx = KEYS.indexOf(key);
    if (laneIdx !== -1) {
        e.preventDefault();
        keyPressed.add(key);
        if (game && game.running && !game.paused && !game.replayMode) {
            game.handleKeyDown(laneIdx);
        }
    }
    if (key === 'escape') {
        const confirmEl = document.getElementById('confirm-overlay');
        if (confirmEl.style.display !== 'none') {
            dismissConfirmDialog();
        } else if (game && game.running && !game.paused && !game.replayMode) {
            pauseGame();
        } else if (game && game.paused) {
            resumeGame();
        }
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    keyPressed.delete(key);
});

// ==================== 暂停/继续 ====================
function pauseGame() {
    if (!game) return;
    game.pause();
    document.getElementById('pause').classList.add('active');
    const save = getSaveData();
    const hasReplay = !!(save.replays[game.level.id] || (save.lastReplays && save.lastReplays[game.level.id]));
    document.getElementById('btn-replay-menu').style.display = hasReplay ? '' : 'none';
}

function resumeGame() {
    game.resume();
    document.getElementById('pause').classList.remove('active');
}

function quitToLevelSelect() {
    if (game) game.stop();
    game = null;
    document.getElementById('pause').classList.remove('active');
    document.getElementById('confirm-overlay').style.display = 'none';
    showScreen('level-select');
}

let _pendingConfirmAction = null;

function showConfirmDialog(title, message, action) {
    _pendingConfirmAction = action;
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').innerHTML = message;
    document.getElementById('confirm-overlay').style.display = 'flex';
}

function dismissConfirmDialog() {
    _pendingConfirmAction = null;
    document.getElementById('confirm-overlay').style.display = 'none';
}

function restartLevel() {
    if (!game) return;
    const levelId = game.level.id;
    game.stop();
    game = null;
    document.getElementById('pause').classList.remove('active');
    document.getElementById('confirm-overlay').style.display = 'none';
    startLevel(levelId);
}

// ==================== 初始化 ====================
function init() {
    if (!_levelDataLoaded) {
        loadLevelData();
        _levelDataLoaded = true;
    }

    checkURLVerification();

    document.getElementById('btn-start').addEventListener('click', () => {
        showScreen('level-select');
    });
    document.getElementById('btn-howto').addEventListener('click', () => {
        showScreen('howto');
    });
    document.getElementById('btn-achievements').addEventListener('click', () => {
        showScreen('achievements');
    });

    document.getElementById('btn-cancel-order').addEventListener('click', dismissOrderConfirm);
    document.getElementById('btn-accept-order').addEventListener('click', acceptPendingOrder);

    document.querySelectorAll('.ach-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.ach-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentAchCategory = tab.dataset.category;
            renderAchievementsList();
        });
    });

    const unequipBtn = document.getElementById('btn-unequip-title');
    if (unequipBtn) {
        unequipBtn.addEventListener('click', () => {
            unequipTitle();
            renderTitlesList();
            updateUnequipButton();
            document.getElementById('ach-current-title').textContent = '无';
        });
    }

    document.getElementById('btn-pause').addEventListener('click', pauseGame);
    document.getElementById('btn-resume').addEventListener('click', resumeGame);
    document.getElementById('btn-quit').addEventListener('click', () => {
        if (!game) return;
        const curScore = Math.floor(game.score).toLocaleString();
        showConfirmDialog(
            '确认退出？',
            `当前收入：<strong style="font-size:20px;">¥${curScore}</strong><br><br>退出订单后，<strong>本局未完成的收入和临时记录将会丢失</strong><br><span style="color:#888;font-size:14px;">（已保存的历史回放不会受影响）</span><br><br>确定取消这单吗？`,
            quitToLevelSelect
        );
    });
    document.getElementById('btn-restart').addEventListener('click', () => {
        if (!game) return;
        const curScore = Math.floor(game.score).toLocaleString();
        showConfirmDialog(
            '确认重新开始？',
            `当前收入：<strong style="font-size:20px;">¥${curScore}</strong><br><br>重新接单后，<strong>本局未完成的收入和临时记录将会丢失</strong><br><span style="color:#888;font-size:14px;">（已保存的历史回放不会受影响）</span><br><br>确定重来吗？`,
            restartLevel
        );
    });
    document.getElementById('btn-confirm-ok').addEventListener('click', () => {
        if (_pendingConfirmAction) _pendingConfirmAction();
    });
    document.getElementById('btn-confirm-cancel').addEventListener('click', dismissConfirmDialog);
    document.getElementById('btn-replay-menu').addEventListener('click', () => {
        if (!game) return;
        const levelId = game.level.id;
        game.stop();
        document.getElementById('pause').classList.remove('active');
        watchReplay(levelId);
    });

    document.getElementById('btn-retry').addEventListener('click', () => {
        dismissLevelHint();
        const btnNext = document.getElementById('btn-next-level');
        btnNext.classList.remove('btn-unlock-anim');
        btnNext.querySelectorAll('.btn-sparkle').forEach(el => el.remove());
        const levelId = game ? game.level.id : 1;
        startLevel(levelId);
    });
    document.getElementById('btn-watch-replay').addEventListener('click', () => {
        if (!game) return;
        dismissLevelHint();
        const btnNext = document.getElementById('btn-next-level');
        btnNext.classList.remove('btn-unlock-anim');
        btnNext.querySelectorAll('.btn-sparkle').forEach(el => el.remove());
        const levelId = game.level.id;
        document.getElementById('result').classList.remove('active');
        watchReplay(levelId);
    });
    document.getElementById('btn-next-level').addEventListener('click', () => {
        if (!game) return;
        dismissLevelHint();
        const btnNext = document.getElementById('btn-next-level');
        btnNext.classList.remove('btn-unlock-anim');
        btnNext.querySelectorAll('.btn-sparkle').forEach(el => el.remove());
        const nextId = game.level.id + 1;
        if (LEVELS.find(l => l.id === nextId)) {
            startLevel(nextId);
        } else {
            quitToLevelSelect();
        }
    });
    document.getElementById('btn-back-levels').addEventListener('click', () => {
        dismissLevelHint();
        const btnNext = document.getElementById('btn-next-level');
        btnNext.classList.remove('btn-unlock-anim');
        btnNext.querySelectorAll('.btn-sparkle').forEach(el => el.remove());
        document.getElementById('result').classList.remove('active');
        showScreen('level-select');
    });

    document.getElementById('hint-dismiss-btn').addEventListener('click', dismissLevelHint);

    document.getElementById('btn-exit-replay').addEventListener('click', exitReplay);

    updateMenuTitle();
}

document.addEventListener('DOMContentLoaded', init);
