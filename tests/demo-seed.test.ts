import { describe, expect, it } from "vitest";

import { buildDemoAssignments, buildDemoSchedule } from "@/lib/demo-seed";
import { getWeekNumber, parseSchedule } from "@/lib/schedule/schedule";

// 演示种子数据(课表/作业)。日期相对传入的 now 动态生成，测试用固定 now 保证确定性。
describe("buildDemoSchedule", () => {
  const now = new Date("2026-06-17T10:00:00"); // 任意一天

  it("产出能被 parseSchedule 接受的合法课表(有 meta.week1_monday + 课程)", () => {
    const s = buildDemoSchedule(now);
    expect(() => parseSchedule(s)).not.toThrow();
    expect(s.courses.length).toBeGreaterThan(0);
  });

  it("week1_monday = 当周周一，使当天落在第 1 周(保证录制当周一定有课)", () => {
    const s = buildDemoSchedule(now);
    expect(getWeekNumber(now, s.meta.week1_monday)).toBe(1);
  });

  it("课程都排在工作日(周一~周五)", () => {
    const s = buildDemoSchedule(now);
    for (const c of s.courses) {
      expect(c.weekday).toBeGreaterThanOrEqual(1);
      expect(c.weekday).toBeLessThanOrEqual(5);
    }
  });
});

describe("buildDemoAssignments", () => {
  const now = new Date("2026-06-17T10:00:00");

  it("含多条未完成的近期作业 + 至少一条已完成", () => {
    const a = buildDemoAssignments(now);
    expect(a.length).toBeGreaterThanOrEqual(3);
    expect(a.some((x) => !x.done)).toBe(true);
    expect(a.some((x) => x.done && x.completedAt)).toBe(true);
  });

  it("每条作业字段齐全(id/subject/title/deadline)", () => {
    for (const x of buildDemoAssignments(now)) {
      expect(x.id).toBeTruthy();
      expect(x.subject).toBeTruthy();
      expect(x.title).toBeTruthy();
      expect(typeof x.deadline).toBe("string");
    }
  });
});
