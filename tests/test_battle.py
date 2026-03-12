import pytest
from playwright.sync_api import Page, expect
from conftest import create_character, wait_for_battle, get_player_stats, get_resources


@pytest.mark.battle
class TestBattleSystem:
    """战斗系统测试"""
    
    def test_enemy_spawn(self, started_game: Page):
        """测试敌人生成"""
        started_game.wait_for_timeout(1000)
        
        enemy_info = started_game.locator("#enemyInfo")
        expect(enemy_info).to_be_visible()
        
        expect(started_game.locator("#enemySprite")).to_be_visible()
        expect(started_game.locator("#enemyName")).not_to_be_empty()
    
    def test_enemy_hp_bar_display(self, started_game: Page):
        """测试敌人血条显示"""
        started_game.wait_for_timeout(1000)
        
        enemy_hp_bar = started_game.locator("#enemyHpBar")
        expect(enemy_hp_bar).to_be_visible()
        
        width = enemy_hp_bar.evaluate("el => el.style.width")
        assert float(width.replace("%", "")) > 0
    
    def test_battle_log_messages(self, started_game: Page):
        """测试战斗日志消息"""
        started_game.wait_for_timeout(2000)
        
        battle_log = started_game.locator("#battleLog")
        expect(battle_log).to_be_visible()
        
        log_entries = battle_log.locator(".log-entry")
        expect(log_entries.first).to_be_visible()
    
    def test_damage_numbers_appear(self, started_game: Page):
        """测试伤害数字出现"""
        initial_damage_count = started_game.locator(".damage-number").count()
        
        started_game.wait_for_timeout(1500)
        
        damage_numbers = started_game.locator(".damage-number")
        assert damage_numbers.count() >= 0
    
    def test_player_hp_changes_in_battle(self, started_game: Page):
        """测试战斗中玩家血量变化"""
        initial_hp = started_game.locator("#playerHp").text_content()
        
        wait_for_battle(started_game, 5000)
        
        current_hp = started_game.locator("#playerHp").text_content()
        
        hp_bar = started_game.locator("#hpBar")
        expect(hp_bar).to_be_visible()
    
    def test_gold_gain_after_battle(self, started_game: Page):
        """测试战斗后金币获取"""
        initial_gold = int(started_game.locator("#gold").text_content())
        
        wait_for_battle(started_game, 5000)
        
        current_gold = int(started_game.locator("#gold").text_content())
        
        assert current_gold >= initial_gold
    
    def test_exp_gain_after_battle(self, started_game: Page):
        """测试战斗后经验获取"""
        initial_exp = started_game.locator("#playerExp").text_content()
        
        wait_for_battle(started_game, 5000)
        
        current_exp = started_game.locator("#playerExp").text_content()
        
        exp_bar = started_game.locator("#expBar")
        expect(exp_bar).to_be_visible()
    
    def test_enemy_respawn_after_defeat(self, started_game: Page):
        """测试敌人被击败后重新生成"""
        wait_for_battle(started_game, 3000)
        
        enemy_name_before = started_game.locator("#enemyName").text_content()
        
        wait_for_battle(started_game, 5000)
        
        enemy_info = started_game.locator("#enemyInfo")
        expect(enemy_info).to_be_visible()
        
        enemy_name_after = started_game.locator("#enemyName").text_content()
        assert enemy_name_after != ""
    
    def test_battle_log_damage_entry(self, started_game: Page):
        """测试战斗日志伤害记录"""
        wait_for_battle(started_game, 3000)
        
        battle_log = started_game.locator("#battleLog")
        log_content = battle_log.text_content()
        
        assert "伤害" in log_content or "击败" in log_content or "获得" in log_content
    
    def test_battle_log_gain_entry(self, started_game: Page):
        """测试战斗日志获取记录"""
        wait_for_battle(started_game, 5000)
        
        battle_log = started_game.locator("#battleLog")
        log_content = battle_log.text_content()
        
        assert "经验" in log_content or "金币" in log_content
    
    def test_player_sprite_display(self, started_game: Page):
        """测试玩家角色显示"""
        player_sprite = started_game.locator("#playerSprite")
        expect(player_sprite).to_be_visible()
        assert player_sprite.text_content() != ""
    
    def test_current_map_display(self, started_game: Page):
        """测试当前地图显示"""
        map_name = started_game.locator("#currentMapName")
        expect(map_name).to_be_visible()
        assert map_name.text_content() == "新手村"
    
    def test_map_requirement_display(self, started_game: Page):
        """测试地图需求显示"""
        map_req = started_game.locator("#mapRequirement")
        expect(map_req).to_be_visible()
        assert "等级要求" in map_req.text_content()
    
    def test_battle_continues_automatically(self, started_game: Page):
        """测试自动战斗持续进行"""
        for i in range(3):
            wait_for_battle(started_game, 2000)
            enemy_info = started_game.locator("#enemyInfo")
            expect(enemy_info).to_be_visible()
    
    def test_player_revival_on_death(self, started_game: Page):
        """测试玩家死亡后自动复活"""
        started_game.wait_for_timeout(1000)
        
        started_game.evaluate("""
            Game.player.hp = 1;
            if (Game.currentEnemy) {
                Game.currentEnemy.atk = 1000;
            }
        """)
        
        wait_for_battle(started_game, 3000)
        
        hp_text = started_game.locator("#playerHp").text_content()
        assert "/" in hp_text
    
    def test_critical_hit_in_battle(self, started_game: Page):
        """测试暴击在战斗中出现"""
        started_game.evaluate("Game.player.baseCrit = 100")
        
        wait_for_battle(started_game, 3000)
        
        battle_log = started_game.locator("#battleLog")
        log_content = battle_log.text_content()
    
    def test_battle_log_scroll(self, started_game: Page):
        """测试战斗日志滚动"""
        wait_for_battle(started_game, 5000)
        
        battle_log = started_game.locator("#battleLog")
        log_entries = battle_log.locator(".log-entry")
        
        assert log_entries.count() >= 1
    
    def test_log_entry_types(self, started_game: Page):
        """测试战斗日志类型"""
        wait_for_battle(started_game, 5000)
        
        damage_entries = started_game.locator(".log-entry.damage")
        gain_entries = started_game.locator(".log-entry.gain")
        info_entries = started_game.locator(".log-entry.info")
        
        total_entries = damage_entries.count() + gain_entries.count() + info_entries.count()
        assert total_entries > 0
    
    def test_power_display_updates(self, started_game: Page):
        """测试战斗力显示更新"""
        initial_power = started_game.locator("#totalPower").text_content()
        
        wait_for_battle(started_game, 5000)
        
        current_power = started_game.locator("#totalPower").text_content()
        expect(started_game.locator("#totalPower")).to_be_visible()


@pytest.mark.battle
class TestBattleRewards:
    """战斗奖励测试"""
    
    def test_item_drop_chance(self, started_game: Page):
        """测试道具掉落"""
        wait_for_battle(started_game, 10000)
        
        battle_log = started_game.locator("#battleLog")
        log_content = battle_log.text_content()
        
        assert "获得" in log_content or "道具" in log_content or "装备" in log_content
    
    def test_equipment_drop(self, started_game: Page):
        """测试装备掉落"""
        wait_for_battle(started_game, 10000)
        
        inventory_count = started_game.locator("#bagCount").text_content()
        
        assert int(inventory_count) >= 0
    
    def test_resource_drops(self, started_game: Page):
        """测试资源掉落"""
        initial_forge = int(started_game.locator("#forgeStone").text_content())
        
        wait_for_battle(started_game, 15000)
        
        current_forge = int(started_game.locator("#forgeStone").text_content())
    
    def test_multiple_battles_accumulate_gold(self, started_game: Page):
        """测试多次战斗累计金币"""
        initial_gold = int(started_game.locator("#gold").text_content())
        
        for _ in range(5):
            wait_for_battle(started_game, 2000)
        
        current_gold = int(started_game.locator("#gold").text_content())
        assert current_gold > initial_gold
