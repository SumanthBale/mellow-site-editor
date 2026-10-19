export function signupOutcome(result: {
  session: unknown | null;
  user: { identities?: unknown[] } | null;
}): "signed-in" | "existing-account" | "confirm-email" {
  if (result.session) return "signed-in";
  if (result.user?.identities?.length === 0) return "existing-account";
  return "confirm-email";
}

export function hasRecoveryMarker(hash: string, search: string): boolean {
  return new URLSearchParams(hash.replace(/^#/, "")).get("type") === "recovery"
    || new URLSearchParams(search.replace(/^\?/, "")).get("type") === "recovery";
}