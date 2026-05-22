import { describe, it, expect } from "vitest";
import {
  getAllMarkers,
  getMatchedMarkers,
  selectionCoversAll,
  isSelectionValid,
  groupMarkersByGene,
} from "./quiz-logic";
import { MIN_SELECTION } from "./questions";

describe("getAllMarkers", () => {
  it("returns a deduplicated union of all non-coversAll markers", () => {
    const all = getAllMarkers();
    const keys = all.map((mk) => `${mk.gene}:${mk.rs}`);
    expect(new Set(keys).size).toBe(all.length);
  });
  it("contains a known marker (FTO rs9939609)", () => {
    const all = getAllMarkers();
    expect(all.some((mk) => mk.gene === "FTO" && mk.rs === "rs9939609")).toBe(true);
  });
  it("does not exceed the panel size of 50", () => {
    expect(getAllMarkers().length).toBeLessThanOrEqual(50);
  });
});

describe("isSelectionValid", () => {
  it("is false below MIN_SELECTION", () => {
    expect(isSelectionValid([1, 2, 3, 4])).toBe(false);
  });
  it("is true at exactly MIN_SELECTION", () => {
    expect(isSelectionValid([1, 2, 3, 4, 5])).toBe(true);
    expect(MIN_SELECTION).toBe(5);
  });
  it("is true above MIN_SELECTION", () => {
    expect(isSelectionValid([1, 2, 3, 4, 5, 6])).toBe(true);
  });
});

describe("selectionCoversAll", () => {
  it("true if question 16 selected", () => {
    expect(selectionCoversAll([1, 2, 3, 4, 16])).toBe(true);
  });
  it("true if question 17 selected", () => {
    expect(selectionCoversAll([17, 1, 2, 3, 4])).toBe(true);
  });
  it("false for only specific questions", () => {
    expect(selectionCoversAll([1, 2, 3, 4, 5])).toBe(false);
  });
});

describe("getMatchedMarkers", () => {
  it("returns the union of markers from selected specific questions, deduplicated", () => {
    const matched = getMatchedMarkers([1, 2]);
    const keys = matched.map((mk) => `${mk.gene}:${mk.rs}`);
    expect(new Set(keys).size).toBe(matched.length);
    expect(matched.some((mk) => mk.gene === "LRP1" && mk.rs === "rs1799986")).toBe(true);
  });
  it("returns all markers when a coversAll question is selected", () => {
    const matched = getMatchedMarkers([1, 16]);
    expect(matched.length).toBe(getAllMarkers().length);
  });
  it("returns empty for empty selection", () => {
    expect(getMatchedMarkers([])).toEqual([]);
  });
  it("ignores unknown question ids", () => {
    expect(getMatchedMarkers([999])).toEqual([]);
  });
});

describe("groupMarkersByGene", () => {
  it("groups rs by gene and sorts genes alphabetically", () => {
    const grouped = groupMarkersByGene([
      { gene: "FTO", rs: "rs9939609" },
      { gene: "APOA5", rs: "rs662799" },
      { gene: "APOA5", rs: "rs964184" },
    ]);
    expect(grouped[0].gene).toBe("APOA5");
    expect(grouped[0].rsList).toEqual(["rs662799", "rs964184"]);
    expect(grouped[1].gene).toBe("FTO");
  });
  it("returns empty for empty input", () => {
    expect(groupMarkersByGene([])).toEqual([]);
  });
});
