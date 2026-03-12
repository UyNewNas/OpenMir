const EventBus = {
    events: {},
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        return () => this.off(event, callback);
    },
    
    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    },
    
    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => callback(data));
    }
};

const Events = {
    PLAYER_LEVEL_UP: 'player:levelUp',
    PLAYER_DEATH: 'player:death',
    PLAYER_REBIRTH: 'player:rebirth',
    
    BATTLE_START: 'battle:start',
    BATTLE_DAMAGE: 'battle:damage',
    BATTLE_ENEMY_DEFEATED: 'battle:enemyDefeated',
    
    EQUIP_GAIN: 'equip:gain',
    EQUIP_EQUIPPED: 'equip:equipped',
    EQUIP_SOLD: 'equip:sold',
    
    RESOURCE_CHANGE: 'resource:change',
    
    QUEST_COMPLETE: 'quest:complete',
    QUEST_PROGRESS: 'quest:progress',
    
    MAP_CHANGE: 'map:change',
    
    SKILL_UPGRADE: 'skill:upgrade',
    SKILL_USE: 'skill:use',
    ACTIVE_SKILL_USE: 'activeSkill:use',
    
    SHOP_PURCHASE: 'shop:purchase',
    SHOP_BOOST_PURCHASE: 'shop:boostPurchase',
    
    SAVE_GAME: 'save:game',
    LOAD_GAME: 'load:game',
    
    UI_UPDATE: 'ui:update',
    LOG_ADD: 'log:add',
    NOTIFICATION_SHOW: 'notification:show'
};

export { EventBus, Events };
