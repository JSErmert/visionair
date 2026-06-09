export const SEED_KEY = "buildmode:seed";

export interface BuildSeed {
  idea: string;
}

// Crash/refresh recovery for an in-progress build. Persisted after every
// answered question so a transient pack failure (or a page reload) never forces
// the user to re-walk the interview. `q` is the next unanswered question (shown
// verbatim on resume so it does not regenerate differently); `complete` means
// every question was answered and only the pack step remains.
export const PROGRESS_KEY = "buildmode:progress";

export interface BuildProgress {
  idea: string;
  // Full question history so Back/Continue can navigate without re-calling the
  // LLM or changing any already-asked question. `responses[i]` is the answer to
  // `questions[i]` ("" if not yet answered). `idx` is the question on screen.
  questions: { move: string; text: string }[];
  responses: string[];
  idx: number;
  complete: boolean;
}
