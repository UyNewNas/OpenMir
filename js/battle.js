import { EventBus, Events } from './core.js';
import { playerSystem } from './player.js';
import { resourceSystem } from './resource.js';
import { equipmentSystem } from './equipment.js';
import { inventorySystem } from './inventory.js';
import { mapSystem } from './map.js';
import { skillSystem } from './skill.js';

class BattleSystem {
    constructor() {
        this.currentEnemy = null;
        this.isAutoBattle = true;
        this.battleTick = 0;
    }
    
    load(enemy) {
        this.currentEnemy = enemy;
    }
    
    getEnemy() {
        return this.currentEnemy;
    }
    
    spawnEnemy() {
        const rebirthLevel = playerSystem.player.rebirthLevel;
        this.currentEnemy = mapSystem.spawnEnemy(rebirthLevel);
        return this.currentEnemy;
    }
    
    clearEnemy() {
        this.currentEnemy = null;
    }
    
    battle() {
        if (!this.currentEnemy) {
            this.spawnEnemy();
            return null;
        }
        
        const result = {
            playerDamage: 0,
            playerCrit: false,
            enemyDamage: 0,
            enemyDefeated: false,
            playerDied: false
        };
        
        const equipment = equipmentSystem.getEquipment();
        const skills = this.getSkills();
        const setBonus = equipmentSystem.getSetBonus();
        
        const playerAtk = playerSystem.getAtk(equipment, skills, setBonus);
        const isCrit = Math.random() * 100 < playerSystem.getCritRate(equipment, skills, setBonus);
        let damage = playerAtk;
        if (isCrit) damage *= 2;
        
        this.currentEnemy.hp -= damage;
        result.playerDamage = damage;
        result.playerCrit = isCrit;
        
        EventBus.emit(Events.BATTLE_DAMAGE, { 
            damage, 
            isCrit, 
            isPlayerAttack: true 
        });
        
        if (this.currentEnemy.hp <= 0) {
            result.enemyDefeated = true;
            this.handleEnemyDefeated();
        } else {
            const enemyDamage = Math.max(1, this.currentEnemy.atk - playerSystem.getDef(equipment, skills, setBonus));
            playerSystem.takeDamage(enemyDamage);
            result.enemyDamage = enemyDamage;
            
            EventBus.emit(Events.BATTLE_DAMAGE, { 
                damage: enemyDamage, 
                isCrit: false, 
                isPlayerAttack: false 
            });
            
            if (playerSystem.player.hp <= 0) {
                result.playerDied = true;
                this.handlePlayerDeath();
            }
        }
        
        return result;
    }
    
    handleEnemyDefeated() {
        const enemy = this.currentEnemy;
        
        playerSystem.gainExp(enemy.exp);
        resourceSystem.add('gold', enemy.gold);
        
        EventBus.emit(Events.BATTLE_ENEMY_DEFEATED, {
            enemy,
            exp: enemy.exp,
            gold: enemy.gold
        });
        
        if (Math.random() < 0.3) {
            const drops = ['forgeStone', 'refineStone', 'skillBook', 'rebirthPill'];
            const weights = [0.4, 0.3, 0.2, 0.1];
            let roll = Math.random();
            let dropIndex = 0;
            for (let i = 0; i < weights.length; i++) {
                roll -= weights[i];
                if (roll <= 0) {
                    dropIndex = i;
                    break;
                }
            }
            const drop = drops[dropIndex];
            resourceSystem.add(drop, 1);
        }
        
        const equip = equipmentSystem.generate(enemy.mapData);
        if (!inventorySystem.isFull()) {
            inventorySystem.addItem(equip);
        }
        
        this.currentEnemy = null;
    }
    
    handlePlayerDeath() {
        const equipment = equipmentSystem.getEquipment();
        const skills = skillSystem.getAll();
        const setBonus = equipmentSystem.getSetBonus();
        playerSystem.heal(playerSystem.getMaxHp(equipment, skills, setBonus));
        playerSystem.recoverMp(playerSystem.getMaxMp());
        this.currentEnemy = null;
    }
    
    getSkills() {
        return skillSystem.getAll();
    }
    
    tick() {
        this.battleTick++;
        return this.battleTick;
    }
    
    resetTick() {
        this.battleTick = 0;
    }
}

const battleSystem = new BattleSystem();
export { battleSystem };
