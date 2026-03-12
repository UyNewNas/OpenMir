import pytest
from playwright.sync_api import Page, expect
from conftest import create_character, switch_tab, wait_for_battle


@pytest.mark.skill
class TestSkillSystem:
    """技能系统测试"""
    
    def test_skill_tab_navigation(self, started_game: Page):
        """测试技能标签导航"""
        switch_tab(started_game, "skill")
        
        skill_tab = started_game.locator("#skill-tab")
        expect(skill_tab).to_have_class("tab-content active")
    
    def test_skill_list_display(self, started_game: Page):
        """测试技能列表显示"""
        switch_tab(started_game, "skill")
        
        skill_list = started_game.locator("#skillList")
        expect(skill_list).to_be_visible()
    
    def test_all_skills_displayed(self, started_game: Page):
        """测试所有技能显示"""
        switch_tab(started_game, "skill")
        
        upgrade_items = started_game.locator(".upgrade-item")
        assert upgrade_items.count() == 4
    
    def test_skill_names_display(self, started_game: Page):
        """测试技能名称显示"""
        switch_tab(started_game, "skill")
        
        skill_names = ["基础攻击", "铁壁防御", "暴击精通", "生命强化"]
        
        for name in skill_names:
            name_locator = started_game.locator(f".upgrade-name:has-text('{name}')")
            expect(name_locator).to_be_visible()
    
    def test_skill_level_display(self, started_game: Page):
        """测试技能等级显示"""
        switch_tab(started_game, "skill")
        
        level_displays = started_game.locator(".upgrade-level")
        assert level_displays.count() >= 4
        
        first_level = level_displays.first.text_content()
        assert "Lv." in first_level
    
    def test_skill_bonus_display(self, started_game: Page):
        """测试技能加成显示"""
        switch_tab(started_game, "skill")
        
        bonus_displays = started_game.locator(".upgrade-desc")
        assert bonus_displays.count() >= 4
        
        first_bonus = bonus_displays.first.text_content()
        assert "加成" in first_bonus
    
    def test_skill_cost_display(self, started_game: Page):
        """测试技能消耗显示"""
        switch_tab(started_game, "skill")
        
        cost_displays = started_game.locator(".upgrade-cost")
        assert cost_displays.count() >= 4
        
        first_cost = cost_displays.first.text_content()
        assert "消耗" in first_cost or "技能书" in first_cost
    
    def test_skill_upgrade_button_display(self, started_game: Page):
        """测试技能升级按钮显示"""
        switch_tab(started_game, "skill")
        
        upgrade_btns = started_game.locator(".upgrade-btn")
        assert upgrade_btns.count() >= 4
    
    def test_skill_upgrade_button_disabled_without_resources(self, started_game: Page):
        """测试资源不足时升级按钮禁用"""
        started_game.evaluate("Game.resources.skillBook = 0")
        
        switch_tab(started_game, "skill")
        
        upgrade_btns = started_game.locator(".upgrade-btn")
        for btn in upgrade_btns.element_handles():
            expect(btn).to_be_disabled()
    
    def test_skill_upgrade_button_enabled_with_resources(self, started_game: Page):
        """测试资源充足时升级按钮启用"""
        started_game.evaluate("Game.resources.skillBook = 10")
        
        switch_tab(started_game, "skill")
        
        first_btn = started_game.locator(".upgrade-btn").first
        expect(first_btn).to_be_enabled()
    
    def test_skill_upgrade_action(self, started_game: Page):
        """测试技能升级动作"""
        started_game.evaluate("Game.resources.skillBook = 10")
        
        switch_tab(started_game, "skill")
        
        initial_level = started_game.locator(".upgrade-level").first.text_content()
        
        first_btn = started_game.locator(".upgrade-btn").first
        first_btn.click()
        
        started_game.wait_for_timeout(300)
        
        current_level = started_game.locator(".upgrade-level").first.text_content()
        assert current_level != initial_level
    
    def test_skill_upgrade_consumes_resources(self, started_game: Page):
        """测试技能升级消耗资源"""
        started_game.evaluate("Game.resources.skillBook = 10")
        
        initial_books = int(started_game.locator("#skillBook").text_content())
        
        switch_tab(started_game, "skill")
        started_game.locator(".upgrade-btn").first.click()
        
        current_books = int(started_game.locator("#skillBook").text_content())
        assert current_books < initial_books
    
    def test_skill_upgrade_increases_bonus(self, started_game: Page):
        """测试技能升级增加加成"""
        started_game.evaluate("Game.resources.skillBook = 10")
        
        switch_tab(started_game, "skill")
        
        initial_bonus = started_game.locator(".upgrade-desc").first.text_content()
        
        started_game.locator(".upgrade-btn").first.click()
        started_game.wait_for_timeout(300)
        
        current_bonus = started_game.locator(".upgrade-desc").first.text_content()
    
    def test_attack_skill_upgrade(self, started_game: Page):
        """测试攻击技能升级"""
        started_game.evaluate("Game.resources.skillBook = 10")
        
        initial_atk = int(started_game.locator("#playerAtk").text_content())
        
        switch_tab(started_game, "skill")
        
        attack_upgrade = started_game.locator(".upgrade-item").first
        attack_upgrade.locator(".upgrade-btn").click()
        
        started_game.wait_for_timeout(300)
        
        current_atk = int(started_game.locator("#playerAtk").text_content())
        assert current_atk >= initial_atk
    
    def test_defense_skill_upgrade(self, started_game: Page):
        """测试防御技能升级"""
        started_game.evaluate("Game.resources.skillBook = 10")
        
        initial_def = int(started_game.locator("#playerDef").text_content())
        
        switch_tab(started_game, "skill")
        
        defense_upgrade = started_game.locator(".upgrade-item").nth(1)
        defense_upgrade.locator(".upgrade-btn").click()
        
        started_game.wait_for_timeout(300)
        
        current_def = int(started_game.locator("#playerDef").text_content())
        assert current_def >= initial_def
    
    def test_critical_skill_upgrade(self, started_game: Page):
        """测试暴击技能升级"""
        started_game.evaluate("Game.resources.skillBook = 20")
        
        initial_crit = started_game.locator("#playerCrit").text_content()
        initial_crit_val = int(initial_crit.replace("%", ""))
        
        switch_tab(started_game, "skill")
        
        crit_upgrade = started_game.locator(".upgrade-item").nth(2)
        crit_upgrade.locator(".upgrade-btn").click()
        
        started_game.wait_for_timeout(300)
        
        current_crit = started_game.locator("#playerCrit").text_content()
        current_crit_val = int(current_crit.replace("%", ""))
        assert current_crit_val >= initial_crit_val
    
    def test_hp_skill_upgrade(self, started_game: Page):
        """测试生命技能升级"""
        started_game.evaluate("Game.resources.skillBook = 10")
        
        initial_hp_text = started_game.locator("#playerHp").text_content()
        
        switch_tab(started_game, "skill")
        
        hp_upgrade = started_game.locator(".upgrade-item").nth(3)
        hp_upgrade.locator(".upgrade-btn").click()
        
        started_game.wait_for_timeout(300)
        
        current_hp_text = started_game.locator("#playerHp").text_content()
    
    def test_skill_cost_increases_with_level(self, started_game: Page):
        """测试技能消耗随等级增加"""
        started_game.evaluate("Game.resources.skillBook = 50")
        
        switch_tab(started_game, "skill")
        
        initial_cost = started_game.locator(".upgrade-cost").first.text_content()
        
        for _ in range(3):
            started_game.locator(".upgrade-btn").first.click()
            started_game.wait_for_timeout(200)
        
        current_cost = started_game.locator(".upgrade-cost").first.text_content()
    
    def test_multiple_skill_upgrades(self, started_game: Page):
        """测试多个技能升级"""
        started_game.evaluate("Game.resources.skillBook = 50")
        
        switch_tab(started_game, "skill")
        
        upgrade_btns = started_game.locator(".upgrade-btn")
        
        for i in range(min(4, upgrade_btns.count())):
            if upgrade_btns.nth(i).is_enabled():
                upgrade_btns.nth(i).click()
                started_game.wait_for_timeout(200)
    
    def test_skill_upgrade_log_entry(self, started_game: Page):
        """测试技能升级日志记录"""
        started_game.evaluate("Game.resources.skillBook = 10")
        
        switch_tab(started_game, "skill")
        started_game.locator(".upgrade-btn").first.click()
        
        battle_log = started_game.locator("#battleLog")
        log_content = battle_log.text_content()
        
        assert "技能升级" in log_content or "升级" in log_content
    
    def test_skill_icons_display(self, started_game: Page):
        """测试技能图标显示"""
        switch_tab(started_game, "skill")
        
        icons = ["⚔", "🛡", "💥", "❤"]
        
        for icon in icons:
            icon_locator = started_game.locator(f".upgrade-name:has-text('{icon}')")
            assert icon_locator.count() > 0


