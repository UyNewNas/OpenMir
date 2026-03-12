import { EventBus, Events } from './core.js';
import { resourceSystem, ResourceNames } from './resource.js';

const CurrencyIcons = {
    gold: '💰',
    diamond: '💎'
};

const CategoryNames = {
    resource: '资源',
    boost: '增益',
    special: '特殊'
};

const ShopItems = {
    gold: [
        {
            id: 'gold_forgeStone_small',
            name: '锻造石x5',
            icon: '🔨',
            category: 'resource',
            description: '用于装备强化的基础材料',
            cost: { gold: 500 },
            reward: { forgeStone: 5 },
            limitType: null,
            limitCount: null
        },
        {
            id: 'gold_forgeStone_medium',
            name: '锻造石x15',
            icon: '🔨',
            category: 'resource',
            description: '用于装备强化的基础材料',
            cost: { gold: 1200 },
            reward: { forgeStone: 15 },
            limitType: null,
            limitCount: null
        },
        {
            id: 'gold_refineStone_small',
            name: '精炼石x5',
            icon: '✨',
            category: 'resource',
            description: '用于装备精炼的高级材料',
            cost: { gold: 800 },
            reward: { refineStone: 5 },
            limitType: null,
            limitCount: null
        },
        {
            id: 'gold_refineStone_medium',
            name: '精炼石x15',
            icon: '✨',
            category: 'resource',
            description: '用于装备精炼的高级材料',
            cost: { gold: 2000 },
            reward: { refineStone: 15 },
            limitType: null,
            limitCount: null
        },
        {
            id: 'gold_skillBook_small',
            name: '技能书x3',
            icon: '📜',
            category: 'resource',
            description: '用于技能升级的珍贵书籍',
            cost: { gold: 1500 },
            reward: { skillBook: 3 },
            limitType: 'daily',
            limitCount: 3
        },
        {
            id: 'gold_skillBook_medium',
            name: '技能书x10',
            icon: '📜',
            category: 'resource',
            description: '用于技能升级的珍贵书籍',
            cost: { gold: 4500 },
            reward: { skillBook: 10 },
            limitType: 'daily',
            limitCount: 2
        },
        {
            id: 'gold_rebirthPill',
            name: '转生丹x1',
            icon: '🔄',
            category: 'special',
            description: '转生必备的神奇丹药',
            cost: { gold: 10000 },
            reward: { rebirthPill: 1 },
            limitType: 'daily',
            limitCount: 2
        },
        {
            id: 'gold_expBoost',
            name: '经验加成卡(1小时)',
            icon: '📈',
            category: 'boost',
            description: '使用后1小时内获得双倍经验',
            cost: { gold: 3000 },
            reward: { expBoost: 1 },
            limitType: 'daily',
            limitCount: 3
        }
    ],
    diamond: [
        {
            id: 'diamond_forgeStone_large',
            name: '锻造石x50',
            icon: '🔨',
            category: 'resource',
            description: '用于装备强化的基础材料',
            cost: { diamond: 5 },
            reward: { forgeStone: 50 },
            limitType: null,
            limitCount: null
        },
        {
            id: 'diamond_refineStone_large',
            name: '精炼石x50',
            icon: '✨',
            category: 'resource',
            description: '用于装备精炼的高级材料',
            cost: { diamond: 8 },
            reward: { refineStone: 50 },
            limitType: null,
            limitCount: null
        },
        {
            id: 'diamond_skillBook_large',
            name: '技能书x30',
            icon: '📜',
            category: 'resource',
            description: '用于技能升级的珍贵书籍',
            cost: { diamond: 10 },
            reward: { skillBook: 30 },
            limitType: 'weekly',
            limitCount: 5
        },
        {
            id: 'diamond_rebirthPill_pack',
            name: '转生丹x5',
            icon: '🔄',
            category: 'special',
            description: '转生必备的神奇丹药',
            cost: { diamond: 15 },
            reward: { rebirthPill: 5 },
            limitType: 'weekly',
            limitCount: 3
        },
        {
            id: 'diamond_gold_pack',
            name: '金币大礼包',
            icon: '💰',
            category: 'resource',
            description: '包含50000金币',
            cost: { diamond: 3 },
            reward: { gold: 50000 },
            limitType: 'daily',
            limitCount: 5
        },
        {
            id: 'diamond_expBoost_long',
            name: '经验加成卡(24小时)',
            icon: '📈',
            category: 'boost',
            description: '使用后24小时内获得双倍经验',
            cost: { diamond: 20 },
            reward: { expBoostLong: 1 },
            limitType: 'weekly',
            limitCount: 2
        },
        {
            id: 'diamond_allResource',
            name: '全能资源包',
            icon: '🎁',
            category: 'special',
            description: '包含各类资源各20个',
            cost: { diamond: 25 },
            reward: { forgeStone: 20, refineStone: 20, skillBook: 20, rebirthPill: 3 },
            limitType: 'weekly',
            limitCount: 2
        }
    ]
};

