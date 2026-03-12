import pytest
from playwright.sync_api import Page, expect
from conftest import create_character, wait_for_battle


@pytest.mark.smoke
class TestSmoke:
    """冒烟测试 - 快速验证核心功能"""
    
    def test_game_loads_successfully(self, clean_game_page: Page):
        """测试游戏成功加载"""
        expect(clean_game_page.locator("#characterCreate")).to_be_visible()
        expect(clean_game_page).to_have_title("传奇世界 - 自动挂机版")
    
    def test_character_creation_flow(self, clean_game_page: Page):
        """测试角色创建流程"""
        create_character(clean_game_page, "冒烟测试", "warrior")
        
        expect(clean_game_page.locator("#gameContainer")).to_be_visible()
        expect(clean_game_page.locator("#playerName")).to_contain_text("冒烟测试")
    
    def test_battle_starts_automatically(self, started_game: Page):
        """测试战斗自动开始"""
        started_game.wait_for_timeout(2000)
        
        expect(started_game.locator("#enemyInfo")).to_be_visible()
        expect(started_game.locator("#autoStatus")).to_contain_text("自动挂机")
    
    def test_ui_panels_visible(self, started_game: Page):
        """测试UI面板可见"""
        expect(started_game.locator(".left-panel")).to_be_visible()
        expect(started_game.locator(".center-panel")).to_be_visible()
        expect(started_game.locator(".right-panel")).to_be_visible()
    
    def test_tabs_navigation(self, started_game: Page):
        """测试标签导航"""
        tabs = ["quest", "map", "equip", "bag", "skill", "rebirth"]
        
        for tab in tabs:
            tab_btn = started_game.locator(f".tab-btn[data-tab='{tab}']")
            tab_btn.click()
            started_game.wait_for_timeout(100)
            
            tab_content = started_game.locator(f"#{tab}-tab")
            expect(tab_content).to_have_class("tab-content active")
    
    def test_player_stats_display(self, started_game: Page):
        """测试玩家属性显示"""
        assert started_game.locator("#playerLevel").text_content() == "1"
        assert started_game.locator("#playerAtk").text_content() != ""
        assert started_game.locator("#playerDef").text_content() != ""
    
    def test_resources_display(self, started_game: Page):
        """测试资源显示"""
        assert started_game.locator("#gold").text_content() == "100"
        assert started_game.locator("#diamond").text_content() == "10"
    
    def test_save_and_load(self, started_game: Page):
        """测试保存和加载"""
        started_game.evaluate("Game.saveGame()")
        
        save_exists = started_game.evaluate("localStorage.getItem('legend_game_save') !== null")
        assert save_exists
    
    def test_battle_generates_log(self, started_game: Page):
        """测试战斗生成日志"""
        wait_for_battle(started_game, 3000)
        
        battle_log = started_game.locator("#battleLog")
        log_entries = battle_log.locator(".log-entry")
        
        assert log_entries.count() > 1
    
    def test_gold_increases_after_battle(self, started_game: Page):
        """测试战斗后金币增加"""
        initial_gold = int(started_game.locator("#gold").text_content())
        
        wait_for_battle(started_game, 5000)
        
        current_gold = int(started_game.locator("#gold").text_content())
        assert current_gold > initial_gold


@pytest.mark.smoke
class TestCriticalPaths:
    """关键路径测试"""
    
    def test_full_gameplay_loop(self, clean_game_page: Page):
        """测试完整游戏循环"""
        create_character(clean_game_page, "完整测试", "warrior")
        
        wait_for_battle(clean_game_page, 5000)
        
        expect(clean_game_page.locator("#enemyInfo")).to_be_visible()
        
        initial_gold = int(clean_game_page.locator("#gold").text_content())
        wait_for_battle(clean_game_page, 5000)
        current_gold = int(clean_game_page.locator("#gold").text_content())
        assert current_gold > initial_gold
        
        clean_game_page.evaluate("Game.saveGame()")
        save_exists = clean_game_page.evaluate("localStorage.getItem('legend_game_save') !== null")
        assert save_exists
    
    def test_all_classes_creation(self, clean_game_page: Page):
        """测试所有职业创建"""
        classes = ["warrior", "mage", "taoist", "assassin"]
        
        for char_class in classes:
            clean_game_page.evaluate("localStorage.clear()")
            clean_game_page.reload()
            
            create_character(clean_game_page, f"{char_class}测试", char_class)
            
            avatar = clean_game_page.locator("#playerAvatar")
            expect(avatar).to_have_class(f"player-avatar {char_class}")
            
            clean_game_page.evaluate("localStorage.clear()")
    
    def test_skill_upgrade_flow(self, started_game: Page):
        """测试技能升级流程"""
        started_game.evaluate("Game.resources.skillBook = 10")
        
        skill_tab = started_game.locator(".tab-btn[data-tab='skill']")
        skill_tab.click()
        
        first_upgrade_btn = started_game.locator(".upgrade-btn").first
        first_upgrade_btn.click()
        
        started_game.wait_for_timeout(300)
        
        level_display = started_game.locator(".upgrade-level").first
        assert "Lv.2" in level_display.text_content()
    
    def test_equipment_equip_flow(self, started_game: Page):
        """测试装备穿戴流程"""
        started_game.evaluate("""
            const equip = {
                id: Date.now(),
                name: '测试武器',
                slot: 'weapon',
                slotName: '武器',
                level: 5,
                quality: 1,
                qualityName: 'uncommon',
                qualityLabel: '优秀',
                setName: '新手套装',
                atk: 15
            };
            Game.inventory.push(equip);
            Game.renderInventory();
        """)
        
        bag_tab = started_game.locator(".tab-btn[data-tab='bag']")
        bag_tab.click()
        
        inventory_slot = started_game.locator(".inventory-slot").first
        inventory_slot.click()
        
        equip_btn = started_game.locator("#equipBtn")
        equip_btn.click()
        
        equip_tab = started_game.locator(".tab-btn[data-tab='equip']")
        equip_tab.click()
        
        equipped_slot = started_game.locator(".equipment-slot").first
        expect(equipped_slot).to_contain_text("测试武器")
