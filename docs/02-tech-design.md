# 食衡技术设计（规格冻结版）

版本：`1.0.0`　`versionCode: 1`　工程：`quickapp/shihe`　包名：`com.openvela.contest2026.team474.shihe`

## 1. 原则

离线优先、能力探测、明确降级、确认后写入。P0 不依赖网络、手机、录音、云 ASR、`service.health`、`system.alarm` 或 VelaClaw。系统 feature 的准确 import、manifest、参数、返回结构、错误码和生命周期，以实现时对应版本官方文档及实测为准，不臆测 vendor API，也不声称待验证能力已跑通。

## 2. 页面与模块

七个主要页面保持简单：首次设置、首页、记餐、确认、运动、历史、设置。文本演示内嵌记餐页；建议、餐时胶囊和健康卡内嵌首页；日明细在历史页内展开；确认页复用餐食和运动两种草稿。

```text
quickapp/shihe/src/
├── app.ux
├── manifest.json
├── common/
│   ├── components/       # 胶囊、看板、健康卡、确认卡
│   ├── data/foods-v1.js  # 固定 60 项只读目录
│   ├── domain/           # 公式、校验、日期、解析器
│   ├── services/         # storage/health/alarm/velaclaw 适配器
│   └── store/            # 单一持久化入口、迁移、保留
└── pages/
    ├── onboarding/       ├── today/       ├── meal/
    ├── confirm/          ├── exercise/    ├── history/
    └── settings/
```

## 3. 数据模型

时间为毫秒 epoch；`localDate` 是保存时设备本地日 `YYYY-MM-DD`；千卡快照四舍五入为整数。

### ProfileV1

```text
ProfileV1 {
  schemaVersion: 1,
  weightKg: number,
  dailyTargetKcal: integer,
  mealWindows: {
    breakfast: { start: "HH:mm", end: "HH:mm" },
    lunch: { start: "HH:mm", end: "HH:mm" },
    dinner: { start: "HH:mm", end: "HH:mm" }
  },
  disclaimerAcceptedAt: number,
  updatedAt: number
}
```

默认 `dailyTargetKcal = 2000`；默认餐段为早餐 07:00–09:30、午餐 11:30–14:00、晚餐 17:30–20:30。`weightKg` 必须由用户有效输入，不提供可让用户静默完成引导的默认体重。Profile 不采集年龄、年龄段或身高。

### FoodV1

```text
FoodV1 {
  id: string, name: string, category: string,
  basisUnit: "g" | "ml",
  energyKcalPer100: number,
  defaultServing: { label: string, amount: number, uiStep: number },
  parseUnits: object, aliases: string[],
  sourceId: string, sourceNote: string, tags: string[]
}
```

交付目录固定 60 项。`energyKcalPer100` 是唯一能量事实源，所有份量统一换算到 `basisUnit`：

```text
itemKcal = round(energyKcalPer100 * amount / 100)
mealTotal = sum(itemKcal)
```

每项必须可追溯到 `sourceId/sourceNote`；所用第三方数据与素材在交付前汇总到 `THIRD_PARTY_NOTICES`。

### MealRecordV1

```text
MealRecordV1 {
  schemaVersion: 1, id: string, createdAt: number, updatedAt: number,
  localDate: "YYYY-MM-DD", mealType: "breakfast" | "lunch" | "dinner" | "snack",
  source: "catalog" | "recent" | "favorite" | "transcript-demo",
  items: [{ foodId: string, nameSnapshot: string, amount: number,
    basisUnit: "g" | "ml", energyKcalPer100Snapshot: number, kcalSnapshot: integer }],
  totalKcalSnapshot: integer
}
```

实际数量、单位和每百单位能量均保存快照，使历史可解释；合计等于各项 `kcalSnapshot` 之和。未知或待处理文本不得进入正式记录。

### ExerciseRecordV1

