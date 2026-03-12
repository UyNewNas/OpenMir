import { EventBus, Events } from './core.js';
import { playerSystem, Classes } from './player.js';
import { resourceSystem } from './resource.js';
import { equipmentSystem } from './equipment.js';
import { inventorySystem } from './inventory.js';
import { mapSystem } from './map.js';
import { skillSystem } from './skill.js';
import { rebirthSystem } from './rebirth.js';
import { questSystem } from './quest.js';
import { battleSystem } from './battle.js';
import { uiSystem } from './ui.js';
import { saveSystem } from './save.js';

class Game {
    constructor() {
        this.selectedClass = null;
        this.pendingAutoEquip = null;
        this.autoEquipTimer = null;
        this.autoEquipCountdown = 0;
        this.gameLoopInterval = null;
        this.uiUpdateInterval = null;
        this.saveInterval = null;
    }
    
    init() {
        uiSystem.init();
        this.setupCharacterCreate();
        this.checkSavedGame();
        this.setupEventBus();
    }
    
    setupEventBus() {
        EventBus.on(Events.PLAYER_LEVEL_UP, ({ level }) => {
            uiSystem.addLog(`恭喜升级！当前等级: ${level}`, 'gain');
            uiSystem.showNotification(`升级了！等级 ${level}`);
            questSystem.updateProgress('level', 0);
        });
        
        EventBus.on(Events.PLAYER_DEATH, () => {
            uiSystem.addLog('你被击败了！自动复活中...', 'info');
        });
        
        EventBus.on(Events.PLAYER_REBIRTH, ({ rebirthLevel }) => {
            uiSystem.addLog(`转生成功！当前转生等级: ${rebirthLevel}`, 'gain');
            uiSystem.showNotification(`转生成功！${rebirthLevel}转`);
        });
        
        EventBus.on(Events.BATTLE_ENEMY_DEFEATED, ({ enemy, exp, gold }) => {
            uiSystem.addLog(`击败${enemy.name}！获得${exp}经验，${gold}金币`, 'gain');
            questSystem.updateProgress('kill', 1);
            questSystem.updateProgress('collect', gold);
        });
        
        EventBus.on(Events.BATTLE_DAMAGE, ({ damage, isCrit, isPlayerAttack }) => {
            uiSystem.showDamage(damage, isCrit, isPlayerAttack);
        });
        
        EventBus.on(Events.EQUIP_GAIN, ({ item }) => {
            uiSystem.addLog(`获得装备: ${item.name} (Lv.${item.level} ${item.qualityLabel})`, 'equip');
            uiSystem.showNotification(`获得 ${item.name}`, 'equip');
            questSystem.updateProgress('equip', 1);
            uiSystem.renderInventory();
            this.checkBetterEquipment(item);
        });
        
        EventBus.on(Events.EQUIP_EQUIPPED, ({ item, oldEquip, slot }) => {
            uiSystem.addLog(`装备了 ${item.name}`, 'equip');
            if (equipmentSystem.hasFullSet(item.setName)) {
                uiSystem.addLog(`激活套装效果: ${item.setName}！`, 'gain');
                uiSystem.showNotification(`套装效果激活: ${item.setName}`, 'equip');
            }
            uiSystem.renderEquipment();
            uiSystem.renderInventory();
            uiSystem.updateStats();
        });
        
        EventBus.on(Events.EQUIP_SOLD, ({ item, price }) => {
            uiSystem.addLog(`出售 ${item.name}，获得 ${price} 金币`, 'gain');
            uiSystem.showNotification(`出售成功，获得 ${price} 金币`);
        });
        
        EventBus.on(Events.QUEST_COMPLETE, ({ quest }) => {
            uiSystem.addLog(`任务完成: ${quest.name}！获得奖励！`, 'quest');
            uiSystem.showNotification(`任务完成: ${quest.name}`);
        });
        
        EventBus.on(Events.MAP_CHANGE, ({ map }) => {
            uiSystem.addLog(`进入地图: ${map.name}`, 'info');
            battleSystem.clearEnemy();
            uiSystem.updateMap();
            uiSystem.renderMaps();
        });
        
        EventBus.on(Events.SAVE_GAME, ({ saveTime }) => {
            uiSystem.updateSaveInfo(`游戏已保存 ${new Date().toLocaleTimeString()}`);
        });
        
        EventBus.on('inventory:equip', ({ itemId }) => {
            this.equipItemById(itemId);
        });
        
        EventBus.on('inventory:unequip', ({ slot }) => {
            this.unequipItem(slot);
        });
    }
    
