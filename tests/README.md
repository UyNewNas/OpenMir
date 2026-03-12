# 传奇世界自动化测试

基于 Python Playwright 框架的自动化测试用例

## 环境要求

- Python 3.8+
- Node.js (用于启动本地服务器)

## 安装

```bash
pip install -r requirements.txt
playwright install
```

## 运行测试

### 运行所有测试
```bash
pytest
```

### 运行特定标记的测试
```bash
pytest -m character    # 角色创建测试
pytest -m battle       # 战斗系统测试
pytest -m equipment    # 装备系统测试
pytest -m map          # 地图系统测试
pytest -m skill        # 技能系统测试
pytest -m quest        # 任务系统测试
pytest -m save         # 存档系统测试
pytest -m smoke        # 冒烟测试
```

### 运行特定测试文件
```bash
pytest tests/test_character.py
pytest tests/test_battle.py
pytest tests/test_equipment.py
```

### 运行特定测试用例
```bash
pytest tests/test_character.py::TestCharacterCreation::test_create_warrior_character
```

### 生成HTML报告
```bash
pytest --html=report.html --self-contained-html
```

## 测试覆盖

### test_character.py - 角色创建测试
- 角色创建页面显示
- 职业选择 (战士/法师/道士/刺客)
- 名字输入验证
- 初始属性和资源显示
- 职业加成验证

### test_battle.py - 战斗系统测试
- 敌人生成和显示
- 战斗日志记录
- 伤害数字显示
- 经验和金币获取
- 敌人重生机制

### test_equipment.py - 装备系统测试
- 装备槽位显示
- 背包管理
- 装备穿戴和卸下
- 装备出售
- 套装效果
- 装备对比

### test_map.py - 地图系统测试
- 地图列表显示
- 地图解锁条件
- 地图切换
- 地图奖励显示

### test_skill.py - 技能系统测试
- 技能列表显示
- 技能升级
- 技能效果验证
- 资源消耗

### test_quest.py - 任务系统测试
- 任务生成
- 任务进度更新
- 任务完成奖励
- 多种任务类型

### test_save.py - 存档系统测试
- 自动保存
- 手动保存
- 存档读取
- 转生系统

### test_smoke.py - 冒烟测试
- 核心功能快速验证
- 关键路径测试

## 测试配置

### pytest.ini
- 测试路径配置
- 标记定义
- 默认参数

### conftest.py
- 公共 fixtures
- 辅助函数
- 测试配置

## 注意事项

1. 测试前请确保本地服务器已启动 (http://localhost:8080)
2. 每个测试用例会自动清理 localStorage
3. 默认使用 headed 模式运行，可在 pytest.ini 中修改
4. slow_mo 设置为 100ms，便于观察测试过程
