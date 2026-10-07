# 离线 Bot 训练改造任务清单（中文版）

## 目标

基于当前 Terraforming Mars 项目，逐步改造出一套可用于离线训练机器人的基础设施。

最终目标不是先做“最强 AI”，而是先做出：

1. 可脱离浏览器运行的对局环境
2. 可批量执行的 Bot 对战流程
3. 可导出训练数据的接口
4. 可迭代增强的 Bot 基线体系

---

## 阶段 1：梳理现有游戏引擎边界

这一阶段不写训练代码，先把“现有代码里什么是 UI，什么是游戏逻辑”分清楚。

### 任务 1.1：确认游戏核心入口

目标：

- 找到一局游戏从创建到结束的核心服务端入口
- 确认房间模式、玩家模式、单机模式分别走哪里

建议检查：

- `src/server/game/`
- `src/server/routes/`
- `src/common/models/`
- `src/common/inputs/`

产出：

- 一份简短说明，列出：
  - 游戏初始化入口
  - 玩家动作提交入口
  - 回合推进入口
  - 结算入口

### 任务 1.2：区分 UI 模型与引擎模型

目标：

- 区分哪些对象是前端展示用的
- 哪些对象是真正的游戏状态

重点确认：

- `PlayerViewModel`
- `GameModel`
- `WaitingForModel`
- 服务端内部 `Game` / `Player` / `Board` 等对象

产出：

- 一张映射表：
  - “训练环境应直接依赖的对象”
  - “训练环境不该直接依赖的展示对象”

### 任务 1.3：识别随机性来源

目标：

- 找出影响复现的所有随机入口

重点排查：

- 洗牌
- 起始公司/前序抽取
- 地图/殖民地/奖项里程碑随机
- 事件/牌库顺序

产出：

- 列出所有 RNG 使用点
- 标记哪些已支持 seed，哪些还不支持

---

## 阶段 2：抽离 Headless Simulator

这是最关键的一步。

训练环境必须可以不经过浏览器、不经过 HTTP 页面，直接在 Node 里跑整局游戏。

### 任务 2.1：定义训练环境接口

建议先定义一个独立接口，例如：

```ts
type BotEnv = {
  reset(config: EnvConfig, seed?: number): EnvState
  legalActions(state: EnvState): BotAction[]
  step(state: EnvState, action: BotAction): StepResult
  isDone(state: EnvState): boolean
  getResult(state: EnvState): GameResult
}
```

要求：

- 能重置一局
- 能拿到当前合法动作
- 能执行一步
- 能判断终局
- 能导出胜负/分数/名次

产出：

- 一个单独的类型文件
- 清晰定义 `EnvState` / `BotAction` / `StepResult`

### 任务 2.2：做最小可运行模拟

目标：

- 在本地脚本里跑通“一局从开始到结束”

第一版可以先不接训练框架，只需要：

- 创建 2 个虚拟玩家
- 自动随机出合法动作
- 跑到终局
- 打印结果

产出：

- 一个可执行脚本，例如 `src/tools/bot/smoke_test.ts`
- 能稳定跑完至少 10 局

### 任务 2.3：支持 seed 复现

目标：

- 同样的 seed + 同样的动作序列 => 同样的结果

这一步非常重要，否则训练和调试会很痛苦。

产出：

- 一个最小复现测试
- 证明相同 seed 的结果稳定一致

---

## 阶段 3：统一动作表示

Terraforming Mars 的难点之一是动作类型复杂，必须先统一编码。

### 任务 3.1：盘点动作类型

目标：

- 列出所有训练环境需要支持的动作类别

至少应包括：

- 打出手牌
- 使用标准项目
- 使用蓝卡行动
- 领取里程碑
- 设立奖项
- Pass
- 起始公司选择
- 前序选择
- 起始手牌购买
- 各类 `WaitingFor` 输入动作

产出：

- 一张动作类型清单

### 任务 3.2：定义 `BotAction` 结构

建议统一为结构化动作，而不是直接复用前端输入对象。

例如：

```ts
type BotAction =
  | {type: 'play_card', cardId: string, payment?: unknown, targets?: unknown}
  | {type: 'standard_project', project: string, targets?: unknown}
  | {type: 'pass'}
  | {type: 'select_corporation', corporationId: string}
  | {type: 'select_preludes', preludeIds: string[]}
  | {type: 'buy_starting_cards', cardIds: string[]}
```

要求：

- 可序列化
- 可存档
- 可回放
- 可映射回服务端输入

### 任务 3.3：实现动作转换层

目标：

- 把“当前合法动作”转换成 `BotAction[]`
- 把 `BotAction` 再转换回实际引擎可执行输入

这层最好单独封装，不要散落在训练代码里。

产出：

- `action_encoder.ts`
- `action_decoder.ts`

---

## 阶段 4：统一状态表示

训练时不能直接把整个前端页面状态喂进去，需要定义机器可用的状态特征。

### 任务 4.1：定义最小状态快照

先做结构化状态，不要急着做神经网络输入张量。

建议先定义：

- 全局状态
  - generation
  - 温度/氧气/海洋
  - 当前 phase
  - 地图/扩展
  - milestones / awards 状态

- 当前玩家状态
  - 资源
  - 产能
  - TR
  - 手牌
  - 场上卡牌

- 对手摘要
  - 资源摘要
  - 产能摘要
  - TR
  - 公开信息

产出：

- `BotObservation` 类型定义

### 任务 4.2：实现 Observation Builder

目标：

- 从当前服务端真实状态构建训练观测

要求：

