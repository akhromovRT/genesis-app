import { describe, it, expect } from "vitest";
import {
  calculateAge,
  calculateBMI,
  calculateWHR,
  calculateWaistRisk,
  calculateIndexOfGrace,
  computeQuickInsights,
} from "./quick-insights";

describe("calculateAge", () => {
  it("returns whole years for a known birthdate before today's month/day", () => {
    expect(calculateAge("1990-01-01", new Date("2026-05-21"))).toBe(36);
  });
  it("subtracts one year when birthday hasn't happened this year", () => {
    expect(calculateAge("1990-12-31", new Date("2026-05-21"))).toBe(35);
  });
  it("handles birthday today as full year", () => {
    expect(calculateAge("1990-05-21", new Date("2026-05-21"))).toBe(36);
  });
});

describe("calculateBMI", () => {
  it("returns 'normal' for BMI 22", () => {
    const result = calculateBMI(70, 178);
    expect(result.value).toBeCloseTo(22.1, 1);
    expect(result.category).toBe("normal");
  });
  it("returns 'underweight' for BMI 17", () => {
    expect(calculateBMI(45, 162).category).toBe("underweight");
  });
  it("returns 'overweight' for BMI 27", () => {
    expect(calculateBMI(85, 178).category).toBe("overweight");
  });
  it("returns 'obese1' for BMI 32", () => {
    expect(calculateBMI(100, 178).category).toBe("obese1");
  });
  it("returns 'obese2' for BMI 37", () => {
    expect(calculateBMI(117, 178).category).toBe("obese2");
  });
  it("returns 'obese3' for BMI 41", () => {
    expect(calculateBMI(130, 178).category).toBe("obese3");
  });
});

describe("calculateWHR", () => {
  it("returns ratio with 2 decimals", () => {
    const r = calculateWHR(80, 100);
    expect(r?.value).toBeCloseTo(0.8, 2);
  });
  it("returns null if waist or hips missing", () => {
    expect(calculateWHR(undefined, 100)).toBeNull();
    expect(calculateWHR(80, undefined)).toBeNull();
  });
  it("flags 'low' risk for male WHR 0.85", () => {
    expect(calculateWHR(85, 100, "m")?.category).toBe("low");
  });
  it("flags 'moderate' risk for male WHR 0.95", () => {
    expect(calculateWHR(95, 100, "m")?.category).toBe("moderate");
  });
  it("flags 'high' risk for male WHR 1.05", () => {
    expect(calculateWHR(105, 100, "m")?.category).toBe("high");
  });
  it("flags 'low' risk for female WHR 0.75", () => {
    expect(calculateWHR(75, 100, "f")?.category).toBe("low");
  });
  it("flags 'high' risk for female WHR 0.90", () => {
    expect(calculateWHR(90, 100, "f")?.category).toBe("high");
  });
});

describe("calculateWaistRisk", () => {
  it("returns 'low' for male waist 90 cm", () => {
    expect(calculateWaistRisk(90, "m")?.category).toBe("low");
  });
  it("returns 'moderate' for male waist 96 cm", () => {
    expect(calculateWaistRisk(96, "m")?.category).toBe("moderate");
  });
  it("returns 'high' for male waist 105 cm", () => {
    expect(calculateWaistRisk(105, "m")?.category).toBe("high");
  });
  it("returns 'low' for female waist 75 cm", () => {
    expect(calculateWaistRisk(75, "f")?.category).toBe("low");
  });
  it("returns 'moderate' for female waist 82 cm", () => {
    expect(calculateWaistRisk(82, "f")?.category).toBe("moderate");
  });
  it("returns 'high' for female waist 90 cm", () => {
    expect(calculateWaistRisk(90, "f")?.category).toBe("high");
  });
  it("returns null when waist missing", () => {
    expect(calculateWaistRisk(undefined, "f")).toBeNull();
  });
});

describe("calculateIndexOfGrace", () => {
  it("returns calf/hips * 100", () => {
    const r = calculateIndexOfGrace(36, 95);
    expect(r?.value).toBeCloseTo(37.9, 1);
  });
  it("returns null if calf or hips missing", () => {
    expect(calculateIndexOfGrace(undefined, 95)).toBeNull();
    expect(calculateIndexOfGrace(36, undefined)).toBeNull();
  });
  it("flags 'harmonious' when 33-38", () => {
    expect(calculateIndexOfGrace(35, 95)?.category).toBe("harmonious");
  });
  it("flags 'thin' when <33", () => {
    expect(calculateIndexOfGrace(28, 95)?.category).toBe("thin");
  });
  it("flags 'dense' when >38", () => {
    expect(calculateIndexOfGrace(42, 95)?.category).toBe("dense");
  });
  it("flags 'harmonious' at exactly 38 (inclusive upper bound)", () => {
    expect(calculateIndexOfGrace(38, 100)?.category).toBe("harmonious");
  });
  it("flags 'dense' just above 38", () => {
    expect(calculateIndexOfGrace(38.1, 100)?.category).toBe("dense");
  });
});

describe("computeQuickInsights", () => {
  it("aggregates all metrics from a complete Step1Answers", () => {
    const insights = computeQuickInsights(
      {
        gender: "m",
        birthDate: "1990-01-01",
        city: "Moscow",
        timezone: "Europe/Moscow",
        height: 178,
        weight: 75,
        waist: 88,
        hips: 100,
        calf: 38,
      },
      new Date("2026-05-21"),
    );
    expect(insights.age).toBe(36);
    expect(insights.bmi?.category).toBe("normal");
    expect(insights.whr?.category).toBe("low");
    expect(insights.waistRisk?.category).toBe("low");
    expect(insights.indexOfGrace?.category).toBe("harmonious");
  });
  it("returns null fields when optional measurements are missing", () => {
    const insights = computeQuickInsights(
      {
        gender: "f",
        birthDate: "1990-01-01",
        city: "Moscow",
        timezone: "Europe/Moscow",
        height: 165,
        weight: 60,
      },
      new Date("2026-05-21"),
    );
    expect(insights.bmi).not.toBeNull();
    expect(insights.whr).toBeNull();
    expect(insights.waistRisk).toBeNull();
    expect(insights.indexOfGrace).toBeNull();
  });
});