```text
ExerciseRecordV1 {
  schemaVersion: 1, id: string, createdAt: number, updatedAt: number,
  localDate: "YYYY-MM-DD",
  activity: "brisk_walk" | "run" | "cycle" | "rope" | "strength" | "yoga",
  metSnapshot: number, weightKgSnapshot: number,
  durationMinutes: integer, kcalSnapshot: integer
}
```

六类及固定演示 MET 值：快走 3.5、跑步 8.0、骑行 6.8、跳绳 10.0、力量训练 5.0、瑜伽 2.5。时长 1–600 分钟；MET 和体重保存快照，参数变化不改历史。

### 根状态与保留

唯一存储键：`shihe_state_v1`。

```text
FavoriteMealV1 {
  id: string, name: string, createdAt: number, updatedAt: number,
  items: [{ foodId: string, amount: number, basisUnit: "g" | "ml" }]
}
```

收藏套餐只保存复用草稿所需字段。复用时必须按当前食品目录重新计算，进入确认页，并在用户确认后才保存为正式餐食。

```text
ShiheStateV1 {
  schemaVersion: 1, profile: ProfileV1 | null,
  meals: MealRecordV1[], exercises: ExerciseRecordV1[],
  recentFoodIds: string[], favoriteMeals: FavoriteMealV1[],
  mealPromptState: {
    localDate: "YYYY-MM-DD",
    breakfast: { status: "pending" | "later" | "skipped" | "completed", remindAt?: number },
    lunch: { status: "pending" | "later" | "skipped" | "completed", remindAt?: number },
    dinner: { status: "pending" | "later" | "skipped" | "completed", remindAt?: number }
  },
  lastMaintenanceAt: number
}
```

系统能力状态仅在运行时探测，不持久化为业务状态。启动、成功保存和跨日恢复时保留今天及之前 29 个本地自然日。解析失败、未知 schema 或校验失败时不覆盖原值，本会话进入安全模式并提示数据损坏与清除选项。写入按“完整对象序列化 → 校验 → 单键替换”；记录 ID 保证幂等。

## 4. 公式与即时回算

```text
exerciseKcal = round(MET * 3.5 * weightKg / 200 * durationMinutes)
intake = sum(meal.totalKcalSnapshot)
exerciseEstimate = sum(exercise.kcalSnapshot)
netIntake = intake - exerciseEstimate
remainingToday = dailyTargetKcal - netIntake
```

MET 为固定估算，不用健康数据修正。首页聚合必须显示摄入、运动估算消耗、净摄入、今日余量，以及早餐、午餐、晚餐完成状态，并显示“估算”“仅供生活管理参考”。新增、修改或删除任一餐食/运动记录后，store 立即重新聚合首页及历史；7 天视图含今天在内连续 7 个本地自然日，空日补零。

## 5. 确定性文本解析器

输入仅来自记餐页内的“一句话记餐（模拟器转写模式）”；入口醒目标明“这是键入的转写文本，不是录音或语音识别”，无麦克风访问。

```text
ParseResult {
  status: "complete" | "needs_review" | "empty",
  items: ParsedItem[], unresolved: UnresolvedFragment[]
}
```

1. 输入最多 80 字，切分后最多 12 个片段；空输入返回 `empty`。
2. 对 60 项规范名和别名做最长别名优先匹配，只有完整片段满足语法时才消费该片段。
3. 支持有限中文数字、阿拉伯数字，以及对应 FoodV1 `parseUnits` 明确声明的单位。
4. 只有完全未提供数量时，才以 `defaultServing` 产生候选，且 UI 必须明确展示所用默认份量。
5. 数字无单位、单位不支持、未知词、中英混合未知内容或否定语义均放入 `unresolved`，返回 `needs_review`；禁止模糊猜测、静默丢弃或保存。
6. 解析器是无存储副作用的纯函数；只有确认页复核通过并由用户提交后才构造正式记录。

冻结测试样例：

- “一碗米饭、一份番茄炒蛋、一杯无糖豆浆”应完整解析为 `complete`。
- “米饭200克、鸡胸肉150g”应完整解析为 `complete`。
- “一瓶可乐，没吃米饭”必须为 `needs_review`，且不得误记米饭。
- 含中英混合未知内容的输入必须为 `needs_review`，未知内容进入 `unresolved`。

