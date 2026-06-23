"use client";

import {
  ClipboardCheck,
  FileText,
  Info,
  Lightbulb,
  ListChecks,
  Plus,
  Send,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { DevHud } from "@/components/ximi/DevHud";
import { Mascot } from "@/components/ximi/Mascot";
import { ReasoningBubble } from "@/components/ximi/ReasoningBubble";
import { useChat } from "@/hooks/useChat";

const GREETING = "喵~ 我是你的学习伙伴小咪，今天想学点什么呀？🐾";

/** 快捷动作 — 对齐 mockup_3 的 2 列网格,点击预填输入框(复用桌面端 chip 行为) */
const QUICK_ACTIONS: {
  label: string;
  prompt: string;
  icon: LucideIcon;
  tint: string;
}[] = [
  {
    label: "整理课堂笔记",
    prompt: "帮我整理课堂笔记",
    icon: FileText,
    tint: "bg-primary-container/30 text-on-primary-container border-primary-container/50",
  },
  {
    label: "生成知识小测",
    prompt: "帮我生成一份知识小测",
    icon: ListChecks,
    tint: "bg-secondary-container/30 text-on-secondary-container border-secondary-container/50",
  },
  {
    label: "检查课后作业",
    prompt: "帮我检查课后作业",
    icon: ClipboardCheck,
    tint: "bg-tertiary-container/30 text-on-tertiary-container border-tertiary-container/50",
  },
  {
    label: "帮我写论文大纲",
    prompt: "帮我写一份论文大纲",
    icon: Lightbulb,
    tint: "bg-surface-container-highest text-on-surface-variant border-outline-variant/50",
  },
];

/** 小咪头像 — 玻璃边框圆形,放在助手气泡左侧 */
function CatAvatar() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-full border-2 border-white bg-surface-container shadow-sm">
      <Mascot size="xs" eager className="!drop-shadow-none" />
    </span>
  );
}

/**
 * 移动端萌系 AI 助手 — 高保真还原「小咪」mockup_3:
 * 玻璃气泡、小咪头像、快捷动作网格、胶囊输入栏、三点输入指示。
 * 复用 useChat() 全部逻辑(消息 / 流式 / Ollama 状态 / 持久化),
 * 仅移动端显示;桌面端原版 ChatPage 保持不变。
 */
