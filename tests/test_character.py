import pytest
from playwright.sync_api import Page, expect
from conftest import create_character, GAME_URL


@pytest.mark.character
class TestCharacterCreation:
    """角色创建测试"""
    
    def test_character_create_page_display(self, clean_game_page: Page):
        """测试角色创建页面是否正确显示"""
        expect(clean_game_page.locator("#characterCreate")).to_be_visible()
        expect(clean_game_page.locator(".create-title")).to_contain_text("传奇世界")
        expect(clean_game_page.locator("#playerNameInput")).to_be_visible()
        expect(clean_game_page.locator("#classGrid")).to_be_visible()
        expect(clean_game_page.locator("#startBtn")).to_be_disabled()
        expect(clean_game_page.locator("#loadBtn")).to_be_disabled()
    
    def test_class_selection_warrior(self, clean_game_page: Page):
        """测试选择战士职业"""
        warrior_card = clean_game_page.locator(".class-card[data-class='warrior']")
        warrior_card.click()
        
        expect(warrior_card).to_have_class("class-card selected")
        expect(warrior_card.locator(".class-name")).to_contain_text("战士")
    
    def test_class_selection_mage(self, clean_game_page: Page):
        """测试选择法师职业"""
        mage_card = clean_game_page.locator(".class-card[data-class='mage']")
        mage_card.click()
        
        expect(mage_card).to_have_class("class-card selected")
        expect(mage_card.locator(".class-name")).to_contain_text("法师")
    
    def test_class_selection_taoist(self, clean_game_page: Page):
        """测试选择道士职业"""
        taoist_card = clean_game_page.locator(".class-card[data-class='taoist']")
        taoist_card.click()
        
        expect(taoist_card).to_have_class("class-card selected")
        expect(taoist_card.locator(".class-name")).to_contain_text("道士")
    
    def test_class_selection_assassin(self, clean_game_page: Page):
        """测试选择刺客职业"""
        assassin_card = clean_game_page.locator(".class-card[data-class='assassin']")
        assassin_card.click()
        
        expect(assassin_card).to_have_class("class-card selected")
        expect(assassin_card.locator(".class-name")).to_contain_text("刺客")
    
    def test_class_switching(self, clean_game_page: Page):
        """测试职业切换"""
        warrior_card = clean_game_page.locator(".class-card[data-class='warrior']")
        mage_card = clean_game_page.locator(".class-card[data-class='mage']")
        
        warrior_card.click()
        expect(warrior_card).to_have_class("class-card selected")
        
        mage_card.click()
        expect(mage_card).to_have_class("class-card selected")
        expect(warrior_card).not_to_have_class("class-card selected")
    
    def test_name_input_validation(self, clean_game_page: Page):
        """测试名字输入验证"""
        name_input = clean_game_page.locator("#playerNameInput")
        start_btn = clean_game_page.locator("#startBtn")
        
        warrior_card = clean_game_page.locator(".class-card[data-class='warrior']")
        warrior_card.click()
        
        expect(start_btn).to_be_disabled()
        
        name_input.fill("TestPlayer")
        expect(start_btn).to_be_enabled()
        
        name_input.fill("")
        expect(start_btn).to_be_disabled()
    
    def test_name_max_length(self, clean_game_page: Page):
        """测试名字最大长度限制"""
        name_input = clean_game_page.locator("#playerNameInput")
        
        long_name = "这是一段超过八个字符的名字"
        name_input.fill(long_name)
        
        actual_value = name_input.input_value()
        assert len(actual_value) <= 8
    
    def test_create_warrior_character(self, clean_game_page: Page):
        """测试创建战士角色"""
        create_character(clean_game_page, "战士测试", "warrior")
        
        expect(clean_game_page.locator("#gameContainer")).to_be_visible()
        expect(clean_game_page.locator("#playerName")).to_contain_text("战士测试")
        expect(clean_game_page.locator("#playerAvatar")).to_have_class("player-avatar warrior")
    
    def test_create_mage_character(self, clean_game_page: Page):
        """测试创建法师角色"""
        create_character(clean_game_page, "法师测试", "mage")
        
        expect(clean_game_page.locator("#gameContainer")).to_be_visible()
        expect(clean_game_page.locator("#playerName")).to_contain_text("法师测试")
        expect(clean_game_page.locator("#playerAvatar")).to_have_class("player-avatar mage")
    
    def test_create_taoist_character(self, clean_game_page: Page):
        """测试创建道士角色"""
        create_character(clean_game_page, "道士测试", "taoist")
        
        expect(clean_game_page.locator("#gameContainer")).to_be_visible()
        expect(clean_game_page.locator("#playerName")).to_contain_text("道士测试")
        expect(clean_game_page.locator("#playerAvatar")).to_have_class("player-avatar taoist")
    
    def test_create_assassin_character(self, clean_game_page: Page):
        """测试创建刺客角色"""
        create_character(clean_game_page, "刺客测试", "assassin")
        
        expect(clean_game_page.locator("#gameContainer")).to_be_visible()
        expect(clean_game_page.locator("#playerName")).to_contain_text("刺客测试")
        expect(clean_game_page.locator("#playerAvatar")).to_have_class("player-avatar assassin")
    
    def test_initial_stats_display(self, clean_game_page: Page):
        """测试初始属性显示"""
        create_character(clean_game_page, "属性测试", "warrior")
        
        assert clean_game_page.locator("#playerLevel").text_content() == "1"
        assert "100" in clean_game_page.locator("#playerHp").text_content()
        assert "50" in clean_game_page.locator("#playerMp").text_content()
    
    def test_initial_resources_display(self, clean_game_page: Page):
        """测试初始资源显示"""
        create_character(clean_game_page, "资源测试", "warrior")
        
        assert clean_game_page.locator("#gold").text_content() == "100"
        assert clean_game_page.locator("#diamond").text_content() == "10"
        assert clean_game_page.locator("#forgeStone").text_content() == "5"
        assert clean_game_page.locator("#refineStone").text_content() == "5"
        assert clean_game_page.locator("#skillBook").text_content() == "3"
    
    def test_warrior_class_bonus(self, clean_game_page: Page):
        """测试战士职业加成"""
        create_character(clean_game_page, "战士加成", "warrior")
        
        atk = int(clean_game_page.locator("#playerAtk").text_content())
        def_val = int(clean_game_page.locator("#playerDef").text_content())
        
        assert atk >= 11
        assert def_val >= 5
    
    def test_mage_class_bonus(self, clean_game_page: Page):
        """测试法师职业加成"""
        create_character(clean_game_page, "法师加成", "mage")
        
        crit = clean_game_page.locator("#playerCrit").text_content()
        crit_value = int(crit.replace("%", ""))
        
        assert crit_value >= 5
    
    def test_assassin_class_bonus(self, clean_game_page: Page):
        """测试刺客职业加成"""
        create_character(clean_game_page, "刺客加成", "assassin")
        
        crit = clean_game_page.locator("#playerCrit").text_content()
        crit_value = int(crit.replace("%", ""))
        
        assert crit_value >= 15
    
    def test_game_ui_elements_visible(self, clean_game_page: Page):
        """测试游戏UI元素可见性"""
        create_character(clean_game_page, "UI测试", "warrior")
        
        expect(clean_game_page.locator(".left-panel")).to_be_visible()
        expect(clean_game_page.locator(".center-panel")).to_be_visible()
        expect(clean_game_page.locator(".right-panel")).to_be_visible()
        expect(clean_game_page.locator(".game-map")).to_be_visible()
        expect(clean_game_page.locator(".battle-log")).to_be_visible()
    
    def test_auto_battle_status(self, clean_game_page: Page):
        """测试自动挂机状态"""
        create_character(clean_game_page, "挂机测试", "warrior")
        
        auto_status = clean_game_page.locator("#autoStatus")
        expect(auto_status).to_be_visible()
        expect(auto_status).to_contain_text("自动挂机")
        expect(auto_status).to_have_class("auto-status active")
