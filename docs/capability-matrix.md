# 食衡能力矩阵（规格冻结版）

本文严格区分本机已验证环境事实、已知目标设备约束与计划能力；除明确写为“已验证”的内容外，不代表已实现或跑通。

## 1. 已验证环境事实

- Windows 的 `C:\Users\30537\.vela\sdk\system-images\vela-miwear-watch-5.0` 是普通 2025-07 镜像，不是比赛健康镜像。
- 比赛 UI 标签是 `vela-miwear-watch-5.0(开发者大赛)`，实际 `imageType` 和目录为 `vela-miwear-watch-5.0-beta`；该比赛镜像已安装，466×466 圆屏 VVD `shihe-health-watch` 已创建并成功启动，ADB 设备为 `emulator-5554`，启动日志出现 `service_health_onRegister`。
- 食衡 M1 debug RPK 已在 `shihe-health-watch` 构建、安装并启动。首次设置保存 90 kg、2000 kcal 和默认三餐时间后，停止并重启应用可直达首页且数据保留；进入修改设置时数据可正确回填。
- M3 模拟器验收已完成：新增、编辑、冷重启、历史、删除及即时回算均通过。
- Ubuntu VM 当前 goldfish 已验证 `CONFIG_QUICKAPP=y`、`CONFIG_QUICKAPP_VAPP=y`；VelaClaw 禁用，`CONFIG_MQ_MAXMSGSIZE=32`。
- 当前 goldfish 已运行基线 release RPK；食衡 release RPK 尚未在 goldfish 验证或部署。
- 上述结果仅证明 M1 debug 和比赛 VVD 的当前验证状态；`service_health_onRegister` 不等于食衡已经接入或调用 `service.health` API，也不等于 release RPK 或 goldfish 已验证。
- `tp-` key 仅由用户在官方 goldfish `ai_agent` 配置界面私下输入。食衡应用绝不接收或存储 key，也不设计自建后端。

## 2. 已知目标设备约束（非本机环境事实）

- Smart Band 10 Pro 是已知目标设备约束，不是初赛验收设备。
- 已知该目标设备不具备录音器/语音助手，因此食衡不把真实腕上录音或语音助手列为能力；这不等同于已在该设备完成食衡验收。

## 3. 交付与验证矩阵

| capability | delivery priority | validation environment / current state | fallback | blocking |
| --- | --- | --- | --- | --- |
| 本地存储（`system.storage`） | P0，计划实现 | M1 debug 已在比赛 VVD 验证首次设置持久化与设置回填；完整 P0 和 goldfish release 仍待验证 | 写失败保留草稿并明确提示；内存态只用于继续演示 | 是；正式 P0 要求重启后数据保留 |
| 餐时胶囊 | P0，计划实现 | 普通 VVD 与 goldfish；验证每次打开/恢复及 pending/later/skipped/completed | 无系统闹钟时仍按本地状态在下次打开/恢复判断 | 是 |
| 最近吃过 / 收藏套餐 | P0，计划实现 | 普通 VVD 与 goldfish；典型一餐 30 秒内，收藏套餐不超过三次点击进入确认 | 目录选择；仍须确认后保存 | 是 |
| 食品目录与文本解析 | P0，计划实现 | 普通 VVD 与 goldfish；固定 60 项及冻结解析样例 | 手动目录选择；待处理内容禁止静默保存 | 是 |
| 餐食/运动修改与删除 | P0，计划实现 | 普通 VVD 与 goldfish；首页及历史即时回算、重启保留 | 操作失败保留原记录并提示 | 是 |
| 运动数据来源 | P0，手动补录降级 | 本次比赛 `service.health` 仅开放 HEART_RATE/SPO2/STRESS，无法取得系统步数、运动记录或活动热量汇总 | 明示“手动补录 · MET 估算”，不生成 Mock、不宣称同步 | 是 |
| goldfish RPK | P0 部署门禁 | Ubuntu goldfish；当前仅基线包已验证，食衡 release RPK 待验 | Windows VVD 可调 UI，但不能代替 goldfish | 是 |
| 比赛健康镜像与 VVD | P1 验证载体 | `vela-miwear-watch-5.0-beta` 已安装；466×466 圆屏 `shihe-health-watch` 已创建并成功启动，ADB 为 `emulator-5554` | 健康卡能力未接入或不可用时显示不可用 | 否 |
| `service.health` HEART_RATE/SPO2/STRESS | P1，可选增强 | 已实现，等待运行时验证；官方 Mock 流程和真机均待验证 | 明确不支持显示“当前设备暂不支持”，读取错误显示“健康数据暂时读取失败”，无效样本显示“暂无有效健康数据”；后续有效样本覆盖，主流程照常 | 否 |
| `system.alarm` | 可选增强，待验证 | 支持该 feature 的 VVD/真机；当前环境未验证 | 保存该餐稍后时间，仅在下次打开/恢复时提示 | 否；不是 P0 阻塞项 |
| VelaClaw | P1，可选增强 | 需重配/重编 goldfish，启用 VelaClaw/`ai_agent` 并按官方要求提高消息队列上限；当前禁用且上限为 32 | 10 秒失败或超时后使用确定性本地建议 | 否 |
| 真实腕上录音 / 云端 ASR | P2，明确不做 | 无交付验证环境 | 明示边界的键入文本演示与本地确定性解析 | 否；禁止宣称 |
| 自建云服务器 / 云账号 / 多设备同步 | P2，明确不做 | 无交付验证环境 | 设备本地独立运行、30 天保留 | 否；禁止宣称 |
| 手机伴侣 App / 蓝牙同步 / 小米运动健康写入 | P2，明确不做 | 无交付验证环境 | 设备本地独立运行 | 否；禁止宣称 |
| 拍照识餐 / 条码扫描 | P2，明确不做 | 无交付验证环境 | 本地目录、最近项、收藏和文本演示 | 否；禁止宣称 |
| 系统级灵动岛 / 后台常驻 | P2，明确不做 | 餐时胶囊仅为应用前台组件 | 应用打开/恢复时刷新 | 否；禁止宣称 |
| 医疗诊断 / 减重疗效 / 精确代谢预测 | P2，明确不做 | 所有界面只提供生活管理估算 | 固定免责声明 | 否；禁止宣称 |

