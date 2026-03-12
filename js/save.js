import { EventBus, Events } from './core.js';
import { playerSystem } from './player.js';
import { resourceSystem } from './resource.js';
import { equipmentSystem } from './equipment.js';
import { inventorySystem } from './inventory.js';
import { mapSystem } from './map.js';
import { skillSystem } from './skill.js';
import { questSystem } from './quest.js';
import { battleSystem } from './battle.js';
import { shopSystem } from './shop.js';
import { activeSkillSystem } from './activeSkill.js';

const SAVE_KEY = 'legend_game_save';

class SaveSystem {
    constructor() {
        this.lastSaveTime = 0;
    }
    
    save() {
        const saveData = {
            player: playerSystem.player,
            resources: resourceSystem.getAll(),
            skills: skillSystem.getAll(),
            activeSkills: activeSkillSystem.getAll(),
            equipment: equipmentSystem.getEquipment(),
            inventory: inventorySystem.getItems(),
            currentMap: mapSystem.getCurrentIndex(),
            quests: questSystem.getQuests(),
            completedQuests: questSystem.getCompletedCount(),
            autoRecycle: inventorySystem.autoRecycle,
            currentEnemy: battleSystem.getEnemy(),
            enemies: battleSystem.getEnemies(),
            shop: shopSystem.getSaveData(),
            saveTime: Date.now()
        };
        
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        this.lastSaveTime = Date.now();
        
        EventBus.emit(Events.SAVE_GAME, { saveTime: this.lastSaveTime });
        return true;
    }
    
    load() {
        const saved = localStorage.getItem(SAVE_KEY);
        if (!saved) return false;
        
        try {
            const data = JSON.parse(saved);
            
            playerSystem.loadPlayer(data.player);
            resourceSystem.load(data.resources);
            skillSystem.load(data.skills);
            activeSkillSystem.load(data.activeSkills);
            equipmentSystem.load(data.equipment);
            inventorySystem.load(data.inventory, data.autoRecycle);
            mapSystem.load(data.currentMap);
            questSystem.load(data.quests, data.completedQuests);
            shopSystem.load(data.shop);
            
            if (data.enemies && data.enemies.length > 0) {
                battleSystem.enemies = data.enemies;
            } else if (data.currentEnemy) {
                battleSystem.load(data.currentEnemy);
            }
            
            EventBus.emit(Events.LOAD_GAME, { loadTime: data.saveTime });
            return true;
        } catch (e) {
            console.error('Load failed:', e);
            return false;
        }
    }
    
    hasSave() {
        return localStorage.getItem(SAVE_KEY) !== null;
    }
    
    deleteSave() {
        localStorage.removeItem(SAVE_KEY);
    }
    
    getSaveTime() {
        const saved = localStorage.getItem(SAVE_KEY);
        if (!saved) return null;
        
        try {
            const data = JSON.parse(saved);
            return data.saveTime;
        } catch {
            return null;
        }
    }
}

const saveSystem = new SaveSystem();
export { saveSystem, SAVE_KEY };