    setupCharacterCreate() {
        const nameInput = uiSystem.elements.playerNameInput;
        const classCards = document.querySelectorAll('.class-card');
        
        nameInput?.addEventListener('input', () => this.validateCreate());
        
        classCards.forEach(card => {
            card.addEventListener('click', () => {
                classCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedClass = card.dataset.class;
                this.validateCreate();
            });
        });
        
        uiSystem.elements.startBtn?.addEventListener('click', () => this.startNewGame());
        uiSystem.elements.loadBtn?.addEventListener('click', () => this.loadGame());
    }
    
    validateCreate() {
        const name = uiSystem.elements.playerNameInput?.value.trim();
        if (uiSystem.elements.startBtn) {
            uiSystem.elements.startBtn.disabled = !name || !this.selectedClass;
        }
    }
    
    checkSavedGame() {
        if (uiSystem.elements.loadBtn) {
            uiSystem.elements.loadBtn.disabled = !saveSystem.hasSave();
        }
    }
    
    startNewGame() {
        const name = uiSystem.elements.playerNameInput.value.trim();
        
        playerSystem.createPlayer(name, this.selectedClass);
        resourceSystem.init();
        skillSystem.init();
        equipmentSystem.load(null);
        inventorySystem.load([], null);
        mapSystem.load(0);
        questSystem.load([], 0);
        
        this.enterGame(false);
    }
    
    loadGame() {
        if (saveSystem.load()) {
            this.enterGame(true);
        }
    }
    
    enterGame(isLoad) {
        uiSystem.showGame();
        uiSystem.updatePlayerInfo();
        uiSystem.updateAutoRecycleUI();
        uiSystem.renderAll();
        uiSystem.updateSkillTabRedDot();
        
        if (!isLoad) {
            for (let i = 0; i < 3; i++) {
                questSystem.generate();
            }
            uiSystem.addLog('欢迎来到传奇世界！开始你的冒险吧！', 'info');
        } else {
            uiSystem.addLog('存档加载成功！继续你的冒险！', 'info');
        }
        
        this.startGameLoop();
        
        this.saveInterval = setInterval(() => saveSystem.save(), 30000);
    }
    
    startGameLoop() {
        this.gameLoopInterval = setInterval(() => {
            if (battleSystem.isAutoBattle) {
                const result = battleSystem.battle();
                if (result) {
                    uiSystem.updateEnemy(battleSystem.currentEnemy);
                }
                
                const tick = battleSystem.tick();
                
                if (tick % 30 === 0) {
                    mapSystem.autoNavigate(
                        playerSystem.player.level,
                        playerSystem.player.rebirthLevel
                    );
                }
                
                if (tick % 60 === 0) {
                    this.autoEquip();
                    const recycleResult = inventorySystem.performAutoRecycle();
                    if (recycleResult.count > 0) {
                        resourceSystem.add('gold', recycleResult.gold);
                        uiSystem.addLog(`自动回收 ${recycleResult.count} 件装备，获得 ${recycleResult.gold} 金币`, 'gain');
                        uiSystem.updateRecycleStats();
                        uiSystem.renderInventory();
                    }
                    questSystem.generate();
                    uiSystem.renderQuests();
                }
                
                const maxHp = playerSystem.getMaxHp(
                    equipmentSystem.getEquipment(),
                    skillSystem.getAll(),
                    equipmentSystem.getSetBonus()
                );
                if (playerSystem.player.hp < maxHp * 0.3) {
                    playerSystem.heal(maxHp * 0.1);
                }
                playerSystem.recoverMp(1);
            }
        }, 500);
        
        this.uiUpdateInterval = setInterval(() => {
            uiSystem.updateAll(battleSystem.currentEnemy);
        }, 100);
    }
    
