"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { parseModelOutput } from "@/lib/chat/output-parser";

interface ReasoningBubbleProps {
  /** 助手原始输出（可能含 <think>…</think> 思维链与 <eop> 结束 token）。 */
  content: string;
  /** 思考用时（秒）；有值时头部显示「用时 X 秒」。 */
  thinkingSeconds?: number;
  /** 是否流式中（用于"思考中…"态与流式光标）。 */
  streaming?: boolean;
}

/**
 * 助手气泡内容：把端侧 Qwen3 的思维链与最终答案拆开展示。
 *
 * 「推理输入输出」是赛项考察点 → 思维链**默认常显**（参考豆包"已思考"样式）：
 * 顶部一行「已思考（用时 X 秒）」+ 折叠箭头，下方用左竖线灰字呈现推理过程，
 * 再下面才是给用户看的最终答案。<eop> 等特殊 token 已在 parseModelOutput 中剥除。
 */
export function ReasoningBubble({
  content,
  thinkingSeconds,
  streaming,
}: ReasoningBubbleProps) {
  const { thinking, answer } = parseModelOutput(content);
  const thinkingDone = answer !== "" || !streaming;
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="min-w-0">
      {thinking && (
        <div className="mb-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-start gap-1.5 text-[12px] font-medium leading-5 text-on-surface-variant/80 transition active:scale-[0.98]"
          >
            {thinkingDone ? (
              <span>
                已思考
                {typeof thinkingSeconds === "number"
                  ? `（用时 ${Math.max(1, Math.round(thinkingSeconds))} 秒）`
                  : ""}
              </span>
            ) : (
              <span className="inline-flex items-center">
                小咪思考中
                <span className="ml-0.5 inline-flex">
                  <span className="animate-bounce [animation-delay:0s]">.</span>
                  <span className="animate-bounce [animation-delay:0.15s]">.</span>
                  <span className="animate-bounce [animation-delay:0.3s]">.</span>
                </span>
              </span>
            )}
            <ChevronDown
              className={`mt-0.5 h-3.5 w-3.5 shrink-0 transition-transform ${expanded ? "" : "-rotate-90"}`}
            />
          </button>

          {expanded && (
            <div className="mt-1.5 space-y-2 border-l-2 border-outline-variant/40 pl-3">
              {thinking.split(/\n{2,}/).map((para, i, arr) => (
                <p
                  key={i}
                  className="whitespace-pre-wrap break-words text-[13px] leading-6 text-on-surface-variant/90"
                >
                  {para.trim()}
                  {streaming && !thinkingDone && i === arr.length - 1 && (
                    <span className="ml-0.5 inline-block h-3.5 w-1 animate-pulse bg-primary/50 align-middle" />
                  )}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {answer && (
        <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-on-surface">
          {answer}
          {streaming && (
            <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-primary/60 align-middle" />
          )}
        </p>
      )}

      {/* 刚开始、思维链与答案都还没出来：挂一个光标占位 */}
      {streaming && !thinking && !answer && (
        <span className="inline-block h-4 w-1.5 animate-pulse bg-primary/60 align-middle" />
      )}
    </div>
  );
}

export default ReasoningBubble;
