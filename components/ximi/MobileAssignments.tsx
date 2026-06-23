"use client";

import { AlertCircle, CalendarDays, CheckCircle2, ChevronDown, ClipboardList, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { QuickCaptureForm } from "@/app/assignments/components";
import { Mascot } from "@/components/ximi/Mascot";
import { useAssignmentsQuery, useScheduleQuery } from "@/hooks/useQueries";
import type { Assignment } from "@/types";

type Filter = "all" | "pending" | "today" | "overdue" | "completed";

/** 科目色块 — 与 MobileHome 的 chip 配色保持一致。 */
const CHIP = [
  "bg-tertiary-container/50 text-on-tertiary-container",
  "bg-secondary-container/60 text-on-secondary-container",
  "bg-primary-container/50 text-on-primary-container",
];

function chipClass(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return CHIP[h % CHIP.length];
}

type Cls = "overdue" | "today" | "future" | "done";
function classify(a: Assignment, now: number): Cls {
  if (a.done) return "done";
  if (!a.deadline) return "future";
  const ms = new Date(a.deadline).getTime() - now;
  if (ms < 0) return "overdue";
  if (ms < 86400000) return "today";
  return "future";
}

function whenLabel(a: Assignment, now: number): { text: string; danger: boolean } {
  const c = classify(a, now);
  if (c === "overdue") return { text: "已逾期", danger: true };
  if (!a.deadline) return { text: "无截止", danger: false };
  const diff = Math.ceil((new Date(a.deadline).getTime() - now) / 86400000);
  if (diff <= 0) return { text: "今天截止", danger: true };
  if (diff === 1) return { text: "明天截止", danger: false };
  return { text: `${diff} 天后`, danger: false };
}

/** 萌系数据格 — 可点击切换筛选,复用 MobileMore 的 StatCell 视觉。 */
function StatCell({
  icon: Icon,
  label,
  value,
  tone,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-center gap-1 rounded-2xl p-3 text-center transition active:scale-95 ${
        active ? "bg-primary-container/60 ring-2 ring-primary/40" : "bg-surface-container-low"
      }`}
    >
      <Icon className={`h-4 w-4 ${tone}`} />
      <span className={`text-[22px] font-bold leading-tight tabular-nums ${tone}`}>{value}</span>
      <span className="text-[11px] font-semibold text-on-surface-variant">{label}</span>
    </button>
  );
}

/** 单条作业 — 萌系卡片,点圆圈打勾、右侧删除。 */
function Row({
  a,
  now,
  onMarkDone,
  onDelete,
}: {
  a: Assignment;
  now: number;
  onMarkDone: (id: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}) {
  const when = whenLabel(a, now);
  return (
    <div className="flex items-start gap-3 rounded-3xl border border-transparent bg-surface p-3.5 transition-colors">
      <button
        type="button"
        onClick={() => onMarkDone(a.id)}
        aria-label={a.done ? "标记为未完成" : "标记为已完成"}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition active:scale-90 ${
          a.done ? "border-primary bg-primary text-primary-foreground" : "border-outline"
        }`}
      >
        {a.done && <CheckCircle2 className="h-4 w-4" />}
      </button>
      <div className="min-w-0 flex-1">
        <h3
          className={`truncate text-[15px] font-semibold ${
            a.done ? "text-on-surface-variant line-through" : "text-on-surface"
          }`}
        >
          {a.title}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${chipClass(a.subject || "")}`}>
            {a.subject || "作业"}
          </span>
          {!a.done && (
            <span
              className={`text-[12px] font-semibold ${when.danger ? "text-error" : "text-on-surface-variant"}`}
            >
              {when.text}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDelete(a.id)}
        aria-label="删除作业"
        className="shrink-0 rounded-full p-1.5 text-on-surface-variant/60 transition hover:bg-error-container/30 hover:text-error active:scale-90"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * 移动端萌系「作业」— 与首页/课表/更多同一套小咪皮肤(标题/卡片/间距/配色),
 * 复用 useAssignmentsQuery 全部逻辑(增删改 / 持久化)与 QuickCaptureForm 表单。
 * 仅移动端显示;桌面端走 app/assignments/page.tsx 的原版。
 */
export function MobileAssignments() {
  const { assignments, isLoading, error, add, markDone, delete: del, reload } = useAssignmentsQuery();
  const { data: scheduleData } = useScheduleQuery();
  const [filter, setFilter] = useState<Filter>("all");
  const [showDone, setShowDone] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const subjects = useMemo(() => {
    const titles = scheduleData?.schedule?.courses?.map((c: { title: string }) => c.title) ?? [];
    return Array.from(new Set(titles)).filter((s): s is string => Boolean(s)).sort();
  }, [scheduleData]);

  const now = Date.now();
  const stats = useMemo(() => {
    let pending = 0, today = 0, overdue = 0, completed = 0;
    for (const a of assignments) {
      const c = classify(a, now);
      if (c === "done") completed++;
      else { pending++; if (c === "today") today++; if (c === "overdue") overdue++; }
    }
    return { pending, today, overdue, completed };
  }, [assignments, now]);

  // 待完成按紧急度排序(逾期→今天→将来),已完成单列。
  const { pending, done } = useMemo(() => {
    const order: Record<Cls, number> = { overdue: 0, today: 1, future: 2, done: 3 };
    const p = assignments.filter((a) => !a.done).sort((x, y) => order[classify(x, now)] - order[classify(y, now)]);
    const d = assignments.filter((a) => a.done);
    return { pending: p, done: d };
  }, [assignments, now]);

  // 当前筛选要展示的列表。
  const filtered = useMemo(() => {
    switch (filter) {
      case "pending": return pending;
      case "today": return pending.filter((a) => classify(a, now) === "today");
      case "overdue": return pending.filter((a) => classify(a, now) === "overdue");
      case "completed": return done;
      default: return pending;
    }
  }, [filter, pending, done, now]);

  const toggleFilter = (f: Filter) => setFilter((cur) => (cur === f ? "all" : f));
  const filterLabel: Record<Exclude<Filter, "all">, string> = {
    pending: "待完成", today: "今天截止", overdue: "已逾期", completed: "已完成",
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 pb-24 pt-3 md:hidden">
      {/* 标题 */}
      <div className="px-1">
        <h1 className="text-[24px] font-bold text-primary">作业</h1>
        <p className="text-[13px] text-on-surface-variant">
          {stats.pending === 0 ? "全部作业都完成啦，给小咪点个赞~" : `还剩 ${stats.pending} 项待完成，和小咪一起搞定~`}
        </p>
      </div>

      {/* 骨架 */}
      {(!mounted || isLoading) && (
        <div className="flex flex-col gap-3">
          <div className="skeleton h-24 rounded-[28px]" />
          <div className="skeleton h-16 rounded-3xl" />
          <div className="skeleton h-16 rounded-3xl" />
        </div>
      )}

      {mounted && error && !isLoading && (
        <button
          onClick={reload}
          className="rounded-[28px] bg-surface-container-lowest px-4 py-8 text-[14px] text-on-surface-variant"
        >
          作业加载失败，点击重试
        </button>
      )}

      {mounted && !isLoading && !error && (
        <>
          {/* 数据格(可筛选) */}
          <div className="grid grid-cols-4 gap-2.5">
            <StatCell icon={ClipboardList} label="待完成" value={stats.pending} tone="text-primary"
              active={filter === "pending"} onClick={() => toggleFilter("pending")} />
            <StatCell icon={CalendarDays} label="今天" value={stats.today}
              tone={stats.today > 0 ? "text-tertiary" : "text-primary"}
              active={filter === "today"} onClick={() => toggleFilter("today")} />
            <StatCell icon={AlertCircle} label="逾期" value={stats.overdue}
              tone={stats.overdue > 0 ? "text-error" : "text-primary"}
              active={filter === "overdue"} onClick={() => toggleFilter("overdue")} />
            <StatCell icon={CheckCircle2} label="已完成" value={stats.completed} tone="text-secondary"
              active={filter === "completed"} onClick={() => toggleFilter("completed")} />
          </div>

          {/* 快速添加(复用桌面表单,token 自动萌化) */}
          <QuickCaptureForm subjects={subjects} onAdd={add} />

          {/* 列表 */}
          {assignments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-[28px] bg-surface-container-lowest py-10">
              <Mascot size="md" />
              <p className="text-[14px] font-medium text-on-surface">还没有作业</p>
              <p className="text-[12px] text-on-surface-variant">在上方添加第一项，开始规划吧~</p>
            </div>
          ) : filter === "all" ? (
            <div className="flex flex-col gap-4">
              {/* 待完成 */}
              <section className="rounded-[28px] bg-surface-container-lowest p-4 shadow-[0_20px_40px_-20px_rgba(var(--ximi-glow),0.25)]">
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className="text-[14px] font-bold text-on-surface">待完成</span>
                  <span className="text-[12px] font-semibold text-on-surface-variant">{pending.length} 项</span>
                </div>
                {pending.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-6">
                    <Mascot size="md" />
                    <p className="text-[14px] text-on-surface-variant">待办都清空啦，放松一下~</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {pending.map((a) => (
                      <Row key={a.id} a={a} now={now} onMarkDone={markDone} onDelete={del} />
                    ))}
                  </div>
                )}
              </section>

              {/* 已完成(可折叠) */}
              {done.length > 0 && (
                <section className="rounded-[28px] bg-surface-container-lowest p-4 shadow-[0_20px_40px_-20px_rgba(var(--ximi-glow),0.25)]">
                  <button
                    type="button"
                    onClick={() => setShowDone((v) => !v)}
                    className="flex w-full items-center justify-between px-1"
                  >
                    <span className="text-[14px] font-bold text-on-surface-variant">已完成</span>
                    <span className="flex items-center gap-2 text-[12px] font-semibold text-on-surface-variant">
                      {done.length} 项
                      <ChevronDown className={`h-4 w-4 transition-transform ${showDone ? "rotate-180" : ""}`} />
                    </span>
                  </button>
                  {showDone && (
                    <div className="mt-3 flex flex-col gap-3">
                      {done.map((a) => (
                        <Row key={a.id} a={a} now={now} onMarkDone={markDone} onDelete={del} />
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>
          ) : (
            /* 筛选态:单组 */
            <section className="rounded-[28px] bg-surface-container-lowest p-4 shadow-[0_20px_40px_-20px_rgba(var(--ximi-glow),0.25)]">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="flex items-center gap-2 text-[14px] font-bold text-on-surface">
                  {filterLabel[filter]}
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant active:scale-95"
                  >
                    清除筛选
                  </button>
                </span>
                <span className="text-[12px] font-semibold text-on-surface-variant">{filtered.length} 项</span>
              </div>
              {filtered.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-on-surface-variant">没有符合条件的作业</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {filtered.map((a) => (
                    <Row key={a.id} a={a} now={now} onMarkDone={markDone} onDelete={del} />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default MobileAssignments;
