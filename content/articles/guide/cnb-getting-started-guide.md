---
title: CNB 云原生构建入门指南
type: GUIDE
category: bangong
keywords: [CNB, CI/CD, 入门, 流水线, 云原生构建]
excerpt: 从注册到配置第一条 .cnb.yml 流水线，手把手带你用 CNB 搭建自动化构建流程。
description: 一步步教你用 CNB 搭建 CI/CD 流水线：注册账号、创建仓库、编写 .cnb.yml、配置定时任务、接入 AI 助手，覆盖从零到上手的完整流程。
authorName: AooBee 编辑部
publishedAt: 2026-08-11
updatedAt: 2026-08-11
faqItems:
  - question: CNB 需要自己买服务器吗？
    answer: 不需要。构建在云端容器化环境执行，无需自建构建机。免费额度即可开始使用，付费版提供更多并发与资源。
  - question: .cnb.yml 放哪里？
    answer: 放在仓库根目录。CNB 会自动识别仓库根目录的 .cnb.yml 作为流水线配置，push 代码后自动触发构建。
  - question: 能接入 GitHub 仓库吗？
    answer: 可以。CNB 支持导入 GitHub 仓库或配置 Webhook，实现外部仓库代码提交自动触发 CNB 构建。
  - question: 定时任务怎么配置？
    answer: 在 .cnb.yml 中用 crontab 表达式配置定时触发，例如 "0 7 * * *" 表示每天早上 7 点执行。适合日报生成、数据拉取等自动化场景。
  - question: AI 助手怎么召唤？
    answer: 在 CNB 的 Issue 或 PR 评论中 @CodeBuddy 即可召唤 AI 助手。它会自动读取上下文、执行任务并在评论中回复结果。
  - question: 首次配置容易出错怎么办？
    answer: 建议从最简单的构建任务开始（如 echo 测试），确认流程跑通后再逐步增加步骤。CNB 构建日志会给出详细错误信息，逐步排查即可。
related:
  - /best/devops-build-platforms-2026
  - /compare/cnb-vs-github-actions
  - /review/cnb-review
  - /reviews/cnb-honest-review
  - /faq/cnb-common-questions
  - /bangong/cnb
---
# CNB 云原生构建入门指南

CNB（cnb.cool）是腾讯云推出的云原生研发平台。这篇文章从零开始，带你用 CNB 搭建一条完整的 CI/CD 流水线——从注册账号到自动构建、再到定时任务与 AI 助手，全程不需要自己买服务器。

## 一、注册与创建组织

打开 [cnb.cool](https://cnb.cool)，用手机号或 GitHub 账号注册即可。注册后建议创建一个组织（团队），把仓库和构建任务组织在一个工作区。个人开发者也建议建一个组织，方便后续扩展。

## 二、创建仓库

在 CNB 控制台点击"新建仓库"，选择公开或私有。你可以直接在 CNB 上创建新仓库，也可以从 GitHub、Gitee 导入已有代码。导入时 CNB 会自动识别仓库结构，无需手动调整。

## 三、编写第一条 .cnb.yml

在仓库根目录创建 `.cnb.yml` 文件，这是 CNB 的流水线配置文件。最简单的示例：

```yaml
build:
  runs-on: ubuntu
  steps:
    - name: 输出构建信息
      run: echo "构建成功！"
```

配置完成后 push 到仓库，CNB 会自动识别 `.cnb.yml` 并触发首次构建。在构建页面可以看到日志输出，确认流程跑通。

## 四、配置真实的构建任务

一个更实际的 Node.js 项目流水线示例：

```yaml
build:
  runs-on: ubuntu
  steps:
    - name: 检出代码
      run: git clone $REPO_URL .
    - name: 安装依赖
      run: npm install --registry=https://registry.npmmirror.com
    - name: 运行测试
      run: npm test
    - name: 构建产物
      run: npm run build
```

关键步骤拆解：检出代码 → 安装依赖（使用国内镜像加速）→ 跑测试 → 构建产物。每一步失败都会在日志中明确标注，方便排查。

## 五、配置定时任务

CNB 支持 crontab 定时触发，适合自动化运维场景。在 `.cnb.yml` 中配置：

```yaml
build:
  runs-on: ubuntu
  crontab: "0 7 * * *"
  steps:
    - name: 拉取每日数据
      run: node scripts/fetch-daily-data.mjs
```

`"0 7 * * *"` 表示每天 7 点执行。可以配合数据拉取、SEO 报告生成、内容发布等脚本实现全自动运维。

## 六、召唤 AI 助手

CNB 深度集成了 AI 助手（CodeBuddy NPC）。在任意 Issue 或 PR 的评论中 @CodeBuddy，它就会自动读取任务上下文、执行操作并在评论中回复。你可以让它：

- 读写仓库文件、修改代码
- 执行构建与测试命令
- 生成 SEO/GEO 内容
- 分析构建失败原因
- 定期生成运维报告

召唤时建议在评论中明确任务目标和约束条件（如分类、格式要求），AI 助手会按规则执行。

## 七、接入外部 GitHub 仓库

如果代码托管在 GitHub，可以将仓库导入 CNB，或在 CNB 中通过 Webhook 接入外部仓库。这样 GitHub 上的 push 会自动触发 CNB 的构建任务，实现"代码在 GitHub、构建在 CNB"的混合架构。

## 八、常见问题排查

**构建一直失败？** 先看日志：依赖安装失败通常是网络问题，配置国内镜像可解决；命令执行失败检查路径和权限；构建超时检查是否有死循环或超大依赖。

**缓存不生效？** 确保依赖安装步骤使用了可复现的 lock 文件（package-lock.json、pnpm-lock.yaml 等），CNB 会基于这些文件自动缓存。

**定时任务没跑？** 检查 crontab 表达式格式是否正确，以及是否为 UTC 时间。确认构建配置无误后，在构建记录页面查看是否触发成功。

**AI 助手不回复？** 检查评论中是否使用了 @CodeBuddy，以及是否在支持的 Issue/PR 中召唤。部分平台限制下，评论数过多可能导致召唤被跳过。

## 结语

从零搭建 CI/CD 只花了不到半小时——这就是 CNB 的价值。不需要维护服务器、不需要配置复杂的构建环境，一份 `.cnb.yml` 就把持续集成、定时任务和 AI 协作全部串起来了。先用最简单的构建任务跑通，再逐步增加测试、部署和自动化运维步骤，你会发现自动化带来的效率提升远超预期。

**联系我们**
联系电话：15532661565　|　微信号：aoo697　|　邮箱：aoobee@sina.com

![扫码加入 AooBee 微信交流群](/huomaAIfens.png)
