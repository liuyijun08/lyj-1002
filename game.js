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
        difficulty: 'easy',
        difficultyLabel: '简单',
        targetScore: 15000,
        targetPercent: 0.6,
        noteCount: 40,
        data: null
    },
    {
        id: 2,
        name: '家常小炒',
        recipe: '🍳 番茄炒蛋',
        difficulty: 'normal',
        difficultyLabel: '普通',
        targetScore: 25000,
        targetPercent: 0.65,
        noteCount: 60,
        data: null
    },
    {
        id: 3,
        name: '主厨挑战',
        recipe: '🍖 红烧排骨',
        difficulty: 'hard',
        difficultyLabel: '困难',
        targetScore: 40000,
        targetPercent: 0.7,
        noteCount: 80,
        data: null
    },
    {
        id: 4,
        name: '快速刀工',
        recipe: '🍣 寿司拼盘',
        difficulty: 'hard',
        difficultyLabel: '困难',
        targetScore: 55000,
        targetPercent: 0.75,
        noteCount: 100,
        data: null
    },
    {
        id: 5,
        name: '终极料理',
        recipe: '🍱 怀石料理套餐',
        difficulty: 'expert',
        difficultyLabel: '专家',
        targetScore: 80000,
        targetPercent: 0.8,
        noteCount: 140,
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

// ==================== 存储系统 ====================
const SAVE_KEY = 'rhythm-chef-save';

function getSaveData() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return { unlocked: 1, bestScores: {}, replays: {}, lastReplays: {} };
        const data = JSON.parse(raw);
        return {
            unlocked: data.unlocked || 1,
            bestScores: data.bestScores || {},
            replays: data.replays || {},
            lastReplays: data.lastReplays || {}
        };
    } catch {
        return { unlocked: 1, bestScores: {}, replays: {}, lastReplays: {} };
    }
}

function saveData(data) {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('保存失败', e);
    }
}

// ==================== 屏幕切换 ====================
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (id === 'level-select') renderLevelSelect();
}

