"use client";

import { useEffect, type ReactNode } from "react";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { GlobalSearch } from "@/components/ui/GlobalSearch";
import { KeyboardOverlay } from "@/components/ui/KeyboardOverlay";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { UpdateNotification } from "@/components/ui/UpdateNotification";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { NotificationActivator } from "@/hooks/useNotifications";
import { semanticBg, semanticBorder, semanticColor } from "@/lib/theme-colors";

import { BottomNav } from "./BottomNav";
import { CuteTopBar } from "./CuteTopBar";
import { SideNav } from "./SideNav";

interface AppShellProps {
  children: ReactNode;
  isOnline?: boolean;
}

function ShortcutActivator() {
  useKeyboardShortcuts();
  return null;
}

/**
 * 移动端:任意输入框(input/textarea/select/可编辑)聚焦、软键盘弹起时,给 <html> 打
 * data-keyboard-open;CSS 据此隐藏底部导航。否则 iOS WebView 会压缩视口,把 fixed 的
 * 底部导航顶上来"跳动"。原先仅聊天页用 data-chat-input-focused 处理,这里统一覆盖全部页面。
 */
function KeyboardNavHider() {
  useEffect(() => {
    const isField = (el: Element | null) =>
      !!el &&
      (el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.tagName === "SELECT" ||
        (el as HTMLElement).isContentEditable);
    const root = document.documentElement;
    const onFocusIn = (e: FocusEvent) => {
      if (isField(e.target as Element | null)) {
        root.setAttribute("data-keyboard-open", "true");
      }
    };
    const onFocusOut = () => {
      // 延后一拍:在两个输入框之间切换焦点时不要误判键盘已收起。
      window.setTimeout(() => {
        if (!isField(document.activeElement)) {
          root.removeAttribute("data-keyboard-open");
        }
      }, 0);
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      root.removeAttribute("data-keyboard-open");
    };
  }, []);
  return null;
}

export function AppShell({ children, isOnline }: AppShellProps) {
  const online = isOnline ?? true;

  return (
    <div className="relative flex min-h-screen bg-background">
      <SideNav />
      <div className="relative z-[1] flex-1 flex flex-col h-screen min-w-0">
        {/* 拖拽条 — Electron 窗口拖拽区域，固定不动 */}
        <div
          className="h-[36px] shrink-0 flex items-center px-4 bg-background sticky top-0 z-10"
          style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        >
          {/* 窗口控制按钮区域 — 不拖拽 */}
          <div style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties} className="flex-1" />
        </div>
        <CuteTopBar />
        {!online && (
          <div
            className="px-4 py-2.5 flex items-center justify-center gap-2 text-[12px] font-medium border-b animate-fade-in sticky top-[36px] z-10"
            style={{ backgroundColor: semanticBg("warning"), color: semanticColor("warning"), borderBottomColor: semanticBorder("warning") }}
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728M12 12h.01" />
            </svg>
            网络连接已断开，离线数据仍可浏览
          </div>
        )}
        <main className="relative flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:px-8 md:pb-0 lg:px-10 animate-page">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
      <BottomNav />
      <NotificationActivator />
      <ShortcutActivator />
      <KeyboardNavHider />
      <UpdateNotification />
      <KeyboardOverlay />
      <GlobalSearch />
      <ToastContainer />
    </div>
  );
}

export default AppShell;
