// 端侧推理实时指标：从 onToken 到达时刻序列(无需改原生)计算 tok/s 与 TTFT。
// HUD 每次收到新 token 时，把累计的到达时刻数组连同请求起始时刻传入即可。

export interface InferenceStats {
  /** 已生成 token 数。 */
  tokens: number;
  /** 首 token 延迟(ms)；尚无 token 时为 null。 */
  ttftMs: number | null;
  /** 解码阶段速度(tok/s)，排除首 token 的 prefill 段；不足 2 token 时为 0。 */
  tokensPerSec: number;
}

export function computeInferenceStats(
  tokenTimestamps: number[],
  startedAt: number,
): InferenceStats {
  const tokens = tokenTimestamps.length;
  if (tokens === 0) {
    return { tokens: 0, ttftMs: null, tokensPerSec: 0 };
  }
  const ttftMs = tokenTimestamps[0] - startedAt;
  const decodeMs = tokenTimestamps[tokens - 1] - tokenTimestamps[0];
  const tokensPerSec = decodeMs > 0 ? ((tokens - 1) / decodeMs) * 1000 : 0;
  return { tokens, ttftMs, tokensPerSec };
}
