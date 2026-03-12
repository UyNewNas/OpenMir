import pytest
from playwright.sync_api import Page, expect
from conftest import create_character, switch_tab, wait_for_battle


@pytest.mark.equipment
class TestEquipmentSystem:
    """装备系统测试"""
    
    def test_equip_tab_navigation(self, started_game: Page):
        """测试装备标签导航"""
        switch_tab(started_game, "equip")
        
        equip_tab = started_game.locator("#equip-tab")
        expect(equip_tab).to_have_class("tab-content active")
    
    def test_equipment_slots_display(self, started_game: Page):
        """测试装备槽位显示"""
        switch_tab(started_game, "equip")
        
        equipment_list = started_game.locator("#equipmentList")
        expect(equipment_list).to_be_visible()
        
        slots = started_game.locator(".equipment-slot")
        assert slots.count() == 4
    
    def test_empty_equipment_slots(self, started_game: Page):
        """测试空装备槽位"""
        switch_tab(started_game, "equip")
        
        empty_slots = started_game.locator(".equipment-slot.empty")
        assert empty_slots.count() == 4
    
    def test_bag_tab_navigation(self, started_game: Page):
        """测试背包标签导航"""
        switch_tab(started_game, "bag")
        
        bag_tab = started_game.locator("#bag-tab")
        expect(bag_tab).to_have_class("tab-content active")
    
    def test_bag_count_display(self, started_game: Page):
        """测试背包数量显示"""
        switch_tab(started_game, "bag")
        
        bag_count = started_game.locator("#bagCount")
        expect(bag_count).to_be_visible()
    
    def test_inventory_grid_display(self, started_game: Page):
        """测试背包网格显示"""
        switch_tab(started_game, "bag")
        
        inventory_grid = started_game.locator("#inventoryGrid")
        expect(inventory_grid).to_be_visible()
    
    def test_equipment_drop_to_inventory(self, started_game: Page):
        """测试装备掉落到背包"""
        switch_tab(started_game, "bag")
        initial_count = int(started_game.locator("#bagCount").text_content())
        
        wait_for_battle(started_game, 10000)
        
        switch_tab(started_game, "bag")
        current_count = int(started_game.locator("#bagCount").text_content())
        
        assert current_count >= initial_count
    
    def test_equipment_slot_click(self, started_game: Page):
        """测试装备槽位点击"""
        switch_tab(started_game, "equip")
        
        first_slot = started_game.locator(".equipment-slot").first
        first_slot.click()
        
        started_game.wait_for_timeout(300)
    
    def test_inventory_item_click(self, started_game: Page):
        """测试背包物品点击"""
        wait_for_battle(started_game, 10000)
        
        switch_tab(started_game, "bag")
        
        inventory_slots = started_game.locator(".inventory-slot")
        if inventory_slots.count() > 0:
            inventory_slots.first.click()
            
            detail_panel = started_game.locator("#equipDetailPanel")
            expect(detail_panel).to_be_visible()
    
    def test_equipment_detail_panel_display(self, started_game: Page):
        """测试装备详情面板显示"""
        started_game.evaluate("""
            const equip = {
                id: Date.now(),
                name: '测试装备',
                slot: 'weapon',
                slotName: '武器',
                level: 10,
                quality: 2,
                qualityName: 'rare',
                qualityLabel: '稀有',
                setName: '新手套装',
                atk: 20,
                def: 10
            };
            Game.inventory.push(equip);
            Game.renderInventory();
        """)
        
        switch_tab(started_game, "bag")
        
        inventory_slot = started_game.locator(".inventory-slot").first
        inventory_slot.click()
        
        expect(started_game.locator("#equipDetailPanel")).to_be_visible()
        expect(started_game.locator("#equipDetailOverlay")).to_be_visible()
    
    def test_equipment_detail_close(self, started_game: Page):
        """测试装备详情关闭"""
        started_game.evaluate("""
            const equip = {
                id: Date.now(),
                name: '测试装备',
                slot: 'weapon',
                slotName: '武器',
                level: 10,
                quality: 2,
                qualityName: 'rare',
                qualityLabel: '稀有',
                setName: '新手套装',
                atk: 20
            };
            Game.inventory.push(equip);
            Game.renderInventory();
        """)
        
        switch_tab(started_game, "bag")
        started_game.locator(".inventory-slot").first.click()
        
        close_btn = started_game.locator(".equip-detail-close")
        close_btn.click()
        
        expect(started_game.locator("#equipDetailPanel")).not_to_be_visible()
    
    def test_equipment_equip_button(self, started_game: Page):
        """测试装备按钮"""
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
        
        switch_tab(started_game, "bag")
        started_game.locator(".inventory-slot").first.click()
        
        equip_btn = started_game.locator("#equipBtn")
        expect(equip_btn).to_be_visible()
    
    def test_equipment_sell_button(self, started_game: Page):
        """测试出售按钮"""
        started_game.evaluate("""
            const equip = {
                id: Date.now(),
                name: '测试装备',
                slot: 'weapon',
                slotName: '武器',
                level: 5,
                quality: 1,
                qualityName: 'uncommon',
                qualityLabel: '优秀',
                setName: '新手套装',
                atk: 10
            };
            Game.inventory.push(equip);
            Game.renderInventory();
        """)
        
        switch_tab(started_game, "bag")
        started_game.locator(".inventory-slot").first.click()
        
        sell_btn = started_game.locator(".equip-detail-btn.sell-btn")
        expect(sell_btn).to_be_visible()
    
    def test_equipment_equip_action(self, started_game: Page):
        """测试装备穿戴动作"""
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
        
        switch_tab(started_game, "bag")
        started_game.locator(".inventory-slot").first.click()
        started_game.locator("#equipBtn").click()
        
        switch_tab(started_game, "equip")
        
        equipped_slot = started_game.locator(".equipment-slot").first
        expect(equipped_slot).not_to_have_class("equipment-slot empty")
    
    def test_equipment_sell_action(self, started_game: Page):
        """测试装备出售动作"""
        initial_gold = int(started_game.locator("#gold").text_content())
        
        started_game.evaluate("""
            const equip = {
                id: Date.now(),
                name: '测试装备',
                slot: 'weapon',
                slotName: '武器',
                level: 5,
                quality: 1,
                qualityName: 'uncommon',
                qualityLabel: '优秀',
                setName: '新手套装',
                atk: 10
            };
            Game.inventory.push(equip);
            Game.renderInventory();
        """)
        
        switch_tab(started_game, "bag")
        started_game.locator(".inventory-slot").first.click()
        started_game.locator(".equip-detail-btn.sell-btn").click()
        
        current_gold = int(started_game.locator("#gold").text_content())
        assert current_gold > initial_gold
    
    def test_equipment_quality_colors(self, started_game: Page):
        """测试装备品质颜色"""
        qualities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']
        
        for i, quality in enumerate(qualities):
            started_game.evaluate(f"""
                Game.inventory = [];
                const equip = {{
                    id: Date.now() + {i},
                    name: '{quality}装备',
                    slot: 'weapon',
                    slotName: '武器',
                    level: 10,
                    quality: {i},
                    qualityName: '{quality}',
                    qualityLabel: '测试',
                    setName: '新手套装',
                    atk: 10
                }};
                Game.inventory.push(equip);
                Game.renderInventory();
            """)
            
            switch_tab(started_game, "bag")
            slot = started_game.locator(".inventory-slot").first
            expect(slot).to_have_class(f"inventory-slot {quality}")
    
    def test_slot_equip_list_display(self, started_game: Page):
        """测试槽位装备列表显示"""
        switch_tab(started_game, "equip")
        
        empty_slot = started_game.locator(".equipment-slot.empty").first
        empty_slot.click()
        
        slot_list = started_game.locator("#slotEquipList")
        expect(slot_list).to_be_visible()
    
    def test_auto_equip_tip_display(self, started_game: Page):
        """测试自动装备提示显示"""
        started_game.evaluate("""
            const betterEquip = {
                id: Date.now(),
                name: '更强武器',
                slot: 'weapon',
                slotName: '武器',
                level: 20,
                quality: 3,
                qualityName: 'epic',
                qualityLabel: '史诗',
                setName: '勇者套装',
                atk: 100
            };
            Game.checkBetterEquipment(betterEquip);
        """)
        
        auto_equip_tip = started_game.locator("#autoEquipTip")
        expect(auto_equip_tip).to_be_visible()
    
    def test_auto_equip_confirm(self, started_game: Page):
        """测试自动装备确认"""
        started_game.evaluate("""
            const betterEquip = {
                id: Date.now(),
                name: '更强武器',
                slot: 'weapon',
                slotName: '武器',
                level: 20,
                quality: 3,
                qualityName: 'epic',
                qualityLabel: '史诗',
                setName: '勇者套装',
                atk: 100
            };
            Game.checkBetterEquipment(betterEquip);
        """)
        
        confirm_btn = started_game.locator(".auto-equip-tip-btn.equip-now")
        confirm_btn.click()
        
        expect(started_game.locator("#autoEquipTip")).not_to_be_visible()
    
    def test_auto_equip_cancel(self, started_game: Page):
        """测试自动装备取消"""
        started_game.evaluate("""
            const betterEquip = {
                id: Date.now(),
                name: '更强武器',
                slot: 'weapon',
                slotName: '武器',
                level: 20,
                quality: 3,
                qualityName: 'epic',
                qualityLabel: '史诗',
                setName: '勇者套装',
                atk: 100
            };
            Game.checkBetterEquipment(betterEquip);
        """)
        
        cancel_btn = started_game.locator(".auto-equip-tip-btn.cancel")
        cancel_btn.click()
        
        expect(started_game.locator("#autoEquipTip")).not_to_be_visible()
    
    def test_set_bonus_display(self, started_game: Page):
        """测试套装效果显示"""
        started_game.evaluate("""
            Game.equipment.weapon = {
                id: 1,
                name: '新手剑',
                slot: 'weapon',
                slotName: '武器',
                level: 5,
                quality: 1,
                qualityName: 'uncommon',
                qualityLabel: '优秀',
                setName: '新手套装',
                atk: 10
            };
            Game.equipment.armor = {
                id: 2,
                name: '新手甲',
                slot: 'armor',
                slotName: '护甲',
                level: 5,
                quality: 1,
                qualityName: 'uncommon',
                qualityLabel: '优秀',
                setName: '新手套装',
                def: 5,
                hp: 20
            };
            Game.renderEquipment();
            Game.updateUI();
        """)
        
        switch_tab(started_game, "equip")
        
        set_bonus = started_game.locator("#setBonusDisplay")
        expect(set_bonus).to_be_visible()
    
    def test_equipment_stats_affect_player(self, started_game: Page):
        """测试装备属性影响玩家"""
        initial_atk = int(started_game.locator("#playerAtk").text_content())
        
        started_game.evaluate("""
            Game.equipment.weapon = {
                id: 1,
                name: '强力武器',
                slot: 'weapon',
                slotName: '武器',
                level: 10,
                quality: 3,
                qualityName: 'epic',
                qualityLabel: '史诗',
                setName: '勇者套装',
                atk: 50
            };
            Game.updateUI();
        """)
        
        current_atk = int(started_game.locator("#playerAtk").text_content())
        assert current_atk > initial_atk
    
    def test_unequip_to_inventory(self, started_game: Page):
        """测试卸下装备到背包"""
        started_game.evaluate("""
            Game.equipment.weapon = {
                id: 1,
                name: '测试武器',
                slot: 'weapon',
                slotName: '武器',
                level: 5,
                quality: 1,
                qualityName: 'uncommon',
                qualityLabel: '优秀',
                setName: '新手套装',
                atk: 10
            };
            Game.renderEquipment();
        """)
        
        switch_tab(started_game, "equip")
        started_game.locator(".equipment-slot").first.click()
        
        unequip_item = started_game.locator(".slot-equip-item").first
        unequip_item.click()
        
        switch_tab(started_game, "bag")
        bag_count = int(started_game.locator("#bagCount").text_content())
        assert bag_count >= 1
    
    def test_inventory_max_limit(self, started_game: Page):
        """测试背包最大容量限制"""
        started_game.evaluate("""
            for (let i = 0; i < 55; i++) {
                const equip = {
                    id: Date.now() + i,
                    name: '装备' + i,
                    slot: 'weapon',
                    slotName: '武器',
                    level: 5,
                    quality: 0,
                    qualityName: 'common',
                    qualityLabel: '普通',
                    setName: '新手套装',
                    atk: 5
                };
                Game.inventory.push(equip);
            }
            Game.renderInventory();
        """)
        
        switch_tab(started_game, "bag")
        bag_count = int(started_game.locator("#bagCount").text_content())
        assert bag_count <= 50


