import { EventBus, Events } from './core.js';

const ResourceNames = {
    gold: '金币',
    diamond: '钻石',
    forgeStone: '锻造石',
    refineStone: '精炼石',
    skillBook: '技能书',
    rebirthPill: '转生丹'
};

class ResourceSystem {
    constructor() {
        this.resources = null;
    }
    
    init() {
        this.resources = {
            gold: 100,
            diamond: 10,
            forgeStone: 5,
            refineStone: 5,
            skillBook: 3,
            rebirthPill: 0
        };
    }
    
    load(data) {
        this.resources = data;
    }
    
    get(key) {
        return this.resources[key] || 0;
    }
    
    getAll() {
        return { ...this.resources };
    }
    
    add(key, amount) {
        if (this.resources[key] !== undefined) {
            this.resources[key] += amount;
            EventBus.emit(Events.RESOURCE_CHANGE, { key, value: this.resources[key] });
            return true;
        }
        return false;
    }
    
    spend(key, amount) {
        if (this.resources[key] >= amount) {
            this.resources[key] -= amount;
            EventBus.emit(Events.RESOURCE_CHANGE, { key, value: this.resources[key] });
            return true;
        }
        return false;
    }
    
    canAfford(key, amount) {
        return this.resources[key] >= amount;
    }
    
    canAffordMultiple(costs) {
        for (let [key, amount] of Object.entries(costs)) {
            if (!this.canAfford(key, amount)) return false;
        }
        return true;
    }
    
    spendMultiple(costs) {
        if (!this.canAffordMultiple(costs)) return false;
        for (let [key, amount] of Object.entries(costs)) {
            this.spend(key, amount);
        }
        return true;
    }
    
    set(key, amount) {
        if (this.resources[key] !== undefined) {
            this.resources[key] = amount;
            EventBus.emit(Events.RESOURCE_CHANGE, { key, value: this.resources[key] });
            return true;
        }
        return false;
    }
    
    getName(key) {
        return ResourceNames[key] || key;
    }
}

const resourceSystem = new ResourceSystem();
export { resourceSystem, ResourceNames };
