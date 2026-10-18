import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Trash2, ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { VERDICT_META } from "@/lib/phishing-features";
import { MessageResult } from "@/components/MessageResult";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MessageInput, analyzeMessage } from "@/lib/message-features";
import type { MessageScanResult } from "@/lib/message-scan.functions";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Scan History — PhishGuard.ai" },
      {
        name: "description",
        content:
          "Review your URL, email and SMS phishing scans, risk scores and AI explanations.",
      },
      { property: "og:title", content: "Scan History — PhishGuard.ai" },
      {
        property: "og:description",
        content: "Your saved phishing detection results and risk scores.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

interface ScanRow {
  id: string;
  url: string;
  host: string | null;
  verdict: "safe" | "suspicious" | "phishing";
  risk_score: number;
  confidence: number;
  ai_summary: string | null;
  created_at: string;
  scan_type: string;
  message_content: string | null;
  sender: string | null;
  subject: string | null;
  ai_indicators: unknown;
  ai_recommendation: string | null;
}

function HistoryPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<ScanRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState<ScanRow | null>(null);
  const parsedDetail = detail ? MessageInput.safeParse({ type: detail.scan_type, content: detail.message_content, sender: detail.sender ?? "", subject: detail.subject ?? "" }) : null;
  const detailResult: MessageScanResult | null = parsedDetail?.success && detail ? {
    ...analyzeMessage(parsedDetail.data), riskScore: detail.risk_score, verdict: detail.verdict,
    ai: detail.ai_summary ? { summary: detail.ai_summary, indicators: Array.isArray(detail.ai_indicators) ? detail.ai_indicators.filter((x): x is string => typeof x === "string") : [], recommendation: detail.ai_recommendation ?? "" } : null, aiError: null,
  } : null;

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void (async () => {
      setFetching(true);
      const { data, error } = await supabase
        .from("scans")
        .select("id,url,host,verdict,risk_score,confidence,ai_summary,created_at,scan_type,message_content,sender,subject,ai_indicators,ai_recommendation")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!active) return;
      if (error) toast.error("Could not load your scan history.");
      setRows((data ?? []) as ScanRow[]);
      setFetching(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const stats = useMemo(() => {
    const total = rows.length;
    const phishing = rows.filter((r) => r.verdict === "phishing").length;
    const suspicious = rows.filter((r) => r.verdict === "suspicious").length;
    const avg = total
      ? Math.round(rows.reduce((a, r) => a + r.risk_score, 0) / total)
      : 0;
    return { total, phishing, suspicious, avg };
  }, [rows]);

  async function remove(id: string) {
    const { error } = await supabase.from("scans").delete().eq("id", id);
    if (error) {
      toast.error("Could not delete that scan.");
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Scan removed.");
  }

  if (loading || !user) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <h1 className="text-3xl font-semibold">Scan history</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your saved URL, email and SMS analyses, newest first.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          { label: "Total scans", value: stats.total },
          { label: "Phishing", value: stats.phishing },
          { label: "Suspicious", value: stats.suspicious },
          { label: "Avg. risk", value: `${stats.avg}/100` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="font-display text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2" aria-label="Filter scan history">{["all", "url", "email", "sms"].map((type) => <Button key={type} size="sm" variant={filter === type ? "default" : "secondary"} onClick={() => setFilter(type)}>{type === "all" ? "All" : type.toUpperCase()}</Button>)}</div>
      <div className="mt-8 space-y-3">
        {fetching ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : rows.filter((r) => filter === "all" || r.scan_type === filter).length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">No scans yet.</p>
            <Button asChild className="mt-4">
              <Link to="/">Open detector</Link>
            </Button>
          </div>
        ) : (
          rows.filter((r) => filter === "all" || r.scan_type === filter).map((row) => {
            const meta = VERDICT_META[row.verdict] ?? VERDICT_META.suspicious;
            const Icon =
              row.verdict === "safe"
                ? CheckCircle2
                : row.verdict === "suspicious"
                  ? AlertTriangle
                  : ShieldAlert;
            return (
              <div
                key={row.id}
                className={`flex flex-col gap-3 rounded-xl border ${meta.ring} bg-surface p-4 sm:flex-row sm:items-center`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${meta.text}`} />
                <div className="min-w-0 flex-1">
                  <p className="mb-1 font-mono text-xs uppercase text-primary">{row.scan_type}{row.sender ? ` · ${row.sender}` : ""}</p>
                  <p className="truncate font-mono text-sm">{row.url}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {row.ai_summary ?? "No AI explanation stored."}
                  </p>
                </div>
                <div className="flex items-center gap-4 sm:justify-end">
                  {row.scan_type !== "url" ? <Button variant="secondary" size="sm" onClick={() => setDetail(row)}>View result</Button> : null}
                  <div className="text-right">
                    <p className={`font-display text-sm font-semibold ${meta.text}`}>
                      {meta.label}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {row.risk_score}/100 · {new Date(row.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete scan"
                    onClick={() => void remove(row.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
      <Dialog open={Boolean(detail)} onOpenChange={(open) => { if (!open) setDetail(null); }}><DialogContent className="max-h-[85vh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto"><DialogTitle>{detail?.scan_type.toUpperCase()} scan result</DialogTitle><DialogDescription>Saved message and phishing assessment</DialogDescription>{detail?.subject ? <p className="break-words text-sm font-medium">{detail.subject}</p> : null}<p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{detail?.message_content}</p>{detailResult ? <MessageResult result={detailResult} /> : null}</DialogContent></Dialog>
    </div>
  );
}
