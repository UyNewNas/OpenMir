import { EventBus, Events } from './core.js';

const Maps = [
    { id: 1, name: '新手村', reqLevel: 1, reqRebirth: 0, monsters: ['史莱姆', '小蝙蝠'], expRate: 1, goldRate: 1, icon: '🏠', equipLevel: 5 },
    { id: 2, name: '森林小径', reqLevel: 10, reqRebirth: 0, monsters: ['森林狼', '野猪'], expRate: 1.5, goldRate: 1.5, icon: '🌲', equipLevel: 10 },
    { id: 3, name: '矿洞入口', reqLevel: 20, reqRebirth: 0, monsters: ['矿洞蝙蝠', '石巨人'], expRate: 2, goldRate: 2, icon: '⛰', equipLevel: 15 },
    { id: 4, name: '幽暗森林', reqLevel: 30, reqRebirth: 0, monsters: ['暗影狼', '毒蜘蛛'], expRate: 2.5, goldRate: 2.5, icon: '🌳', equipLevel: 20 },
    { id: 5, name: '古墓入口', reqLevel: 40, reqRebirth: 0, monsters: ['骷髅兵', '僵尸'], expRate: 3, goldRate: 3, icon: '🏛', equipLevel: 25 },
    { id: 6, name: '恶魔洞穴', reqLevel: 50, reqRebirth: 0, monsters: ['恶魔', '地狱犬'], expRate: 4, goldRate: 4, icon: '🕳', equipLevel: 30 },
    { id: 7, name: '龙之谷', reqLevel: 60, reqRebirth: 0, monsters: ['幼龙', '龙人'], expRate: 5, goldRate: 5, icon: '🐉', equipLevel: 35 },
    { id: 8, name: '魔王城', reqLevel: 80, reqRebirth: 0, monsters: ['魔将军', '暗黑骑士'], expRate: 7, goldRate: 7, icon: '🏰', equipLevel: 40 },
    { id: 9, name: '深渊', reqLevel: 100, reqRebirth: 1, monsters: ['深渊领主', '虚空行者'], expRate: 10, goldRate: 10, icon: '🌑', equipLevel: 45 },
    { id: 10, name: '神域', reqLevel: 120, reqRebirth: 2, monsters: ['天使', '神兽'], expRate: 15, goldRate: 15, icon: '✨', equipLevel: 50 }
];

const MonsterSprites = {
    '史莱姆': '🟢', '小蝙蝠': '🦇', '森林狼': '🐺', '野猪': '🐗',
    '矿洞蝙蝠': '🦇', '石巨人': '🗿', '暗影狼': '🐺', '毒蜘蛛': '🕷',
    '骷髅兵': '💀', '僵尸': '🧟', '恶魔': '👹', '地狱犬': '🐕',
    '幼龙': '🐲', '龙人': '🧌', '魔将军': '👿', '暗黑骑士': '🗡',
    '深渊领主': '👁', '虚空行者': '🌀', '天使': '👼', '神兽': '🦄'
};

class MapSystem {
    constructor() {
        this.maps = Maps;
        this.currentMapIndex = 0;
    }
    
    load(index) {
        this.currentMapIndex = index || 0;
    }
    
    getAll() {
        return this.maps;
    }
    
    getCurrent() {
        return this.maps[this.currentMapIndex];
    }
    
    getCurrentIndex() {
        return this.currentMapIndex;
    }
    
    canEnter(mapIndex, playerLevel, rebirthLevel) {
        const map = this.maps[mapIndex];
        return playerLevel >= map.reqLevel && rebirthLevel >= map.reqRebirth;
    }
    
    changeMap(mapIndex) {
        if (mapIndex >= 0 && mapIndex < this.maps.length) {
            this.currentMapIndex = mapIndex;
            EventBus.emit(Events.MAP_CHANGE, { map: this.maps[mapIndex] });
            return true;
        }
        return false;
    }
    
    getMonsterSprite(name) {
        return MonsterSprites[name] || '👹';
    }
    
    spawnEnemy(rebirthLevel) {
        const map = this.getCurrent();
        const monsterName = map.monsters[Math.floor(Math.random() * map.monsters.length)];
        const baseHp = 50 + (map.id * 30) + (rebirthLevel * 100);
        
        return {
            name: monsterName,
            hp: baseHp,
            maxHp: baseHp,
            atk: 5 + (map.id * 5) + (rebirthLevel * 20),
            exp: Math.floor(20 * map.expRate),
            gold: Math.floor(10 * map.goldRate),
            sprite: this.getMonsterSprite(monsterName),
            mapData: map
        };
    }
    
    autoNavigate(playerLevel, rebirthLevel) {
        const map = this.getCurrent();
        if (playerLevel >= map.reqLevel + 10 && rebirthLevel >= map.reqRebirth) {
            if (this.currentMapIndex < this.maps.length - 1) {
                const nextMap = this.maps[this.currentMapIndex + 1];
                if (playerLevel >= nextMap.reqLevel && rebirthLevel >= nextMap.reqRebirth) {
                    this.changeMap(this.currentMapIndex + 1);
                    return true;
                }
            }
        }
        return false;
    }
}

const mapSystem = new MapSystem();
export { mapSystem, Maps, MonsterSprites };
