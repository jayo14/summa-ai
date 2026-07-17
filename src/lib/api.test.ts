import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchAnalytics,
  fetchHexagon,
  fetchExams,
  fetchLearningProgress,
  fetchArtifacts,
  deleteArtifact,
  fetchMaterials,
  fetchConcepts,
  fetchTimelineEvents,
  fetchMemoryFacts,
  fetchMemorySummary,
  forgetMemoryTopic,
} from "@/lib/api";

vi.mock("@/lib/fastapi", () => ({
  fastapiFetch: vi.fn(),
  fastapiUrl: (path: string) => `http://localhost:8000/api/v1${path}`,
}));

import { fastapiFetch } from "@/lib/fastapi";

describe("API layer", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("fetchAnalytics returns data on success", async () => {
    const data = { hexagonDimensions: [], summary: { avgScore: 80 } };
    (fastapiFetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(data);
    const result = await fetchAnalytics("token");
    expect(result).toEqual(data);
  });

  it("fetchAnalytics returns null on error", async () => {
    (fastapiFetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("fail"));
    const result = await fetchAnalytics("token");
    expect(result).toBeNull();
  });

  it("fetchHexagon returns dimensions", async () => {
    (fastapiFetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ dimensions: [{ dimension: "Depth", score: 80 }] });
    const result = await fetchHexagon("token");
    expect(result).toEqual([{ dimension: "Depth", score: 80 }]);
  });

  it("fetchHexagon returns null when no dimensions", async () => {
    (fastapiFetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({});
    const result = await fetchHexagon("token");
    expect(result).toBeNull();
  });

  it("fetchExams returns exams", async () => {
    (fastapiFetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ exams: [{ exam: "Math", readiness: 80, daysLeft: 10 }] });
    const result = await fetchExams("token");
    expect(result).toEqual([{ exam: "Math", readiness: 80, daysLeft: 10 }]);
  });

  it("fetchLearningProgress returns progress", async () => {
    (fastapiFetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ progress: [{ topic: "loops", mastery: 90, trend: "up" }] });
    const result = await fetchLearningProgress("token");
    expect(result).toEqual([{ topic: "loops", mastery: 90, trend: "up" }]);
  });

  it("fetchArtifacts passes type query param", async () => {
    (fastapiFetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await fetchArtifacts("token", "notes");
    expect(fastapiFetch).toHaveBeenCalledWith("/artifacts?type=notes", undefined, "token");
  });

  it("deleteArtifact returns true on success", async () => {
    (fastapiFetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const result = await deleteArtifact("a1", "token");
    expect(result).toBe(true);
  });

  it("deleteArtifact returns false on error", async () => {
    (fastapiFetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("fail"));
    const result = await deleteArtifact("a1", "token");
    expect(result).toBe(false);
  });

  it("fetchMaterials handles array response", async () => {
    (fastapiFetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "m1" }]);
    const result = await fetchMaterials("token");
    expect(result).toEqual([{ id: "m1" }]);
  });

  it("fetchMaterials handles nested materials response", async () => {
    (fastapiFetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ materials: [{ id: "m2" }] });
    const result = await fetchMaterials("token");
    expect(result).toEqual([{ id: "m2" }]);
  });

  it("fetchConcepts handles array response", async () => {
    (fastapiFetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "c1" }]);
    const result = await fetchConcepts("token");
    expect(result).toEqual([{ id: "c1" }]);
  });

  it("fetchTimelineEvents handles events array", async () => {
    (fastapiFetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ events: [{ id: "t1" }] });
    const result = await fetchTimelineEvents("token");
    expect(result).toEqual([{ id: "t1" }]);
  });

  it("fetchTimelineEvents uses default limit", async () => {
    (fastapiFetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await fetchTimelineEvents("token");
    expect(fastapiFetch).toHaveBeenCalledWith("/timeline?limit=50", undefined, "token");
  });

  it("fetchMemoryFacts returns facts", async () => {
    (fastapiFetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ facts: [{ content: "likes AI", type: "preference" }] });
    const result = await fetchMemoryFacts("token");
    expect(result).toEqual([{ content: "likes AI", type: "preference" }]);
  });

  it("fetchMemorySummary returns summary", async () => {
    (fastapiFetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ total: 5, by_type: { preference: 3 } });
    const result = await fetchMemorySummary("token");
    expect(result).toEqual({ total: 5, by_type: { preference: 3 } });
  });

  it("forgetMemoryTopic returns true on success", async () => {
    (fastapiFetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ status: "success" });
    const result = await forgetMemoryTopic("token", "main", "loops");
    expect(result).toBe(true);
  });

  it("forgetMemoryTopic returns false when status not success", async () => {
    (fastapiFetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ status: "error" });
    const result = await forgetMemoryTopic("token", "main", "loops");
    expect(result).toBe(false);
  });
});
