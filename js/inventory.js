import { EventBus, Events } from './core.js';
import { equipmentSystem, QualityNames, QualityLabels, SlotIcons } from './equipment.js';
import { playerSystem } from './player.js';

const BASE_BAG_SIZE = 100;
const BAG_SIZE_PER_100_LEVEL = 100;

class InventorySystem {
    constructor() {
        this.items = [];
        this.selectedItem = null;
        this.autoRecycle = {
            enabled: false,
            maxLevel: 0,
            maxQuality: -1,
            totalRecycled: 0,
            totalGoldEarned: 0
        };
    }
    
    getMaxBagSize() {
        const level = playerSystem.player ? playerSystem.player.level : 1;
        return BASE_BAG_SIZE + Math.floor(level / 100) * BAG_SIZE_PER_100_LEVEL;
    }
    
    load(data, autoRecycleData) {
        this.items = data || [];
        this.autoRecycle = autoRecycleData || {
            enabled: false,
            maxLevel: 0,
            maxQuality: -1,
            totalRecycled: 0,
            totalGoldEarned: 0
        };
    }
    
    getItems() {
        return [...this.items];
    }
    
    getCount() {
        return this.items.length;
    }
    
    isFull() {
        return this.items.length >= this.getMaxBagSize();
    }
    
    addItem(item) {
        if (this.isFull()) {
            return false;
        }
        this.items.push(item);
        EventBus.emit(Events.EQUIP_GAIN, { item });
        return true;
    }
    
    removeItem(itemId) {
        const index = this.items.findIndex(i => i.id === itemId);
        if (index !== -1) {
            const removed = this.items.splice(index, 1)[0];
            return removed;
        }
        return null;
    }
    
    getItem(itemId) {
        return this.items.find(i => i.id === itemId);
    }
    
    getItemsBySlot(slot) {
        return this.items.filter(item => item.slot === slot);
    }
    
    getSortedItemsBySlot(slot) {
        const items = this.getItemsBySlot(slot);
        return items.sort((a, b) => equipmentSystem.calculateScore(b) - equipmentSystem.calculateScore(a));
    }
    
    selectItem(item) {
        this.selectedItem = item;
    }
    
    getSelectedItem() {
        return this.selectedItem;
    }
    
    clearSelection() {
        this.selectedItem = null;
    }
    
    toggleAutoRecycle() {
        this.autoRecycle.enabled = !this.autoRecycle.enabled;
    }
    
    setRecycleSettings(maxLevel, maxQuality) {
        this.autoRecycle.maxLevel = maxLevel;
        this.autoRecycle.maxQuality = maxQuality;
    }
    
    performAutoRecycle() {
        if (!this.autoRecycle.enabled) return { count: 0, gold: 0 };
        if (this.autoRecycle.maxLevel <= 0 || this.autoRecycle.maxQuality < 0) return { count: 0, gold: 0 };
        
        const toRecycle = this.items.filter(item => 
            item.level <= this.autoRecycle.maxLevel && 
            item.quality <= this.autoRecycle.maxQuality
        );
        
        if (toRecycle.length === 0) return { count: 0, gold: 0 };
        
        let totalGold = 0;
        toRecycle.forEach(item => {
            const price = equipmentSystem.getSellPrice(item);
            totalGold += price;
            this.removeItem(item.id);
        });
        
        this.autoRecycle.totalRecycled += toRecycle.length;
        this.autoRecycle.totalGoldEarned += totalGold;
        
        return { count: toRecycle.length, gold: totalGold };
    }
    
    getRecycleStats() {
        return {
            totalRecycled: this.autoRecycle.totalRecycled,
            totalGoldEarned: this.autoRecycle.totalGoldEarned
        };
    }
}

const inventorySystem = new InventorySystem();
export { inventorySystem, BASE_BAG_SIZE, BAG_SIZE_PER_100_LEVEL };
