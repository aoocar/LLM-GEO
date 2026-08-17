---
title: DeepSeek Harness 接入宝塔 MCP 指南：用 AI Agent 自动运维服务器
type: GUIDE
category: ai
keywords: [DeepSeek Harness, 宝塔 MCP, AI 运维, Agent, 服务器自动化]
excerpt: 一步步教你将 DeepSeek Harness 接入宝塔 MCP，让 AI Agent 自动完成服务器环境检查、软件安装、网站巡检和故障修复等运维任务。
description: DeepSeek Harness 接入宝塔 MCP 完整指南：了解 Agent 框架的核心设计、快速安装方法、接入宝塔 MCP 的详细步骤，以及三个实测运维场景演示。
authorName: AooBee 编辑部
publishedAt: 2026-08-17
faqItems:
  - question: DeepSeek Harness 是模型还是工具？
    answer: DeepSeek Harness 不是一个大模型，而是一套用来构建和运行 Agent 的开源框架。模型负责理解需求、判断问题和规划步骤，Harness 负责管理上下文、调用工具、执行任务、接收反馈，并推动任务继续完成。
  - question: 怎么把宝塔 MCP 接入 DeepSeek Harness？
    answer: 在宝塔面板中安装并打开"宝塔 MCP 服务"，进入"接入与体验"页面，将运行 DeepSeek Harness 的设备 IP 加入访问白名单，然后复制面板自动生成的 MCP 安装提示词，直接发送给 DeepSeek Harness 即可完成接入。
  - question: 宝塔 MCP 接入后能做什么？
    answer: 接入后 DeepSeek Harness 可以读取服务器环境、调用面板工具，自动完成软件安装、网站巡检、故障修复和项目部署等任务，用户只需用自然语言描述需求。
  - question: 使用 DeepSeek Harness 需要会写代码吗？
    answer: 基础使用不需要写代码，只需要会用自然语言描述任务。但作为开发者预览版，了解基本的命令行和服务器知识能帮助你更好地使用和排查问题。
  - question: DeepSeek Harness 的运行环境要求是什么？
    answer: 需要提前准备好 Node.js 开发环境。支持通过 npx 或 npm 全局安装，启动后会在本地运行 Web UI，默认访问地址为 http://127.0.0.1:3080，同时需要配置 DeepSeek API Key。
  - question: DeepSeek Harness 接入宝塔 MCP 安全吗？
    answer: 宝塔生成的 MCP 安装提示词可能包含 Token、密码等敏感信息，请勿转发、截图公开或发送给无关人员。建议仅将运行 Harness 的设备 IP 加入白名单，控制访问范围。
  - question: DeepSeek Harness 和普通 AI 问答有什么区别？
    answer: 普通 AI 问答只会给出"应该怎么做"的建议，而 DeepSeek Harness 会读取真实环境、调用工具并继续执行后续步骤，从发现问题、判断原因到执行修复和验证结果，形成完整的自动化处理链路。
related:
  - /guide/deepseek-harness-guide
  - /ai/deepseek-harness
  - /ai/deepseek
  - /reviews/deepseek-harness-honest-review
  - /best/deepseek-harness-tools-2026
---
# DeepSeek Harness 接入宝塔 MCP 指南

DeepSeek Harness 开发者预览版已正式开放测试，并同步以 MIT 协议开放源代码。这篇文章将带你了解 DeepSeek Harness 是什么、如何安装，以及它接入宝塔 MCP 后能做什么，帮助你用 AI Agent 实现服务器运维自动化。

## 一、DeepSeek Harness 是什么

DeepSeek Harness 不是一个新模型，而是一套用来构建和运行 Agent 的开源框架。模型负责理解需求、判断问题和规划步骤，Harness 则负责管理上下文、调用工具、执行任务、接收反馈，并推动任务继续完成。

其核心设计可以概括为**"一切皆插件"**。模型、工具、Skills、会话、沙箱、存储、循环、调度和 UI 等 Agent 能力，都由插件组合而成。开发者不需要修改 DeepSeek Harness 本身的源码，就可以替换或扩展其中的能力。

目前提供四种运行模式：

- **标准模式**：加载较完整的工具组合，适合日常使用
- **PTC 模式**：由模型生成代码，组合完成多轮工具调用
- **极简模式**：只保留 Shell 和文件编辑工具，主要用于模型基准测试
- **创造模式**：检查当前运行环境、试验插件，并组合新的运行模式

另一个重要设计是**"每一次运行都有迹可循"**。模型看到的内容、工具调用与结果、子 Agent 调度和上下文注入等信息，都会写入仅追加的会话日志。通过 Trajectory 视图，可以查看任务每一步是怎么判断和执行的。

