/**
 * 多模型通用 LLM 客户端
 *
 * 支持的模型提供商（通过 LLM_PROVIDER 环境变量切换）：
 *   - openai    → OpenAI GPT-4o / GPT-4o-mini
 *   - anthropic → Anthropic Claude
 *   - deepseek  → DeepSeek V3/R1
 *   - qwen      → 阿里通义千问
 *   - zhipu     → 智谱 GLM-4
 *   - moonshot  → Kimi / Moonshot
 *   - ollama    → 本地 Ollama 模型
 *
 * 任何支持 OpenAI 兼容 API 的模型都可以通过自定义配置接入。
 */

import OpenAI from "openai";

// ==================== 配置读取 ====================

export type Provider = "openai" | "anthropic" | "deepseek" | "qwen" | "zhipu" | "moonshot" | "mimo" | "ollama" | "custom";

const PROVIDER = (process.env.LLM_PROVIDER || "openai") as Provider;

// 各提供商默认配置
const PROVIDER_CONFIG: Record<Provider, { baseURL: string; model: string; apiKeyEnv: string }> = {
  openai:    { baseURL: "https://api.openai.com/v1",       model: "gpt-4o",                 apiKeyEnv: "OPENAI_API_KEY" },
  anthropic: { baseURL: "https://api.anthropic.com/v1",    model: "claude-sonnet-4-20250514", apiKeyEnv: "ANTHROPIC_API_KEY" },
  deepseek:  { baseURL: "https://api.deepseek.com/v1",     model: "deepseek-chat",          apiKeyEnv: "DEEPSEEK_API_KEY" },
  qwen:      { baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1", model: "qwen-plus",  apiKeyEnv: "DASHSCOPE_API_KEY" },
  zhipu:     { baseURL: "https://open.bigmodel.cn/api/paas/v4", model: "glm-4-plus",        apiKeyEnv: "ZHIPU_API_KEY" },
  moonshot:  { baseURL: "https://api.moonshot.cn/v1",      model: "moonshot-v1-128k",       apiKeyEnv: "MOONSHOT_API_KEY" },
  mimo:      { baseURL: "https://token-plan-cn.xiaomimimo.com/v1", model: "mimo-v2.5-pro",       apiKeyEnv: "MIMO_API_KEY" },
  ollama:    { baseURL: "http://localhost:11434/v1",        model: "llama3.1",               apiKeyEnv: "OLLAMA_API_KEY" },
  custom:    { baseURL: "",                                 model: "",                       apiKeyEnv: "LLM_API_KEY" },
};

function getConfig() {
  const base = PROVIDER_CONFIG[PROVIDER];
  return {
    baseURL: process.env.LLM_BASE_URL || base.baseURL,
    model:   process.env.LLM_MODEL     || base.model,
    apiKey:  process.env[base.apiKeyEnv] || process.env.LLM_API_KEY || "ollama",
  };
}

// ==================== 客户端初始化 ====================

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (_client) return _client;
  const { baseURL, apiKey } = getConfig();
  _client = new OpenAI({ baseURL, apiKey });
  return _client;
}

// ==================== 类型定义 ====================

export interface LLMResponse {
  content: string;
  provider: Provider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface CallOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;       // 覆盖默认模型
  provider?: Provider;  // 覆盖默认提供商
}

// ==================== 核心调用函数 ====================

/**
 * 通用 LLM 调用（文本输出）
 */
export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  options?: CallOptions
): Promise<LLMResponse> {
  const config = getConfig();
  const model = options?.model || config.model;
  const client = getClient();

  const response = await client.chat.completions.create({
    model,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 4096,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const choice = response.choices[0];
  return {
    content: choice.message.content || "",
    provider: PROVIDER,
    model,
    usage: response.usage
      ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        }
      : undefined,
  };
}

/**
 * JSON 格式输出的 LLM 调用
 */
export async function callLLMJson<T>(
  systemPrompt: string,
  userPrompt: string,
  options?: CallOptions
): Promise<T> {
  const response = await callLLM(
    systemPrompt + "\n\n请以纯JSON格式输出，不要包含任何markdown标记或代码块标记。",
    userPrompt,
    { ...options, temperature: options?.temperature ?? 0.3 }
  );

  // 清理 markdown 代码块标记
  let jsonStr = response.content.trim();
  if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
  if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
  if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);

  return JSON.parse(jsonStr.trim()) as T;
}

/**
 * 获取当前配置信息（用于调试）
 */
export function getLLMInfo() {
  const config = getConfig();
  return {
    provider: PROVIDER,
    model: config.model,
    baseURL: config.baseURL,
    hasApiKey: !!config.apiKey && config.apiKey !== "ollama",
  };
}

export { getConfig, PROVIDER };
