import { describe, it, expect } from "vitest";

describe("workspace-ui-kit smoke tests", () => {
  // モジュールimportは全スイート並列実行時にマシン負荷で5秒を超えることが
  // あるため、スモークテストとして余裕を持たせる
  it("page module can be imported", { timeout: 30_000 }, async () => {
    const mod = await import("../app/page");
    expect(mod).toBeDefined();
  });
});