@pytest.mark.equipment
class TestEquipmentComparison:
    """装备对比测试"""
    
    def test_equipment_compare_display(self, started_game: Page):
        """测试装备对比显示"""
        started_game.evaluate("""
            Game.equipment.weapon = {
                id: 1,
                name: '当前武器',
                slot: 'weapon',
                slotName: '武器',
                level: 5,
                quality: 1,
                qualityName: 'uncommon',
                qualityLabel: '优秀',
                setName: '新手套装',
                atk: 10
            };
            
            const newEquip = {
                id: Date.now(),
                name: '新武器',
                slot: 'weapon',
                slotName: '武器',
                level: 10,
                quality: 2,
                qualityName: 'rare',
                qualityLabel: '稀有',
                setName: '勇者套装',
                atk: 25
            };
            Game.inventory.push(newEquip);
            Game.renderInventory();
            Game.renderEquipment();
        """)
        
        switch_tab(started_game, "bag")
        started_game.locator(".inventory-slot").first.click()
        
        compare_section = started_game.locator("#equipCompare")
        expect(compare_section).to_be_visible()
    
    def test_better_equipment_indicator(self, started_game: Page):
        """测试更好装备指示器"""
        started_game.evaluate("""
            Game.equipment.weapon = {
                id: 1,
                name: '当前武器',
                slot: 'weapon',
                slotName: '武器',
                level: 5,
                quality: 1,
                qualityName: 'uncommon',
                qualityLabel: '优秀',
                setName: '新手套装',
                atk: 10
            };
            
            const betterEquip = {
                id: Date.now(),
                name: '更好武器',
                slot: 'weapon',
                slotName: '武器',
                level: 15,
                quality: 3,
                qualityName: 'epic',
                qualityLabel: '史诗',
                setName: '战神套装',
                atk: 50
            };
            Game.inventory.push(betterEquip);
            Game.renderInventory();
            Game.renderEquipment();
        """)
        
        switch_tab(started_game, "bag")
        started_game.locator(".inventory-slot").first.click()
        
        better_stat = started_game.locator(".equip-detail-value.better")
        assert better_stat.count() > 0
