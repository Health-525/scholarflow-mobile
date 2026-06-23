// 端侧 Qwen3 原始输出清洗：剥掉 <eop> 结束 token，并把 <think>…</think>
// 思维链与最终答案拆开，避免直接泄漏到聊天气泡。
// 纯函数，对「累积文本」调用即可（流式每次传当前全量，终值传完整串）。

export interface ParsedOutput {
  /** 思维链内容；无 / 为空时为 null。 */
  thinking: string | null;
  /** 给用户看的最终答案（流式且思考未完成时为空串）。 */
  answer: string;
}

const THINK_OPEN = "<think>";
const THINK_CLOSE = "</think>";
const SPECIAL_TOKENS = /<eop>/g;

export function parseModelOutput(raw: string): ParsedOutput {
  const cleaned = raw.replace(SPECIAL_TOKENS, "");

  const open = cleaned.indexOf(THINK_OPEN);
  if (open === -1) {
    return { thinking: null, answer: cleaned.trim() };
  }

  const afterOpen = cleaned.slice(open + THINK_OPEN.length);
  const close = afterOpen.indexOf(THINK_CLOSE);

  // 思考还没闭合（流式中途）：答案尚未开始。
  if (close === -1) {
    const thinking = afterOpen.trim();
    return { thinking: thinking || null, answer: "" };
  }

  const thinking = afterOpen.slice(0, close).trim();
  const before = cleaned.slice(0, open);
  const after = afterOpen.slice(close + THINK_CLOSE.length);
  return { thinking: thinking || null, answer: (before + after).trim() };
}
