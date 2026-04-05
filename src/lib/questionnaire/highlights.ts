import { DISCLAIMER, RULES, type Highlight } from "./rules";
import type { FullAnswers } from "./types";

const SEVERITY_ORDER: Record<string, number> = {
  warning: 0,
  attention: 1,
  info: 2,
};

export function computeHighlights(answers: FullAnswers): Highlight[] {
  const results: Highlight[] = [];

  for (const rule of RULES) {
    try {
      const { matched, triggers } = rule.evaluate(answers);
      if (!matched) continue;
      results.push({
        id: rule.id,
        category: rule.category,
        severity: rule.severity,
        title: rule.title,
        description: rule.description,
        triggers,
        recommendation: rule.recommendation,
        disclaimer: DISCLAIMER,
      });
    } catch {
      // skip failed rule silently
    }
  }

  results.sort((a, b) => {
    const sev = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (sev !== 0) return sev;
    return a.id.localeCompare(b.id);
  });

  return results;
}

export type { Highlight } from "./rules";
