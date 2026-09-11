# 食衡测试与发布验证报告

## 1. 基线

- 测试日期：2026-09-12
- 源码分支：`feat/shihe-mvp`
- RC1 源码提交：`6d70077`
- 包名：`com.openvela.contest2026.team474.shihe`
- 版本：`1.0.0`（`versionCode: 1`）
- RC1 文件：`com.openvela.contest2026.team474.shihe.release.1.0.0.rpk`
- RC1 大小：90,125 bytes
- RC1 SHA-256：`3e26977cf4d9c8696d5823b07ace1c9699de89264ec8ad86070f2c7c21b5728e`

本报告只记录已经实际完成的验证。用户私下配置 `tp-` Key 后的 VelaClaw 成功回复尚未作为通过项；它不是 P0 发布门禁。

## 2. 自动化与构建

在 Ubuntu VM 和 Windows AIoT 工具链执行：

```bash
cd quickapp/shihe
npm test
npm run build
```

结果：

- 食品文本解析、未知项保留、餐食确认与回算测试通过。
- MET 运动估算、今日能量、7 天趋势、30 天保留和餐时状态测试通过。
- 健康样本归一化、无响应 watchdog、高压力本地建议测试通过。
- VelaClaw 脱敏上下文、基础设施错误识别、空回复和 10 秒超时回退测试通过。
- goldfish 缺少 `system.router` 时的入口降级测试通过。
- debug RPK 构建通过；构建审计确认 index、onboarding、home、meal、confirm、exercise、history 七个页面均进入包内。

Windows 使用本地且被 Git 忽略的签名材料执行 `npm run release` 成功，生成上述 RC1。签名私钥未复制到 VM、比赛仓或证据目录。

## 3. AIoT 比赛健康模拟器

验证环境：

- AIoT Core / Emulator 1.7.22
- 镜像标签：`vela-miwear-watch-5.0（开发者大赛）`
- image type：`vela-miwear-watch-5.0-beta`
- 实例：`shihe-health-watch`
- 466 × 466 圆屏，density 320

生产 RPK 通过 `pm install` 安装，并通过 `am start com.openvela.contest2026.team474.shihe` 启动。首次设置、首页、记餐、确认、补录运动和历史页面均能打开；重启后设置与业务记录保留。

`service.health` 实际订阅得到官方 Mock 数据。历次观察包括 HEART_RATE/SPO2/STRESS 为 81/99/41、89/98/42、108/99/12、120/97/37，以及 RC1 验收时的 97/98/34。数值仅证明模拟器 Mock 链路，不代表真实健康测量。压力较高时本地建议会切换为一分钟呼吸提醒；离开首页后退订，返回首页重新建立一组订阅。

在普通 `vela-watch-5.0` 镜像中，运行日志确认 `service.health` 未注册。食衡稳定显示“当前设备暂不支持”，记餐、补录运动、历史和设置仍可使用。

### 20 分钟稳定性

状态：**待重新执行，不计为通过**。首轮人工核对确认四个业务页面可达，但自动循环后半段的返回手势离开了快应用并进入系统表盘卡片。原脚本只检查截图文件大小，没有验证页面语义，因此 1,200 秒和 23 个循环不能证明食衡四页持续可达。该次运行仅保留为“自动化脚本需要页面识别”的问题证据，不纳入稳定性结论。

正式复测必须在每轮先显式启动食衡，并验证截图中出现对应页面标题；通过标准仍为连续 20 分钟无应用崩溃、无黑屏，首页、历史、补录运动和记餐持续可达。复测完成前，本报告不得宣称 20 分钟稳定性已通过。

## 4. openvela goldfish

构建目标：`vendor/openvela/boards/vela/configs/goldfish-arm64-v8a-ap/`。

已验证配置包含：

```text
CONFIG_QUICKAPP=y
CONFIG_QUICKAPP_VAPP=y
CONFIG_FEATURE_SYSTEM_VELACLAW=y
CONFIG_EXAMPLES_AI_AGENT_VELA=y
CONFIG_MQ_MAXMSGSIZE=4096
```

已完成 debug RPK 启动和 VelaClaw 无 Key 降级验证：调用到达 `system.velaclaw` 和 `ai_agent`，后端返回不可用时，食衡识别基础设施错误并显示“AI 暂不可用，已保留本地建议”。

RC1 production RPK 也已完成实际验证：RPK 解包为 14 个文件并推送到 `/data/app/com.openvela.contest2026.team474.shihe`，串口执行 `vapp hap://app/com.openvela.contest2026.team474.shihe` 后，日志确认：

- 从生产包目录初始化，识别包名 `com.openvela.contest2026.team474.shihe` 和版本 `1.0.0`；
- `system.storage` 与 `system.velaclaw` 成功加载；
- `pages/index` 完成 build、ready 和 show；
- 应用持续运行且未自行退出，随后由测试人员正常中止并返回 `goldfish-armv8a-ap>` 提示符。

当前开源 goldfish 虽在构建配置中启用了 router，运行时仍未注册 `system.router`；根 URI 因此展示 index 验证页，完整七页流程由 AIoT 比赛模拟器承担。goldfish 输出中的 LVGL `CRIT [User]` 是该端口的 framebuffer 初始化日志级别，后续显示初始化和 QuickApp 启动均继续成功，不能单独按崩溃解读。

## 5. 数据与降级验证

- 空状态：首次启动进入设置，不使用虚假默认体重。
- 损坏存储：提示用户并允许明确重建，不静默覆盖。
- 未知食品：展示待处理文本，必须替换或明确忽略后才能确认。
- 断网或 AI 不支持：本地食品库、记餐、运动、历史和规则建议继续工作。
- 健康能力缺失、暂时失败、无有效样本：分别显示对应状态，不阻塞主流程。
- 运动来源：界面统一标注“手动补录 · MET 估算”，不宣称同步系统步数或运动记录。
- 修改和删除：餐食与运动变更后摄入、消耗、净摄入和剩余目标立即重算。

## 6. 安全与隐私

- Git 跟踪文件和 RPK 文本均扫描高置信度 `tp-`、`sk-` 和私钥头模式。
- `sign/`、`node_modules/`、`build/` 和 `dist/` 被忽略。
- VelaClaw 只发送当天汇总和布尔状态，不发送原始健康样本；调用前要求用户确认。
- `tp-` Key 仅由用户在 goldfish `ai_agent` 中私下配置，不进入应用、仓库、AI 日志、截图或视频。
- 官方 `validate-log.py` 用于校验 `logs/AuroraZW/`；不得手工改写 JSONL。

## 7. 尚未关闭的非 P0 项

- VelaClaw 有 Key 成功回复需要用户私下完成一次最终验证；失败时保留本地建议，不阻塞发布。
- `system.alarm` 未纳入发布基线；餐时胶囊在应用打开或恢复时判断。
- 初赛不依赖真机、系统运动数据同步、手机伴侣或云服务。
