import { describe, expect, it } from "vitest";

import { parseModelOutput } from "@/lib/chat/output-parser";

// 端侧 Qwen3 原始输出会带 <think>…</think> 思维链与 <eop> 结束 token，
// 直接渲染会泄漏到气泡里。parseModelOutput 把原始(累积)文本拆成
// { thinking, answer } 并剥掉特殊 token；流式/终值都对同一份累积串调用。
describe("parseModelOutput", () => {
  it("纯文本无标签：thinking 为 null，answer 原样", () => {
    const r = parseModelOutput("你好！有什么可以帮你的~");
    expect(r).toEqual({ thinking: null, answer: "你好！有什么可以帮你的~" });
  });

  it("剥掉结尾的 <eop> 特殊 token", () => {
    const r = parseModelOutput("你好！<eop><eop>");
    expect(r.thinking).toBeNull();
    expect(r.answer).toBe("你好！");
  });

  it("完整 <think> 块：拆出 thinking 与 answer", () => {
    const r = parseModelOutput(
      "<think>用户在打招呼，我礼貌回应。</think>\n\n你好！很高兴见到你~",
    );
    expect(r.thinking).toBe("用户在打招呼，我礼貌回应。");
    expect(r.answer).toBe("你好！很高兴见到你~");
  });

  it("流式中途（<think> 未闭合）：thinking 为已有内容，answer 为空", () => {
    const r = parseModelOutput("<think>正在分析用户意图");
    expect(r.thinking).toBe("正在分析用户意图");
    expect(r.answer).toBe("");
  });

  it("真实 Qwen3 输出（think + 答案 + eop）：剥 eop 且正确拆分", () => {
    const raw =
      "<think>\n好的，用户回复你好。\n</think>\n\n你好！有学习问题随时问我~ 😊<eop><eop>";
    const r = parseModelOutput(raw);
    expect(r.thinking).toBe("好的，用户回复你好。");
    expect(r.answer).toBe("你好！有学习问题随时问我~ 😊");
  });

  it("空思维链（<think></think>）视为无 thinking", () => {
    const r = parseModelOutput("<think>\n\n</think>嗯，在的~");
    expect(r.thinking).toBeNull();
    expect(r.answer).toBe("嗯，在的~");
  });
});
