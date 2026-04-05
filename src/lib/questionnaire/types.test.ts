import { describe, it, expect } from "vitest";
import { Step1Schema, FrequencyEnum, FullAnswersSchema } from "./types";

describe("Step1Schema (personal)", () => {
  it("accepts valid input", () => {
    const input = {
      gender: "f" as const,
      birthDate: "1985-06-15",
      city: "Москва",
      timezone: "Europe/Moscow",
      height: 170,
      weight: 65,
      waist: 75,
      hips: 95,
    };
    expect(() => Step1Schema.parse(input)).not.toThrow();
  });

  it("rejects height out of range", () => {
    const input = {
      gender: "m" as const,
      birthDate: "1985-06-15",
      city: "Москва",
      timezone: "Europe/Moscow",
      height: 50,
      weight: 70,
    };
    expect(() => Step1Schema.parse(input)).toThrow();
  });

  it("makes waist and hips optional", () => {
    const input = {
      gender: "m" as const,
      birthDate: "1985-06-15",
      city: "Москва",
      timezone: "Europe/Moscow",
      height: 180,
      weight: 80,
    };
    expect(() => Step1Schema.parse(input)).not.toThrow();
  });
});

describe("FrequencyEnum", () => {
  it("accepts all four values", () => {
    ["never", "rarely", "sometimes", "often"].forEach((v) => {
      expect(() => FrequencyEnum.parse(v)).not.toThrow();
    });
  });

  it("rejects unknown values", () => {
    expect(() => FrequencyEnum.parse("always")).toThrow();
  });
});

describe("FullAnswersSchema", () => {
  it("makes all steps optional (for partial drafts)", () => {
    expect(() => FullAnswersSchema.parse({})).not.toThrow();
    expect(() => FullAnswersSchema.parse({ step1: undefined })).not.toThrow();
  });
});
