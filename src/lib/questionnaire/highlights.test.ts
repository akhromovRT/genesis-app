import { describe, it, expect } from "vitest";
import { computeHighlights } from "./highlights";
import type { FullAnswers } from "./types";

function makeAnswers(overrides: Partial<FullAnswers> = {}): FullAnswers {
  return overrides;
}

describe("computeHighlights — empty answers", () => {
  it("returns empty array for empty answers", () => {
    const result = computeHighlights(makeAnswers());
    expect(result).toEqual([]);
  });
});

describe("Rule: Possible Magnesium deficiency", () => {
  it("triggers when 3+ of 4 symptoms marked 'often' or 'sometimes'", () => {
    const answers = makeAnswers({
      step8: {
        symptoms: {
          muscleCramps: "often",
          muscleTwitches: "sometimes",
          sleepDisturbances: "often",
          irritabilityMoodSwings: "often",
        },
        goals: "",
        readinessToChange: "full",
        consentPersonalData: true,
        confirmAccuracy: true,
      } as any,
    });
    const result = computeHighlights(answers);
    expect(result.find((h) => h.id === "mg-deficiency")).toBeDefined();
  });

  it("does NOT trigger with only 2 symptoms", () => {
    const answers = makeAnswers({
      step8: {
        symptoms: {
          muscleCramps: "often",
          muscleTwitches: "sometimes",
        },
        goals: "",
        readinessToChange: "full",
        consentPersonalData: true,
        confirmAccuracy: true,
      } as any,
    });
    const result = computeHighlights(answers);
    expect(result.find((h) => h.id === "mg-deficiency")).toBeUndefined();
  });
});

describe("Rule: High medication burden", () => {
  it("triggers when 5+ medication groups taken 'often'", () => {
    const answers = makeAnswers({
      step6: {
        medications: {
          bloodPressureHeart: { frequency: "often" },
          nsaids: { frequency: "often" },
          antidepressants: { frequency: "often" },
          stomach: { frequency: "often" },
          thyroidHormones: { frequency: "often" },
        },
        supplements: {},
        noBrandPreference: false,
      } as any,
    });
    const result = computeHighlights(answers);
    expect(result.find((h) => h.id === "high-med-burden")).toBeDefined();
  });
});

describe("All highlights include required fields", () => {
  it("each highlight has title, description, severity, disclaimer", () => {
    const answers = makeAnswers({
      step5: {
        stressLevel: 5,
        emotionalState: "",
        pollinosis: "",
        foodAllergies: "",
        drugAllergies: "",
      } as any,
      step8: {
        symptoms: {
          sleepDisturbances: "often",
          irritabilityMoodSwings: "often",
        },
        goals: "",
        readinessToChange: "full",
        consentPersonalData: true,
        confirmAccuracy: true,
      } as any,
    });
    const result = computeHighlights(answers);
    for (const h of result) {
      expect(h.title).toBeTruthy();
      expect(h.description).toBeTruthy();
      expect(h.severity).toMatch(/^(info|attention|warning)$/);
      expect(h.disclaimer).toContain("Не является медицинским диагнозом");
      expect(h.id).toBeTruthy();
      expect(Array.isArray(h.triggers)).toBe(true);
    }
  });
});

describe("Sorting", () => {
  it("sorts warning before attention before info", () => {
    const answers = makeAnswers({
      step8: {
        symptoms: {
          muscleCramps: "often",
          muscleTwitches: "often",
          sleepDisturbances: "often",
          irritabilityMoodSwings: "often",
        },
        goals: "",
        readinessToChange: "full",
        consentPersonalData: true,
        confirmAccuracy: true,
      } as any,
    });
    const result = computeHighlights(answers);
    const severityOrder: Record<string, number> = { warning: 0, attention: 1, info: 2 };
    for (let i = 1; i < result.length; i++) {
      expect(severityOrder[result[i - 1].severity]).toBeLessThanOrEqual(
        severityOrder[result[i].severity]
      );
    }
  });
});