## 二、快速安装

准备好 Node.js 开发环境后，运行一条命令即可快速体验：

```bash
npx @deepseek-ai/dsh web
```

或者直接全局安装：

```bash
npm i -g @deepseek-ai/dsh
dsh web
```

启动完成后，DeepSeek Harness 会在本地运行 Web UI，默认访问地址为 http://127.0.0.1:3080。打开页面后，进入左下角的"设置"，在模型配置中填写 DeepSeek API Key。保存后回到工作区，选择需要操作的项目目录，就可以创建会话开始使用了。

需要注意的是，当前还是 v0.1 开发者预览版，核心插件、基础接口和配置方式都可能继续调整，更适合开发者和喜欢尝鲜的用户先行体验。

## 三、接入宝塔 MCP

既然 DeepSeek Harness 的设计思路是"一切皆插件"，那么把宝塔面板的服务器运维能力接进去就是很自然的延伸。DeepSeek Harness 负责理解需求、拆解任务和安排工具调用，宝塔 MCP 则将服务器、网站、软件、文件、数据库和安全等面板能力提供给它。

实际接入过程非常简单，不需要手动查找 MCP 地址，也不用自己修改配置文件：

1. 在宝塔面板中安装并打开"宝塔 MCP 服务"，进入"接入与体验"页面
2. 将运行 DeepSeek Harness 的设备 IP 加入访问白名单
3. 点击复制面板自动生成的 MCP 安装提示词
4. 把提示词直接发送给 DeepSeek Harness

这段提示词中已经包含接入所需的安装说明，DeepSeek Harness 会根据提示下载并读取安装文档，再按照文档步骤完成宝塔 MCP 的安装与配置。整个过程中，不需要手动复制连接地址或编写配置。完成后它会汇总执行结果，如果中途出现错误也会停止操作并返回具体的错误步骤和处理建议。

**安全提醒**：宝塔生成的安装提示词可能包含 Token、密码等敏感信息，请勿转发、截图公开或发送给无关人员。

## 四、三个实测运维场景

### 1. 检查服务器并安装 Node.js

给 DeepSeek Harness 下达"帮我在服务器安装一下最新的 Node.js 版本"的任务后，它没有直接执行固定命令，而是先通过宝塔 MCP 检查服务器系统、当前 Node.js 环境和面板软件信息，再根据检查结果安排安装步骤。这是 Harness 与普通问答之间比较明显的区别：它不只给出"应该怎么安装"，还会读取当前环境并调用工具继续处理。

### 2. 巡检网站并修复故障

让 Harness 对服务器进行网站巡检，它通过宝塔 MCP 发现：Nginx 服务已停止、80 和 443 端口没有正常监听、多个网站受到影响、其中一个站点的 SSL 证书已过期。发现问题后，它没有直接启动服务，而是继续检查 Nginx 进程、PID 文件、配置语法和系统状态，确认没有明显的配置错误和 OOM 痕迹后再启动 Nginx。服务恢复后，又完成 SSL 证书续签和 HTTPS 状态检查，形成了一条完整的运维处理链路。

### 3. 从需求到完成项目部署

测试了在服务器上部署一套轻量运维工具箱的完整任务。Harness 先确认了技术栈、功能范围和部署域名，然后拆解成多个步骤：检查 DNS 解析、创建网站并配置 PHP 8.2、编写和部署代码、配置文件权限、添加访问密码、申请 SSL 证书、检查访问状态。遇到 DNS 未正确解析时，它给出了需要添加的 A 记录，并在域名生效前通过服务器 IP 和 Host 请求验证网站状态。最终部署完成的工具箱包含系统监控、服务管理、网站状态、日志查看和进程与端口五个模块。

## 五、总结

DeepSeek Harness v0.1 目前只是一个起点，功能、插件和配置方式还会继续变化。但"一切皆插件"的设计，让外部能力有了更多接入空间。宝塔 MCP 要做的，就是把宝塔长期积累的网站、软件、数据库、安全和服务器管理能力，以更规范的方式提供给不同的 AI 工具和 Agent。

无论使用的是 DeepSeek Harness，还是其他支持 MCP 的 AI 工具，都可以通过宝塔 MCP 连接服务器运维能力。随着后续版本的迭代和更多真实运维场景的测试，AI 自动运维的体验会越来越成熟。

**联系我们**
联系电话：15532661565　|　微信号：aoo697　|　邮箱：aoobee@sina.com

![扫码加入 AooBee 微信交流群](/huomaAIfens.png)
