import { EventBus, Events } from './core.js';
import { playerSystem } from './player.js';
import { resourceSystem, ResourceNames } from './resource.js';

const QuestTemplates = [
    { type: 'kill', name: '击杀怪物', target: 10, reward: { gold: 100, exp: 200 }, desc: '击杀10只怪物' },
    { type: 'kill', name: '狩猎达人', target: 25, reward: { gold: 300, diamond: 5 }, desc: '击杀25只怪物' },
    { type: 'kill', name: '怪物克星', target: 50, reward: { gold: 500, diamond: 10, forgeStone: 3 }, desc: '击杀50只怪物' },
    { type: 'collect', name: '收集金币', target: 500, reward: { diamond: 5, exp: 300 }, desc: '收集500金币' },
    { type: 'collect', name: '财富积累', target: 1500, reward: { diamond: 10, forgeStone: 3 }, desc: '收集1500金币' },
    { type: 'collect', name: '富翁之路', target: 5000, reward: { diamond: 20, refineStone: 5 }, desc: '收集5000金币' },
    { type: 'level', name: '等级提升', target: 3, reward: { gold: 200, diamond: 5, skillBook: 1 }, desc: '达到等级' },
    { type: 'level', name: '强者之路', target: 5, reward: { gold: 500, diamond: 10, skillBook: 2 }, desc: '达到等级' },
    { type: 'equip', name: '收集装备', target: 5, reward: { gold: 150, forgeStone: 3, refineStone: 2 }, desc: '收集5件装备' },
    { type: 'equip', name: '装备猎人', target: 15, reward: { gold: 400, forgeStone: 5, diamond: 5 }, desc: '收集15件装备' },
    { type: 'equip', name: '装备收藏家', target: 30, reward: { gold: 800, refineStone: 10, diamond: 10 }, desc: '收集30件装备' }
];

class QuestSystem {
    constructor() {
        this.quests = [];
        this.completedCount = 0;
    }
    
    load(quests, completedCount) {
        this.quests = quests || [];
        this.completedCount = completedCount || 0;
    }
    
    getQuests() {
        return [...this.quests];
    }
    
    getCompletedCount() {
        return this.completedCount;
    }
    
    generate() {
        if (this.quests.length >= 3) return;
        
        const playerLevel = playerSystem.player.level;
        
        const availableTemplates = QuestTemplates.filter(template => {
            if (template.type === 'level') {
                const targetLevel = playerLevel + template.target;
                return targetLevel > playerLevel;
            }
            const existingQuest = this.quests.find(q => q.type === template.type && q.target === template.target);
            return !existingQuest;
        });
        
        if (availableTemplates.length === 0) return;
        
        const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
        
        let target = template.target;
        let desc = template.desc;
        if (template.type === 'level') {
            target = playerLevel + template.target;
            desc = `达到等级${target}`;
        }
        
        const quest = {
            id: Date.now(),
            ...template,
            target,
            desc,
            progress: template.type === 'level' ? playerLevel : 0,
            status: 'active'
        };
        
        this.quests.push(quest);
    }
    
    updateProgress(type, amount) {
        this.quests.forEach(quest => {
            if (quest.type === type && quest.status === 'active') {
                if (type === 'level') {
                    quest.progress = playerSystem.player.level;
                } else {
                    quest.progress = Math.min(quest.progress + amount, quest.target);
                }
                
                if (quest.progress >= quest.target) {
                    quest.status = 'completed';
                    this.completeQuest(quest);
                }
            }
        });
    }
    
    completeQuest(quest) {
        Object.entries(quest.reward).forEach(([key, value]) => {
            if (resourceSystem.get(key) !== undefined) {
                resourceSystem.add(key, value);
            } else if (key === 'exp') {
                playerSystem.gainExp(value);
            }
        });
        
        this.completedCount++;
        this.quests = this.quests.filter(q => q.id !== quest.id);
        
        EventBus.emit(Events.QUEST_COMPLETE, { quest });
        
        this.generate();
    }
    
    getRewardText(quest) {
        return Object.entries(quest.reward).map(([key, value]) => {
            const name = ResourceNames[key] || key;
            return `${name}×${value}`;
        }).join(' ');
    }
}

const questSystem = new QuestSystem();
export { questSystem, QuestTemplates };
