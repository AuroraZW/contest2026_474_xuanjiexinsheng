# openvela 快应用赛前开发基线

记录日期：2026-09-02（Asia/Shanghai）

GitHub 账号：`AuroraZW`

团队仓库：`open-vela/contest2026_474_xuanjiexinsheng`

比赛分支：`dev-ai-contest-2026`

## 1. 工作区与版本控制

- Windows 仅保留快应用仓副本：`D:\openvela-quickapp\contest2026_474_xuanjiexinsheng`。
- 完整 openvela 与比赛代码的事实源位于 Ubuntu VM：`/home/ubuntu/openvela`。
- Multipass 使用 Hyper-V 后端；实例 `openvela-dev` 为 Ubuntu 22.04.5 LTS、8 vCPU、15.6 GiB 内存、100 GB 动态磁盘。
- 切换比赛 manifest 前已创建快照 `pre-contest-dev-20260901`。
- manifest 的跟踪分支为 `refs/heads/dev-ai-contest-2026`，当前 manifest 提交为 `015ee80a7c2d3c7c4f3b948107a21244c552345a`。
- `gh` 登录账号为 `AuroraZW`；上游团队仓权限为 `WRITE`，个人 fork 权限为 `ADMIN`；Git 传输协议为 HTTPS。
- 提交身份已配置为 `AuroraZW <295313217+AuroraZW@users.noreply.github.com>`，正式提交使用 DCO sign-off。

## 2. Ubuntu VM 工具链

官方 `detect-env.sh` 检测通过：原生 Ubuntu 22.04、16 GB 内存、48 GB 可用磁盘，Git、CMake、Python、Make、GCC、Git LFS 与 repo 均可用。

| 工具 | 验证版本 |
| --- | --- |
| Git | 2.34.1 |
| Git LFS | 3.8.0 |
| repo | 2.66.1 |
| CMake | 3.22.1 |
| GCC | 11.4.0 |
| Python | 3.10.12 |
| Node.js | 22.23.2 |
| npm | 10.9.8 |
| ADB | 28.0.2 |
| GitHub CLI | 2.98.0 |
| Codex CLI | 0.152.0 |
| bubblewrap | 0.6.1 |
| OpenSSL | 3.0.2 |

## 3. AI Coding 日志

- 采集身份固定为团队 `contest2026_474_xuanjiexinsheng`、GitHub 登录名 `AuroraZW`。
- 官方 `verify-setup.sh` 结果为 11 passed、0 failed。
- 已从比赛仓目录启动并正常结束一次 Codex CLI 只读会话，真实日志写入 `logs/AuroraZW/2026-09-02/`。
- 已在工作区外执行隐私闸门测试，比赛日志数量未变化。
- `validate-log.py` 对保留的真实日志与 manifest 校验通过。
- 示例身份目录 `logs/your-github-login/` 已删除，`logs/` 未被 `.gitignore` 忽略。

## 4. Windows 快应用工具链

- AIoT IDE：1.99.3。
- 核心扩展：`vela.aiot-core` 1.7.22、`vela.aiot-emulator` 1.7.22、`vela.aiot-devtools` 1.7.12、`vela.aiot-project` 1.7.13、`vela.aiot-ux` 1.7.10。
- Windows Node.js 24.18.0、npm 11.16.0、OpenSSL 4.0.2。
- `vela-watch-5` 可视化模拟器可启动，ADB 识别为 `emulator-5554`（NuttX）。
- 临时 Hello Watch 工程已完成 npm 依赖安装、IDE Debug 构建与安装、Elements DOM 检查、Console 事件检查、源码映射断点命中和继续执行。
- 调试包 SHA-256：`9178856e50589c8906e16281070ce65294af8ebf5ba891ca91c7de26ff2f3092`。
- 正式签名包 SHA-256：`97da9195d845886dd73d8731157124f65ee5889dce5c7626ab0c0d2fdbc8b525`。
- 临时签名私钥仅保存在比赛仓之外，不提交到 Git。

## 5. 比赛分支构建与 ARM64 goldfish

构建命令：

```bash
./build.sh \
  vendor/openvela/boards/vela/configs/goldfish-arm64-v8a-ap/ \
  --cmake -j8
```

验证结果：

- 构建完成，共 3950 个 Ninja 步骤，用时 05:37。
- `CONFIG_QUICKAPP=y`、`CONFIG_QUICKAPP_VAPP=y`。
- `cmake_out/vela_goldfish-arm64-v8a-ap/nuttx` 为 ARM64 静态链接 ELF。
- `nuttx` SHA-256：`c59870ab2632fb7ed5194b2addeda2ead490f922413dfe347e505765d891ac87`。
- 以 `-no-window -no-audio -gpu swiftshader_indirect` 启动后出现 `goldfish-armv8a-ap>`，`help` 可用。
- VM 内 ADB 识别到 `emulator-5554`，设备类型为 NuttX。
- 官方比赛附件 `font.zip` 已完整推送至 `/data/font/`。
- 正式 RPK 已解压并推送至 `/data/app/com.application.watch.demo`，串口执行 `vapp hap://app/com.application.watch.demo` 后持续运行且无崩溃输出；结束应用后提示符恢复，并通过 `poweroff` 正常关闭模拟器。

## 6. 准入结论

赛前基础链路已经覆盖：代码同步、GitHub 写入权限、DCO 提交、AI 日志采集、Windows 快应用调试与签名、比赛分支 openvela 编译、ARM64 goldfish 串口/ADB、中文字体和 release RPK 运行。接下来可以在正式包名和产品方案确定后进入业务开发。

参考资料：

- [2026 首届 openvela AIoT 开发者大赛总览](https://github.com/open-vela/docs/blob/dev-ai-contest-2026/zh-cn/contest_2026/contest_overview.md)
- [代码提交指南](https://github.com/open-vela/docs/blob/dev-ai-contest-2026/zh-cn/contest_2026/code_submission_guide.md)
- [快应用 AI Coding 工作流](https://github.com/open-vela/docs/blob/dev-ai-contest-2026/zh-cn/contest_2026/quickapp/quickapp_ai_workflow.md)
- [快应用开发手册](https://github.com/open-vela/docs/blob/dev-ai-contest-2026/zh-cn/contest_2026/quickapp/quickapp_manual.md)
- [AI Coding 日志采集手册](https://github.com/open-vela/docs/blob/dev-ai-contest-2026/zh-cn/contest_2026/ai_coding_log_guide.md)