class ShopSystem {
    constructor() {
        this.purchaseRecords = {};
        this.lastResetDate = this.getTodayString();
    }
    
    init() {
        this.purchaseRecords = {};
        this.lastResetDate = this.getTodayString();
    }
    
    load(data) {
        this.purchaseRecords = data?.records || {};
        this.lastResetDate = data?.lastResetDate || this.getTodayString();
        this.checkAndResetLimits();
    }
    
    getSaveData() {
        return {
            records: this.purchaseRecords,
            lastResetDate: this.lastResetDate
        };
    }
    
    getTodayString() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    
    getWeekString() {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `${now.getFullYear()}-W${weekNumber}`;
    }
    
    checkAndResetLimits() {
        const today = this.getTodayString();
        if (today !== this.lastResetDate) {
            this.resetDailyLimits();
            this.lastResetDate = today;
        }
        this.checkWeeklyReset();
    }
    
    resetDailyLimits() {
        Object.keys(this.purchaseRecords).forEach(itemId => {
            const item = this.findItem(itemId);
            if (item && item.limitType === 'daily') {
                this.purchaseRecords[itemId] = 0;
            }
        });
    }
    
    checkWeeklyReset() {
        const currentWeek = this.getWeekString();
        const savedWeek = localStorage.getItem('shop_week_reset');
        if (savedWeek !== currentWeek) {
            this.resetWeeklyLimits();
            localStorage.setItem('shop_week_reset', currentWeek);
        }
    }
    
    resetWeeklyLimits() {
        Object.keys(this.purchaseRecords).forEach(itemId => {
            const item = this.findItem(itemId);
            if (item && item.limitType === 'weekly') {
                this.purchaseRecords[itemId] = 0;
            }
        });
    }
    
    findItem(itemId) {
        for (const currency of ['gold', 'diamond']) {
            const item = ShopItems[currency].find(i => i.id === itemId);
            if (item) return { ...item, currency };
        }
        return null;
    }
    
    getItems(currency) {
        return ShopItems[currency] || [];
    }
    
    getAllItems() {
        return ShopItems;
    }
    
    getPurchaseCount(itemId) {
        return this.purchaseRecords[itemId] || 0;
    }
    
    getRemainingLimit(item) {
        if (!item.limitType) return -1;
        const purchased = this.getPurchaseCount(item.id);
        return Math.max(0, item.limitCount - purchased);
    }
    
    canPurchase(itemId) {
        const item = this.findItem(itemId);
        if (!item) return { canBuy: false, reason: '商品不存在' };
        
        if (item.limitType) {
            const remaining = this.getRemainingLimit(item);
            if (remaining <= 0) {
                return { canBuy: false, reason: '已达购买上限' };
            }
        }
        
        const currencyKey = Object.keys(item.cost)[0];
        const costAmount = item.cost[currencyKey];
        
        if (!resourceSystem.canAfford(currencyKey, costAmount)) {
            const currencyName = ResourceNames[currencyKey];
            return { canBuy: false, reason: `${currencyName}不足` };
        }
        
        return { canBuy: true };
    }
    
    purchase(itemId) {
        const checkResult = this.canPurchase(itemId);
        if (!checkResult.canBuy) {
            return { success: false, message: checkResult.reason };
        }
        
        const item = this.findItem(itemId);
        if (!item) {
            return { success: false, message: '商品不存在' };
        }
        
        const currencyKey = Object.keys(item.cost)[0];
        const costAmount = item.cost[currencyKey];
        
        if (!resourceSystem.spend(currencyKey, costAmount)) {
            return { success: false, message: '支付失败' };
        }
        
        for (const [key, amount] of Object.entries(item.reward)) {
            if (key === 'expBoost' || key === 'expBoostLong') {
                EventBus.emit(Events.SHOP_BOOST_PURCHASE, { type: key, amount });
            } else {
                resourceSystem.add(key, amount);
            }
        }
        
        this.purchaseRecords[itemId] = (this.purchaseRecords[itemId] || 0) + 1;
        
        EventBus.emit(Events.SHOP_PURCHASE, { item, currency: item.currency });
        
        return { success: true, message: `购买成功：${item.name}` };
    }
    
    getCostText(item) {
        const entries = Object.entries(item.cost);
        return entries.map(([key, amount]) => `${CurrencyIcons[key] || ''}${amount} ${ResourceNames[key]}`).join(' ');
    }
    
    getRewardText(item) {
        const entries = Object.entries(item.reward);
        return entries.map(([key, amount]) => {
            if (key === 'expBoost') return '经验加成(1小时)';
            if (key === 'expBoostLong') return '经验加成(24小时)';
            return `${ResourceNames[key] || key}x${amount}`;
        }).join(' ');
    }
}

const shopSystem = new ShopSystem();
export { shopSystem, ShopItems, CurrencyIcons, CategoryNames };
