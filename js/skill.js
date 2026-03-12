import { EventBus, Events } from './core.js';
import { resourceSystem, ResourceNames } from './resource.js';
import { playerSystem } from './player.js';

const DefaultSkills = {
    attack: { name: '基础攻击', level: 1, icon: '⚔', bonus: 0, cost: { skillBook: 1 }, multiplier: 2 },
    defense: { name: '铁壁防御', level: 1, icon: '🛡', bonus: 0, cost: { skillBook: 1 }, multiplier: 1.5 },
    critical: { name: '暴击精通', level: 1, icon: '💥', bonus: 0, cost: { skillBook: 2 }, multiplier: 1 },
    hpBoost: { name: '生命强化', level: 1, icon: '❤', bonus: 0, cost: { skillBook: 1 }, multiplier: 10 }
};

class SkillSystem {
    constructor() {
        this.skills = null;
    }
    
    init() {
        this.skills = JSON.parse(JSON.stringify(DefaultSkills));
    }
    
    load(data) {
        this.skills = data || JSON.parse(JSON.stringify(DefaultSkills));
    }
    
    getAll() {
        return { ...this.skills };
    }
    
    get(skillKey) {
        return this.skills[skillKey];
    }
    
    getMaxLevel() {
        const playerLevel = playerSystem.player?.level || 1;
        return Math.floor(playerLevel / 10) + 1;
    }
    
    canUpgrade(skillKey) {
        const skill = this.skills[skillKey];
        if (!skill) return false;
        
        if (skill.level >= this.getMaxLevel()) {
            return false;
        }
        
        for (let [resource, amount] of Object.entries(skill.cost)) {
            if (!resourceSystem.canAfford(resource, amount * skill.level)) {
                return false;
            }
        }
        return true;
    }
    
    hasAnyUpgrade() {
        return Object.keys(this.skills).some(key => this.canUpgrade(key));
    }
    
    upgrade(skillKey) {
        const skill = this.skills[skillKey];
        if (!skill || !this.canUpgrade(skillKey)) return false;
        
        for (let [resource, amount] of Object.entries(skill.cost)) {
            resourceSystem.spend(resource, amount * skill.level);
        }
        
        skill.level++;
        skill.bonus = Math.floor(skill.level * skill.multiplier);
        
        EventBus.emit(Events.SKILL_UPGRADE, { skillKey, skill });
        return true;
    }
    
    getCostText(skillKey) {
        const skill = this.skills[skillKey];
        return Object.entries(skill.cost)
            .map(([r, a]) => `${ResourceNames[r]}×${a * skill.level}`)
            .join(' ');
    }
}

const skillSystem = new SkillSystem();
export { skillSystem, DefaultSkills };
