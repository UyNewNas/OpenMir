import pytest
from playwright.sync_api import Page, expect
from conftest import create_character, switch_tab, wait_for_battle


@pytest.mark.save
class TestSaveSystem:
    """存档系统测试"""
    
    def test_save_info_display(self, started_game: Page):
        """测试存档信息显示"""
        save_info = started_game.locator("#saveInfo")
        expect(save_info).to_be_visible()
    
    def test_auto_save(self, started_game: Page):
        """测试自动保存"""
        started_game.evaluate("Game.saveGame()")
        
        save_info = started_game.locator("#saveInfo")
        expect(save_info).to_contain_text("保存")
    
    def test_save_to_localstorage(self, started_game: Page):
        """测试保存到localStorage"""
        started_game.evaluate("Game.saveGame()")
        
        save_exists = started_game.evaluate("localStorage.getItem('legend_game_save') !== null")
        assert save_exists
    
    def test_save_player_data(self, started_game: Page):
        """测试保存玩家数据"""
        started_game.evaluate("""
            Game.player.level = 50;
            Game.player.exp = 5000;
            Game.saveGame();
        """)
        
        save_data = started_game.evaluate("JSON.parse(localStorage.getItem('legend_game_save'))")
        
        assert save_data["player"]["level"] == 50
        assert save_data["player"]["exp"] == 5000
    
    def test_save_resources_data(self, started_game: Page):
        """测试保存资源数据"""
        started_game.evaluate("""
            Game.resources.gold = 10000;
            Game.resources.diamond = 100;
            Game.saveGame();
        """)
        
        save_data = started_game.evaluate("JSON.parse(localStorage.getItem('legend_game_save'))")
        
        assert save_data["resources"]["gold"] == 10000
        assert save_data["resources"]["diamond"] == 100
    
    def test_save_equipment_data(self, started_game: Page):
        """测试保存装备数据"""
        started_game.evaluate("""
            Game.equipment.weapon = {
                id: 1,
                name: '测试武器',
                slot: 'weapon',
                atk: 100
            };
            Game.saveGame();
        """)
        
        save_data = started_game.evaluate("JSON.parse(localStorage.getItem('legend_game_save'))")
        
        assert save_data["equipment"]["weapon"]["name"] == "测试武器"
    
    def test_save_inventory_data(self, started_game: Page):
        """测试保存背包数据"""
        started_game.evaluate("""
            Game.inventory = [
                { id: 1, name: '物品1', slot: 'weapon' },
                { id: 2, name: '物品2', slot: 'armor' }
            ];
            Game.saveGame();
        """)
        
        save_data = started_game.evaluate("JSON.parse(localStorage.getItem('legend_game_save'))")
        
        assert len(save_data["inventory"]) == 2
    
    def test_save_current_map(self, started_game: Page):
        """测试保存当前地图"""
        started_game.evaluate("""
            Game.currentMap = 3;
            Game.saveGame();
        """)
        
        save_data = started_game.evaluate("JSON.parse(localStorage.getItem('legend_game_save'))")
        
        assert save_data["currentMap"] == 3
    
    def test_save_skills_data(self, started_game: Page):
        """测试保存技能数据"""
        started_game.evaluate("""
            Game.skills.attack.level = 10;
            Game.skills.attack.bonus = 20;
            Game.saveGame();
        """)
        
        save_data = started_game.evaluate("JSON.parse(localStorage.getItem('legend_game_save'))")
        
        assert save_data["skills"]["attack"]["level"] == 10
    
    def test_save_quests_data(self, started_game: Page):
        """测试保存任务数据"""
        started_game.evaluate("""
            Game.quests = [{
                id: 1,
                type: 'kill',
                name: '测试任务',
                target: 10,
                progress: 5,
                status: 'active'
            }];
            Game.saveGame();
        """)
        
        save_data = started_game.evaluate("JSON.parse(localStorage.getItem('legend_game_save'))")
        
        assert len(save_data["quests"]) == 1
    
    def test_load_game_button_disabled_without_save(self, clean_game_page: Page):
        """测试无存档时读取按钮禁用"""
        clean_game_page.evaluate("localStorage.clear()")
        clean_game_page.reload()
        
        load_btn = clean_game_page.locator("#loadBtn")
        expect(load_btn).to_be_disabled()
    
    def test_load_game_button_enabled_with_save(self, clean_game_page: Page):
        """测试有存档时读取按钮启用"""
        clean_game_page.evaluate("""
            localStorage.setItem('legend_game_save', JSON.stringify({
                player: { name: '测试', class: 'warrior', level: 10 },
                resources: { gold: 1000 },
                skills: {},
                equipment: {},
                inventory: [],
                currentMap: 0,
                quests: []
            }));
        """)
        clean_game_page.reload()
        
        load_btn = clean_game_page.locator("#loadBtn")
        expect(load_btn).to_be_enabled()
    
    def test_load_game_data(self, clean_game_page: Page):
        """测试读取游戏数据"""
        clean_game_page.evaluate("""
            localStorage.setItem('legend_game_save', JSON.stringify({
                player: {
                    name: '存档测试',
                    class: 'mage',
                    level: 50,
                    exp: 10000,
                    expToNext: 20000,
                    hp: 500,
                    maxHp: 500,
                    mp: 250,
                    maxMp: 250,
                    baseAtk: 100,
                    baseDef: 50,
                    baseCrit: 10,
                    rebirthLevel: 2,
                    rebirthBonus: 100
                },
                resources: {
                    gold: 50000,
                    diamond: 500,
                    forgeStone: 100,
                    refineStone: 100,
                    skillBook: 50,
                    rebirthPill: 10
                },
                skills: {
                    attack: { name: '基础攻击', level: 20, icon: '⚔', bonus: 40, cost: { skillBook: 1 }, multiplier: 2 },
                    defense: { name: '铁壁防御', level: 15, icon: '🛡', bonus: 22, cost: { skillBook: 1 }, multiplier: 1.5 },
                    critical: { name: '暴击精通', level: 10, icon: '💥', bonus: 10, cost: { skillBook: 2 }, multiplier: 1 },
                    hpBoost: { name: '生命强化', level: 25, icon: '❤', bonus: 250, cost: { skillBook: 1 }, multiplier: 10 }
                },
                equipment: {
                    weapon: { id: 1, name: '传说武器', slot: 'weapon', atk: 500 },
                    armor: null,
                    helmet: null,
                    boots: null
                },
                inventory: [
                    { id: 2, name: '背包物品', slot: 'armor' }
                ],
                currentMap: 2,
                quests: [],
                completedQuests: 10
            }));
        """)
        clean_game_page.reload()
        
        load_btn = clean_game_page.locator("#loadBtn")
        load_btn.click()
        
        clean_game_page.wait_for_selector("#gameContainer", state="visible", timeout=5000)
        
        expect(clean_game_page.locator("#playerName")).to_contain_text("存档测试")
        assert clean_game_page.locator("#playerLevel").text_content() == "50"
        assert clean_game_page.locator("#gold").text_content() == "50000"
    
    def test_load_preserves_player_class(self, clean_game_page: Page):
        """测试读取保留职业"""
        clean_game_page.evaluate("""
            localStorage.setItem('legend_game_save', JSON.stringify({
                player: {
                    name: '法师测试',
                    class: 'mage',
                    level: 1,
                    exp: 0,
                    expToNext: 100,
                    hp: 100,
                    maxHp: 100,
                    mp: 50,
                    maxMp: 50,
                    baseAtk: 10,
                    baseDef: 5,
                    baseCrit: 5,
                    rebirthLevel: 0,
                    rebirthBonus: 0
                },
                resources: { gold: 100, diamond: 10, forgeStone: 5, refineStone: 5, skillBook: 3, rebirthPill: 0 },
                skills: {
                    attack: { name: '基础攻击', level: 1, icon: '⚔', bonus: 0, cost: { skillBook: 1 }, multiplier: 2 },
                    defense: { name: '铁壁防御', level: 1, icon: '🛡', bonus: 0, cost: { skillBook: 1 }, multiplier: 1.5 },
                    critical: { name: '暴击精通', level: 1, icon: '💥', bonus: 0, cost: { skillBook: 2 }, multiplier: 1 },
                    hpBoost: { name: '生命强化', level: 1, icon: '❤', bonus: 0, cost: { skillBook: 1 }, multiplier: 10 }
                },
                equipment: { weapon: null, armor: null, helmet: null, boots: null },
                inventory: [],
                currentMap: 0,
                quests: [],
                completedQuests: 0
            }));
        """)
        clean_game_page.reload()
        
        clean_game_page.locator("#loadBtn").click()
        clean_game_page.wait_for_selector("#gameContainer", state="visible", timeout=5000)
        
        avatar = clean_game_page.locator("#playerAvatar")
        expect(avatar).to_have_class("player-avatar mage")
    
    def test_load_preserves_equipment(self, clean_game_page: Page):
        """测试读取保留装备"""
        clean_game_page.evaluate("""
            localStorage.setItem('legend_game_save', JSON.stringify({
                player: {
                    name: '装备测试',
                    class: 'warrior',
                    level: 1,
                    exp: 0,
                    expToNext: 100,
                    hp: 100,
                    maxHp: 100,
                    mp: 50,
                    maxMp: 50,
                    baseAtk: 10,
                    baseDef: 5,
                    baseCrit: 5,
                    rebirthLevel: 0,
                    rebirthBonus: 0
                },
                resources: { gold: 100, diamond: 10, forgeStone: 5, refineStone: 5, skillBook: 3, rebirthPill: 0 },
                skills: {
                    attack: { name: '基础攻击', level: 1, icon: '⚔', bonus: 0, cost: { skillBook: 1 }, multiplier: 2 },
                    defense: { name: '铁壁防御', level: 1, icon: '🛡', bonus: 0, cost: { skillBook: 1 }, multiplier: 1.5 },
                    critical: { name: '暴击精通', level: 1, icon: '💥', bonus: 0, cost: { skillBook: 2 }, multiplier: 1 },
                    hpBoost: { name: '生命强化', level: 1, icon: '❤', bonus: 0, cost: { skillBook: 1 }, multiplier: 10 }
                },
                equipment: {
                    weapon: { id: 1, name: '测试武器', slot: 'weapon', slotName: '武器', level: 10, quality: 2, qualityName: 'rare', qualityLabel: '稀有', setName: '新手套装', atk: 50 },
                    armor: null,
                    helmet: null,
                    boots: null
                },
                inventory: [],
                currentMap: 0,
                quests: [],
                completedQuests: 0
            }));
        """)
        clean_game_page.reload()
        
        clean_game_page.locator("#loadBtn").click()
        clean_game_page.wait_for_selector("#gameContainer", state="visible", timeout=5000)
        
        switch_tab(clean_game_page, "equip")
        
        equipped_slot = clean_game_page.locator(".equipment-slot").first
        expect(equipped_slot).not_to_have_class("equipment-slot empty")
        expect(equipped_slot).to_contain_text("测试武器")
    
    def test_clear_save(self, started_game: Page):
        """测试清除存档"""
        started_game.evaluate("Game.saveGame()")
        
        assert started_game.evaluate("localStorage.getItem('legend_game_save') !== null")
        
        started_game.evaluate("localStorage.clear()")
        
        assert started_game.evaluate("localStorage.getItem('legend_game_save') === null")
    
    def test_save_after_battle(self, started_game: Page):
        """测试战斗后保存"""
        wait_for_battle(started_game, 5000)
        
        started_game.evaluate("Game.saveGame()")
        
        save_data = started_game.evaluate("JSON.parse(localStorage.getItem('legend_game_save'))")
        
        assert save_data["player"]["level"] >= 1
    
    def test_save_timestamp(self, started_game: Page):
        """测试保存时间戳"""
        started_game.evaluate("Game.saveGame()")
        
        save_data = started_game.evaluate("JSON.parse(localStorage.getItem('legend_game_save'))")
        
        assert "saveTime" in save_data
        assert save_data["saveTime"] > 0


