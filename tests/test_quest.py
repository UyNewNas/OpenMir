import pytest
from playwright.sync_api import Page, expect
from conftest import create_character, switch_tab, wait_for_battle


@pytest.mark.quest
class TestQuestSystem:
    """任务系统测试"""
    
    def test_quest_tab_navigation(self, started_game: Page):
        """测试任务标签导航"""
        switch_tab(started_game, "quest")
        
        quest_tab = started_game.locator("#quest-tab")
        expect(quest_tab).to_have_class("tab-content active")
    
    def test_quest_list_display(self, started_game: Page):
        """测试任务列表显示"""
        switch_tab(started_game, "quest")
        
        quest_list = started_game.locator("#questList")
        expect(quest_list).to_be_visible()
    
    def test_quest_generation(self, started_game: Page):
        """测试任务生成"""
        started_game.evaluate("Game.generateQuests()")
        
        switch_tab(started_game, "quest")
        
        quest_items = started_game.locator(".quest-item")
        assert quest_items.count() > 0
    
    def test_quest_name_display(self, started_game: Page):
        """测试任务名称显示"""
        started_game.evaluate("Game.generateQuests()")
        
        switch_tab(started_game, "quest")
        
        quest_name = started_game.locator(".quest-name").first
        expect(quest_name).to_be_visible()
        assert quest_name.text_content() != ""
    
    def test_quest_description_display(self, started_game: Page):
        """测试任务描述显示"""
        started_game.evaluate("Game.generateQuests()")
        
        switch_tab(started_game, "quest")
        
        quest_desc = started_game.locator(".quest-desc").first
        expect(quest_desc).to_be_visible()
        assert "目标" in quest_desc.text_content()
    
    def test_quest_progress_display(self, started_game: Page):
        """测试任务进度显示"""
        started_game.evaluate("Game.generateQuests()")
        
        switch_tab(started_game, "quest")
        
        quest_progress = started_game.locator(".quest-progress").first
        expect(quest_progress).to_be_visible()
        assert "进度" in quest_progress.text_content()
    
    def test_quest_status_display(self, started_game: Page):
        """测试任务状态显示"""
        started_game.evaluate("Game.generateQuests()")
        
        switch_tab(started_game, "quest")
        
        quest_status = started_game.locator(".quest-status").first
        expect(quest_status).to_be_visible()
        assert "进行中" in quest_status.text_content() or "已完成" in quest_status.text_content()
    
    def test_quest_status_active_style(self, started_game: Page):
        """测试进行中任务样式"""
        started_game.evaluate("""
            Game.quests = [];
            Game.generateQuests();
        """)
        
        switch_tab(started_game, "quest")
        
        active_status = started_game.locator(".quest-status.active")
        expect(active_status.first).to_be_visible()
    
    def test_kill_quest_progress(self, started_game: Page):
        """测试击杀任务进度"""
        started_game.evaluate("""
            Game.quests = [{
                id: 1,
                type: 'kill',
                name: '击杀怪物',
                target: 10,
                progress: 0,
                status: 'active',
                reward: { gold: 50 }
            }];
            Game.renderQuests();
        """)
        
        switch_tab(started_game, "quest")
        
        initial_progress = started_game.locator(".quest-progress").first.text_content()
        
        started_game.evaluate("Game.updateQuestProgress('kill', 1)")
        
        started_game.wait_for_timeout(200)
        
        current_progress = started_game.locator(".quest-progress").first.text_content()
    
    def test_collect_quest_progress(self, started_game: Page):
        """测试收集任务进度"""
        started_game.evaluate("""
            Game.quests = [{
                id: 1,
                type: 'collect',
                name: '收集金币',
                target: 500,
                progress: 0,
                status: 'active',
                reward: { diamond: 5 }
            }];
            Game.renderQuests();
        """)
        
        switch_tab(started_game, "quest")
        
        started_game.evaluate("Game.updateQuestProgress('collect', 100)")
        
        started_game.wait_for_timeout(200)
        
        progress_text = started_game.locator(".quest-progress").first.text_content()
        assert "100" in progress_text
    
    def test_level_quest_progress(self, started_game: Page):
        """测试等级任务进度"""
        started_game.evaluate("""
            Game.quests = [{
                id: 1,
                type: 'level',
                name: '达到等级',
                target: 10,
                progress: 1,
                status: 'active',
                reward: { gold: 200 }
            }];
            Game.renderQuests();
        """)
        
        switch_tab(started_game, "quest")
        
        progress_text = started_game.locator(".quest-progress").first.text_content()
        assert "1" in progress_text
    
    def test_quest_completion(self, started_game: Page):
        """测试任务完成"""
        started_game.evaluate("""
            Game.quests = [{
                id: 1,
                type: 'kill',
                name: '击杀怪物',
                target: 5,
                progress: 4,
                status: 'active',
                reward: { gold: 50 }
            }];
            Game.renderQuests();
        """)
        
        initial_gold = int(started_game.locator("#gold").text_content())
        
        started_game.evaluate("Game.updateQuestProgress('kill', 1)")
        
        started_game.wait_for_timeout(500)
        
        current_gold = int(started_game.locator("#gold").text_content())
        assert current_gold >= initial_gold
    
    def test_quest_completion_log(self, started_game: Page):
        """测试任务完成日志"""
        started_game.evaluate("""
            Game.quests = [{
                id: 1,
                type: 'kill',
                name: '击杀怪物',
                target: 5,
                progress: 4,
                status: 'active',
                reward: { gold: 50 }
            }];
            Game.renderQuests();
        """)
        
        started_game.evaluate("Game.updateQuestProgress('kill', 1)")
        
        battle_log = started_game.locator("#battleLog")
        log_content = battle_log.text_content()
        
        assert "任务完成" in log_content or "奖励" in log_content
    
    def test_quest_reward_gold(self, started_game: Page):
        """测试任务金币奖励"""
        started_game.evaluate("""
            Game.quests = [{
                id: 1,
                type: 'kill',
                name: '测试任务',
                target: 1,
                progress: 0,
                status: 'active',
                reward: { gold: 100 }
            }];
            Game.renderQuests();
        """)
        
        initial_gold = int(started_game.locator("#gold").text_content())
        
        started_game.evaluate("Game.updateQuestProgress('kill', 1)")
        
        current_gold = int(started_game.locator("#gold").text_content())
        assert current_gold >= initial_gold + 100
    
    def test_quest_reward_diamond(self, started_game: Page):
        """测试任务钻石奖励"""
        started_game.evaluate("""
            Game.quests = [{
                id: 1,
                type: 'collect',
                name: '测试任务',
                target: 100,
                progress: 99,
                status: 'active',
                reward: { diamond: 10 }
            }];
            Game.renderQuests();
        """)
        
        initial_diamond = int(started_game.locator("#diamond").text_content())
        
        started_game.evaluate("Game.updateQuestProgress('collect', 1)")
        
        current_diamond = int(started_game.locator("#diamond").text_content())
        assert current_diamond >= initial_diamond + 10
    
    def test_quest_reward_forge_stone(self, started_game: Page):
        """测试任务锻造石奖励"""
        started_game.evaluate("""
            Game.quests = [{
                id: 1,
                type: 'equip',
                name: '测试任务',
                target: 1,
                progress: 0,
                status: 'active',
                reward: { forgeStone: 5 }
            }];
            Game.renderQuests();
        """)
        
        initial_forge = int(started_game.locator("#forgeStone").text_content())
        
        started_game.evaluate("Game.updateQuestProgress('equip', 1)")
        
        current_forge = int(started_game.locator("#forgeStone").text_content())
        assert current_forge >= initial_forge + 5
    
    def test_new_quest_after_completion(self, started_game: Page):
        """测试任务完成后生成新任务"""
        started_game.evaluate("""
            Game.quests = [{
                id: 1,
                type: 'kill',
                name: '测试任务',
                target: 1,
                progress: 0,
                status: 'active',
                reward: { gold: 50 }
            }];
            Game.renderQuests();
        """)
        
        started_game.evaluate("Game.updateQuestProgress('kill', 1)")
        
        started_game.wait_for_timeout(500)
        
        switch_tab(started_game, "quest")
        
        quest_items = started_game.locator(".quest-item")
        assert quest_items.count() >= 1
    
    def test_multiple_quests(self, started_game: Page):
        """测试多个任务"""
        started_game.evaluate("""
            Game.quests = [];
            Game.generateQuests();
            Game.generateQuests();
            Game.generateQuests();
            Game.renderQuests();
        """)
        
        switch_tab(started_game, "quest")
        
        quest_items = started_game.locator(".quest-item")
        assert quest_items.count() >= 1
    
    def test_quest_progress_from_battle(self, started_game: Page):
        """测试战斗更新任务进度"""
        started_game.evaluate("""
            Game.quests = [{
                id: 1,
                type: 'kill',
                name: '击杀怪物',
                target: 10,
                progress: 0,
                status: 'active',
                reward: { gold: 50 }
            }];
            Game.renderQuests();
        """)
        
        wait_for_battle(started_game, 5000)
        
        switch_tab(started_game, "quest")
        
        progress_text = started_game.locator(".quest-progress").first.text_content()
    
    def test_completed_quests_count(self, started_game: Page):
        """测试已完成任务计数"""
        started_game.evaluate("""
            Game.completedQuests = 5;
        """)
        
        assert started_game.evaluate("Game.completedQuests") == 5


