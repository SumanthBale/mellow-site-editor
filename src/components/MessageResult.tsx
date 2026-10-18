import { AlertTriangle, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";
import type { MessageScanResult } from "@/lib/message-scan.functions";
import { VERDICT_META } from "@/lib/phishing-features";
import { Progress } from "@/components/ui/progress";

export function MessageResult({ result }: { result: MessageScanResult }) {
  const meta = VERDICT_META[result.verdict];
  const Icon = result.verdict === "safe" ? CheckCircle2 : result.verdict === "phishing" ? ShieldAlert : AlertTriangle;
  return <div className="mt-8 space-y-6" aria-live="polite" data-testid="message-result">
    <section className={`border-y ${meta.ring} py-6`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className={`flex items-center gap-3 text-xl font-semibold ${meta.text}`}><Icon className="h-6 w-6" />{meta.label}</h2>
        <p className="font-mono text-xl">{result.riskScore}<span className="text-sm text-muted-foreground">/100 risk</span></p>
      </div>
      <Progress value={result.riskScore} className="mt-4 h-2" />
      <p className="mt-3 text-xs text-muted-foreground">Heuristic assessment, not a trained-model probability. A low score does not guarantee safety.</p>
    </section>
    <section>
      <h3 className="text-base font-semibold">Content and sender indicators</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{result.features.map((f) => <div key={f.key} className={`rounded-lg border p-4 ${f.hit ? f.severity === "danger" ? "border-danger/35 bg-danger/5" : "border-warn/35 bg-warn/5" : "border-border bg-surface"}`}>
        <div className="flex justify-between gap-2"><p className="text-sm font-medium">{f.label}</p><span className={`shrink-0 font-mono text-xs ${f.hit ? "text-warn" : "text-safe"}`}>{f.hit ? `+${f.weight}` : "—"}</span></div>
        <p className="mt-1 break-all font-mono text-xs text-muted-foreground">{f.value}</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{f.note}</p>
      </div>)}</div>
    </section>
    <section>
      <h3 className="text-base font-semibold">Embedded links · {result.linkCount}</h3>
      {result.links.length ? <ul className="mt-3 divide-y divide-border">{result.links.map((link) => <li key={link.url} className="flex flex-wrap justify-between gap-2 py-3"><span className="min-w-0 break-all font-mono text-xs">{link.url}</span><span className={`text-xs ${VERDICT_META[link.verdict].text}`}>{VERDICT_META[link.verdict].label} · {link.riskScore}/100</span></li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No supported links detected.</p>}
      {result.linkCount > 20 ? <p className="text-xs text-warn">Only the first 20 unique links were checked.</p> : null}
    </section>
    {result.ai || result.aiError ? <section className="border-t border-border pt-5"><h3 className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-primary" />AI explanation</h3>{result.ai ? <><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{result.ai.summary}</p><ul className="mt-3 list-inside list-disc space-y-2 text-sm">{result.ai.indicators.map((indicator, i) => <li key={i}>{indicator}</li>)}</ul><p className="mt-4 text-sm font-medium">{result.ai.recommendation}</p></> : <p className="mt-3 text-sm text-warn">{result.aiError}</p>}</section> : null}
  </div>;
}