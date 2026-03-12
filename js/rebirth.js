import { EventBus, Events } from './core.js';
import { playerSystem } from './player.js';
import { resourceSystem } from './resource.js';

class RebirthSystem {
    canRebirth() {
        return playerSystem.canRebirth() && resourceSystem.canAfford('rebirthPill', 1);
    }
    
    rebirth() {
        if (!this.canRebirth()) return false;
        
        resourceSystem.spend('rebirthPill', 1);
        playerSystem.rebirth();
        
        EventBus.emit(Events.PLAYER_REBIRTH, { 
            rebirthLevel: playerSystem.player.rebirthLevel 
        });
        
        return true;
    }
    
    getNextBonus() {
        return playerSystem.player.rebirthBonus + 50;
    }
    
    getCurrentBonus() {
        return playerSystem.player.rebirthBonus;
    }
    
    getRebirthLevel() {
        return playerSystem.player.rebirthLevel;
    }
}

const rebirthSystem = new RebirthSystem();
export { rebirthSystem };
