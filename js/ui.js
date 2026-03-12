import { EventBus, Events } from './core.js';
import { playerSystem, Classes } from './player.js';
import { resourceSystem } from './resource.js';
import { equipmentSystem, QualityNames, QualityLabels, SlotIcons, SlotNames } from './equipment.js';
import { inventorySystem, MAX_BAG_SIZE } from './inventory.js';
import { mapSystem } from './map.js';
import { skillSystem } from './skill.js';
import { rebirthSystem } from './rebirth.js';
import { questSystem } from './quest.js';
import { shopSystem, CurrencyIcons, CategoryNames } from './shop.js';

class UISystem {
    constructor() {
        this.elements = {};
    }
    
    init() {
        this.cacheElements();
        this.setupTabs();
        this.setupEventListeners();
    }
    
    cacheElements() {
        this.elements = {
            characterCreate: document.getElementById('characterCreate'),
            gameContainer: document.getElementById('gameContainer'),
            playerNameInput: document.getElementById('playerNameInput'),
            classGrid: document.getElementById('classGrid'),
            startBtn: document.getElementById('startBtn'),
            loadBtn: document.getElementById('loadBtn'),
            
            playerAvatar: document.getElementById('playerAvatar'),
            playerName: document.getElementById('playerName'),
            playerClassInfo: document.getElementById('playerClassInfo'),
            rebirthLevel: document.getElementById('rebirthLevel'),
            totalPower: document.getElementById('totalPower'),
            
            playerLevel: document.getElementById('playerLevel'),
            playerExp: document.getElementById('playerExp'),
            expBar: document.getElementById('expBar'),
            playerHp: document.getElementById('playerHp'),
            hpBar: document.getElementById('hpBar'),
            playerMp: document.getElementById('playerMp'),
            mpBar: document.getElementById('mpBar'),
            playerAtk: document.getElementById('playerAtk'),
            playerDef: document.getElementById('playerDef'),
            playerCrit: document.getElementById('playerCrit'),
            
            gold: document.getElementById('gold'),
            diamond: document.getElementById('diamond'),
            forgeStone: document.getElementById('forgeStone'),
            refineStone: document.getElementById('refineStone'),
            skillBook: document.getElementById('skillBook'),
            rebirthPill: document.getElementById('rebirthPill'),
            
            currentMapName: document.getElementById('currentMapName'),
            mapRequirement: document.getElementById('mapRequirement'),
            enemyInfo: document.getElementById('enemyInfo'),
            enemySprite: document.getElementById('enemySprite'),
            enemyName: document.getElementById('enemyName'),
            enemyHpBar: document.getElementById('enemyHpBar'),
            playerSprite: document.getElementById('playerSprite'),
            autoStatus: document.getElementById('autoStatus'),
            gameMap: document.getElementById('gameMap'),
            
            battleLog: document.getElementById('battleLog'),
            
            questList: document.getElementById('questList'),
            mapList: document.getElementById('mapList'),
            equipmentList: document.getElementById('equipmentList'),
            setBonusDisplay: document.getElementById('setBonusDisplay'),
            slotEquipList: document.getElementById('slotEquipList'),
            inventoryGrid: document.getElementById('inventoryGrid'),
            bagCount: document.getElementById('bagCount'),
            skillList: document.getElementById('skillList'),
            rebirthInfo: document.getElementById('rebirthInfo'),
            
            autoRecycleToggle: document.getElementById('autoRecycleToggle'),
            recycleLevelSelect: document.getElementById('recycleLevelSelect'),
            recycleQualitySelect: document.getElementById('recycleQualitySelect'),
            recycleStats: document.getElementById('recycleStats'),
            
            saveInfo: document.getElementById('saveInfo'),
            
            autoEquipTip: document.getElementById('autoEquipTip'),
            autoEquipItemName: document.getElementById('autoEquipItemName'),
            autoEquipItemStats: document.getElementById('autoEquipItemStats'),
            autoEquipCountdown: document.getElementById('autoEquipCountdown'),
            
            equipDetailOverlay: document.getElementById('equipDetailOverlay'),
            equipDetailPanel: document.getElementById('equipDetailPanel'),
            detailEquipName: document.getElementById('detailEquipName'),
            detailEquipSlot: document.getElementById('detailEquipSlot'),
            detailEquipLevel: document.getElementById('detailEquipLevel'),
            detailEquipQuality: document.getElementById('detailEquipQuality'),
            detailEquipSet: document.getElementById('detailEquipSet'),
            detailEquipStats: document.getElementById('detailEquipStats'),
            equipCompare: document.getElementById('equipCompare'),
            compareStats: document.getElementById('compareStats'),
            sellPrice: document.getElementById('sellPrice'),
            
            skillTabBtn: document.getElementById('skillTabBtn'),
            
            shopTabBtn: document.getElementById('shopTabBtn'),
            shopCurrencyTabs: document.getElementById('shopCurrencyTabs'),
            shopItemList: document.getElementById('shopItemList'),
            shopGoldAmount: document.getElementById('shopGoldAmount'),
            shopDiamondAmount: document.getElementById('shopDiamondAmount')
        };
    }
    
    setupTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
            });
        });
    }
    
    setupEventListeners() {
        this.elements.autoRecycleToggle?.addEventListener('click', () => {
            inventorySystem.toggleAutoRecycle();
            this.updateAutoRecycleUI();
        });
        
        this.elements.recycleLevelSelect?.addEventListener('change', () => this.updateRecycleSettings());
        this.elements.recycleQualitySelect?.addEventListener('change', () => this.updateRecycleSettings());
    }
    
    showCharacterCreate() {
        this.elements.characterCreate.style.display = 'flex';
        this.elements.gameContainer.style.display = 'none';
    }
    
    showGame() {
        this.elements.characterCreate.style.display = 'none';
        this.elements.gameContainer.style.display = 'grid';
    }
    
    updatePlayerInfo() {
        const player = playerSystem.player;
        const classData = playerSystem.getClassData();
        
        this.elements.playerAvatar.textContent = classData.avatar;
        this.elements.playerAvatar.className = `player-avatar ${player.class}`;
        this.elements.playerSprite.textContent = classData.sprite;
        this.elements.playerName.textContent = player.name;
        this.elements.playerClassInfo.innerHTML = `${classData.name} · <span id="rebirthLevel">${player.rebirthLevel}</span>转`;
    }
    
    updateStats() {
        const player = playerSystem.player;
        const equipment = equipmentSystem.getEquipment();
        const skills = skillSystem.getAll();
        const setBonus = equipmentSystem.getSetBonus();
        
        this.elements.playerLevel.textContent = player.level;
        this.elements.playerExp.textContent = `${this.formatNumber(player.exp)}/${this.formatNumber(player.expToNext)}`;
        this.elements.expBar.style.width = `${(player.exp / player.expToNext) * 100}%`;
        
        const maxHp = playerSystem.getMaxHp(equipment, skills, setBonus);
        const maxMp = playerSystem.getMaxMp();
        
        this.elements.playerHp.textContent = `${this.formatNumber(player.hp)}/${this.formatNumber(maxHp)}`;
        this.elements.hpBar.style.width = `${(player.hp / maxHp) * 100}%`;
        
        this.elements.playerMp.textContent = `${this.formatNumber(player.mp)}/${this.formatNumber(maxMp)}`;
        this.elements.mpBar.style.width = `${(player.mp / maxMp) * 100}%`;
        
        this.elements.playerAtk.textContent = this.formatNumber(playerSystem.getAtk(equipment, skills, setBonus));
        this.elements.playerDef.textContent = this.formatNumber(playerSystem.getDef(equipment, skills, setBonus));
        this.elements.playerCrit.textContent = `${playerSystem.getCritRate(equipment, skills, setBonus)}%`;
        
        this.elements.totalPower.textContent = this.formatNumber(playerSystem.getTotalPower(equipment, skills, setBonus));
    }
    
    updateResources() {
        this.elements.gold.textContent = this.formatNumber(resourceSystem.get('gold'));
        this.elements.diamond.textContent = this.formatNumber(resourceSystem.get('diamond'));
        this.elements.forgeStone.textContent = this.formatNumber(resourceSystem.get('forgeStone'));
        this.elements.refineStone.textContent = this.formatNumber(resourceSystem.get('refineStone'));
        this.elements.skillBook.textContent = this.formatNumber(resourceSystem.get('skillBook'));
        this.elements.rebirthPill.textContent = this.formatNumber(resourceSystem.get('rebirthPill'));
    }
    
    updateMap() {
        const map = mapSystem.getCurrent();
        this.elements.currentMapName.textContent = map.name;
        this.elements.mapRequirement.textContent = `等级要求: ${map.reqLevel} | 转生要求: ${map.reqRebirth}`;
    }
    
    updateEnemy(enemy) {
        if (enemy) {
            this.elements.enemyInfo.style.display = 'block';
            this.elements.enemySprite.textContent = enemy.sprite;
            this.elements.enemyName.textContent = enemy.name;
            this.elements.enemyHpBar.style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;
        } else {
            this.elements.enemyInfo.style.display = 'none';
        }
    }
    
    renderMaps() {
        const player = playerSystem.player;
        const currentIndex = mapSystem.getCurrentIndex();
        
        this.elements.mapList.innerHTML = mapSystem.getAll().map((map, index) => {
            const isLocked = player.level < map.reqLevel || player.rebirthLevel < map.reqRebirth;
            const isCurrent = index === currentIndex;
            return `
                <div class="map-item ${isLocked ? 'locked' : ''} ${isCurrent ? 'current' : ''}" 
                     data-map-index="${index}">
                    <div class="map-item-name">${map.icon} ${map.name} ${isCurrent ? '<span class="current-map-tag">【当前地图】</span>' : ''}</div>
                    <div class="map-item-req">
                        ${isLocked ? `需要: Lv.${map.reqLevel} ${map.reqRebirth > 0 ? `· ${map.reqRebirth}转` : ''}` : '可进入'}
                    </div>
                    <div class="map-item-rewards">经验×${map.expRate} 金币×${map.goldRate} | 装备Lv.${map.equipLevel}</div>
                </div>
            `;
        }).join('');
        
        this.elements.mapList.querySelectorAll('.map-item:not(.locked)').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.mapIndex);
                if (mapSystem.canEnter(index, player.level, player.rebirthLevel)) {
                    mapSystem.changeMap(index);
                }
            });
        });
    }
    
    renderEquipment() {
        const equipment = equipmentSystem.getEquipment();
        const slots = ['weapon', 'armor', 'helmet', 'boots'];
        
        this.elements.equipmentList.innerHTML = slots.map(slot => {
            const equip = equipment[slot];
            if (equip) {
                const statsText = [];
                if (equip.atk) statsText.push(`攻击+${equip.atk}`);
                if (equip.def) statsText.push(`防御+${equip.def}`);
                if (equip.hp) statsText.push(`生命+${equip.hp}`);
                if (equip.crit) statsText.push(`暴击+${equip.crit}%`);
                
                return `
                    <div class="equipment-slot" data-slot="${slot}">
                        <div class="equip-header">
                            <span class="equip-name ${equip.qualityName}">${SlotIcons[slot]} ${equip.name}</span>
                            <span class="equip-level">Lv.${equip.level}</span>
                        </div>
                        <div class="equip-stats">${statsText.join(' ')}</div>
                        <div class="equip-set">套装: ${equip.setName}</div>
                        <div class="click-hint">点击更换装备</div>
                    </div>
                `;
            } else {
                return `
                    <div class="equipment-slot empty" data-slot="${slot}">
                        <div class="equip-header">
                            <span class="equip-name">${SlotIcons[slot]} ${SlotNames[slot]}</span>
                        </div>
                        <div class="equip-stats">空</div>
                        <div class="click-hint">点击选择装备</div>
                    </div>
                `;
            }
        }).join('');
        
        this.elements.equipmentList.querySelectorAll('.equipment-slot').forEach(item => {
            item.addEventListener('click', () => {
                this.showSlotEquipList(item.dataset.slot);
            });
        });
        
        this.renderSetBonus();
    }
    
    showSlotEquipList(slot) {
        const currentEquip = equipmentSystem.getSlot(slot);
        const bagEquips = inventorySystem.getSortedItemsBySlot(slot);
        
        let listHtml = `<div class="slot-equip-list-title">${SlotIcons[slot]} ${SlotNames[slot]} - 背包中的装备</div>`;
        
        if (currentEquip) {
            const statsText = [];
            if (currentEquip.atk) statsText.push(`攻击+${currentEquip.atk}`);
            if (currentEquip.def) statsText.push(`防御+${currentEquip.def}`);
            if (currentEquip.hp) statsText.push(`生命+${currentEquip.hp}`);
            if (currentEquip.crit) statsText.push(`暴击+${currentEquip.crit}%`);
            
            listHtml += `
                <div class="slot-equip-item" style="border-color: #4caf50;" data-action="unequip" data-slot="${slot}">
                    <div class="slot-equip-item-name ${currentEquip.qualityName}">当前: ${currentEquip.name} (Lv.${currentEquip.level})</div>
                    <div class="slot-equip-item-stats">${statsText.join(' ')} | 点击卸下</div>
                </div>
            `;
        }
        
        if (bagEquips.length === 0) {
            listHtml += `<div class="slot-equip-empty-msg">背包中没有该部位的装备</div>`;
        } else {
            bagEquips.forEach((item) => {
                const statsText = [];
                if (item.atk) statsText.push(`攻击+${item.atk}`);
                if (item.def) statsText.push(`防御+${item.def}`);
                if (item.hp) statsText.push(`生命+${item.hp}`);
                if (item.crit) statsText.push(`暴击+${item.crit}%`);
                
                let compareText = '';
                let isBetter = false;
                if (currentEquip) {
                    const currentScore = equipmentSystem.calculateScore(currentEquip);
                    const newScore = equipmentSystem.calculateScore(item);
                    if (newScore > currentScore) {
                        isBetter = true;
                        const atkDiff = (item.atk || 0) - (currentEquip.atk || 0);
                        const defDiff = (item.def || 0) - (currentEquip.def || 0);
                        const hpDiff = (item.hp || 0) - (currentEquip.hp || 0);
                        const critDiff = (item.crit || 0) - (currentEquip.crit || 0);
                        
                        const diffs = [];
                        if (atkDiff > 0) diffs.push(`攻击+${atkDiff}`);
                        if (defDiff > 0) diffs.push(`防御+${defDiff}`);
                        if (hpDiff > 0) diffs.push(`生命+${hpDiff}`);
                        if (critDiff > 0) diffs.push(`暴击+${critDiff}%`);
                        compareText = ` | 提升: ${diffs.join(' ')}`;
                    }
                } else {
                    isBetter = true;
                }
                
                listHtml += `
                    <div class="slot-equip-item" data-action="equip" data-item-id="${item.id}">
                        <div class="slot-equip-item-name ${item.qualityName}">${item.name} (Lv.${item.level} ${item.qualityLabel})</div>
                        <div class="slot-equip-item-stats ${isBetter ? 'better' : ''}">${statsText.join(' ')}${compareText}</div>
                    </div>
                `;
            });
        }
        
        this.elements.slotEquipList.innerHTML = listHtml;
        this.elements.slotEquipList.style.display = 'block';
        
        this.elements.slotEquipList.querySelectorAll('.slot-equip-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                if (action === 'unequip') {
                    EventBus.emit('inventory:unequip', { slot: item.dataset.slot });
                } else if (action === 'equip') {
                    EventBus.emit('inventory:equip', { itemId: parseFloat(item.dataset.itemId) });
                }
                this.elements.slotEquipList.style.display = 'none';
            });
        });
    }
    
    hideSlotEquipList() {
        this.elements.slotEquipList.style.display = 'none';
    }
    
    renderSetBonus() {
        const activeSets = equipmentSystem.getActiveSets();
        
        if (activeSets.length === 0) {
            this.elements.setBonusDisplay.innerHTML = '';
            return;
        }
        
        this.elements.setBonusDisplay.innerHTML = activeSets.map(set => {
            const bonusText = Object.entries(set.bonus)
                .map(([stat, val]) => `${stat === 'atk' ? '攻击' : stat === 'def' ? '防御' : stat === 'hp' ? '生命' : '暴击'}+${val}`)
                .join(' ');
            
            return `
                <div class="set-bonus" style="${set.isFull ? '' : 'opacity: 0.5'}">
                    <div class="set-bonus-title">${set.name} (${set.pieces}/${set.total})</div>
                    <div class="set-bonus-desc">${set.isFull ? '✓ ' : ''}${bonusText}</div>
                </div>
            `;
        }).join('');
    }
    
    renderInventory() {
        const items = inventorySystem.getItems();
        this.elements.bagCount.textContent = items.length;
        
        this.elements.inventoryGrid.innerHTML = items.map((item, index) => `
            <div class="inventory-slot ${item.qualityName} ${inventorySystem.getSelectedItem()?.id === item.id ? 'selected' : ''}" 
                 data-index="${index}">
                <div class="icon">${SlotIcons[item.slot]}</div>
                <div class="level">Lv.${item.level}</div>
                <div class="quality">${item.qualityLabel}</div>
            </div>
        `).join('');
        
        this.elements.inventoryGrid.querySelectorAll('.inventory-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                const index = parseInt(slot.dataset.index);
                this.showEquipDetail(index);
            });
        });
    }
    
    showEquipDetail(index) {
        const items = inventorySystem.getItems();
        const item = items[index];
        if (!item) return;
        
        inventorySystem.selectItem(item);
        this.renderInventory();
        
        this.elements.equipDetailOverlay.style.display = 'block';
        this.elements.equipDetailPanel.style.display = 'block';
        
        this.elements.detailEquipName.textContent = item.name;
        this.elements.detailEquipName.className = `equip-detail-name ${item.qualityName}`;
        this.elements.detailEquipSlot.textContent = item.slotName;
        this.elements.detailEquipLevel.textContent = `Lv.${item.level}`;
        this.elements.detailEquipQuality.textContent = item.qualityLabel;
        this.elements.detailEquipQuality.className = `equip-detail-value ${item.qualityName}`;
        this.elements.detailEquipSet.textContent = item.setName;
        
        const statsHtml = [];
        if (item.atk) statsHtml.push(`<div class="equip-detail-row"><span class="equip-detail-label">攻击力</span><span class="equip-detail-value">+${item.atk}</span></div>`);
        if (item.def) statsHtml.push(`<div class="equip-detail-row"><span class="equip-detail-label">防御力</span><span class="equip-detail-value">+${item.def}</span></div>`);
        if (item.hp) statsHtml.push(`<div class="equip-detail-row"><span class="equip-detail-label">生命值</span><span class="equip-detail-value">+${item.hp}</span></div>`);
        if (item.crit) statsHtml.push(`<div class="equip-detail-row"><span class="equip-detail-label">暴击率</span><span class="equip-detail-value">+${item.crit}%</span></div>`);
        this.elements.detailEquipStats.innerHTML = statsHtml.join('');
        
        const currentEquip = equipmentSystem.getSlot(item.slot);
        if (currentEquip) {
            this.elements.equipCompare.style.display = 'block';
            const compareHtml = [];
            
            const atkDiff = (item.atk || 0) - (currentEquip.atk || 0);
            const defDiff = (item.def || 0) - (currentEquip.def || 0);
            const hpDiff = (item.hp || 0) - (currentEquip.hp || 0);
            const critDiff = (item.crit || 0) - (currentEquip.crit || 0);

            if (atkDiff !== 0) compareHtml.push(`<div class="equip-detail-row"><span class="equip-detail-label">攻击力</span><span class="equip-detail-value ${atkDiff > 0 ? 'better' : 'worse'}">${atkDiff > 0 ? '+' : ''}${atkDiff}</span></div>`);
            if (defDiff !== 0) compareHtml.push(`<div class="equip-detail-row"><span class="equip-detail-label">防御力</span><span class="equip-detail-value ${defDiff > 0 ? 'better' : 'worse'}">${defDiff > 0 ? '+' : ''}${defDiff}</span></div>`);
            if (hpDiff !== 0) compareHtml.push(`<div class="equip-detail-row"><span class="equip-detail-label">生命值</span><span class="equip-detail-value ${hpDiff > 0 ? 'better' : 'worse'}">${hpDiff > 0 ? '+' : ''}${hpDiff}</span></div>`);
            if (critDiff !== 0) compareHtml.push(`<div class="equip-detail-row"><span class="equip-detail-label">暴击率</span><span class="equip-detail-value ${critDiff > 0 ? 'better' : 'worse'}">${critDiff > 0 ? '+' : ''}${critDiff}%</span></div>`);

            if (compareHtml.length === 0) {
                compareHtml.push('<div class="equip-detail-row"><span class="equip-detail-value">属性相同</span></div>');
            }

            this.elements.compareStats.innerHTML = compareHtml.join('');
        } else {
            this.elements.equipCompare.style.display = 'block';
            this.elements.compareStats.innerHTML = '<div class="equip-detail-row"><span class="equip-detail-value better">新装备槽位</span></div>';
        }
        
        const sellPrice = equipmentSystem.getSellPrice(item);
        this.elements.sellPrice.textContent = `出售价格: ${sellPrice} 金币`;
    }
    
    closeEquipDetail() {
        this.elements.equipDetailOverlay.style.display = 'none';
        this.elements.equipDetailPanel.style.display = 'none';
        inventorySystem.clearSelection();
        this.renderInventory();
    }
    
    renderSkills() {
        const skills = skillSystem.getAll();
        const maxLevel = skillSystem.getMaxLevel();
        
        this.elements.skillList.innerHTML = Object.entries(skills).map(([key, skill]) => {
            const costText = skillSystem.getCostText(key);
            const canUpgrade = skillSystem.canUpgrade(key);
            const isMaxLevel = skill.level >= maxLevel;
            
            return `
                <div class="upgrade-item">
                    <div class="upgrade-header">
                        <span class="upgrade-name-wrapper">
                            <span class="upgrade-name">${skill.icon} ${skill.name}</span>
                            ${canUpgrade ? '<span class="red-dot"></span>' : ''}
                        </span>
                        <span class="upgrade-level">Lv.${skill.level}/${maxLevel}</span>
                    </div>
                    <div class="upgrade-desc">当前加成: +${skill.bonus}</div>
                    <div class="upgrade-cost">${isMaxLevel ? '已达上限' : `消耗: ${costText}`}</div>
                    <button class="upgrade-btn" data-skill="${key}" ${canUpgrade ? '' : 'disabled'}>${isMaxLevel ? '已满级' : '升级'}</button>
                </div>
            `;
        }).join('');
        
        this.elements.skillList.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                skillSystem.upgrade(btn.dataset.skill);
                this.renderSkills();
                this.updateStats();
            });
        });
        
        this.updateSkillTabRedDot();
    }
    
    updateSkillTabRedDot() {
        const hasUpgrade = skillSystem.hasAnyUpgrade();
        let redDot = this.elements.skillTabBtn?.querySelector('.red-dot');
        
        if (hasUpgrade) {
            if (!redDot) {
                redDot = document.createElement('span');
                redDot.className = 'red-dot';
                this.elements.skillTabBtn?.appendChild(redDot);
            }
        } else {
            redDot?.remove();
        }
    }
    
    renderRebirth() {
        const player = playerSystem.player;
        const canRebirth = rebirthSystem.canRebirth();
        
        this.elements.rebirthInfo.innerHTML = `
            <div class="upgrade-item">
                <div class="upgrade-header">
                    <span class="upgrade-name">🔄 转生系统</span>
                    <span class="upgrade-level">${player.rebirthLevel}转</span>
                </div>
                <div class="upgrade-desc">
                    转生后等级重置为1，获得永久属性加成<br>
                    当前加成: +${player.rebirthBonus} 攻击/防御<br>
                    下次加成: +${rebirthSystem.getNextBonus()} 攻击/防御
                </div>
                <div class="upgrade-cost">要求: 等级100 · 转生丹×1</div>
                <button class="upgrade-btn" id="rebirthBtn" ${canRebirth ? '' : 'disabled'}>
                    ${player.level < 100 ? '需要等级100' : 
                      resourceSystem.get('rebirthPill') < 1 ? '需要转生丹' : '转生'}
                </button>
            </div>
            <div class="upgrade-item">
                <div class="upgrade-desc">
                    转生丹获取方式:<br>
                    · 击杀怪物有几率掉落<br>
                    · 完成任务获得<br>
                    · 高级地图掉率更高
                </div>
            </div>
        `;
        
        document.getElementById('rebirthBtn')?.addEventListener('click', () => {
            if (rebirthSystem.rebirth()) {
                this.renderRebirth();
                this.renderMaps();
                this.updateStats();
            }
        });
    }
    
    renderQuests() {
        const quests = questSystem.getQuests();
        
        this.elements.questList.innerHTML = quests.map(quest => {
            const rewardText = questSystem.getRewardText(quest);
            return `
                <div class="quest-item">
                    <div class="quest-name">${quest.name}</div>
                    <div class="quest-desc">${quest.desc || `目标: ${quest.target}`}</div>
                    <div class="quest-progress">进度: ${quest.progress}/${quest.target}</div>
                    <div class="quest-reward">奖励: ${rewardText}</div>
                    <span class="quest-status ${quest.status}">${quest.status === 'active' ? '进行中' : '已完成'}</span>
                </div>
            `;
        }).join('');
    }
    
    updateAutoRecycleUI() {
        const autoRecycle = inventorySystem.autoRecycle;
        
        if (autoRecycle.enabled) {
            this.elements.autoRecycleToggle?.classList.add('active');
        } else {
            this.elements.autoRecycleToggle?.classList.remove('active');
        }
        
        if (this.elements.recycleLevelSelect) {
            this.elements.recycleLevelSelect.value = autoRecycle.maxLevel;
        }
        if (this.elements.recycleQualitySelect) {
            this.elements.recycleQualitySelect.value = autoRecycle.maxQuality;
        }
        
        this.updateRecycleStats();
    }
    
    updateRecycleSettings() {
        const maxLevel = parseInt(this.elements.recycleLevelSelect?.value || 0);
        const maxQuality = parseInt(this.elements.recycleQualitySelect?.value || -1);
        inventorySystem.setRecycleSettings(maxLevel, maxQuality);
    }
    
    updateRecycleStats() {
        const stats = inventorySystem.getRecycleStats();
        if (this.elements.recycleStats) {
            this.elements.recycleStats.textContent = `累计回收: ${stats.totalRecycled}件装备，获得 ${this.formatNumber(stats.totalGoldEarned)} 金币`;
        }
    }
    
    addLog(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        this.elements.battleLog.appendChild(entry);
        this.elements.battleLog.scrollTop = this.elements.battleLog.scrollHeight;
        
        if (this.elements.battleLog.children.length > 100) {
            this.elements.battleLog.removeChild(this.elements.battleLog.firstChild);
        }
    }
    
    showNotification(message, type = '') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
    
    showDamage(damage, isCrit, isPlayerAttack) {
        const dmgEl = document.createElement('div');
        dmgEl.className = `damage-number ${isCrit ? 'crit' : ''}`;
        dmgEl.textContent = damage;
        dmgEl.style.left = `${Math.random() * 60 + 20}%`;
        dmgEl.style.top = isPlayerAttack ? '40%' : '70%';
        this.elements.gameMap.appendChild(dmgEl);
        setTimeout(() => dmgEl.remove(), 1000);
    }
    
    showAutoEquipTip(newEquip, currentEquip) {
        this.elements.autoEquipTip.style.display = 'block';
        this.elements.autoEquipItemName.textContent = `${newEquip.name} (Lv.${newEquip.level} ${newEquip.qualityLabel})`;
        this.elements.autoEquipItemName.className = `auto-equip-tip-item-name ${newEquip.qualityName}`;
        
        let statsText = '';
        if (newEquip.atk) statsText += `攻击+${newEquip.atk} `;
        if (newEquip.def) statsText += `防御+${newEquip.def} `;
        if (newEquip.hp) statsText += `生命+${newEquip.hp} `;
        if (newEquip.crit) statsText += `暴击+${newEquip.crit}% `;
        
        if (currentEquip) {
            const atkDiff = (newEquip.atk || 0) - (currentEquip.atk || 0);
            const defDiff = (newEquip.def || 0) - (currentEquip.def || 0);
            const hpDiff = (newEquip.hp || 0) - (currentEquip.hp || 0);
            const critDiff = (newEquip.crit || 0) - (currentEquip.crit || 0);
            
            statsText += '<br><span style="color: #4caf50;">提升: ';
            if (atkDiff > 0) statsText += `攻击+${atkDiff} `;
            if (defDiff > 0) statsText += `防御+${defDiff} `;
            if (hpDiff > 0) statsText += `生命+${hpDiff} `;
            if (critDiff > 0) statsText += `暴击+${critDiff}% `;
            statsText += '</span>';
        }
        
        this.elements.autoEquipItemStats.innerHTML = statsText;
    }
    
    hideAutoEquipTip() {
        this.elements.autoEquipTip.style.display = 'none';
    }
    
    updateAutoEquipCountdown(countdown) {
        this.elements.autoEquipCountdown.textContent = countdown;
    }
    
    updateSaveInfo(message) {
        this.elements.saveInfo.textContent = message;
    }
    
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return Math.floor(num).toString();
    }
    
    updateAll(enemy = null) {
        this.updateStats();
        this.updateResources();
        this.updateMap();
        this.updateEnemy(enemy);
        this.renderSkills();
    }
    
    renderAll() {
        this.renderMaps();
        this.renderEquipment();
        this.renderInventory();
        this.renderSkills();
        this.renderRebirth();
        this.renderQuests();
        this.renderShop();
    }
    
    renderShop(currency = 'gold') {
        this.setupShopCurrencyTabs(currency);
        this.renderShopItems(currency);
        this.updateShopResources();
    }
    
    setupShopCurrencyTabs(activeCurrency) {
        if (!this.elements.shopCurrencyTabs) return;
        
        this.elements.shopCurrencyTabs.innerHTML = `
            <button class="shop-currency-tab ${activeCurrency === 'gold' ? 'active' : ''}" data-currency="gold">
                ${CurrencyIcons.gold} 金币商店
            </button>
            <button class="shop-currency-tab ${activeCurrency === 'diamond' ? 'active' : ''}" data-currency="diamond">
                ${CurrencyIcons.diamond} 钻石商店
            </button>
        `;
        
        this.elements.shopCurrencyTabs.querySelectorAll('.shop-currency-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.renderShop(tab.dataset.currency);
            });
        });
    }
    
    renderShopItems(currency) {
        if (!this.elements.shopItemList) return;
        
        const items = shopSystem.getItems(currency);
        
        this.elements.shopItemList.innerHTML = items.map(item => {
            const canBuy = shopSystem.canPurchase(item.id);
            const remaining = shopSystem.getRemainingLimit(item);
            const costText = shopSystem.getCostText(item);
            const rewardText = shopSystem.getRewardText(item);
            
            let limitText = '';
            if (item.limitType === 'daily') {
                limitText = `<span class="shop-item-limit daily">每日限购 ${remaining}/${item.limitCount}</span>`;
            } else if (item.limitType === 'weekly') {
                limitText = `<span class="shop-item-limit weekly">每周限购 ${remaining}/${item.limitCount}</span>`;
            }
            
            return `
                <div class="shop-item ${!canBuy.canBuy ? 'disabled' : ''}" data-item-id="${item.id}">
                    <div class="shop-item-icon">${item.icon}</div>
                    <div class="shop-item-info">
                        <div class="shop-item-name">${item.name}</div>
                        <div class="shop-item-desc">${item.description}</div>
                        <div class="shop-item-reward">获得: ${rewardText}</div>
                        ${limitText}
                    </div>
                    <div class="shop-item-buy">
                        <div class="shop-item-cost">${costText}</div>
                        <button class="shop-buy-btn" ${!canBuy.canBuy ? 'disabled' : ''}>
                            ${canBuy.canBuy ? '购买' : canBuy.reason}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        this.elements.shopItemList.querySelectorAll('.shop-buy-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemEl = btn.closest('.shop-item');
                const itemId = itemEl.dataset.itemId;
                this.handleShopPurchase(itemId, currency);
            });
        });
    }
    
    handleShopPurchase(itemId, currency) {
        const result = shopSystem.purchase(itemId);
        
        if (result.success) {
            this.showNotification(result.message, 'gain');
            this.addLog(result.message, 'gain');
            this.updateResources();
            this.renderShopItems(currency);
            this.updateShopResources();
        } else {
            this.showNotification(result.message, 'info');
        }
    }
    
    updateShopResources() {
        if (this.elements.shopGoldAmount) {
            this.elements.shopGoldAmount.textContent = this.formatNumber(resourceSystem.get('gold'));
        }
        if (this.elements.shopDiamondAmount) {
            this.elements.shopDiamondAmount.textContent = this.formatNumber(resourceSystem.get('diamond'));
        }
    }
}

const uiSystem = new UISystem();
export { uiSystem };
