import { describe, expect, test } from "bun:test";
import { analyzeMessage, extractMessageLinks, MessageInput } from "./message-features";

describe("email and SMS phishing modules", () => {
  test("email flags credential theft, urgency, and sender impersonation", () => {
    const r = analyzeMessage({ type: "email", sender: "alerts@account-check.top", subject: "Urgent PayPal warning", content: "Dear customer, your account is suspended. Reply with your password and OTP immediately.", useAi: false });
    expect(r.verdict).toBe("phishing");
    expect(r.features.find((f) => f.key === "sender_mismatch")?.hit).toBe(true);
  });
  test("SMS flags payment and credential lure with an embedded phishing URL", () => {
    const r = analyzeMessage({ type: "sms", sender: "DELIVERY", subject: "", content: "Urgent: payment required. Verify your account at http://delivery-verify.top/login", useAi: false });
    expect(r.verdict).toBe("phishing"); expect(r.links.length).toBe(1);
  });
  test("routine messages do not trigger a phishing verdict", () => {
    for (const type of ["email", "sms"] as const) expect(analyzeMessage({ type, sender: "", subject: "", content: "Our project meeting is at 10 tomorrow in room 204.", useAi: false }).riskScore).toBe(0);
  });
  test("links are deduplicated and sender email addresses are not links", () => {
    expect(extractMessageLinks("help@example.com https://example.com. https://example.com www.example.org/path")).toEqual(["https://example.com", "www.example.org/path"]);
  });
  test("SMS enforces 2,000 characters; email accepts up to 20,000", () => {
    const base = { sender: "", subject: "", useAi: false };
    expect(MessageInput.safeParse({ ...base, type: "sms", content: "a".repeat(2001) }).success).toBe(false);
    expect(MessageInput.safeParse({ ...base, type: "email", content: "a".repeat(20000) }).success).toBe(true);
    expect(MessageInput.safeParse({ ...base, type: "email", content: "a".repeat(20001) }).success).toBe(false);
  });
  test("email sender must be valid when provided", () => {
    expect(MessageInput.safeParse({ type: "email", sender: "not-an-email", content: "Meeting tomorrow" }).success).toBe(false);
  });
});