// Single source of truth for input size caps. Imported by both the API route
// (server-side Zod validation) and the client (textarea maxLength + counter) so
// the two can never drift out of sync.
export const LIMITS = {
  idea: 24000,
  response: 12000,
  question: 4000,
} as const;