@pytest.mark.quest
class TestQuestTypes:
    """任务类型测试"""
    
    def test_kill_quest_type(self, started_game: Page):
        """测试击杀任务类型"""
        started_game.evaluate("""
            Game.quests = [{
                id: 1,
                type: 'kill',
                name: '击杀怪物',
                target: 10,
                progress: 0,
                status: 'active',
                reward: { gold: 50 }
            }];
            Game.renderQuests();
        """)
        
        switch_tab(started_game, "quest")
        
        quest_name = started_game.locator(".quest-name").first.text_content()
        assert "击杀" in quest_name
    
    def test_collect_quest_type(self, started_game: Page):
        """测试收集任务类型"""
        started_game.evaluate("""
            Game.quests = [{
                id: 1,
                type: 'collect',
                name: '收集金币',
                target: 500,
                progress: 0,
                status: 'active',
                reward: { diamond: 5 }
            }];
            Game.renderQuests();
        """)
        
        switch_tab(started_game, "quest")
        
        quest_name = started_game.locator(".quest-name").first.text_content()
        assert "收集" in quest_name
    
    def test_level_quest_type(self, started_game: Page):
        """测试等级任务类型"""
        started_game.evaluate("""
            Game.quests = [{
                id: 1,
                type: 'level',
                name: '达到等级',
                target: 10,
                progress: 1,
                status: 'active',
                reward: { gold: 200 }
            }];
            Game.renderQuests();
        """)
        
        switch_tab(started_game, "quest")
        
        quest_name = started_game.locator(".quest-name").first.text_content()
        assert "等级" in quest_name
    
    def test_equip_quest_type(self, started_game: Page):
        """测试装备任务类型"""
        started_game.evaluate("""
            Game.quests = [{
                id: 1,
                type: 'equip',
                name: '收集装备',
                target: 5,
                progress: 0,
                status: 'active',
                reward: { forgeStone: 5 }
            }];
            Game.renderQuests();
        """)
        
        switch_tab(started_game, "quest")
        
        quest_name = started_game.locator(".quest-name").first.text_content()
        assert "装备" in quest_name
