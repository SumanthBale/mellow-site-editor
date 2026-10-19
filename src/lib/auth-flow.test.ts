import { test } from "node:test";
import assert from "node:assert/strict";
import { signupOutcome, hasRecoveryMarker } from "./auth-flow";

test("signup without a session requires confirmation, not sign-in", () => {
  assert.equal(signupOutcome({ session: null, user: { identities: [{}] } }), "confirm-email");
});
test("repeated signup without a session does not create a signed-in account", () => {
  assert.equal(signupOutcome({ session: null, user: { identities: [] } }), "existing-account");
});
test("only an actual signup session is treated as signed in", () => {
  assert.equal(signupOutcome({ session: { user: {} }, user: { identities: [{}] } }), "signed-in");
});
test("recovery links recognize the auth hash marker", () => {
  assert.equal(hasRecoveryMarker("#access_token=example&type=recovery", ""), true);
  assert.equal(hasRecoveryMarker("#type=signup", ""), false);
  assert.equal(hasRecoveryMarker("", "?type=recovery&code=example"), true);
});