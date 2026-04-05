import { FullAnswers, FullAnswersSchema } from "./types";

const STORAGE_KEY = "genesis_q_v1";
const TOKEN_KEY = "genesis_q_token_v1";

export interface StoredSession {
  sessionToken: string;
  currentStep: number;
  answers: FullAnswers;
  updatedAt: string;
}

function generateToken(): string {
  // 21-char hex token using crypto
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 21);
}

export function getOrCreateToken(): string {
  if (typeof window === "undefined") return "";
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = generateToken();
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

export function loadSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const answers = FullAnswersSchema.parse(parsed.answers ?? {});
    return {
      sessionToken: parsed.sessionToken,
      currentStep: parsed.currentStep ?? 0,
      answers,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export function saveSession(
  currentStep: number,
  answers: FullAnswers
): StoredSession {
  const sessionToken = getOrCreateToken();
  const session: StoredSession = {
    sessionToken,
    currentStep,
    answers,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
  return session;
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function hasDraft(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}
