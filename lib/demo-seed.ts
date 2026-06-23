/**
 * 演示数据种子（仅手机端）—— 课表 + 作业。
 *
 * 用真实 schema（RawScheduleData / Assignment），日期相对传入的 now 动态生成，
 * 所以无论哪天录制，课表都落在当前周、作业 ddl 都是近几天。
 * 仅当本地为空时自动写入（seedDemoDataIfEmpty），不覆盖真实数据；
 * reseedDemoData() 强制重写（给"重置演示数据"按钮用）。
 *
 * ⚠️ 这是演示用占位数据：字段结构与真实数据完全一致、可直接编辑。
 * 注：mobile-data 走动态 import，避免把 Capacitor 拉进纯构造函数 / 单测。
 */

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function plusDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}
function mondayOfWeek(base: Date): Date {
  const d = new Date(base);
  const wd = d.getDay() || 7; // 1=Mon..7=Sun
  d.setDate(d.getDate() - (wd - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

const PERIOD_TIMES: Record<string, string> = {
  "1": "08:00-08:45", "2": "08:50-09:35", "3": "09:50-10:35", "4": "10:40-11:25",
  "5": "11:30-12:15", "6": "14:00-14:45", "7": "14:50-15:35", "8": "15:50-16:35",
  "9": "16:40-17:25", "10": "18:30-19:15", "11": "19:20-20:05", "12": "20:10-20:55",
};

/** 一周课表（CS 方向，南工大风格）。weeks 设宽，保证录制当周一定显示。演示占位、可改。 */
export function buildDemoSchedule(now: Date = new Date()) {
  return {
    meta: {
      tz: "Asia/Shanghai",
      week1_monday: ymd(mondayOfWeek(now)),
      semester: "2025-2026-2",
      schoolId: "njtech",
    },
    periodTimes: PERIOD_TIMES,
    courses: [
      { title: "高等数学(下)", weekday: 1, periods: [1, 2], weeks: "1-20", location: "教4-201", teacher: "王建国" },
      { title: "大学物理", weekday: 1, periods: [3, 4], weeks: "1-20", location: "教4-305", teacher: "李慧" },
      { title: "数据结构", weekday: 2, periods: [1, 2], weeks: "1-20", location: "计3-401", teacher: "陈明" },
      { title: "线性代数", weekday: 2, periods: [6, 7], weeks: "1-20", location: "教2-108", teacher: "赵芳" },
      { title: "操作系统", weekday: 3, periods: [3, 4], weeks: "1-20", location: "计3-502", teacher: "刘伟" },
      { title: "大学英语(四)", weekday: 3, periods: [6, 7], weeks: "1-20", location: "外1-203", teacher: "Smith" },
      { title: "概率论与数理统计", weekday: 4, periods: [1, 2], weeks: "1-20", location: "教4-201", teacher: "孙琳" },
      { title: "计算机网络", weekday: 4, periods: [8, 9], weeks: "1-20", location: "计3-401", teacher: "周强" },
      { title: "算法设计与分析", weekday: 5, periods: [3, 4], weeks: "1-20", location: "计3-505", teacher: "吴敏" },
      { title: "毛泽东思想概论", weekday: 5, periods: [6, 7], weeks: "1-20", location: "教1-101", teacher: "郑红" },
    ],
  };
}

/** 几条近期作业（含未完成 + 一条已完成）。deadline 相对 now，录制时永远是"近几天"。 */
export function buildDemoAssignments(now: Date = new Date()) {
  const iso = (d: Date) => d.toISOString();
  return [
    { id: "demo-asgn-1", subject: "数据结构", title: "实验三：二叉树的遍历与应用", deadline: iso(plusDays(now, 1)), done: false, createdAt: iso(plusDays(now, -2)) },
    { id: "demo-asgn-2", subject: "高等数学(下)", title: "习题册 第8章 重积分", deadline: iso(plusDays(now, 2)), done: false, createdAt: iso(plusDays(now, -1)) },
    { id: "demo-asgn-3", subject: "大学英语(四)", title: "Unit 5 作文：My View on AI", deadline: iso(plusDays(now, 4)), done: false, createdAt: iso(plusDays(now, -1)) },
    { id: "demo-asgn-4", subject: "操作系统", title: "读书报告：进程调度算法对比", deadline: iso(plusDays(now, 6)), done: false, createdAt: iso(now) },
    { id: "demo-asgn-5", subject: "计算机网络", title: "课后习题 第3章", deadline: iso(plusDays(now, -1)), done: true, completedAt: iso(plusDays(now, -1)), createdAt: iso(plusDays(now, -3)) },
  ];
}

/**
 * 仅手机端：本地为空时写入演示数据。force=true 强制重写（重置按钮用）。返回是否写入。
 * mobile-data 动态导入 —— 只在真机调用时才加载 Capacitor。
 */
export async function seedDemoDataIfEmpty(force = false): Promise<boolean> {
  const { readData, writeData, isNative } = await import("./mobile-data");
  if (!isNative) return false;

  let wrote = false;

  const sched = (await readData("schedule")) as { courses?: unknown[] } | null;
  if (force || !sched?.courses?.length) {
    await writeData("data/schedule.json", JSON.stringify(buildDemoSchedule(), null, 2), "演示数据·课表");
    wrote = true;
  }

  const asgn = await readData("assignments");
  const asgnCount = Array.isArray(asgn)
    ? asgn.length
    : ((asgn as { assignments?: unknown[] })?.assignments?.length ?? 0);
  if (force || asgnCount === 0) {
    await writeData("data/assignments.json", JSON.stringify(buildDemoAssignments(), null, 2), "演示数据·作业");
    wrote = true;
  }

  return wrote;
}

/** 强制重写演示数据（给"重置演示数据"按钮）。 */
export function reseedDemoData(): Promise<boolean> {
  return seedDemoDataIfEmpty(true);
}
