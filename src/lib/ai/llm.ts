/**
 * Provider-agnostic LLM service.
 * Supports OpenAI, Anthropic (Claude), and Google (Gemini).
 * Swappable via config without changing agent code.
 */

import { getAiConfig } from "./config";

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
}

export interface LlmResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

async function callOpenAI(messages: LlmMessage[], options: LlmOptions): Promise<LlmResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const config = getAiConfig();
  const model = options.model || config.model;

  const body: Record<string, unknown> = {
    model,
    messages,
    max_tokens: options.maxTokens || config.maxTokens,
    temperature: options.temperature ?? config.temperature,
  };

  if (options.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const choice = data.choices[0];

  return {
    content: choice.message.content || "",
    model: data.model,
    usage: {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
    },
    finishReason: choice.finish_reason,
  };
}

async function callAnthropic(messages: LlmMessage[], options: LlmOptions): Promise<LlmResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const config = getAiConfig();
  const model = options.model || config.model;

  // Extract system message
  const systemMessage = messages.find((m) => m.role === "system")?.content || "";
  const nonSystemMessages = messages.filter((m) => m.role !== "system");

  const body: Record<string, unknown> = {
    model,
    max_tokens: options.maxTokens || config.maxTokens,
    temperature: options.temperature ?? config.temperature,
    system: systemMessage,
    messages: nonSystemMessages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  };

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${error}`);
  }

  const data = await response.json();

  return {
    content: data.content[0]?.text || "",
    model: data.model,
    usage: {
      promptTokens: data.usage?.input_tokens || 0,
      completionTokens: data.usage?.output_tokens || 0,
      totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    },
    finishReason: data.stop_reason || "end_turn",
  };
}

async function callGoogle(messages: LlmMessage[], options: LlmOptions): Promise<LlmResponse> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");

  const config = getAiConfig();
  const model = options.model || config.model;

  // Convert messages to Gemini format
  const systemInstruction = messages.find((m) => m.role === "system")?.content;
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      maxOutputTokens: options.maxTokens || config.maxTokens,
      temperature: options.temperature ?? config.temperature,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  if (options.jsonMode) {
    (body.generationConfig as Record<string, unknown>).responseMimeType = "application/json";
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google AI API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];

  return {
    content: candidate?.content?.parts?.[0]?.text || "",
    model,
    usage: {
      promptTokens: data.usageMetadata?.promptTokenCount || 0,
      completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: data.usageMetadata?.totalTokenCount || 0,
    },
    finishReason: candidate?.finishReason || "STOP",
  };
}

/**
 * Main LLM completion function.
 * Routes to the configured provider automatically.
 */
export async function llmComplete(messages: LlmMessage[], options: LlmOptions = {}): Promise<LlmResponse> {
  const config = getAiConfig();

  switch (config.provider) {
    case "openai":
      return callOpenAI(messages, options);
    case "anthropic":
      return callAnthropic(messages, options);
    case "google":
      return callGoogle(messages, options);
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }
}

/**
 * Convenience: single prompt completion
 */
export async function llmPrompt(
  systemPrompt: string,
  userPrompt: string,
  options: LlmOptions = {}
): Promise<string> {
  const response = await llmComplete(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    options
  );
  return response.content;
}

/**
 * Convenience: JSON completion (parses response as JSON)
 */
export async function llmJson<T = unknown>(
  systemPrompt: string,
  userPrompt: string,
  options: LlmOptions = {}
): Promise<T> {
  const response = await llmComplete(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { ...options, jsonMode: true }
  );

  try {
    return JSON.parse(response.content) as T;
  } catch {
    // Try to extract JSON from the response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    throw new Error(`Failed to parse LLM response as JSON: ${response.content.slice(0, 200)}`);
  }
}
