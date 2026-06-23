<div align="center">
  <img src="public/icons/logo.png" alt="ScholarFlow Logo" width="96" />
  <h1>ScholarFlow Mobile</h1>
  <p><strong>端侧 AI 学习助手 · 手机端（iOS / Android）</strong></p>
  <p><strong>On-device AI study companion for college students — iOS / Android, fully offline</strong></p>

  <p>
    <a href="docs/competition/">比赛技术方案 Competition</a> ·
    <a href="https://github.com/Health-525/scholarflow">桌面端主仓 Desktop repo</a> ·
    <a href="https://github.com/Health-525/scholarflow-mobile/issues/new">问题反馈 Issues</a>
  </p>

  <p>
    <a href="LICENSE"><img src="https://img.shields.io/github/license/Health-525/scholarflow-mobile" alt="License" /></a>
    <img src="https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue" alt="Platform" />
    <img src="https://img.shields.io/badge/inference-MNN--LLM-orange" alt="MNN-LLM" />
    <img src="https://img.shields.io/badge/model-Qwen3%20(4--bit)-green" alt="Qwen3" />
    <img src="https://img.shields.io/badge/offline-100%25-success" alt="Offline" />
  </p>
</div>

---

<p align="center">
  <a href="#中文">中文</a> ·
  <a href="#english">English</a>
</p>

<p align="center">
  <img src="docs/competition/screenshots/小咪首页-首屏.png" width="30%" alt="首页" />
  <img src="docs/competition/screenshots/小咪AI助手-对话.png" width="30%" alt="AI 助手" />
  <img src="docs/competition/screenshots/小咪课表-今日.png" width="30%" alt="课表" />
</p>

## 中文

### 这是什么

**ScholarFlow Mobile 是 ScholarFlow 的手机端。** 它把大学生分散在十几个 App 里的学业事务——课表、作业、考试、GPA、图书馆、笔记、番茄钟、日报——**聚合进一个 App**，再用一个**完全跑在手机本地、离线可用**的端侧 AI 助手，作为统一智能入口贯穿所有模块。