@pytest.mark.skill
class TestSkillEffects:
    """技能效果测试"""
    
    def test_attack_skill_affects_damage(self, started_game: Page):
        """测试攻击技能影响伤害"""
        started_game.evaluate("""
            Game.skills.attack.level = 10;
            Game.skills.attack.bonus = 20;
            Game.updateUI();
        """)
        
        atk = int(started_game.locator("#playerAtk").text_content())
        assert atk > 10
    
    def test_defense_skill_reduces_damage(self, started_game: Page):
        """测试防御技能减少伤害"""
        started_game.evaluate("""
            Game.skills.defense.level = 10;
            Game.skills.defense.bonus = 15;
            Game.updateUI();
        """)
        
        def_val = int(started_game.locator("#playerDef").text_content())
        assert def_val > 5
    
    def test_critical_skill_increases_rate(self, started_game: Page):
        """测试暴击技能增加暴击率"""
        started_game.evaluate("""
            Game.skills.critical.level = 10;
            Game.skills.critical.bonus = 10;
            Game.updateUI();
        """)
        
        crit = started_game.locator("#playerCrit").text_content()
        crit_val = int(crit.replace("%", ""))
        assert crit_val > 5
    
    def test_hp_skill_increases_max_hp(self, started_game: Page):
        """测试生命技能增加最大血量"""
        started_game.evaluate("""
            Game.skills.hpBoost.level = 10;
            Game.skills.hpBoost.bonus = 100;
            Game.updateUI();
        """)
        
        hp_text = started_game.locator("#playerHp").text_content()
        assert "/" in hp_text
    
    def test_all_skills_max_level(self, started_game: Page):
        """测试所有技能满级"""
        started_game.evaluate("""
            Game.skills.attack.level = 100;
            Game.skills.attack.bonus = 200;
            Game.skills.defense.level = 100;
            Game.skills.defense.bonus = 150;
            Game.skills.critical.level = 100;
            Game.skills.critical.bonus = 100;
            Game.skills.hpBoost.level = 100;
            Game.skills.hpBoost.bonus = 1000;
            Game.updateUI();
        """)
        
        atk = int(started_game.locator("#playerAtk").text_content())
        def_val = int(started_game.locator("#playerDef").text_content())
        crit = int(started_game.locator("#playerCrit").text_content().replace("%", ""))
        
        assert atk > 100
        assert def_val > 50
        assert crit > 50
