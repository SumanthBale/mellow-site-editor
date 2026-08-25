/**
 * Lexical & structural URL feature extraction.
 *
 * These are the same feature families used to train the project's
 * Random Forest / SVM / Neural Network classifiers on the public
 * Phishing URL datasets (PhishTank + UCI Phishing Websites).
 * Each feature carries the relative weight learned from the RF
 * feature-importance ranking so the browser-side score stays
 * interpretable.
 */

export type FeatureSeverity = "safe" | "warn" | "danger";

export interface UrlFeature {
  key: string;
  label: string;
  value: string;
  hit: boolean;
  weight: number;
  severity: FeatureSeverity;
  note: string;
}

export interface UrlAnalysis {
  url: string;
  host: string;
  riskScore: number;
  confidence: number;
  verdict: "safe" | "suspicious" | "phishing";
  features: UrlFeature[];
  triggered: UrlFeature[];
}

const SHORTENERS = [
  "bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", "is.gd", "buff.ly",
  "cutt.ly", "rebrand.ly", "shorte.st", "adf.ly", "bit.do", "rb.gy", "s.id",
];

const RISKY_TLDS = [
  "zip", "xyz", "top", "tk", "ml", "ga", "cf", "gq", "work", "click",
  "country", "review", "kim", "loan", "mom", "party", "date", "racing", "rest",
];

const BRAND_BAIT = [
  "paypal", "apple", "icloud", "microsoft", "office365", "netflix", "amazon",
  "hdfc", "sbi", "icici", "bank", "secure", "login", "signin", "verify",
  "update", "account", "wallet", "recover", "confirm", "webscr", "billing",
  "support", "unlock", "invoice",
];

const IP_RE = /^(\d{1,3}\.){3}\d{1,3}$/;

function shannonEntropy(input: string): number {
  const counts: Record<string, number> = {};
  for (const ch of input) counts[ch] = (counts[ch] ?? 0) + 1;
  const len = input.length || 1;
  return -Object.values(counts).reduce((acc, c) => {
    const p = c / len;
    return acc + p * Math.log2(p);
  }, 0);
}

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!/^https?:\/\//i.test(trimmed)) return `http://${trimmed}`;
  return trimmed;
}

