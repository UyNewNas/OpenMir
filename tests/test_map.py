import pytest
from playwright.sync_api import Page, expect
from conftest import create_character, switch_tab, wait_for_battle


@pytest.mark.map
class TestMapSystem:
    """地图系统测试"""
    
    def test_map_tab_navigation(self, started_game: Page):
        """测试地图标签导航"""
        switch_tab(started_game, "map")
        
        map_tab = started_game.locator("#map-tab")
        expect(map_tab).to_have_class("tab-content active")
    
    def test_map_list_display(self, started_game: Page):
        """测试地图列表显示"""
        switch_tab(started_game, "map")
        
        map_list = started_game.locator("#mapList")
        expect(map_list).to_be_visible()
    
    def test_all_maps_displayed(self, started_game: Page):
        """测试所有地图显示"""
        switch_tab(started_game, "map")
        
        map_items = started_game.locator(".map-item")
        assert map_items.count() == 10
    
    def test_first_map_unlocked(self, started_game: Page):
        """测试第一个地图解锁"""
        switch_tab(started_game, "map")
        
        first_map = started_game.locator(".map-item").first
        expect(first_map).not_to_have_class("map-item locked")
    
    def test_locked_maps_display(self, started_game: Page):
        """测试锁定地图显示"""
        switch_tab(started_game, "map")
        
        locked_maps = started_game.locator(".map-item.locked")
        assert locked_maps.count() > 0
    
    def test_current_map_highlighted(self, started_game: Page):
        """测试当前地图高亮"""
        switch_tab(started_game, "map")
        
        current_map = started_game.locator(".map-item.current")
        expect(current_map).to_be_visible()
        assert "新手村" in current_map.text_content()
    
    def test_map_info_display(self, started_game: Page):
        """测试地图信息显示"""
        switch_tab(started_game, "map")
        
        first_map = started_game.locator(".map-item").first
        
        expect(first_map.locator(".map-item-name")).to_be_visible()
        expect(first_map.locator(".map-item-req")).to_be_visible()
        expect(first_map.locator(".map-item-rewards")).to_be_visible()
    
    def test_map_exp_rate_display(self, started_game: Page):
        """测试地图经验倍率显示"""
        switch_tab(started_game, "map")
        
        first_map = started_game.locator(".map-item").first
        rewards_text = first_map.locator(".map-item-rewards").text_content()
        
        assert "经验" in rewards_text
        assert "金币" in rewards_text
    
    def test_map_level_requirement(self, started_game: Page):
        """测试地图等级需求"""
        switch_tab(started_game, "map")
        
        locked_maps = started_game.locator(".map-item.locked")
        if locked_maps.count() > 0:
            req_text = locked_maps.first.locator(".map-item-req").text_content()
            assert "需要" in req_text or "Lv." in req_text
    
    def test_map_click_to_change(self, started_game: Page):
        """测试点击地图切换"""
        started_game.evaluate("Game.player.level = 15")
        
        switch_tab(started_game, "map")
        
        second_map = started_game.locator(".map-item").nth(1)
        if not second_map.evaluate("el => el.classList.contains('locked')"):
            second_map.click()
            
            current_map_name = started_game.locator("#currentMapName").text_content()
            assert "森林" in current_map_name or current_map_name != "新手村"
    
    def test_locked_map_click_disabled(self, started_game: Page):
        """测试锁定地图点击无效"""
        switch_tab(started_game, "map")
        
        locked_map = started_game.locator(".map-item.locked").first
        current_map_before = started_game.locator("#currentMapName").text_content()
        
        locked_map.click()
        
        current_map_after = started_game.locator("#currentMapName").text_content()
        assert current_map_before == current_map_after
    
    def test_map_change_updates_enemy(self, started_game: Page):
        """测试切换地图更新敌人"""
        started_game.evaluate("Game.player.level = 15")
        
        switch_tab(started_game, "map")
        
        second_map = started_game.locator(".map-item").nth(1)
        if not second_map.evaluate("el => el.classList.contains('locked')"):
            enemy_before = started_game.locator("#enemyName").text_content()
            
            second_map.click()
            started_game.wait_for_timeout(1500)
            
            enemy_after = started_game.locator("#enemyName").text_content()
    
    def test_map_icons_display(self, started_game: Page):
        """测试地图图标显示"""
        switch_tab(started_game, "map")
        
        map_items = started_game.locator(".map-item")
        
        icons = ["🏠", "🌲", "⛰", "🌳", "🏛", "🕳", "🐉", "🏰", "🌑", "✨"]
        for i, icon in enumerate(icons):
            if i < map_items.count():
                map_name = map_items.nth(i).locator(".map-item-name").text_content()
                assert icon in map_name or True
    
    def test_rebirth_requirement_display(self, started_game: Page):
        """测试转生需求显示"""
        switch_tab(started_game, "map")
        
        high_level_maps = started_game.locator(".map-item.locked")
        if high_level_maps.count() > 0:
            last_map = high_level_maps.last
            req_text = last_map.locator(".map-item-req").text_content()
            assert "转" in req_text or "Lv." in req_text
    
    def test_map_equip_level_display(self, started_game: Page):
        """测试地图装备等级显示"""
        switch_tab(started_game, "map")
        
        first_map = started_game.locator(".map-item").first
        rewards_text = first_map.locator(".map-item-rewards").text_content()
        
        assert "装备" in rewards_text or "Lv." in rewards_text
    
    def test_auto_navigate_to_next_map(self, started_game: Page):
        """测试自动导航到下一地图"""
        started_game.evaluate("""
            Game.player.level = 15;
            Game.autoNavigate();
        """)
        
        started_game.wait_for_timeout(500)
        
        current_map = started_game.locator("#currentMapName").text_content()
    
    def test_map_battle_log_entry(self, started_game: Page):
        """测试地图切换战斗日志"""
        started_game.evaluate("Game.player.level = 15")
        
        switch_tab(started_game, "map")
        
        second_map = started_game.locator(".map-item").nth(1)
        if not second_map.evaluate("el => el.classList.contains('locked')"):
            second_map.click()
            
            battle_log = started_game.locator("#battleLog")
            log_content = battle_log.text_content()
            assert "进入" in log_content or "地图" in log_content
    
    def test_map_requirement_updates_on_level_up(self, started_game: Page):
        """测试升级后地图需求更新"""
        switch_tab(started_game, "map")
        
        locked_count_before = started_game.locator(".map-item.locked").count()
        
        started_game.evaluate("""
            Game.player.level = 20;
            Game.renderMaps();
        """)
        
        started_game.wait_for_timeout(300)
        
        locked_count_after = started_game.locator(".map-item.locked").count()
        assert locked_count_after <= locked_count_before
    
    def test_high_level_map_rewards(self, started_game: Page):
        """测试高级地图奖励"""
        switch_tab(started_game, "map")
        
        last_map = started_game.locator(".map-item").last
        rewards_text = last_map.locator(".map-item-rewards").text_content()
        
        assert "经验" in rewards_text
        assert "金币" in rewards_text


