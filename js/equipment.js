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
    bracelet: 300,
    belt: 400,
    cape: 500,
    glove: 600
};

class EquipmentSystem {
    constructor() {
        this.equipment = {};
        AllSlots.forEach(slot => {
            this.equipment[slot] = null;
        });
    }
    
    load(data) {
        this.equipment = {};
        AllSlots.forEach(slot => {
            this.equipment[slot] = data && data[slot] ? data[slot] : null;
        });
    }
    
    getUnlockedSlots(playerLevel) {
        return AllSlots.filter(slot => SlotUnlockLevels[slot] <= playerLevel);
    }
    
    getLockedSlots(playerLevel) {
        return AllSlots.filter(slot => SlotUnlockLevels[slot] > playerLevel);
    }
    
    isSlotUnlocked(slot, playerLevel) {
        return SlotUnlockLevels[slot] <= playerLevel;
    }
    
    getSlotUnlockLevel(slot) {
        return SlotUnlockLevels[slot];
    }
    
    getEquipment() {
        return { ...this.equipment };
    }
    
    getSlot(slot) {
        return this.equipment[slot];
    }
    
    equip(item) {
        const slot = item.slot;
        const oldEquip = this.equipment[slot];
        this.equipment[slot] = item;
        
        EventBus.emit(Events.EQUIP_EQUIPPED, { item, oldEquip, slot });
        return oldEquip;
    }
    
    unequip(slot) {
        const equip = this.equipment[slot];
        this.equipment[slot] = null;
        return equip;
    }
    
    generate(mapData, playerLevel) {
        const equipLevel = mapData.equipLevel;
        const qualityRoll = Math.random();
        let quality = 0;
        if (qualityRoll > 0.99) quality = 5;
        else if (qualityRoll > 0.95) quality = 4;
        else if (qualityRoll > 0.85) quality = 3;
        else if (qualityRoll > 0.65) quality = 2;
        else if (qualityRoll > 0.35) quality = 1;

        const unlockedSlots = this.getUnlockedSlots(playerLevel);
        const slot = unlockedSlots[Math.floor(Math.random() * unlockedSlots.length)];

        const setNames = Object.keys(EquipmentSets);
        const setName = setNames[Math.min(Math.floor(equipLevel / 10), setNames.length - 1)];

        const baseStats = {
            weapon: { atk: 5 + equipLevel * 2 },
            armor: { def: 3 + equipLevel, hp: equipLevel * 5 },
            helmet: { def: 2 + equipLevel * 0.5, hp: equipLevel * 3 },
            boots: { def: 1 + equipLevel * 0.3, crit: Math.floor(equipLevel / 10) },
            necklace: { atk: 2 + equipLevel, crit: Math.floor(equipLevel / 8) },
            ring: { atk: 3 + equipLevel * 0.8, crit: Math.floor(equipLevel / 12) },
            bracelet: { def: 2 + equipLevel * 0.6, hp: equipLevel * 4 },
            belt: { def: 1 + equipLevel * 0.4, hp: equipLevel * 6 },
            cape: { def: 2 + equipLevel * 0.5, hp: equipLevel * 3, crit: Math.floor(equipLevel / 15) },
            glove: { atk: 4 + equipLevel * 0.6, crit: Math.floor(equipLevel / 10) }
        };

        const multiplier = QualityMultipliers[quality];
        const stats = {};
        Object.entries(baseStats[slot]).forEach(([stat, value]) => {
            stats[stat] = Math.floor(value * multiplier);
        });

        const names = {
            weapon: ['剑', '刀', '斧', '杖', '匕首'],
            armor: ['铠甲', '战甲', '法袍', '道袍', '皮甲'],
            helmet: ['头盔', '战盔', '法冠', '道冠', '皮帽'],
            boots: ['战靴', '长靴', '法靴', '道靴', '皮靴'],
            necklace: ['项链', '护符', '坠饰', '念珠', '项圈'],
            ring: ['戒指', '指环', '扳指', '戒圈', '指套'],
            bracelet: ['手镯', '护腕', '手环', '腕带', '臂环'],
            belt: ['腰带', '束带', '皮带', '腰封', '革带'],
            cape: ['披风', '斗篷', '长袍', '风衣', '披肩'],
            glove: ['手套', '护手', '手甲', '掌套', '拳套']
        };

        const prefixes = ['破旧', '普通', '精良', '优秀', '卓越', '完美'];
        const prefix = prefixes[quality];

        return {
            id: Date.now() + Math.random(),
            name: `${prefix}${setName.replace('套装', '')}${names[slot][Math.floor(Math.random() * names[slot].length)]}`,
            slot: slot,
            slotName: SlotNames[slot],
            level: equipLevel,
            quality: quality,
            qualityName: QualityNames[quality],
            qualityLabel: QualityLabels[quality],
            setName: setName,
            ...stats
        };
    }
    
    getSetBonus() {
        const bonus = { atk: 0, def: 0, hp: 0, crit: 0 };
        
        Object.entries(EquipmentSets).forEach(([setName, setData]) => {
            const equippedSetPieces = [];
            Object.entries(this.equipment).forEach(([slot, equip]) => {
                if (equip && equip.setName === setName) {
                    equippedSetPieces.push(slot);
                }
            });
            
            if (equippedSetPieces.length >= 4 && setData.bonus4) {
                Object.entries(setData.bonus4).forEach(([stat, value]) => {
                    bonus[stat] = (bonus[stat] || 0) + value;
                });
            }
            
            if (equippedSetPieces.length >= 8 && setData.bonus8) {
                Object.entries(setData.bonus8).forEach(([stat, value]) => {
                    bonus[stat] = (bonus[stat] || 0) + value;
                });
            }
        });
        
        return bonus;
    }
    
    hasFullSet(setName) {
        const setData = EquipmentSets[setName];
        if (!setData) return false;
        
        return setData.pieces.every(slot => {
            const equip = this.equipment[slot];
            return equip && equip.setName === setName;
        });
    }
    
    getActiveSets() {
        const activeSets = [];
        
        Object.entries(EquipmentSets).forEach(([setName, setData]) => {
            const pieces = [];
            Object.entries(this.equipment).forEach(([slot, equip]) => {
                if (equip && equip.setName === setName) {
                    pieces.push(slot);
                }
            });

            if (pieces.length > 0) {
                const has4Piece = pieces.length >= 4;
                const has8Piece = pieces.length >= 8;
                const isFull = pieces.length === setData.pieces.length;
                
                activeSets.push({
                    name: setName,
                    pieces: pieces.length,
                    total: setData.pieces.length,
                    bonus4: setData.bonus4,
                    bonus8: setData.bonus8,
                    has4Piece: has4Piece,
                    has8Piece: has8Piece,
                    isFull: isFull
                });
            }
        });
        
        return activeSets;
    }
    
    calculateScore(equip) {
        if (!equip) return 0;
        let score = 0;
        score += (equip.atk || 0) * 10;
        score += (equip.def || 0) * 5;
        score += (equip.hp || 0) * 0.5;
        score += (equip.crit || 0) * 20;
        score += equip.quality * 50;
        return score;
    }
    
    getSellPrice(item) {
        return Math.floor(item.level * (item.quality + 1) * 10);
    }
}

const equipmentSystem = new EquipmentSystem();
export { 
    equipmentSystem, 
    EquipmentSets, 
    QualityNames, 
    QualityLabels, 
    QualityColors, 
    QualityMultipliers,
    SlotNames,
    SlotIcons,
    AllSlots,
    SlotUnlockLevels
};
