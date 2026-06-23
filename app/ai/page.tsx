import { MobileChat } from "@/components/ximi/MobileChat";

export default function AiPage() {
  return (
    <>
      {/* 移动端：萌系「小咪」AI 助手（端侧 MNN 本地推理聊天） */}
      <MobileChat />

      {/* 桌面端：回退视图 —— AI 助手以移动端为主 */}
      <div className="hidden md:flex max-w-5xl mx-auto min-h-[60vh] items-center justify-center px-4 py-10 animate-page">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm animate-fade-up">
          <h1 className="text-xl font-bold font-display text-foreground">小咪 AI 助手</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            端侧 Qwen3 · 全程本地推理。请在手机端体验完整的「小咪」聊天。
          </p>
        </div>
      </div>
    </>
  );
}
