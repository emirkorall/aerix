import { describe, it, expect } from "vitest";
import { recommendNextPack } from "./packProgress";
import type { PackProgressMap } from "./packProgress";
import type { TrainingPack } from "./trainingPacks";

const MOCK_PACKS: TrainingPack[] = [
  {
    id: "pack-a",
    title: "Pack A",
    description: "",
    levelTag: "",
    planAccess: "starter",
    drills: [
      { id: "d1", slug: "d1", title: "", goals: [], videoId: "", creator: "", section: "Mechanics", tags: [] },
      { id: "d2", slug: "d2", title: "", goals: [], videoId: "", creator: "", section: "Mechanics", tags: [] },
    ],
  },
  {
    id: "pack-b",
    title: "Pack B",
    description: "",
    levelTag: "",
    planAccess: "pro",
    drills: [
      { id: "d3", slug: "d3", title: "", goals: [], videoId: "", creator: "", section: "Mechanics", tags: [] },
    ],
  },
];

describe("recommendNextPack", () => {
  it("prioritizes in-progress pack over not-started", () => {
    const progress: PackProgressMap = {
      "pack-a": {
        completedDrillIds: ["d1"],
        lastStartedAt: "2024-01-01T00:00:00Z",
      },
    };
    const result = recommendNextPack(MOCK_PACKS, progress);
    expect(result?.id).toBe("pack-a");
  });

  it("falls back to first incomplete pack when none in-progress", () => {
    const progress: PackProgressMap = {
      "pack-a": {
        completedDrillIds: ["d1", "d2"],
        lastStartedAt: "2024-01-01T00:00:00Z",
      },
    };
    // pack-a completed, pack-b not started → recommend pack-b
    const result = recommendNextPack(MOCK_PACKS, progress);
    expect(result?.id).toBe("pack-b");
  });
});
