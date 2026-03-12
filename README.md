# OpenMir 🎮

一个开源的类传奇自动挂机网页游戏，使用纯前端技术实现，无需后端服务。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

## ✨ 特性

- 🎯 **自动挂机** - 自动战斗、自动拾取装备、自动回收
- ⚔️ **多职业系统** - 战士、法师、道士、刺客四种职业
- 🗺️ **多地图探索** - 10个不同等级的地图，逐步解锁
- 🛡️ **装备系统** - 6种品质、套装效果、自动穿戴
- 🔄 **转生系统** - 等级达到100级可转生，获得永久加成
- 📜 **任务系统** - 动态任务生成，丰富奖励
- 💾 **本地存档** - 自动保存游戏进度

## 🚀 快速开始

### 在线游玩

直接打开 `index.html` 即可开始游戏，或部署到任意静态服务器。

### 本地运行

```bash
# 方式1: 使用 Python
python -m http.server 8080

# 方式2: 使用 Node.js
npx serve .

# 方式3: 使用 VS Code Live Server 插件
# 右键 index.html -> Open with Live Server
```

然后访问 `http://localhost:8080`

## 📁 项目结构

```
OpenMir/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式文件
└── js/
    ├── core.js         # 核心模块 - 事件系统
    ├── player.js       # 玩家系统
    ├── resource.js     # 资源系统
    ├── equipment.js    # 装备系统
    ├── inventory.js    # 背包系统
    ├── battle.js       # 战斗系统
    ├── map.js          # 地图系统
    ├── skill.js        # 技能系统
    ├── rebirth.js      # 转生系统
    ├── quest.js        # 任务系统
    ├── ui.js           # UI系统
    ├── save.js         # 存档系统
    └── game.js         # 游戏主模块
```

## 🎮 游戏玩法

### 职业

| 职业 | 特点 | 加成 |
|------|------|------|
| ⚔️ 战士 | 近战物理，血厚防高 | 生命+20% 攻击+10% 防御+15% |
| 🔮 法师 | 远程魔法，高爆发 | 魔法+30% 攻击+20% 暴击+5% |
| ☯️ 道士 | 召唤辅助，全能型 | 生命+10% 魔法+15% 全属性+5% |
| 🗡️ 刺客 | 高暴击高闪避 | 暴击+10% 攻击+15% 闪避+10% |

### 装备品质

- ⚪ 普通 - 基础属性
- 🟢 优秀 - 1.2倍属性
- 🔵 稀有 - 1.5倍属性
- 🟣 史诗 - 2倍属性
- 🟠 传说 - 3倍属性
- 🔴 神话 - 5倍属性

### 地图解锁

| 地图 | 等级要求 | 转生要求 |
|------|----------|----------|
| 新手村 | 1级 | 0转 |
| 森林小径 | 10级 | 0转 |
| 矿洞入口 | 20级 | 0转 |
| 幽暗森林 | 30级 | 0转 |
| 古墓入口 | 40级 | 0转 |
| 恶魔洞穴 | 50级 | 1转 |
| 龙之谷 | 60级 | 1转 |
| 魔王城 | 80级 | 2转 |
| 深渊 | 100级 | 3转 |
| 神域 | 120级 | 5转 |

## 🛠️ 开发指南

### 模块化架构

项目采用 ES6 模块化设计，各系统完全解耦，支持多人协作开发：

```javascript
// 各模块独立开发示例
import { EventBus, Events } from './core.js';

// 监听事件
EventBus.on(Events.PLAYER_LEVEL_UP, ({ level }) => {
    console.log(`升级到 ${level} 级！`);
});

// 触发事件
EventBus.emit(Events.PLAYER_LEVEL_UP, { level: 10 });
```

### 开发分工

| 模块文件 | 负责内容 |
|----------|----------|
| `player.js` | 玩家属性、职业平衡 |
| `battle.js` | 战斗逻辑、伤害公式 |
| `equipment.js` | 装备生成、套装效果 |
| `map.js` | 地图设计、怪物配置 |
| `skill.js` | 技能系统、升级平衡 |
| `quest.js` | 任务设计、奖励配置 |
| `ui.js` | 界面美化、交互优化 |

## 📝 更新日志

### v1.0.0 (2024-03-12)

- ✅ 完成模块化重构
- ✅ 实现自动挂机系统
- ✅ 实现装备套装系统
- ✅ 实现转生系统
- ✅ 实现任务系统
- ✅ 实现自动回收功能

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- 灵感来源于经典传奇游戏
- 感谢所有贡献者的支持

---

⭐ 如果这个项目对你有帮助，请给一个 Star！