export function MobileChat() {
  const [inputFocused, setInputFocused] = useState(false);
  const composerRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    input,
    setInput,
    loading,
    streamingContent,
    inferenceStats,
    mounted,
    ready,
    isNative,
    modelPhase,
    modelError,
    reloadModel,
    selectedModel,
    messagesEndRef,
    inputRef,
    sendMessage,
    handleKeyDown,
  } = useChat();

  // 键盘打开时 iOS WebView 会压缩视口；此时不要再叠加底部导航高度。
  const inputBottom = inputFocused
    ? "calc(12px + env(safe-area-inset-bottom, 0px))"
    : "calc(72px + env(safe-area-inset-bottom, 0px))";
  // 消息区底部留白,避免末条消息和输入栏 / 键盘 / 底部导航互相遮挡
  const scrollPadBottom = inputFocused
    ? "calc(204px + env(safe-area-inset-bottom, 0px))"
    : "calc(168px + env(safe-area-inset-bottom, 0px))";

  useEffect(() => {
    const root = document.documentElement;
    if (inputFocused) {
      root.setAttribute("data-chat-input-focused", "true");
    } else {
      root.removeAttribute("data-chat-input-focused");
    }
    return () => root.removeAttribute("data-chat-input-focused");
  }, [inputFocused]);

  if (!mounted) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-3 pt-4 md:hidden">
        <div className="skeleton h-28 rounded-[28px]" />
        <div className="skeleton h-16 rounded-3xl" />
        <div className="skeleton h-16 rounded-3xl" />
      </div>
    );
  }

  const isEmpty = messages.length === 0 && !streamingContent;

  return (
    <div className="md:hidden">
      <DevHud stats={inferenceStats} />
      {/* 消息历史(可滚动) */}
      <div
        className="mx-auto flex max-w-md flex-col gap-4 pt-4"
        style={{ paddingBottom: scrollPadBottom }}
      >
        {/* 后端未就绪提示 — 萌系、诚实；原生=端侧模型加载，Web=Ollama */}
        {!ready &&
          (isNative ? (
            modelPhase === "error" ? (
              <div className="flex items-start gap-3 rounded-[24px] border-[1.5px] border-white/60 bg-surface-container-lowest p-4 shadow-[0_10px_30px_-10px_rgba(var(--ximi-glow),0.3)]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-surface-container">
                  <Mascot size="xs" eager className="!drop-shadow-none" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold leading-6 text-on-surface">
                    小咪没能唤醒本地大脑
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-on-surface-variant">
                    {modelError ?? "本地模型加载失败"}
                  </p>
                  <button
                    type="button"
                    onClick={reloadModel}
                    className="mt-2 rounded-full bg-primary-container px-4 py-1.5 text-[12px] font-semibold text-on-primary-container transition active:scale-95"
                  >
                    重试加载
                  </button>
                </div>
              </div>
            ) : (
              /* 端侧模型加载中 —— 演示视频「模型本地加载过程」拍摄点 */
              <div className="flex items-center gap-3 rounded-[24px] border-[1.5px] border-white/60 bg-surface-container-lowest p-4 shadow-[0_10px_30px_-10px_rgba(var(--ximi-glow),0.3)]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-surface-container">
                  <Mascot size="xs" eager className="!drop-shadow-none" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold leading-6 text-on-surface">
                    小咪正在唤醒本地大脑…🧠
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-on-surface-variant">
                    首次在手机本地加载模型，稍等一下下~（全程离线、不联网）
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 self-center">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40 [animation-delay:0s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:0.2s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/80 [animation-delay:0.4s]" />
                </span>
              </div>
            )
          ) : (
            <div className="flex items-start gap-3 rounded-[24px] border-[1.5px] border-white/60 bg-surface-container-lowest p-4 shadow-[0_10px_30px_-10px_rgba(var(--ximi-glow),0.3)]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-surface-container">
                <Mascot size="xs" eager className="!drop-shadow-none" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold leading-6 text-on-surface">
                  小咪还没连上大脑（Ollama 离线）
                </p>
                <p className="mt-1 text-[12px] leading-5 text-on-surface-variant">
                  先启动{" "}
                  <code className="rounded bg-surface-container px-1.5 py-0.5 text-[11px] text-on-surface">
                    ollama serve
                  </code>
                  ，再拉取模型{" "}
                  <code className="rounded bg-surface-container px-1.5 py-0.5 text-[11px] text-on-surface">
                    ollama pull qwen2.5
                  </code>
                  ，小咪就能陪你学啦~
                </p>
              </div>
            </div>
          ))}

        {isEmpty ? (
          /* 空状态:问候气泡 + 快捷动作网格 */
          <div className="flex max-w-[88%] gap-2">
            <CatAvatar />
            <div className="min-w-0 rounded-2xl rounded-bl-sm border-[1.5px] border-white/50 bg-surface-container-lowest p-4 text-on-surface shadow-[0_10px_30px_-10px_rgba(var(--ximi-glow),0.3)]">
              <p className="text-[15px] leading-7">{GREETING}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map(({ label, prompt, icon: Icon, tint }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setInput(prompt);
                      inputRef.current?.focus();
                    }}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-left transition active:scale-95 ${tint}`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="text-[12px] font-semibold leading-5">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) =>
              msg.role === "user" ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-primary-foreground shadow-[0_8px_20px_-8px_rgba(var(--primary-rgb),0.5)]">
                    <p className="whitespace-pre-wrap break-words text-[15px] leading-7">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex max-w-[88%] gap-2">
                  <CatAvatar />
                  <div className="min-w-0 rounded-2xl rounded-bl-sm border-[1.5px] border-white/50 bg-surface-container-lowest px-4 py-3 text-on-surface shadow-[0_10px_30px_-10px_rgba(var(--ximi-glow),0.3)]">
                    <ReasoningBubble
                      content={msg.content}
                      thinkingSeconds={
                        msg.thinkingMs ? msg.thinkingMs / 1000 : undefined
                      }
                    />
                  </div>
                </div>
              ),
            )}

            {/* 流式回复 */}
            {loading && streamingContent && (
              <div className="flex max-w-[88%] gap-2">
                <CatAvatar />
                <div className="min-w-0 rounded-2xl rounded-bl-sm border-[1.5px] border-white/50 bg-surface-container-lowest px-4 py-3 text-on-surface shadow-[0_10px_30px_-10px_rgba(var(--ximi-glow),0.3)]">
                  <ReasoningBubble content={streamingContent} streaming />
                </div>
              </div>
            )}

            {/* 三点输入指示(暂无内容) */}
            {loading && !streamingContent && (
              <div className="flex max-w-[88%] gap-2">
                <CatAvatar />
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border-[1.5px] border-white/50 bg-surface-container-lowest px-4 py-3.5 shadow-[0_10px_30px_-10px_rgba(var(--ximi-glow),0.3)]">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40 [animation-delay:0s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:0.2s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/80 [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 胶囊输入栏(固定,浮于底部导航之上)
          必须 portal 到 body:<main> 因 animate-page 的 transform 残留(animation-fill-mode:both,
          pageEnter 末帧 translateY(0))会成为 position:fixed 的包含块,把输入栏困在 overflow-y-auto
          的滚动容器里(表现为浮到屏幕中央、消息文字穿透重叠)。portal 到 body 后 fixed 相对真实视口
          定位,与同为 fixed 的 BottomNav 行为一致。 */}
      {createPortal(
        <div
          ref={composerRef}
          className="fixed inset-x-0 z-40 px-4 transition-[bottom] duration-200 md:hidden"
          style={{ bottom: inputBottom }}
          onFocusCapture={() => setInputFocused(true)}
          onBlurCapture={() => {
            window.setTimeout(() => {
              if (!composerRef.current?.contains(document.activeElement)) {
                setInputFocused(false);
              }
            }, 0);
          }}
        >
          {/* 渐变遮罩:让向上滚动的消息在输入栏后方淡出,避免文字穿透重叠 */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 -top-8 bg-gradient-to-t from-background via-background/95 to-transparent"
          />
          <div className="relative mx-auto max-w-md">
            <div className="flex items-center gap-2 rounded-full border-[1.5px] border-white/50 bg-white/80 p-2.5 shadow-[0_8px_30px_-6px_rgba(var(--ximi-glow),0.35)] backdrop-blur-md transition focus-within:border-primary-container">
              <button
                type="button"
                aria-label="更多"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-primary-container/20 hover:text-primary active:scale-90"
              >
                <Plus className="h-6 w-6" />
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  ready
                    ? "和小咪聊聊学习吧..."
                    : isNative
                      ? modelPhase === "error"
                        ? "本地模型未就绪"
                        : "小咪正在加载本地模型…"
                      : "小咪还没连上大脑哦~"
                }
                disabled={!ready || loading}
                rows={1}
                className="hide-scrollbar min-h-[44px] max-h-32 flex-1 resize-none border-none bg-transparent px-0 py-2.5 text-[15px] leading-6 text-on-surface outline-none placeholder:text-on-surface-variant/50 disabled:opacity-60"
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = Math.min(target.scrollHeight, 120) + "px";
                }}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!input.trim() || !ready || loading}
                aria-label="发送"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container transition hover:bg-primary hover:text-primary-foreground active:scale-90 disabled:opacity-50 disabled:hover:bg-primary-container disabled:hover:text-on-primary-container"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            {ready && (
              <p className="mt-1.5 flex items-center justify-center gap-1 text-[10px] text-on-surface-variant/60">
                <Info className="h-3 w-3" />
                {isNative
                  ? "小咪在线 · 端侧模型，回答仅供参考哦"
                  : `小咪在线 · ${selectedModel}，回答仅供参考哦`}
              </p>
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

export default MobileChat;