    stopGameLoop() {
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null;
        }
        if (this.uiUpdateInterval) {
            clearInterval(this.uiUpdateInterval);
            this.uiUpdateInterval = null;
        }
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
            this.saveInterval = null;
        }
    }
    
    equipItem(item) {
        if (inventorySystem.isFull()) {
            uiSystem.addLog('背包已满！', 'info');
            return;
        }
        
        const oldEquip = equipmentSystem.equip(item);
        inventorySystem.removeItem(item.id);
        
        if (oldEquip) {
            inventorySystem.addItem(oldEquip);
        }
        
        saveSystem.save();
    }
    
    equipItemById(itemId) {
        const item = inventorySystem.getItem(itemId);
        if (item) {
            this.equipItem(item);
            uiSystem.hideSlotEquipList();
        }
    }
    
    unequipItem(slot) {
        if (inventorySystem.isFull()) {
            uiSystem.addLog('背包已满，无法卸下装备！', 'info');
            return;
        }
        
        const equip = equipmentSystem.unequip(slot);
        if (equip) {
            inventorySystem.addItem(equip);
            uiSystem.addLog(`卸下了 ${equip.name}`, 'info');
            uiSystem.renderEquipment();
            uiSystem.renderInventory();
            uiSystem.updateStats();
            saveSystem.save();
        }
    }
    
    checkBetterEquipment(newEquip) {
        if (this.pendingAutoEquip) return;
        
        const currentEquip = equipmentSystem.getSlot(newEquip.slot);
        let isBetter = false;
        
        if (!currentEquip) {
            isBetter = true;
        } else {
            const currentScore = equipmentSystem.calculateScore(currentEquip);
            const newScore = equipmentSystem.calculateScore(newEquip);
            isBetter = newScore > currentScore;
        }
        
        if (isBetter) {
            this.showAutoEquipTip(newEquip, currentEquip);
        }
    }
    
    showAutoEquipTip(newEquip, currentEquip) {
        this.pendingAutoEquip = newEquip;
        this.autoEquipCountdown = 5;
        
        uiSystem.showAutoEquipTip(newEquip, currentEquip);
        
        if (this.autoEquipTimer) {
            clearInterval(this.autoEquipTimer);
        }
        
        this.autoEquipTimer = setInterval(() => {
            this.autoEquipCountdown--;
            uiSystem.updateAutoEquipCountdown(this.autoEquipCountdown);
            
            if (this.autoEquipCountdown <= 0) {
                this.confirmAutoEquip();
            }
        }, 1000);
    }
    
    confirmAutoEquip() {
        if (!this.pendingAutoEquip) return;
        
        this.equipItem(this.pendingAutoEquip);
        this.hideAutoEquipTip();
    }
    
    cancelAutoEquip() {
        this.hideAutoEquipTip();
    }
    
    hideAutoEquipTip() {
        uiSystem.hideAutoEquipTip();
        
        if (this.autoEquipTimer) {
            clearInterval(this.autoEquipTimer);
            this.autoEquipTimer = null;
        }
        
        this.pendingAutoEquip = null;
        this.autoEquipCountdown = 0;
    }
    
    toggleAutoRecycle() {
        inventorySystem.toggleAutoRecycle();
        uiSystem.updateAutoRecycleUI();
        saveSystem.save();
    }
    
    updateRecycleSettings() {
        uiSystem.updateRecycleSettings();
        saveSystem.save();
    }
    
    showEquipDetail(index) {
        uiSystem.showEquipDetail(index);
    }
    
    closeEquipDetail() {
        uiSystem.closeEquipDetail();
    }
    
    confirmEquip() {
        const item = inventorySystem.getSelectedItem();
        if (item) {
            this.equipItem(item);
            uiSystem.closeEquipDetail();
        }
    }
    
    sellEquip() {
        const item = inventorySystem.getSelectedItem();
        if (!item) return;
        
        const price = equipmentSystem.getSellPrice(item);
        inventorySystem.removeItem(item.id);
        resourceSystem.add('gold', price);
        
        EventBus.emit(Events.EQUIP_SOLD, { item, price });
        
        uiSystem.closeEquipDetail();
        uiSystem.renderInventory();
        uiSystem.updateResources();
        saveSystem.save();
    }
    
    autoEquip() {
        const items = inventorySystem.getItems();
        items.forEach(item => {
            const currentEquip = equipmentSystem.getSlot(item.slot);
            if (!currentEquip || 
                (item.quality > currentEquip.quality || 
                 (item.quality === currentEquip.quality && item.level > currentEquip.level))) {
                if (Math.random() < 0.3) {
                    this.equipItem(item);
                }
            }
        });
    }
}

const game = new Game();
window.Game = game;
window.onload = () => game.init();
export { game };