## 6. 能力探测与降级契约

适配器统一返回 `{ available, status, data?, reason? }`；增强失败不得阻断 P0 账本。

### system.storage

- 探测后读取 `shihe_state_v1`，校验、迁移并执行 30 天维护。
- 不可用或读失败时使用仅本会话内存态，醒目标明“记录可能无法保留”。
- 写失败保留草稿和重试入口，不显示普通成功；保存成功后读取回验。

### 餐时胶囊与 system.alarm

- 应用每次打开或恢复时，根据本地时间、三个餐段、当天 meals 和 `mealPromptState` 重新计算状态。
- 未记录时展开“现在记录 / 稍后提醒 / 本餐跳过”；已记录时收缩并显示该餐热量。
- “稍后提醒”保存该餐的 `remindAt`。仅当 `system.alarm` 可用时按官方接口申请、更新或取消系统闹钟；本地状态保存与闹钟注册是两个独立结果。
- alarm 不可用或失败时如实提示，不伪造通知，也不承诺进程被回收后触发；下次打开或恢复时仍检查 `remindAt`。
- `system.alarm` 是可选增强，不是 P0 阻塞项。

### service.health

- P1 覆盖官方 Mock 的 HEART_RATE、SPO2、STRESS。健康卡仅在首页可见期间读取或订阅，页面隐藏/销毁时立即取消订阅。
- 心率和血氧只展示；压力只允许触发温和的本地建议，例如先呼吸一分钟、避免情绪化进食。
- 三类数据均不进入热量公式、不持久化、不用于诊断；不得构造接口未返回的数据。
- 模拟器数据标“官方 Mock 数据”。能力、权限或有效数据不可用时显示“当前设备暂不支持”，主流程照常。

### system.velaclaw

- P1，仅由用户主动触发并确认实际发送的最小文字摘要。
- 使用官方 `@system.velaclaw` 接口和独立 10 秒计时器；失败、拒绝、离线、非法响应或超时均立即回退确定性本地建议，忽略迟到回调和页面销毁后的更新。
- 回复标“AI 生成，仅供参考”，不得写成事实或医疗结论，也不得发送不存在、推断出的健康或个人数据。
- 应用绝不接收、读取或存储 key；用户只在 goldfish `ai_agent` 官方配置界面私下输入 `tp-` key。仓库与 RPK 不含 `tp-`/`sk-` key。

## 7. 页面与记录行为

- 未完成首次设置时只进入 onboarding；体重无有效输入或免责声明未接受不得完成。
- 编辑只改 draft，返回即丢弃；确认页从不可变 draft 渲染并重算。
- 保存生成唯一 ID、幂等写入并读取回验，成功后才导航；双击只写一条。
- 餐食和运动记录均提供修改与删除。修改复用确认流程；删除需确认。成功后 store 立即回算首页与历史。
- 最近吃过与收藏套餐均为 P0；收藏套餐不超过 3 次点击进入确认，但绝不跳过确认写入。

## 8. 安全、隐私与视觉

- 无账户、自建后端、手机伴侣 App、蓝牙同步或小米运动健康写入；业务数据仅存本地。
- 日志不输出档案、饮食明细、健康值、AI 正文、密钥或完整存储对象。
- 输入做长度、类型、枚举、有限数和范围校验；纯文本绑定，禁止动态执行。
- 清除数据须二次确认并尝试取消已注册闹钟，取消失败须告知。
- 视觉采用深色表盘背景、暖橙餐食状态、绿色完成状态、大数字和圆角卡片。以 480×480 圆屏为主验收，同时检查方屏和窄屏布局不溢出。

## 9. 测试计划

