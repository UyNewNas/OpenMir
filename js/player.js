import { EventBus, Events } from './core.js';

const Classes = {
    warrior: {
        name: '战士',
        icon: '⚔',
        avatar: '🛡',
        sprite: '🧔',
        bonuses: { hp: 1.2, atk: 1.1, def: 1.15, mp: 1, crit: 0, dodge: 0 }
    },
    mage: {
        name: '法师',
        icon: '🔮',
        avatar: '🧙',
        sprite: '🧙',
        bonuses: { hp: 0.9, atk: 1.2, def: 0.9, mp: 1.3, crit: 5, dodge: 0 }
    },
    taoist: {
        name: '道士',
        icon: '☯',
        avatar: '👨‍🦳',
        sprite: '🧓',
        bonuses: { hp: 1.1, atk: 1.05, def: 1.05, mp: 1.15, crit: 0, dodge: 0 }
    },
    assassin: {
        name: '刺客',
        icon: '🗡',
        avatar: '🥷',
        sprite: '🥷',
        bonuses: { hp: 0.95, atk: 1.15, def: 0.95, mp: 1, crit: 10, dodge: 10 }
    }
};

class PlayerSystem {
    constructor() {
        this.player = null;
    }
    
    createPlayer(name, playerClass) {
        this.player = {
            name: name,
            class: playerClass,
            level: 1,
            exp: 0,
            expToNext: 100,
            hp: 100,
            maxHp: 100,
            mp: 50,
            maxMp: 50,
            baseAtk: 10,
            baseDef: 5,
            baseCrit: 5,
            rebirthLevel: 0,
            rebirthBonus: 0
        };
        return this.player;
    }
    
    loadPlayer(data) {
        this.player = data;
        return this.player;
    }
    
    getClassData() {
        return Classes[this.player.class];
    }
    
    getClassBonus(stat) {
        const classData = this.getClassData();
        return classData.bonuses[stat] || 1;
    }
    
    getAtk(equipment = {}, skills = {}, setBonus = {}) {
        let atk = this.player.baseAtk + (this.player.level * 2) + this.player.rebirthBonus;
        atk *= this.getClassBonus('atk');
        
        Object.values(equipment).forEach(equip => {
            if (equip) atk += equip.atk || 0;
        });
        
        atk += skills.attack?.bonus || 0;
        atk += setBonus.atk || 0;
        
        return Math.floor(atk);
    }
    
    getDef(equipment = {}, skills = {}, setBonus = {}) {
        let def = this.player.baseDef + (this.player.level * 1) + this.player.rebirthBonus;
        def *= this.getClassBonus('def');
        
        Object.values(equipment).forEach(equip => {
            if (equip) def += equip.def || 0;
        });
        
        def += skills.defense?.bonus || 0;
        def += setBonus.def || 0;
        
        return Math.floor(def);
    }
    
    getMaxHp(equipment = {}, skills = {}, setBonus = {}) {
        let hp = 100 + (this.player.level * 10) + (this.player.rebirthBonus * 50);
        hp *= this.getClassBonus('hp');
        
        Object.values(equipment).forEach(equip => {
            if (equip && equip.hp) hp += equip.hp;
        });
        
        hp += skills.hpBoost?.bonus || 0;
        hp += setBonus.hp || 0;
        
        return Math.floor(hp);
    }
    
    getMaxMp() {
        let mp = 50 + (this.player.level * 5);
        mp *= this.getClassBonus('mp');
        return Math.floor(mp);
    }
    
    getCritRate(equipment = {}, skills = {}, setBonus = {}) {
        let crit = this.player.baseCrit + this.getClassBonus('crit');
        crit += skills.critical?.bonus || 0;
        
        Object.values(equipment).forEach(equip => {
            if (equip && equip.crit) crit += equip.crit;
        });
        
        crit += setBonus.crit || 0;
        
        return Math.floor(crit);
    }
    
    getTotalPower(equipment = {}, skills = {}, setBonus = {}) {
        const atk = this.getAtk(equipment, skills, setBonus);
        const def = this.getDef(equipment, skills, setBonus);
        const hp = this.getMaxHp(equipment, skills, setBonus);
        const crit = this.getCritRate(equipment, skills, setBonus);
        return Math.floor((atk * 10 + def * 5 + hp * 0.5 + crit * 100) * (1 + this.player.rebirthLevel * 0.1));
    }
    
    gainExp(amount) {
        this.player.exp += amount;
        let leveledUp = false;
        
        while (this.player.exp >= this.player.expToNext) {
            this.player.exp -= this.player.expToNext;
            this.player.level++;
            this.player.expToNext = Math.floor(this.player.expToNext * 1.2);
            this.player.hp = this.getMaxHp();
            this.player.maxHp = this.player.hp;
            this.player.mp = this.getMaxMp();
            leveledUp = true;
        }
        
        if (leveledUp) {
            EventBus.emit(Events.PLAYER_LEVEL_UP, { level: this.player.level });
        }
        
        return leveledUp;
    }
    
    takeDamage(damage) {
        this.player.hp = Math.max(0, this.player.hp - damage);
        if (this.player.hp <= 0) {
            EventBus.emit(Events.PLAYER_DEATH, {});
        }
        return this.player.hp;
    }
    
    heal(amount) {
        const maxHp = this.getMaxHp();
        this.player.hp = Math.min(maxHp, this.player.hp + amount);
        return this.player.hp;
    }
    
    recoverMp(amount) {
        const maxMp = this.getMaxMp();
        this.player.mp = Math.min(maxMp, this.player.mp + amount);
        return this.player.mp;
    }
    
    rebirth() {
        this.player.rebirthLevel++;
        this.player.rebirthBonus += 50;
        this.player.level = 1;
        this.player.exp = 0;
        this.player.expToNext = 100;
        this.player.hp = this.getMaxHp();
        this.player.maxHp = this.player.hp;
        
        EventBus.emit(Events.PLAYER_REBIRTH, { rebirthLevel: this.player.rebirthLevel });
        return true;
    }
    
    canRebirth() {
        return this.player.level >= 100;
    }
}

const playerSystem = new PlayerSystem();
export { playerSystem, Classes };