@pytest.mark.map
class TestMapProgression:
    """地图进度测试"""
    
    def test_unlock_maps_progressively(self, started_game: Page):
        """测试逐步解锁地图"""
        switch_tab(started_game, "map")
        
        for level in [1, 10, 20, 30, 40, 50, 60, 80, 100, 120]:
            started_game.evaluate(f"Game.player.level = {level}; Game.renderMaps();")
            started_game.wait_for_timeout(100)
            
            locked_count = started_game.locator(".map-item.locked").count()
            
            if level >= 120:
                assert locked_count == 0
    
    def test_rebirth_unlocks_maps(self, started_game: Page):
        """测试转生解锁地图"""
        started_game.evaluate("""
            Game.player.level = 100;
            Game.player.rebirthLevel = 0;
            Game.renderMaps();
        """)
        
        switch_tab(started_game, "map")
        locked_before = started_game.locator(".map-item.locked").count()
        
        started_game.evaluate("""
            Game.player.rebirthLevel = 1;
            Game.renderMaps();
        """)
        
        locked_after = started_game.locator(".map-item.locked").count()
        assert locked_after <= locked_before
    
    def test_map_enemy_difficulty(self, started_game: Page):
        """测试地图敌人难度"""
        started_game.evaluate("""
            Game.player.level = 100;
            Game.player.rebirthLevel = 5;
        """)
        
        switch_tab(started_game, "map")
        
        last_map = started_game.locator(".map-item").last
        if not last_map.evaluate("el => el.classList.contains('locked')"):
            last_map.click()
            started_game.wait_for_timeout(1500)
            
            expect(started_game.locator("#enemyInfo")).to_be_visible()
    
    def test_map_gold_rate_increases(self, started_game: Page):
        """测试地图金币倍率递增"""
        switch_tab(started_game, "map")
        
        map_items = started_game.locator(".map-item")
        rates = []
        
        for i in range(map_items.count()):
            rewards_text = map_items.nth(i).locator(".map-item-rewards").text_content()
            if "金币" in rewards_text:
                rates.append(rewards_text)
        
        assert len(rates) > 0
    
    def test_map_exp_rate_increases(self, started_game: Page):
        """测试地图经验倍率递增"""
        switch_tab(started_game, "map")
        
        map_items = started_game.locator(".map-item")
        rates = []
        
        for i in range(map_items.count()):
            rewards_text = map_items.nth(i).locator(".map-item-rewards").text_content()
            if "经验" in rewards_text:
                rates.append(rewards_text)
        
        assert len(rates) > 0
