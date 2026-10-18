import { z } from "zod";
import { analyzeUrl, type UrlFeature, type UrlAnalysis } from "./phishing-features";

export const MessageInput = z.object({
  type: z.enum(["email", "sms"]),
  content: z.string().trim().min(3, "Enter at least 3 characters.").max(20000),
  sender: z.string().trim().max(320).default(""),
  subject: z.string().trim().max(300).default(""),
  useAi: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.type === "sms" && data.content.length > 2000)
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["content"], message: "SMS content must be 2,000 characters or fewer." });
  if (data.type === "email" && data.sender && !z.string().email().safeParse(data.sender).success)
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sender"], message: "Enter a valid sender email address, or leave it blank." });
});
export type MessageScanInput = z.infer<typeof MessageInput>;
export interface MessageAnalysis {
  type: "email" | "sms";
  content: string;
  sender: string;
  subject: string;
  riskScore: number;
  verdict: UrlAnalysis["verdict"];
  features: UrlFeature[];
  links: UrlAnalysis[];
  linkCount: number;
}

export function extractMessageLinks(text: string): string[] {
  const matches = text.match(/\b(?:https?:\/\/|www\.)[^\s<>"']+|\b(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:com|net|org|in|co|io|uk|top|xyz|tk|zip|click|ly|me)\b(?:\/[^\s<>"']*)?/gi) ?? [];
  return [...new Set(matches.map((s) => s.replace(/[.,;!?)\]}]+$/, "")))].filter((link) => {
    const index = text.indexOf(link);
    return index === 0 || text[index - 1] !== "@";
  });
}

export function analyzeMessage(input: MessageScanInput): MessageAnalysis {
  const data = MessageInput.parse(input);
  const text = `${data.subject}\n${data.content}`;
  const urls = extractMessageLinks(text);
  const links = urls.slice(0, 20).flatMap((url) => {
    try { return [analyzeUrl(url)]; } catch { return []; }
  });
  const signal = (key: string, label: string, pattern: RegExp, weight: number, note: string): UrlFeature => {
    const match = text.match(pattern);
    return { key, label, value: match?.[0] ?? "not found", hit: Boolean(match), weight,
      severity: match ? (weight >= 15 ? "danger" : "warn") : "safe", note };
  };
  const features = [
    signal("urgency", "Urgency or threats", /\b(urgent|immediately|act now|within \d+ hours?|suspend(?:ed)?|blocked|final warning|expires? today)\b/i, 15, "Pressure can discourage checking the sender independently."),
    signal("credentials", "Sensitive information request", /\b(password|otp|one[- ]time (?:password|code)|pin|cvv|credit card|bank details|login credentials|verify your account|confirm your identity)\b/i, 25, "Never disclose passwords, OTPs, or payment credentials in a reply."),
    signal("reward", "Unexpected reward", /\b(won|winner|lottery|free gift|claim your prize|cash reward|jackpot)\b/i, 15, "Unexpected rewards are a common social-engineering lure."),
    signal("payment", "Payment or financial action", /\b(pay now|payment required|transfer (?:money|funds)|wire transfer|gift cards?|processing fee|delivery fee|refund|unpaid|overdue)\b/i, 15, "Verify financial requests through an independently known contact."),
    signal("action", "Requested action", /\b(click|tap|follow this link|download|open the attachment|enable macros|reply with)\b/i, 8, "Action language is weak evidence alone; context matters."),
    signal("greeting", "Generic greeting", /\b(dear customer|dear user|valued customer|dear account holder)\b/i, 5, "Generic greetings can indicate a bulk impersonation campaign."),
    signal("attachment", "Potentially risky attachment mention", /\b[\w-]+\.(?:exe|scr|js|vbs|bat|docm|xlsm|zip)\b|enable macros/i, 15, "Only attachment names in the text are checked; files are not opened."),
  ];
  const riskyLink = links.reduce((max, l) => Math.max(max, l.riskScore), 0);
  features.push({ key: "links", label: "Embedded link risk", value: links.length ? `${links.length} checked · highest ${riskyLink}/100` : "no links found", hit: riskyLink >= 25, weight: riskyLink >= 55 ? 35 : 15, severity: riskyLink >= 55 ? "danger" : riskyLink >= 25 ? "warn" : "safe", note: "Lexical URL checks only; destinations are never visited." });
  if (data.type === "email") {
    const domain = data.sender.split("@")[1] ?? "";
    const claimedBrands = ["paypal", "microsoft", "amazon", "apple", "netflix", "google"];
    const mismatch = claimedBrands.find((brand) => new RegExp(`\\b${brand}\\b`, "i").test(text) && domain && domain !== `${brand}.com` && !domain.endsWith(`.${brand}.com`));
    features.push({ key: "sender_mismatch", label: "Brand / sender mismatch", value: mismatch ? `${mismatch} claimed · ${domain}` : data.sender ? "no supported brand mismatch found" : "sender not supplied", hit: Boolean(mismatch), weight: 20, severity: mismatch ? "danger" : "safe", note: "A mismatch is a clue, not proof. Sender addresses can be spoofed; SPF/DKIM/DMARC are not verified." });
  }
  const riskScore = Math.min(100, features.filter((f) => f.hit).reduce((sum, f) => sum + f.weight, 0));
  return { type: data.type, content: data.content, sender: data.sender, subject: data.subject, features, links, linkCount: urls.length, riskScore, verdict: riskScore >= 55 ? "phishing" : riskScore >= 25 ? "suspicious" : "safe" };
}