import { playerSystem } from './player.js';
import { resourceSystem } from './resource.js';
import { skillSystem } from './skill.js';
import { mapSystem } from './map.js';
import { equipmentSystem } from './equipment.js';
import { inventorySystem } from './inventory.js';
import { battleSystem } from './battle.js';
import { saveSystem } from './save.js';
import { uiSystem } from './ui.js';
import { EventBus, Events } from './core.js';

class DebugSystem {
    constructor() {
        this.isVisible = false;
        this.originalGameSpeed = 500;
    }
    
    init() {
        this.setupToggle();
        this.setupKeyboardShortcut();
        this.syncValues();
    }
    
    setupToggle() {
        const toggleBtn = document.getElementById('debugToggleBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }
    }
    
    setupKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.toggle();
            }
        });
    }
    
    toggle() {
        this.isVisible = !this.isVisible;
        const panel = document.getElementById('debugPanel');
        if (panel) {
            panel.style.display = this.isVisible ? 'block' : 'none';
            if (this.isVisible) {
                this.syncValues();
            }
        }
    }
    
    show() {
        this.isVisible = true;
        const panel = document.getElementById('debugPanel');
        if (panel) {
            panel.style.display = 'block';
            this.syncValues();
        }
    }
    
    hide() {
        this.isVisible = false;
        const panel = document.getElementById('debugPanel');
        if (panel) {
            panel.style.display = 'none';
        }
    }
    
    syncValues() {
        if (!playerSystem.player) return;
        
        const player = playerSystem.player;
        
        const levelInput = document.getElementById('debugLevel');
        if (levelInput) levelInput.value = player.level;
        
        const expInput = document.getElementById('debugExp');
        if (expInput) expInput.value = player.exp;
        
        const rebirthInput = document.getElementById('debugRebirth');
        if (rebirthInput) rebirthInput.value = player.rebirthLevel || 0;
        
        const hpInput = document.getElementById('debugHp');
        if (hpInput) hpInput.value = Math.floor(player.hp);
        
        const mpInput = document.getElementById('debugMp');
        if (mpInput) mpInput.value = Math.floor(player.mp);
        
        const atkInput = document.getElementById('debugAtk');
        if (atkInput) atkInput.value = player.baseAtk;
        
        const defInput = document.getElementById('debugDef');
        if (defInput) defInput.value = player.baseDef;
        
        const critInput = document.getElementById('debugCrit');
        if (critInput) critInput.value = player.baseCrit;
        
        const resources = resourceSystem.getAll();
        const goldInput = document.getElementById('debugGold');
        if (goldInput) goldInput.value = resources.gold;
        
        const diamondInput = document.getElementById('debugDiamond');
        if (diamondInput) diamondInput.value = resources.diamond;
        
        const forgeStoneInput = document.getElementById('debugForgeStone');
        if (forgeStoneInput) forgeStoneInput.value = resources.forgeStone;
        
        const refineStoneInput = document.getElementById('debugRefineStone');
        if (refineStoneInput) refineStoneInput.value = resources.refineStone;
        
        const skillBookInput = document.getElementById('debugSkillBook');
        if (skillBookInput) skillBookInput.value = resources.skillBook;
        
        const rebirthPillInput = document.getElementById('debugRebirthPill');
        if (rebirthPillInput) rebirthPillInput.value = resources.rebirthPill;
        
        const skills = skillSystem.getAll();
        const skillAttackInput = document.getElementById('debugSkillAttack');
        if (skillAttackInput) skillAttackInput.value = skills.attack?.level || 1;
        
        const skillDefenseInput = document.getElementById('debugSkillDefense');
        if (skillDefenseInput) skillDefenseInput.value = skills.defense?.level || 1;
        
        const skillCriticalInput = document.getElementById('debugSkillCritical');
        if (skillCriticalInput) skillCriticalInput.value = skills.critical?.level || 1;
        
        const skillHpBoostInput = document.getElementById('debugSkillHpBoost');
        if (skillHpBoostInput) skillHpBoostInput.value = skills.hpBoost?.level || 1;
        
        const mapSelect = document.getElementById('debugMap');
        if (mapSelect) mapSelect.value = mapSystem.getCurrentIndex();
    }
    
    setLevel() {
        const value = parseInt(document.getElementById('debugLevel').value);
        if (!isNaN(value) && value > 0) {
            playerSystem.player.level = value;
            playerSystem.player.expToNext = Math.floor(100 * Math.pow(1.2, value - 1));
            uiSystem.updateStats();
            uiSystem.updatePlayerInfo();
            saveSystem.save();
        }
    }
    
    setExp() {
        const value = parseInt(document.getElementById('debugExp').value);
        if (!isNaN(value) && value >= 0) {
            playerSystem.player.exp = value;
            uiSystem.updateStats();
            saveSystem.save();
        }
    }
    
    setRebirth() {
        const value = parseInt(document.getElementById('debugRebirth').value);
        if (!isNaN(value) && value >= 0) {
            playerSystem.player.rebirthLevel = value;
            playerSystem.player.rebirthBonus = value * 50;
            uiSystem.updateStats();
            uiSystem.updatePlayerInfo();
            uiSystem.renderMaps();
            saveSystem.save();
        }
    }
    
    setHp() {
        const value = parseInt(document.getElementById('debugHp').value);
        if (!isNaN(value) && value > 0) {
            playerSystem.player.hp = value;
            playerSystem.player.maxHp = value;
            uiSystem.updateStats();
            saveSystem.save();
        }
    }
    
    setMp() {
        const value = parseInt(document.getElementById('debugMp').value);
        if (!isNaN(value) && value >= 0) {
            playerSystem.player.mp = value;
            playerSystem.player.maxMp = value;
            uiSystem.updateStats();
            saveSystem.save();
        }
    }
    
    setAtk() {
        const value = parseInt(document.getElementById('debugAtk').value);
        if (!isNaN(value) && value >= 0) {
            playerSystem.player.baseAtk = value;
            uiSystem.updateStats();
            saveSystem.save();
        }
    }
    
    setDef() {
        const value = parseInt(document.getElementById('debugDef').value);
        if (!isNaN(value) && value >= 0) {
            playerSystem.player.baseDef = value;
            uiSystem.updateStats();
            saveSystem.save();
        }
    }
    
    setCrit() {
        const value = parseInt(document.getElementById('debugCrit').value);
        if (!isNaN(value) && value >= 0 && value <= 100) {
            playerSystem.player.baseCrit = value;
            uiSystem.updateStats();
            saveSystem.save();
        }
    }
    
    setResource(type) {
        const inputId = 'debug' + type.charAt(0).toUpperCase() + type.slice(1);
        const input = document.getElementById(inputId);
        if (!input) {
            console.log('Input not found:', inputId);
            return;
        }
        const value = parseInt(input.value);
        if (!isNaN(value) && value >= 0) {
            resourceSystem.set(type, value);
            uiSystem.updateResources();
            saveSystem.save();
        }
    }
    
    setSkill(skillKey) {
        const inputId = 'debugSkill' + skillKey.charAt(0).toUpperCase() + skillKey.slice(1);
        const value = parseInt(document.getElementById(inputId).value);
        if (!isNaN(value) && value >= 1) {
            const skill = skillSystem.get(skillKey);
            if (skill) {
                skill.level = value;
                skill.bonus = Math.floor(value * skill.multiplier);
                uiSystem.renderSkills();
                uiSystem.updateStats();
                saveSystem.save();
            }
        }
    }
    
    setMap() {
        const value = parseInt(document.getElementById('debugMap').value);
        if (!isNaN(value) && value >= 0) {
            mapSystem.changeMap(value);
            saveSystem.save();
        }
    }
    
    maxLevel() {
        playerSystem.player.level = 999;
        playerSystem.player.exp = 0;
        playerSystem.player.expToNext = 999999;
        uiSystem.updateStats();
        uiSystem.updatePlayerInfo();
        uiSystem.renderMaps();
        saveSystem.save();
        this.syncValues();
    }
    
    maxResources() {
        resourceSystem.set('gold', 999999999);
        resourceSystem.set('diamond', 99999);
        resourceSystem.set('forgeStone', 9999);
        resourceSystem.set('refineStone', 9999);
        resourceSystem.set('skillBook', 9999);
        resourceSystem.set('rebirthPill', 999);
        uiSystem.updateResources();
        saveSystem.save();
        this.syncValues();
    }
    
    maxSkills() {
        const skills = skillSystem.getAll();
        for (const key in skills) {
            const skill = skills[key];
            skill.level = 999;
            skill.bonus = Math.floor(999 * skill.multiplier);
        }
        uiSystem.renderSkills();
        uiSystem.updateStats();
        saveSystem.save();
        this.syncValues();
    }
    
    generateEquip() {
        const map = mapSystem.getCurrent();
        if (map) {
            const equip = equipmentSystem.generate(map);
            inventorySystem.addItem(equip);
            EventBus.emit(Events.EQUIP_GAIN, { item: equip });
            uiSystem.renderInventory();
            saveSystem.save();
        }
    }
    
    clearInventory() {
        inventorySystem.clear();
        uiSystem.renderInventory();
        saveSystem.save();
    }
    
    clearSave() {
        if (confirm('确定要清除所有存档数据吗？此操作不可恢复！')) {
            localStorage.clear();
            location.reload();
        }
    }
    
    toggleAutoBattle() {
        battleSystem.isAutoBattle = !battleSystem.isAutoBattle;
        const statusEl = document.getElementById('autoStatus');
        if (statusEl) {
            if (battleSystem.isAutoBattle) {
                statusEl.textContent = '🤖 自动挂机中...';
                statusEl.classList.add('active');
            } else {
                statusEl.textContent = '⏸ 已暂停';
                statusEl.classList.remove('active');
            }
        }
    }
    
    killAllEnemies() {
        battleSystem.clearEnemies();
        setTimeout(() => {
            battleSystem.spawnEnemies();
            uiSystem.updateEnemies(battleSystem.getEnemies());
        }, 500);
    }
    
    setSpeed() {
        const value = parseInt(document.getElementById('debugSpeed').value);
        if (!isNaN(value) && value > 0) {
            if (window.Game && window.Game.gameLoopInterval) {
                clearInterval(window.Game.gameLoopInterval);
                window.Game.gameLoopInterval = setInterval(() => {
                    if (battleSystem.isAutoBattle) {
                        const result = battleSystem.battle();
                        if (result) {
                            uiSystem.updateEnemies(battleSystem.getEnemies());
                        }
                        battleSystem.tick();
                    }
                }, value);
            }
        }
    }
}

const debugSystem = new DebugSystem();
window.Debug = debugSystem;
export { debugSystem };
