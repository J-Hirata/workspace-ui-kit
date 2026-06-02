import { describe, it, expect } from "vitest";

import {
  buildBreadcrumb,
  canDeleteFolder,
} from "@/lib/materials/indexedDbStore";
import type { MaterialState } from "@/lib/materials/types";

describe("material tree helpers", () => {
  it("buildBreadcrumb はルートから現在フォルダまでの連鎖を返す", () => {
    const folders = [
      { id: "a", parentId: null, name: "資料" },
      { id: "b", parentId: "a", name: "HTML案" },
    ];
    const chain = buildBreadcrumb(folders, "b");
    expect(chain.map((c) => c.name)).toEqual(["ルート", "資料", "HTML案"]);
  });

  it("canDeleteFolder は子フォルダまたはファイルがあると false", () => {
    const state: MaterialState = {
      folders: [
        { id: "p", parentId: null, name: "親" },
        { id: "c", parentId: "p", name: "子" },
      ],
      files: [],
    };
    expect(canDeleteFolder("p", state)).toBe(false);
    expect(canDeleteFolder("c", state)).toBe(true);
  });

  it("canDeleteFolder はファイル直下で false", () => {
    const state: MaterialState = {
      folders: [{ id: "p", parentId: null, name: "親" }],
      files: [
        {
          id: "f1",
          folderId: "p",
          name: "a.html",
          mimeType: "text/html",
          sizeBytes: 10,
          updatedAt: "",
        },
      ],
    };
    expect(canDeleteFolder("p", state)).toBe(false);
  });
});