- 同一个状态生成结果稳定
- 不混入前端专用字段
- 默认不偷看对手隐藏手牌

产出：

- `observation_builder.ts`

### 任务 4.3：为后续模型输入做可扩展设计

建议把状态拆层：

- 原始结构化 observation
- 特征工程后的 tensor / vector

这样后面无论做：

- 启发式 bot
- 监督学习
- 强化学习

都可以复用同一套 observation builder。

---

## 阶段 5：先做基线 Bot

训练前必须先有 baseline。

### 任务 5.1：随机合法动作 Bot

目标：

- 从 `legalActions` 里随机选一个

作用：

- 测环境是否稳定
- 测动作空间是否完整
- 测整局是否能自然结束

产出：

- `RandomBot`

### 任务 5.2：启发式 Bot v1

目标：

- 做一个不强但稳定的规则机器人

建议先实现粗粒度优先级：

- 优先能提升产能的动作
- 优先高性价比卡牌
- 优先能提升 TR 的动作
- 避免无意义 pass
- 起始公司/前序按简单评分选

产出：

- `HeuristicBotV1`

### 任务 5.3：Bot 对战 runner

目标：

- 让 Bot vs Bot 批量对战

支持：

- 指定玩家数
- 指定扩展组合
- 指定 seed 范围
- 输出胜率/平均分/平均时长

产出：

- `run_bot_match.ts`

---

## 阶段 6：数据采集

训练前要能稳定产数据。

### 任务 6.1：定义训练样本格式

建议每条样本至少包含：

- observation
- legal actions
- chosen action
- 当前玩家 ID
- 回合阶段
- 最终结果

可选：

- policy mask
- action score
- value target

产出：

- `BotTrainingSample` 类型

### 任务 6.2：导出对局轨迹

目标：

- 每局游戏都能导出完整轨迹

建议存成：

- `jsonl`
- 或压缩后的批量文件

产出：

- `replay exporter`
- `dataset writer`

### 任务 6.3：生成 imitation learning 数据集

数据来源建议先用：

- 启发式 bot
- 浅层搜索 bot（如果后面做）

不要一开始用随机 bot 数据训练主策略。

---

## 阶段 7：训练第一版策略模型

这一阶段才开始真正训练。

### 任务 7.1：选训练框架

可以考虑：

- Python 侧训练，Node 导出数据
- 或纯 TS/JS 侧做轻量实验

更现实的路线通常是：

- 游戏环境保留在 TS
- 数据导出给 Python
- Python 用 PyTorch 训练

### 任务 7.2：先做行为克隆

目标：

- 给定 observation + legal actions
- 学会选择接近启发式 bot 的动作

先不要追求强度，先追求：

- 合法率高
- 行为稳定
- 能完整打完全局

### 任务 7.3：离线评估

至少评估：

- 对随机 bot 胜率
- 对启发式 bot 胜率
- 不同地图表现
- 不同扩展组合表现
- 单人 / 双人 / 多人差异

---

## 阶段 8：强化学习 / 自博弈

只有前面都稳定后，才建议进入这一阶段。

### 任务 8.1：定义 RL reward

主奖励建议优先使用：

- 胜负
- 排名
- 最终 VP 差

辅助奖励可以少量加入：

- TR 增长
- 产能增长

但必须小心，不要让模型学偏。

### 任务 8.2：搭建 self-play pipeline

支持：

- 多个 bot 版本互打
- checkpoint 对战
- 数据回收再训练

### 任务 8.3：建立 league 机制

不要只和最新自己打。

建议对手池包括：

- 随机 bot
- 启发式 bot
- 历史 checkpoint
- 搜索 bot

---

## 阶段 9：工程化能力补齐

这一阶段是为了让训练系统可维护。

### 任务 9.1：回放与调试工具

需要支持：

- 复现某个 seed
- 回放某条 bot 对局
- 检查某一步动作为什么被选中

### 任务 9.2：指标看板

至少记录：

- 平均胜率
- 平均分
- 每步耗时
- 非法动作率
- 游戏中断率

### 任务 9.3：版本管理

需要能明确知道：

- 数据集版本
- Bot 版本
- 模型 checkpoint 版本
- 对局规则版本

---

## 优先级建议

如果按实际价值排序，我建议：

### P0

- 抽离 headless simulator
- 支持 seed 复现
- 统一动作表示
- 随机 bot 跑通

### P1

- 启发式 bot
- observation builder
- 批量 bot 对战 runner
- 数据导出

### P2

- imitation learning
- 离线评估体系

### P3

- self-play RL
- league 训练
- 搜索增强

---

## 不建议一开始做的事

以下这些都不该放在第一阶段：

- 直接训练大语言模型
- 直接从前端 DOM 学习动作
- 一开始就上 PPO / RL
- 没有 baseline 就比较模型强弱
- 没有 replay 能力就大规模跑数据

---

## 最小可落地里程碑

如果只定一个最小版本，建议目标是：

1. 在 Node 环境里自动跑完一整局
2. 两个随机 bot 能连续跑 100 局不崩
3. 一个启发式 bot 能稳定优于随机 bot
4. 能导出训练样本

达到这个里程碑后，再进入模型训练才是合理的。

---

## 总结

这项工作真正的基础不是“训练算法”，而是：

1. 可脱离 UI 的稳定环境
2. 可序列化的动作定义
3. 可复现的状态与随机数控制
4. 足够可靠的 baseline bot

如果这 4 件事做扎实，后面无论你走：

- imitation learning
- self-play RL
- search + policy

都会顺很多。