> 🖥️ 桌面端（Electron）在主仓 **[Health-525/scholarflow](https://github.com/Health-525/scholarflow)**；**本仓库专注手机端 + 端侧 AI**。

### 一句话亮点

把大学生分散的学业全流程聚合到一端，再用一个随身、离线的端侧 AI 助手统一驱动——**免切换、免联网、免付费、数据不出端**。

### 为什么是「端侧」

| | |
| --- | --- |
| **离线可用** | 图书馆地下层 / 宿舍弱网照样用，推理零流量 |
| **零成本** | 本地推理、无限次，不需要云 AI 会员或按量付费 |
| **隐私** | 成绩、薄弱知识点、学习数据**不出端**，本地完成推理 |
| **懂你的上下文** | 学业数据与 AI 同处一端，可端侧个性化辅导（端侧 RAG 方向） |

### 端侧 AI 技术

- **模型**：`Qwen3-1.7B` / `Qwen3-0.6B`（4-bit 量化、MNN 格式，从[魔搭 ModelScope](https://www.modelscope.cn/) 拉取，约 2GB，不入库）
- **推理框架**：[MNN-LLM](https://github.com/alibaba/MNN)，CPU(NEON) 后端，逐 token 流式回调，跑在原生线程不阻塞界面
- **桥接**：Capacitor 原生插件（Swift → Obj-C++ → MNN C++）
- **后端抽象**：`useChat` → `ChatBackend`——手机走原生 MNN、桌面/开发走 Ollama，**同一套聊天 UI 零改动**
- **SME2 前瞻**：iPhone 15（A16/A17）走通用 NEON；在含 SME2 的 **M5 上实测验证 MNN 的 SME2 加速路径**，形成「今天 iPhone 15 可跑、未来无缝吃 SME2 提速」的同构演进

> 完整技术方案、性能口径与 SME2 指南见 **[`docs/competition/`](docs/competition/)**。

### 萌系「小咪」皮肤

移动端专属 kawaii 粉猫皮肤（仅 `@media max-width:767px` 生效，不影响桌面主题）：首页 / 课表 / AI 助手 / 更多 / 设置 全模块改皮。截图见 [`docs/competition/screenshots/`](docs/competition/screenshots/)。

### 功能总览

| 模块 | 说明 |
| --- | --- |
| 仪表盘 | 汇总课表、作业、考试倒计时、教务通知、最近日报 |
| 课表 | 今日视图、本周网格、日期查询、学期周次计算 |
| 作业 / 考试 | 快速新增、列表管理、完成状态追踪 |
| 成绩 / GPA | 教务同步、绩点展示、按学期查看 |
| 图书馆 | 阅览室状态、预约、暂离、取消、馆内消息 |
| 笔记 / 番茄钟 / 目标 | Markdown 笔记、专注计时、习惯追踪 |
| 日报 / 周报 | 学习数据沉淀与趋势复盘 |
| **AI 助手** | **贯穿全模块的端侧统一入口，离线即答** |

### 快速开始（手机端）

要求：Node 20+ ／ npm 10+ ／ Xcode（iOS）或 Android Studio ／ `git-lfs`（拉模型用）

```bash
git clone https://github.com/Health-525/scholarflow-mobile.git
cd scholarflow-mobile
npm install

# 1) 拉端侧大模型（~2GB，从魔搭；需 git-lfs）
npm run mobile:models

# 2) 构建并打开原生工程
npm run mobile:ios                       # iOS：构建 + 打开 Xcode
npm run mobile:build && npm run mobile:open   # Android：构建 + 打开 Android Studio

# 仅在浏览器里调手机 UI
npm run mobile:dev
```

> 大模型权重（`*.mnn.weight`）**不进 git**，克隆后跑一次 `npm run mobile:models` 即可补齐到 `ios/App/` 下。

### 技术栈

`Next.js 15` + `React 19` + `TypeScript` · `Tailwind CSS` + `shadcn/ui` · `Zustand` + `TanStack Query` · `Capacitor`（iOS / Android）· **`MNN-LLM` + `Qwen3`（端侧）** · `Vitest` + `Playwright`

### 比赛

参加 **「手机上的创意AI」初赛**（参赛机型 iPhone 15）。技术方案文档、产品截图、MNN 开启 SME2 加速指南均在 **[`docs/competition/`](docs/competition/)**。

### 相关文档

- 桌面端主仓：[Health-525/scholarflow](https://github.com/Health-525/scholarflow)
- 学校接入指南：[docs/school-adapter-guide.md](docs/school-adapter-guide.md)
- 数据模型：[docs/DATA_MODEL.md](docs/DATA_MODEL.md)
- 安全说明：[SECURITY.md](SECURITY.md) ／ 贡献：[CONTRIBUTING.md](CONTRIBUTING.md)

---

## English

### What It Is

**ScholarFlow Mobile is the phone client of ScholarFlow.** It aggregates the academic chores a college student juggles across a dozen apps — schedule, assignments, exams, GPA, library, notes, pomodoro, reports — into **one app**, then drives every module through a single **on-device, fully-offline AI assistant**.

> 🖥️ The desktop (Electron) build lives in the main repo **[Health-525/scholarflow](https://github.com/Health-525/scholarflow)**. **This repo focuses on mobile + on-device AI.**

### Why On-Device

- **Offline** — works in library basements / weak dorm Wi-Fi; zero data usage for inference
- **Zero cost** — unlimited local inference, no cloud-AI subscription
- **Private** — grades and study data never leave the device
- **Context-aware** — academic data sits on the same device as the AI (on-device RAG direction)

### On-Device AI Stack

- **Model**: `Qwen3-1.7B` / `Qwen3-0.6B` (4-bit, MNN format, pulled from ModelScope, ~2GB, not committed)
- **Inference**: [MNN-LLM](https://github.com/alibaba/MNN) on CPU(NEON), token-streamed on a native thread
- **Bridge**: Capacitor native plugin (Swift → Obj-C++ → MNN C++)
- **Backend abstraction**: `useChat` → `ChatBackend` — native MNN on phone, Ollama on desktop/dev, **one chat UI, zero changes**
- **SME2-ready**: iPhone 15 runs generic NEON; the MNN SME2 acceleration path is validated on **M5 (SME2-capable)**

> Full technical writeup and SME2 guide in **[`docs/competition/`](docs/competition/)**.

### Quick Start

Requirements: Node 20+ / npm 10+ / Xcode (iOS) or Android Studio / `git-lfs`.

```bash
git clone https://github.com/Health-525/scholarflow-mobile.git
cd scholarflow-mobile
npm install
npm run mobile:models                    # fetch on-device models (~2GB, git-lfs)
npm run mobile:ios                       # iOS: build + open Xcode
# npm run mobile:build && npm run mobile:open   # Android
```

### Tech Stack

`Next.js 15` + `React 19` + `TypeScript` · `Tailwind` + `shadcn/ui` · `Zustand` + `TanStack Query` · `Capacitor` (iOS / Android) · **`MNN-LLM` + `Qwen3` (on-device)** · `Vitest` + `Playwright`

### Competition

Built for the **"Creative AI on Mobile"** preliminary round (target device: iPhone 15). Solution doc, screenshots, and the MNN SME2 guide are in **[`docs/competition/`](docs/competition/)**.

## License

MIT © 2026 [Health-525](https://github.com/Health-525)
