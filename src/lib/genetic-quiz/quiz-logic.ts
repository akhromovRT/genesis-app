import { QUIZ_QUESTIONS, MIN_SELECTION, type GeneMarker } from "./questions";

function markerKey(mk: GeneMarker): string {
  return `${mk.gene}:${mk.rs}`;
}

function dedupe(markers: GeneMarker[]): GeneMarker[] {
  const seen = new Set<string>();
  const out: GeneMarker[] = [];
  for (const mk of markers) {
    const key = markerKey(mk);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(mk);
    }
  }
  return out;
}

/** Дедуплицированный union всех маркеров из конкретных (не coversAll) вопросов. */
export function getAllMarkers(): GeneMarker[] {
  const all: GeneMarker[] = [];
  for (const q of QUIZ_QUESTIONS) {
    if (!q.coversAll) all.push(...q.markers);
  }
  return dedupe(all);
}

export function isSelectionValid(selectedIds: number[]): boolean {
  return selectedIds.length >= MIN_SELECTION;
}

export function selectionCoversAll(selectedIds: number[]): boolean {
  return QUIZ_QUESTIONS.some(
    (q) => q.coversAll && selectedIds.includes(q.id),
  );
}

export function getMatchedMarkers(selectedIds: number[]): GeneMarker[] {
  if (selectedIds.length === 0) return [];
  if (selectionCoversAll(selectedIds)) return getAllMarkers();
  const collected: GeneMarker[] = [];
  for (const q of QUIZ_QUESTIONS) {
    if (selectedIds.includes(q.id)) collected.push(...q.markers);
  }
  return dedupe(collected);
}

export interface GeneGroup {
  gene: string;
  rsList: string[];
}

export function groupMarkersByGene(markers: GeneMarker[]): GeneGroup[] {
  const map = new Map<string, string[]>();
  for (const mk of markers) {
    const list = map.get(mk.gene) ?? [];
    if (!list.includes(mk.rs)) list.push(mk.rs);
    map.set(mk.gene, list);
  }
  return Array.from(map.entries())
    .map(([gene, rsList]) => ({ gene, rsList }))
    .sort((a, b) => a.gene.localeCompare(b.gene));
}