`blocking` 表示冻结交付门禁，不代表所有硬件具备对应系统能力。探测成功前，UI 不得展示成功状态或虚构数据。

## 4. 验证约束

- 比赛镜像、VVD 启动和 `service_health_onRegister` 已验证，但这些环境事实不等于食衡已接入或跑通 `service.health` API。
- M1 debug 的安装、启动和设置持久化验证不等于完整 P0、release RPK 或 goldfish 已验证。
- “官方文档支持”不等于当前固件启用；须记录镜像/固件、权限、调用结果、日志或截图。
- 模拟器 HEART_RATE、SPO2、STRESS 是官方 Mock 数据，必须标注模拟来源，不能外推为真机验证；只在页面可见时读取/订阅，离页取消。
- 心率和血氧只展示；压力仅可触发温和本地建议。三类健康数据均不持久化、不进热量公式、不诊断。
- 长期产品方向是在系统能力开放后优先同步步数、运动记录和活动热量；初赛只提供明确标注的手动补录 / MET 估算，不能宣称系统运动数据已同步。
- goldfish 的 QUICKAPP/VAPP 只证明框架存在，不证明 alarm、health 或 VelaClaw 可用。
- VelaClaw 当前只可验 10 秒回退路径；应用不得接收 key，不得发送不存在或推断的健康/个人数据。
- 核心验收以断网且所有可选能力关闭时仍可记录、确认保存、修改、删除、聚合并查看历史为准。
- 视觉以 480×480 圆屏为主：深色表盘背景、暖橙餐食状态、绿色完成状态、大数字、圆角卡片；另检查方屏和窄屏不溢出。

## 5. 官方链接

- [大赛总览](https://github.com/open-vela/docs/blob/dev-ai-contest-2026/zh-cn/contest_2026/contest_overview.md)
- [手表应用赛道指引](https://github.com/open-vela/docs/blob/dev-ai-contest-2026/zh-cn/contest_2026/quickapp/watch_app_track_guide.md)
- [快应用手动开发指南](https://github.com/open-vela/docs/blob/dev-ai-contest-2026/zh-cn/contest_2026/quickapp/quickapp_manual.md)
- [service.health 手册](https://github.com/open-vela/docs/blob/dev-ai-contest-2026/zh-cn/contest_2026/quickapp/service_health_guide.md)
- [system.velaclaw 教程](https://github.com/open-vela/docs/blob/dev-ai-contest-2026/zh-cn/contest_2026/quickapp/quickapp_velaclaw.md)
- [Xiaomi Vela system.velaclaw 接口](https://iot.mi.com/vela/quickapp/zh/features/other/velaclaw.html)
