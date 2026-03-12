import { EventBus, Events } from './core.js';
import { playerSystem } from './player.js';
import { resourceSystem } from './resource.js';
import { equipmentSystem } from './equipment.js';
import { inventorySystem } from './inventory.js';
import { mapSystem } from './map.js';
import { skillSystem } from './skill.js';
import { activeSkillSystem } from './activeSkill.js';

const MAX_ENEMIES = 5;

class BattleSystem {
    constructor() {
        this.enemies = [];
        this.isAutoBattle = true;
        this.battleTick = 0;
    }
    
    load(enemy) {
        this.enemies = enemy ? [enemy] : [];
    }
    
    getEnemy() {
        return this.enemies.length > 0 ? this.enemies[0] : null;
    }
    
    getEnemies() {
        return this.enemies;
    }
    
    spawnEnemies() {
        const rebirthLevel = playerSystem.player.rebirthLevel;
        this.enemies = mapSystem.spawnEnemies(rebirthLevel);
        return this.enemies;
    }
    
    clearEnemy() {
        this.enemies = [];
    }
    
    removeEnemy(index) {
        if (index >= 0 && index < this.enemies.length) {
            this.enemies.splice(index, 1);
        }
    }
    
    battle() {
        if (this.enemies.length === 0) {
            this.spawnEnemies();
            return null;
        }
        
        const result = {
            playerDamage: 0,
            playerCrit: false,
            enemyDamage: 0,
            enemiesDefeated: 0,
            playerDied: false
        };
        
        const equipment = equipmentSystem.getEquipment();
        const skills = this.getSkills();
        const setBonus = equipmentSystem.getSetBonus();
        
        const playerAtk = playerSystem.getAtk(equipment, skills, setBonus);
        const isCrit = Math.random() * 100 < playerSystem.getCritRate(equipment, skills, setBonus);
        let damage = playerAtk;
        if (isCrit) damage *= 2;
        
        const targetEnemy = this.enemies[0];
        if (targetEnemy) {
            targetEnemy.hp -= damage;
            result.playerDamage = damage;
            result.playerCrit = isCrit;
            
            EventBus.emit(Events.BATTLE_DAMAGE, { 
                damage, 
                isCrit, 
                isPlayerAttack: true 
            });
            
            if (targetEnemy.hp <= 0) {
                this.handleEnemyDefeated(0);
                result.enemiesDefeated++;
            }
        }
        
        this.enemies = this.enemies.filter(e => e.hp > 0);
        
        if (this.enemies.length > 0) {
            let totalEnemyDamage = 0;
            this.enemies.forEach(enemy => {
                const enemyDamage = Math.max(1, enemy.atk - playerSystem.getDef(equipment, skills, setBonus));
                totalEnemyDamage += enemyDamage;
            });
            
            playerSystem.takeDamage(totalEnemyDamage);
            result.enemyDamage = totalEnemyDamage;
            
            EventBus.emit(Events.BATTLE_DAMAGE, { 
                damage: totalEnemyDamage, 
                isCrit: false, 
                isPlayerAttack: false 
            });
            
            if (playerSystem.player.hp <= 0) {
                result.playerDied = true;
                this.handlePlayerDeath();
            }
        }
        
        if (this.enemies.length === 0) {
            setTimeout(() => this.spawnEnemies(), 1000);
        }
        
        return result;
    }
    
    useActiveSkill(skillId) {
        const skill = activeSkillSystem.get(skillId);
        if (!skill || !skill.unlocked) return null;
        
        if (!activeSkillSystem.canUse(skillId)) return null;
        
        const mpCost = skill.mpCost;
        if (playerSystem.player.mp < mpCost) return null;
        
        playerSystem.player.mp -= mpCost;
        activeSkillSystem.use(skillId);
        
        const result = {
            skillId,
            skillName: skill.name,
            damage: 0,
            targetsHit: 0,
            enemiesDefeated: 0
        };
        
        const equipment = equipmentSystem.getEquipment();
        const skills = skillSystem.getAll();
        const setBonus = equipmentSystem.getSetBonus();
        
        const baseAtk = playerSystem.getAtk(equipment, skills, setBonus);
        const damage = Math.floor(baseAtk * skill.damageMultiplier);
        
        result.damage = damage;
        
        if (skill.targetType === 'all') {
            result.targetsHit = this.enemies.length;
            
            this.enemies.forEach((enemy, index) => {
                enemy.hp -= damage;
                EventBus.emit(Events.BATTLE_DAMAGE, { 
                    damage, 
                    isCrit: false, 
                    isPlayerAttack: true 
                });
                
                if (enemy.hp <= 0) {
                    this.handleEnemyDefeated(index);
                    result.enemiesDefeated++;
                }
            });
        } else {
            if (this.enemies[0]) {
                this.enemies[0].hp -= damage;
                result.targetsHit = 1;
                
                EventBus.emit(Events.BATTLE_DAMAGE, { 
                    damage, 
                    isCrit: false, 
                    isPlayerAttack: true 
                });
                
                if (this.enemies[0].hp <= 0) {
                    this.handleEnemyDefeated(0);
                    result.enemiesDefeated++;
                }
            }
        }
        
        this.enemies = this.enemies.filter(e => e.hp > 0);
        
        if (this.enemies.length === 0) {
            setTimeout(() => this.spawnEnemies(), 1000);
        }
        
        EventBus.emit(Events.SKILL_USE, { skill, result });
        
        return result;
    }
    
    handleEnemyDefeated(index) {
        const enemy = this.enemies[index];
        if (!enemy) return;
        
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
        
        const equip = equipmentSystem.generate(enemy.mapData, playerSystem.player.level);
        if (!inventorySystem.isFull()) {
            inventorySystem.addItem(equip);
        }
    }
    
    handlePlayerDeath() {
        const equipment = equipmentSystem.getEquipment();
        const skills = skillSystem.getAll();
        const setBonus = equipmentSystem.getSetBonus();
        playerSystem.heal(playerSystem.getMaxHp(equipment, skills, setBonus));
        playerSystem.recoverMp(playerSystem.getMaxMp());
        this.enemies = [];
    }
    
    getSkills() {
        return skillSystem.getAll();
    }
    
    tick() {
        this.battleTick++;
        activeSkillSystem.reduceCooldowns(1);
        return this.battleTick;
    }
    
    resetTick() {
        this.battleTick = 0;
    }
}

const battleSystem = new BattleSystem();
export { battleSystem, MAX_ENEMIES };
