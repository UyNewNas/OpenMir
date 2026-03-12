import { EventBus, Events } from './core.js';

const EquipmentSets = {
    '新手套装': { 
        pieces: ['weapon', 'armor', 'helmet', 'boots'], 
        bonus4: { atk: 5, def: 3 },
        bonus8: null
    },
    '勇者套装': { 
        pieces: ['weapon', 'armor', 'helmet', 'boots', 'necklace', 'ring', 'bracelet', 'belt'], 
        bonus4: { atk: 15, def: 10, hp: 50 },
        bonus8: { atk: 30, def: 20, hp: 100, crit: 5 }
    },
    '战神套装': { 
        pieces: ['weapon', 'armor', 'helmet', 'boots', 'necklace', 'ring', 'bracelet', 'belt'], 
        bonus4: { atk: 30, def: 20, crit: 5 },
        bonus8: { atk: 60, def: 40, crit: 10, hp: 200 }
    },
    '圣光套装': { 
        pieces: ['weapon', 'armor', 'helmet', 'boots', 'necklace', 'ring', 'bracelet', 'belt', 'cape', 'glove'], 
        bonus4: { atk: 50, def: 30, hp: 100, crit: 10 },
        bonus8: { atk: 100, def: 60, hp: 300, crit: 20 }
    },
    '龙神套装': { 
        pieces: ['weapon', 'armor', 'helmet', 'boots', 'necklace', 'ring', 'bracelet', 'belt', 'cape', 'glove'], 
        bonus4: { atk: 100, def: 60, hp: 200, crit: 15 },
        bonus8: { atk: 200, def: 120, hp: 500, crit: 30 }
    },
    '神域套装': { 
        pieces: ['weapon', 'armor', 'helmet', 'boots', 'necklace', 'ring', 'bracelet', 'belt', 'cape', 'glove'], 
        bonus4: { atk: 200, def: 100, hp: 500, crit: 20 },
        bonus8: { atk: 400, def: 200, hp: 1000, crit: 40 }
    }
};

const QualityNames = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
const QualityLabels = ['普通', '优秀', '稀有', '史诗', '传说', '神话'];
const QualityColors = ['#fff', '#4caf50', '#2196f3', '#9c27b0', '#ff9800', '#e91e63'];
const QualityMultipliers = [1, 1.2, 1.5, 2, 3, 5];

const AllSlots = ['weapon', 'armor', 'helmet', 'boots', 'necklace', 'ring', 'bracelet', 'belt', 'cape', 'glove'];

const SlotNames = {
    weapon: '武器',
    armor: '护甲',
    helmet: '头盔',
    boots: '鞋子',
    necklace: '项链',
    ring: '戒指',
    bracelet: '手镯',
    belt: '腰带',
    cape: '披风',
    glove: '手套'
};

const SlotIcons = {
    weapon: '🗡',
    armor: '🛡',
    helmet: '⛑',
    boots: '👢',
    necklace: '📿',
    ring: '💍',
    bracelet: '⌚',
    belt: '🎗',
    cape: '🧣',
    glove: '🧤'
};

const SlotUnlockLevels = {
    weapon: 1,
    armor: 1,
    helmet: 1,
    boots: 1,
    necklace: 100,
    ring: 200,
    bracelet: 300