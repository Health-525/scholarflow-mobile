import { describe, expect, it } from "vitest";

import { computeInferenceStats } from "@/lib/chat/inference-stats";

// 从「每个 token 的到达时刻(ms) + 请求起始时刻」算端侧推理指标：
// token 数、首 token 延迟(TTFT)、解码阶段 tok/s。纯函数，传入显式时间戳便于确定性测试。
describe("computeInferenceStats", () => {
  it("无 token：tokens 0、ttft 为 null、tok/s 为 0", () => {
    const s = computeInferenceStats([], 0);
    expect(s.tokens).toBe(0);
    expect(s.ttftMs).toBeNull();
    expect(s.tokensPerSec).toBe(0);
  });

  it("TTFT = 首 token 到达时刻 − 起始时刻", () => {
    const s = computeInferenceStats([320, 360, 400], 100);
    expect(s.ttftMs).toBe(220);
  });

  it("解码 tok/s = 解码窗口内 (N-1) token / 耗时", () => {
    // 起始0；5 token 落在 100,200,300,400,500ms。解码窗 100→500=400ms，解码 4 个 → 10 tok/s
    const s = computeInferenceStats([100, 200, 300, 400, 500], 0);
    expect(s.tokens).toBe(5);
    expect(s.tokensPerSec).toBeCloseTo(10, 5);
  });

  it("单 token：无解码窗口，tok/s 为 0，但 ttft 有效", () => {
    const s = computeInferenceStats([150], 0);
    expect(s.tokens).toBe(1);
    expect(s.ttftMs).toBe(150);
    expect(s.tokensPerSec).toBe(0);
  });
});
