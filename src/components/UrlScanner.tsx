import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { scanUrl, type ScanResult } from "@/lib/scan.functions";
import { VERDICT_META } from "@/lib/phishing-features";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const SAMPLES = [
  "https://www.google.com",
  "http://192.168.4.21/secure-paypal-login/verify.php",
  "http://hdfc-bank.account-verify.top/login?redirect=//evil.tk",
];

export function UrlScanner() {
  const runScan = useServerFn(scanUrl);
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  async function handleScan(target?: string) {
    const value = (target ?? url).trim();
    if (!value) {
      toast.error("Enter a URL to analyse.");
      return;
    }
    setUrl(value);
    setLoading(true);
    setResult(null);
    try {
      const res = await runScan({ data: { url: value } });
      setResult(res);
      if (res.aiError) toast.warning(res.aiError);

      if (user) {
        const { error } = await supabase.from("scans").insert({
          user_id: user.id,
          url: res.url,
          host: res.host,
          verdict: res.verdict,
          risk_score: res.riskScore,
          confidence: res.confidence,
          features: res.triggered.map((f) => ({
            key: f.key,
            label: f.label,
            value: f.value,
            weight: f.weight,
          })),
          ai_summary: res.ai?.summary ?? null,
          ai_indicators: res.ai?.indicators ?? [],
          ai_recommendation: res.ai?.recommendation ?? null,
        });
        if (error) toast.error("Scan ran, but saving to history failed.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Scan failed. Try another URL.",
      );
    } finally {
      setLoading(false);
    }
  }

  const meta = result ? VERDICT_META[result.verdict] : null;
  const Icon =
    result?.verdict === "safe"
      ? CheckCircle2
      : result?.verdict === "suspicious"
        ? AlertTriangle
        : ShieldAlert;

  return (
    <div className="w-full">
      <div className="rounded-xl border border-border bg-surface p-4 glow-ring sm:p-5">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            void handleScan();
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a link, e.g. http://secure-login.verify-account.tk"
              className="h-12 bg-background pl-9 font-mono text-sm"
              aria-label="URL to analyse"
            />
          </div>
          <Button type="submit" size="lg" className="h-12 px-6 font-medium" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analysing
              </>
            ) : (
              "Analyse URL"
            )}
          </Button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Try:</span>
          {SAMPLES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void handleScan(s)}
              className="max-w-full truncate rounded border border-border bg-surface-2 px-2 py-1 font-mono hover:text-foreground"
            >
              {s.replace(/^https?:\/\//, "").slice(0, 34)}
            </button>
          ))}
        </div>
        {!user ? (
          <p className="mt-3 text-xs text-muted-foreground">
            <Link to="/auth" className="text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>{" "}
            to save scans to your history.
          </p>
        ) : null}
      </div>

      {result && meta ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-5">
          <div className={`rounded-xl border ${meta.ring} ${meta.tone} p-5 lg:col-span-2`}>
            <div className="flex items-center gap-3">
              <Icon className={`h-7 w-7 ${meta.text}`} />
              <div>
                <p className={`font-display text-xl font-semibold ${meta.text}`}>
                  {meta.label}
                </p>
                <p className="break-all font-mono text-xs text-muted-foreground">
                  {result.host}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">Risk score</span>
                <span className="font-display text-2xl font-semibold">
                  {result.riskScore}
                  <span className="text-sm text-muted-foreground">/100</span>
                </span>
              </div>
              <Progress value={result.riskScore} className="mt-2 h-2" />
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-border bg-background/40 p-3">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="font-display text-lg">{result.confidence}%</p>
                </div>
                <div className="rounded-lg border border-border bg-background/40 p-3">
                  <p className="text-xs text-muted-foreground">Features hit</p>
                  <p className="font-display text-lg">
                    {result.triggered.length}/{result.features.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-3">
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="flex items-center gap-2 font-display text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-primary" /> AI reasoning
              </p>
              {result.ai ? (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {result.ai.summary}
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {result.ai.indicators.map((ind) => (
                      <li key={ind} className="flex gap-2">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                        <span className="text-muted-foreground">{ind}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 rounded-lg border border-primary/25 bg-primary/5 p-3 text-sm">
                    {result.ai.recommendation}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  {result.aiError ?? "No AI explanation available."}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="font-display text-sm font-semibold">
                Extracted feature vector
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {result.features.map((f) => (
                  <div
                    key={f.key}
                    className={`rounded-lg border p-3 text-sm ${
                      f.hit
                        ? f.severity === "danger"
                          ? "border-danger/35 bg-danger/5"
                          : "border-warn/35 bg-warn/5"
                        : "border-border bg-background/30"
                    }`}
                    title={f.note}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">{f.label}</span>
                      {f.hit ? (
                        <span
                          className={`font-mono text-[10px] ${
                            f.severity === "danger" ? "text-danger" : "text-warn"
                          }`}
                        >
                          +{f.weight}
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-safe">ok</span>
                      )}
                    </div>
                    <p className="mt-1 truncate font-mono text-xs">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
