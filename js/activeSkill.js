import { EventBus, Events } from './core.js';
import { playerSystem } from './player.js';
import { resourceSystem } from './resource.js';

const ActiveSkills = {
    fireball: {
        id: 'fireball',
        name: '火球术',
        icon: '🔥',
        description: '发射火球攻击所有敌人',
        mpCost: 20,
        cooldown: 5,
        damageMultiplier: 1.5,
        targetType: 'all',
        unlocked: false,
        unlockLevel: 1
    },
    lightning: {
        id: 'lightning',
        name: '闪电链',
        icon: '⚡',
        description: '释放闪电链攻击多个敌人',
        mpCost: 30,
        cooldown: 8,
        damageMultiplier: 2.0,
        targetType: 'all',
        unlocked: false,
        unlockLevel: 10
    },
    blizzard: {
        id: 'blizzard',
        name: '暴风雪',
        icon: '❄',
        description: '召唤暴风雪冻结所有敌人',
        mpCost: 50,
        cooldown: 12,
        damageMultiplier: 3.0,
        targetType: 'all',
        unlocked: false,
        unlockLevel: 20
    },
    meteor: {
        id: 'meteor',
        name: '陨石术',
        icon: '☄',
        description: '召唤陨石从天而降',
        mpCost: 80,
        cooldown: 20,
        damageMultiplier: 5.0,
        targetType: 'all',
        unlocked: false,
        unlockLevel: 40
    },
    thunderStrike: {
        id: 'thunderStrike',
        name: '雷霆万钧',
        icon: '🌩',
        description: '召唤雷霆之力毁灭一切',
        mpCost: 100,
        cooldown: 30,
        damageMultiplier: 8.0,
        targetType: 'all',
        unlocked: false,
        unlockLevel: 60
    }
};

class ActiveSkillSystem {
    constructor() {
        this.skills = {};
        this.cooldowns = {};
    }
    
    init() {
        this.skills = JSON.parse(JSON.stringify(ActiveSkills));
        this.cooldowns = {};
        Object.keys(this.skills).forEach(key => {
            this.cooldowns[key] = 0;
        });
    }
    
    load(data) {
        if (data) {
            this.skills = data.skills || JSON.parse(JSON.stringify(ActiveSkills));
            this.cooldowns = data.cooldowns || {};
        } else {
            this.init();
        }
    }
    
    getAll() {
        return { ...this.skills };
    }
    
    get(skillId) {
        return this.skills[skillId];
    }
    
    getCooldown(skillId) {
        return this.cooldowns[skillId] || 0;
    }
    
    isReady(skillId) {
        return this.cooldowns[skillId] <= 0;
    }
    
    canUse(skillId) {
        const skill = this.skills[skillId];
        if (!skill || !skill.unlocked) return false;
        if (!this.isReady(skillId)) return false;
        if (playerSystem.player.mp < skill.mpCost) return false;
        return true;
    }
    
    use(skillId) {
        const skill = this.skills[skillId];
        if (!this.canUse(skillId)) return null;
        
        playerSystem.player.mp -= skill.mpCost;
        this.cooldowns[skillId] = skill.cooldown;
        
        EventBus.emit(Events.ACTIVE_SKILL_USE, { skillId, skill });
        
        return {
            skillId,
            damageMultiplier: skill.damageMultiplier,
            targetType: skill.targetType
        };
    }
    
    reduceCooldowns(amount = 1) {
        Object.keys(this.cooldowns).forEach(key => {
            if (this.cooldowns[key] > 0) {
                this.cooldowns[key] -= amount;
            }
        });
    }
    
    checkUnlocks(playerLevel) {
        let newUnlocks = [];
        Object.entries(this.skills).forEach(([key, skill]) => {
            if (!skill.unlocked && playerLevel >= skill.unlockLevel) {
                skill.unlocked = true;
                newUnlocks.push(skill);
            }
        });
        return newUnlocks;
    }
    
    getUnlockedSkills() {
        return Object.entries(this.skills)
            .filter(([key, skill]) => skill.unlocked)
            .map(([key, skill]) => ({ ...skill, id: key, currentCooldown: this.cooldowns[key] || 0 }));
    }
}

const activeSkillSystem = new ActiveSkillSystem();
export { activeSkillSystem, ActiveSkills };