- 目录：恰好 60 项；稳定唯一 ID；字段完整；每项有来源；仅 `energyKcalPer100` 为能量事实源；第三方清单完整。
- 食品公式：g/ml 两类、默认份量、边界值、四舍五入及合计误差不超过 1 kcal。
- 运动：六类固定 MET、体重/时长边界、估算标签；确认没有其他运动混入。
- 解析：80 字与 12 片段边界、最长别名优先、只整段消费、有限数字/单位、无数量默认份量、数字无单位、不支持单位、未知词、否定和上述四个冻结样例。
- 存储：取消零写、双击单写、写失败不报成功、修改/删除即时回算、7/30 天跨月年、本地午夜、重启保留、损坏 JSON、未知 schema、ID 幂等。
- 首页聚合：摄入、运动估算消耗、净摄入、今日余量计算正确；早餐、午餐、晚餐完成状态随保存、修改、删除即时更新。
- 胶囊：每次打开/恢复重算；pending/later/skipped/completed；稍后到期；当天跳过；保存、修改和删除后的状态变化；alarm success/unavailable/fail。
- 健康：三类官方 Mock；仅可见时订阅、离页取消；不可用文案；心率/血氧仅展示；压力仅触发温和本地建议；均不持久化、不进公式。
- AI：9.9 秒成功、10 秒超时、失败、拒绝、迟到回调和页面销毁；确认应用无 key 输入/存储，并且只发送实际存在且用户确认的字段。
- 视觉：480×480 圆屏为主；方屏、窄屏无文字/卡片/按钮溢出；深色、暖橙、绿色、大数字和圆角卡片符合冻结视觉。
- 环境：现有普通 `vela-watch-5` VVD 验 P0，不据此宣称 health；下载比赛镜像并创建对应 VVD 后再验 `service.health`；Ubuntu goldfish 验 release RPK、字体和离线闭环，当前固件只验 VelaClaw 降级；真机另验，Mock 不算真机。

## 10. VM 事实源 / Windows 构建 Git 工作流

VM 比赛仓 `/home/ubuntu/openvela/contest2026_474_xuanjiexinsheng` 是唯一源码事实源，正式开发分支为 `feat/shihe-mvp`，负责所有正式修改、审查和提交；每日正式提交使用 `git commit -s` 并推送个人 fork。Windows 仅承担拉取、构建和模拟器验证。

1. 所有源码修改只在 VM 完成并形成可拉取的提交。
2. Windows 只执行 `git pull --ff-only` 获取 VM 提交，不产生源码修复，也不得用 Windows 工作区反向覆盖 VM。
3. Windows 在 AIoT IDE 构建 debug/release RPK 并运行 VVD；发现问题后把现象、日志和截图反馈到 VM，由 VM 修改后再次提交，Windows 再次 `git pull --ff-only`。
4. Windows 生成最终 RPK 后，通过 `multipass transfer` 将产物传回 VM，由 VM 纳入最终提交。
5. 不复制 `.git`、密钥、`node_modules` 或缓存；冲突和正式历史只在 VM 管理。

## 11. 官方依据

- [大赛总览](https://github.com/open-vela/docs/blob/dev-ai-contest-2026/zh-cn/contest_2026/contest_overview.md)
- [手表应用赛道指引](https://github.com/open-vela/docs/blob/dev-ai-contest-2026/zh-cn/contest_2026/quickapp/watch_app_track_guide.md)
- [快应用 AI 工作流](https://github.com/open-vela/docs/blob/dev-ai-contest-2026/zh-cn/contest_2026/quickapp/quickapp_ai_workflow.md)
- [快应用手动开发指南](https://github.com/open-vela/docs/blob/dev-ai-contest-2026/zh-cn/contest_2026/quickapp/quickapp_manual.md)
- [service.health 手册](https://github.com/open-vela/docs/blob/dev-ai-contest-2026/zh-cn/contest_2026/quickapp/service_health_guide.md)
- [system.velaclaw 教程](https://github.com/open-vela/docs/blob/dev-ai-contest-2026/zh-cn/contest_2026/quickapp/quickapp_velaclaw.md)
- [Xiaomi Vela system.velaclaw 接口](https://iot.mi.com/vela/quickapp/zh/features/other/velaclaw.html)