// ==================== 关卡选择 ====================
function renderLevelSelect() {
    const save = getSaveData();
    const list = document.getElementById('level-list');
    list.innerHTML = '';
    LEVELS.forEach(lvl => {
        const unlocked = lvl.id <= save.unlocked;
        const best = save.bestScores[lvl.id] || 0;
        const card = document.createElement('div');
        card.className = 'level-card' + (unlocked ? '' : ' locked');
        card.innerHTML = `
            <div class="level-num">第 ${lvl.id} 关</div>
            <div class="level-name">${lvl.name}</div>
            <div class="level-recipe">${lvl.recipe}</div>
            <div class="level-target">🎯 目标: ${lvl.targetScore.toLocaleString()}</div>
            <span class="level-diff diff-${lvl.difficulty}">${lvl.difficultyLabel}</span>
            ${best > 0 ? `<div class="best-score">🏆 ${best.toLocaleString()}</div>` : ''}
            ${!unlocked ? '<div class="locked-icon">🔒</div>' : ''}
        `;
        if (unlocked) {
            card.addEventListener('click', () => startLevel(lvl.id));
        }
        list.appendChild(card);
    });
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
        this.replay = replayData;
        this.currentReplayIndex = 0;
        this.replayActions = replayData ? (replayData.actions || []) : [];
        this.recordedActions = [];
        this.recordedHits = [];

        this.clearVisuals();
        this.updateHUD();
        this.updateLevelInfo();

        this.running = true;
        this.paused = false;
        this.pauseOffset = 0;
        this.startTime = performance.now();
        this.lastFrameTime = this.startTime;
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

        // 回放模式：处理输入模拟
        if (this.replayMode && this.replayActions) {
            while (this.currentReplayIndex < this.replayActions.length &&
                   this.replayActions[this.currentReplayIndex].time <= now) {
                const act = this.replayActions[this.currentReplayIndex];
                this.currentReplayIndex++;
                if (act.type === 'down') {
                    this.handleKeyDown(act.lane, now);
                }
            }
        }

        this.updateNotes(now);
        this.checkMissedNotes(now);
        this.updateHUD();

        // 检查关卡结束
        if (this.allNotesPassed(now) && this.activeNotes.length === 0) {
            this.running = false;
            if (!this.replayMode) {
                setTimeout(() => onLevelComplete(this), 500);
            }
            return;
        }

        // 检查血量
        if (!this.replayMode && this.hp <= 0) {
            this.running = false;
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
                // 切到坏食材：扣分+断连+掉血
                this.combo = 0;
                this.judges.bad++;
                this.score = Math.max(0, this.score - 800);
                this.hp -= HP_DAMAGE_BAD;
                this.showJudge('BAD CUT!', 'bad');
                this.showHitFx(note.data.lane, 'bad');
                break;
            case 'bad-dodge':
                // 坏食材成功躲避：少量加分
                this.judges.bad++;
                this.score += 50;
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
    const save = getSaveData();
    const level = engine.level;
    const finalScore = Math.floor(engine.score);
    const passed = finalScore >= level.targetScore && engine.hp > 0;
    const judges = engine.judges;

    // 评级
    const totalGood = judges.perfect + judges.great + judges.good + judges.miss;
    const accuracy = totalGood > 0 ? (judges.perfect * 1 + judges.great * 0.8 + judges.good * 0.5) / totalGood : 0;
    let rank = 'F';
    if (accuracy >= 0.95 && engine.hp > 50) rank = 'S';
    else if (accuracy >= 0.85) rank = 'A';
    else if (accuracy >= 0.7) rank = 'B';
    else if (accuracy >= 0.5) rank = 'C';
    else rank = 'F';

    // 更新记录
    let newUnlock = false;
    if (passed) {
        if (level.id >= save.unlocked && level.id < LEVELS.length) {
            save.unlocked = level.id + 1;
            newUnlock = true;
        }
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

    // 显示结果
    document.getElementById('result-title').textContent = passed ? '🎉 关卡完成！' : (engine.hp <= 0 ? '💀 生命值耗尽...' : '😅 未达目标...');
    const rankEl = document.getElementById('result-rank');
    rankEl.textContent = rank;
    rankEl.className = 'result-rank rank-' + rank.toLowerCase();

    document.getElementById('result-score').textContent = finalScore.toLocaleString();
    document.getElementById('result-combo').textContent = engine.maxCombo;
    document.getElementById('result-perfect').textContent = judges.perfect;
    document.getElementById('result-great').textContent = judges.great;
    document.getElementById('result-good').textContent = judges.good;
    document.getElementById('result-miss').textContent = judges.miss + judges.bad;

    const unlockMsg = document.getElementById('unlock-msg');
    if (newUnlock) {
        const nextLvl = LEVELS.find(l => l.id === level.id + 1);
        unlockMsg.textContent = `🎊 解锁新关卡：第${nextLvl.id}关 ${nextLvl.name}`;
        unlockMsg.style.display = 'block';
    } else {
        unlockMsg.style.display = 'none';
    }

    // 按钮显示
    const btnNext = document.getElementById('btn-next-level');
    const nextLvl = LEVELS.find(l => l.id === level.id + 1);
    btnNext.style.display = (passed && nextLvl && nextLvl.id <= save.unlocked) ? '' : 'none';

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
        if (game && game.running && !game.paused && !game.replayMode) {
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
    showScreen('level-select');
}

// ==================== 初始化 ====================
function init() {
    if (!_levelDataLoaded) {
        loadLevelData();
        _levelDataLoaded = true;
    }

    // 菜单按钮
    document.getElementById('btn-start').addEventListener('click', () => {
        showScreen('level-select');
    });
    document.getElementById('btn-howto').addEventListener('click', () => {
        showScreen('howto');
    });

    // 暂停菜单
    document.getElementById('btn-pause').addEventListener('click', pauseGame);
    document.getElementById('btn-resume').addEventListener('click', resumeGame);
    document.getElementById('btn-quit').addEventListener('click', quitToLevelSelect);
    document.getElementById('btn-replay-menu').addEventListener('click', () => {
        if (!game) return;
        const levelId = game.level.id;
        game.stop();
        document.getElementById('pause').classList.remove('active');
        watchReplay(levelId);
    });

    // 结果页按钮
    document.getElementById('btn-retry').addEventListener('click', () => {
        const levelId = game ? game.level.id : 1;
        startLevel(levelId);
    });
    document.getElementById('btn-watch-replay').addEventListener('click', () => {
        if (!game) return;
        const levelId = game.level.id;
        document.getElementById('result').classList.remove('active');
        watchReplay(levelId);
    });
    document.getElementById('btn-next-level').addEventListener('click', () => {
        if (!game) return;
        const nextId = game.level.id + 1;
        if (LEVELS.find(l => l.id === nextId)) {
            startLevel(nextId);
        } else {
            quitToLevelSelect();
        }
    });
    document.getElementById('btn-back-levels').addEventListener('click', () => {
        document.getElementById('result').classList.remove('active');
        showScreen('level-select');
    });

    // 回放退出
    document.getElementById('btn-exit-replay').addEventListener('click', exitReplay);
}

document.addEventListener('DOMContentLoaded', init);