@pytest.mark.save
class TestRebirthSystem:
    """转生系统测试"""
    
    def test_rebirth_tab_navigation(self, started_game: Page):
        """测试转生标签导航"""
        switch_tab(started_game, "rebirth")
        
        rebirth_tab = started_game.locator("#rebirth-tab")
        expect(rebirth_tab).to_have_class("tab-content active")
    
    def test_rebirth_info_display(self, started_game: Page):
        """测试转生信息显示"""
        switch_tab(started_game, "rebirth")
        
        rebirth_info = started_game.locator("#rebirthInfo")
        expect(rebirth_info).to_be_visible()
    
    def test_rebirth_level_display(self, started_game: Page):
        """测试转生等级显示"""
        switch_tab(started_game, "rebirth")
        
        rebirth_level = started_game.locator(".upgrade-level").first
        expect(rebirth_level).to_contain_text("转")
    
    def test_rebirth_button_disabled_at_low_level(self, started_game: Page):
        """测试低等级时转生按钮禁用"""
        started_game.evaluate("Game.player.level = 50")
        
        switch_tab(started_game, "rebirth")
        
        rebirth_btn = started_game.locator(".upgrade-btn")
        expect(rebirth_btn.first).to_be_disabled()
    
    def test_rebirth_button_disabled_without_pill(self, started_game: Page):
        """测试无转生丹时转生按钮禁用"""
        started_game.evaluate("""
            Game.player.level = 100;
            Game.resources.rebirthPill = 0;
            Game.renderRebirth();
        """)
        
        switch_tab(started_game, "rebirth")
        
        rebirth_btn = started_game.locator(".upgrade-btn").first
        expect(rebirth_btn).to_be_disabled()
    
    def test_rebirth_button_enabled_when_ready(self, started_game: Page):
        """测试满足条件时转生按钮启用"""
        started_game.evaluate("""
            Game.player.level = 100;
            Game.resources.rebirthPill = 1;
            Game.renderRebirth();
        """)
        
        switch_tab(started_game, "rebirth")
        
        rebirth_btn = started_game.locator(".upgrade-btn").first
        expect(rebirth_btn).to_be_enabled()
    
    def test_rebirth_action(self, started_game: Page):
        """测试转生动作"""
        started_game.evaluate("""
            Game.player.level = 100;
            Game.resources.rebirthPill = 1;
        """)
        
        initial_rebirth = started_game.evaluate("Game.player.rebirthLevel")
        
        switch_tab(started_game, "rebirth")
        started_game.locator(".upgrade-btn").first.click()
        
        current_rebirth = started_game.evaluate("Game.player.rebirthLevel")
        assert current_rebirth == initial_rebirth + 1
    
    def test_rebirth_resets_level(self, started_game: Page):
        """测试转生重置等级"""
        started_game.evaluate("""
            Game.player.level = 100;
            Game.resources.rebirthPill = 1;
        """)
        
        switch_tab(started_game, "rebirth")
        started_game.locator(".upgrade-btn").first.click()
        
        level = started_game.locator("#playerLevel").text_content()
        assert level == "1"
    
    def test_rebirth_increases_bonus(self, started_game: Page):
        """测试转生增加属性加成"""
        started_game.evaluate("""
            Game.player.level = 100;
            Game.resources.rebirthPill = 1;
        """)
        
        initial_bonus = started_game.evaluate("Game.player.rebirthBonus")
        
        switch_tab(started_game, "rebirth")
        started_game.locator(".upgrade-btn").first.click()
        
        current_bonus = started_game.evaluate("Game.player.rebirthBonus")
        assert current_bonus > initial_bonus
    
    def test_rebirth_consumes_pill(self, started_game: Page):
        """测试转生消耗转生丹"""
        started_game.evaluate("""
            Game.player.level = 100;
            Game.resources.rebirthPill = 1;
        """)
        
        initial_pills = int(started_game.locator("#rebirthPill").text_content())
        
        switch_tab(started_game, "rebirth")
        started_game.locator(".upgrade-btn").first.click()
        
        current_pills = int(started_game.locator("#rebirthPill").text_content())
        assert current_pills < initial_pills
    
    def test_rebirth_updates_display(self, started_game: Page):
        """测试转生更新显示"""
        started_game.evaluate("""
            Game.player.level = 100;
            Game.player.rebirthLevel = 0;
            Game.resources.rebirthPill = 1;
        """)
        
        switch_tab(started_game, "rebirth")
        started_game.locator(".upgrade-btn").first.click()
        
        rebirth_display = started_game.locator("#rebirthLevel")
        expect(rebirth_display).to_contain_text("1")
    
    def test_rebirth_log_entry(self, started_game: Page):
        """测试转生日志记录"""
        started_game.evaluate("""
            Game.player.level = 100;
            Game.resources.rebirthPill = 1;
        """)
        
        switch_tab(started_game, "rebirth")
        started_game.locator(".upgrade-btn").first.click()
        
        battle_log = started_game.locator("#battleLog")
        log_content = battle_log.text_content()
        
        assert "转生" in log_content
    
    def test_multiple_rebirths(self, started_game: Page):
        """测试多次转生"""
        started_game.evaluate("""
            Game.player.level = 100;
            Game.resources.rebirthPill = 5;
        """)
        
        for i in range(3):
            switch_tab(started_game, "rebirth")
            started_game.locator(".upgrade-btn").first.click()
            started_game.evaluate("Game.player.level = 100")
            started_game.wait_for_timeout(200)
        
        rebirth_level = started_game.evaluate("Game.player.rebirthLevel")
        assert rebirth_level >= 3
    
    def test_rebirth_unlocks_maps(self, started_game: Page):
        """测试转生解锁地图"""
        started_game.evaluate("""
            Game.player.level = 100;
            Game.player.rebirthLevel = 0;
            Game.resources.rebirthPill = 1;
        """)
        
        switch_tab(started_game, "rebirth")
        started_game.locator(".upgrade-btn").first.click()
        
        switch_tab(started_game, "map")
        
        locked_maps = started_game.locator(".map-item.locked")
        locked_count_before = locked_maps.count()
        
        started_game.evaluate("Game.renderMaps()")
        
        locked_count_after = started_game.locator(".map-item.locked").count()
        assert locked_count_after <= locked_count_before
