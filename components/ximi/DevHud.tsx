"use client";

import { useEffect, useState } from "react";

import type { InferenceStats } from "@/lib/chat/inference-stats";

interface DevHudProps {
  stats: InferenceStats | null;
  /** 端侧实际加载的模型标签。 */
  modelName?: string;
}

/**
 * 端侧推理「读数层」浮层：实时显示 tok/s / 首token / token 数 / 网络。
 *
 * ⚠️ 定位：这是**可读的 HUD，不是证据本身**。真正的硬证据是引擎自身打印的
 * 原始日志(Xcode / Console)＋飞行模式(OS 级)。录像时让日志里的 tok/s 与本
 * HUD 对上即可互证。所有数值均**实时计算(会自然抖动)，非写死**。
 */
export function DevHud({ stats, modelName = "Qwen3-0.6B" }: DevHudProps) {
  const [online, setOnline] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!stats) return null;

  const tps = stats.tokensPerSec > 0 ? stats.tokensPerSec.toFixed(1) : "—";

  return (
    <button
      type="button"
      onClick={() => setCollapsed((v) => !v)}
      aria-label="端侧推理实时指标"
      className="fixed right-2 top-2 z-30 rounded-lg border border-emerald-400/30 bg-black/80 px-2.5 py-1.5 text-left font-mono text-[11px] leading-tight text-emerald-300 shadow-lg backdrop-blur-sm"
    >
      {collapsed ? (
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          {tps} tok/s
        </span>
      ) : (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            端侧推理 · MNN
          </div>
          <div className="text-emerald-300/80">模型 {modelName} · 本地</div>
          <div>
            速度 <span className="text-emerald-200">{tps}</span> tok/s
          </div>
          <div className="text-emerald-300/80">
            首token {stats.ttftMs != null ? `${Math.round(stats.ttftMs)} ms` : "—"}
            {" · "}
            {stats.tokens} tok
          </div>
          <div className={online ? "text-amber-300/80" : "text-emerald-200"}>
            网络 {online ? "在线" : "离线 ✈️"}
          </div>
        </div>
      )}
    </button>
  );
}

export default DevHud;