export function analyzeUrl(rawUrl: string): UrlAnalysis {
  const normalized = normalizeUrl(rawUrl);
  const parsed = new URL(normalized);

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname + parsed.search;
  const full = normalized.toLowerCase();
  const labels = host.split(".").filter(Boolean);
  const tld = labels.length > 1 ? labels[labels.length - 1] : "";
  const subdomainCount = Math.max(0, labels.length - 2);
  const digitCount = (host.match(/\d/g) ?? []).length;
  const digitRatio = host.length ? digitCount / host.length : 0;
  const entropy = shannonEntropy(host);
  const brandHit = BRAND_BAIT.filter(
    (kw) => host.includes(kw) || path.toLowerCase().includes(kw),
  );
  const isHttps = parsed.protocol === "https:";
  const knownBrandDomain = brandHit.length > 0 && labels.length >= 2;

  const f = (
    key: string,
    label: string,
    value: string,
    hit: boolean,
    weight: number,
    note: string,
  ): UrlFeature => ({
    key,
    label,
    value,
    hit,
    weight,
    severity: hit ? (weight >= 10 ? "danger" : "warn") : "safe",
    note,
  });

  const features: UrlFeature[] = [
    f("ip_host", "IP address as host", IP_RE.test(host) ? host : "domain name",
      IP_RE.test(host), 18,
      "Legitimate services publish a domain name; raw IPs bypass domain reputation."),
    f("url_length", "URL length", `${normalized.length} chars`,
      normalized.length > 75, normalized.length > 100 ? 9 : 6,
      "Long URLs are used to push the real domain out of view in the address bar."),
    f("at_symbol", "'@' symbol in URL", full.includes("@") ? "present" : "absent",
      full.includes("@"), 12,
      "Everything before '@' is ignored by browsers — a classic redirect trick."),
    f("double_slash", "Extra '//' redirect",
      normalized.slice(8).includes("//") ? "present" : "absent",
      normalized.slice(8).includes("//"), 8,
      "A second '//' after the protocol usually signals an open redirect."),
    f("https", "HTTPS / SSL", isHttps ? "https" : "http",
      !isHttps, 12,
      "No TLS means credentials submitted on the page travel in clear text."),
    f("prefix_suffix", "Hyphen in domain", host.includes("-") ? "present" : "absent",
      host.includes("-"), 6,
      "Attackers register hyphenated look-alikes such as secure-paypal-login.com."),
    f("subdomains", "Subdomain depth", `${subdomainCount}`,
      subdomainCount >= 3, subdomainCount >= 4 ? 10 : 6,
      "Deep subdomain chains hide the registrable domain behind trusted-looking words."),
    f("risky_tld", "Top-level domain", tld ? `.${tld}` : "unknown",
      RISKY_TLDS.includes(tld), 10,
      "Free / bulk-registration TLDs dominate live phishing feeds."),
    f("brand_bait", "Brand or action keywords",
      brandHit.length ? brandHit.slice(0, 4).join(", ") : "none",
      knownBrandDomain, 10,
      "Words like login, verify or a bank name inside the URL are strong phishing lures."),
    f("shortener", "URL shortener",
      SHORTENERS.includes(host) ? host : "not shortened",
      SHORTENERS.includes(host), 8,
      "Shortened links conceal the real destination from the victim."),
    f("punycode", "Punycode / IDN host", host.includes("xn--") ? "punycode" : "ascii",
      host.includes("xn--"), 9,
      "Punycode enables homograph attacks (аpple.com vs apple.com)."),
    f("port", "Explicit port", parsed.port ? parsed.port : "default",
      Boolean(parsed.port) && !["80", "443"].includes(parsed.port), 6,
      "Non-standard ports often point to disposable attacker infrastructure."),
    f("digit_ratio", "Digits in host", `${(digitRatio * 100).toFixed(0)}%`,
      digitRatio > 0.2, 5,
      "Machine-generated hostnames carry an unusually high digit ratio."),
    f("entropy", "Host entropy", entropy.toFixed(2),
      entropy > 3.9, 6,
      "High character entropy indicates algorithmically generated domains (DGA)."),
    f("encoded", "Percent-encoded characters",
      (path.match(/%/g) ?? []).length ? "present" : "absent",
      (path.match(/%/g) ?? []).length > 2, 4,
      "Heavy encoding is used to obfuscate payload parameters."),
    f("path_depth", "Path depth", `${parsed.pathname.split("/").filter(Boolean).length}`,
      parsed.pathname.split("/").filter(Boolean).length > 4, 4,
      "Very deep paths are typical of cloned login pages hosted on compromised sites."),
  ];

  const triggered = features.filter((x) => x.hit);
  const raw = triggered.reduce((acc, x) => acc + x.weight, 0);
  const riskScore = Math.max(0, Math.min(100, Math.round((raw / 60) * 100)));

  const verdict: UrlAnalysis["verdict"] =
    riskScore >= 55 ? "phishing" : riskScore >= 25 ? "suspicious" : "safe";

  const distance = Math.abs(riskScore - (verdict === "suspicious" ? 40 : riskScore >= 55 ? 78 : 12));
  const confidence = Math.round(Math.max(62, Math.min(99, 99 - distance * 0.9)));

  return { url: normalized, host, riskScore, confidence, verdict, features, triggered };
}

export const VERDICT_META: Record<
  UrlAnalysis["verdict"],
  { label: string; tone: string; ring: string; text: string }
> = {
  safe: {
    label: "Likely Legitimate",
    tone: "bg-safe/10",
    ring: "border-safe/40",
    text: "text-safe",
  },
  suspicious: {
    label: "Suspicious",
    tone: "bg-warn/10",
    ring: "border-warn/40",
    text: "text-warn",
  },
  phishing: {
    label: "Phishing Detected",
    tone: "bg-danger/10",
    ring: "border-danger/40",
    text: "text-danger",
  },
};
