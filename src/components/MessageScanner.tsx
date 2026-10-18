import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Loader2, ScanLine, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageResult } from "./MessageResult";
import { MessageInput } from "@/lib/message-features";
import { scanMessage, type MessageScanResult } from "@/lib/message-scan.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const SAMPLES = {
  email: { sender: "security@paypal-account.top", subject: "Urgent: PayPal account suspended", content: "Dear customer, your PayPal account is suspended. Verify your account immediately. Click http://paypal-account.top/login and enter your password and OTP to restore access." },
  sms: { sender: "DELIVERY", subject: "", content: "Urgent: payment required for your parcel. Pay the delivery fee and verify your account at http://delivery-verify.top/login. Enter your card PIN to avoid return." },
};
export function MessageScanner({ type }: { type: "email" | "sms" }) {
  const { user } = useAuth();
  const runScan = useServerFn(scanMessage);
  const [content, setContent] = useState("");
  const [sender, setSender] = useState("");
  const [subject, setSubject] = useState("");
  const [useAi, setUseAi] = useState(false);
  const [save, setSave] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<MessageScanResult | null>(null);
  const [error, setError] = useState("");
  const limit = type === "sms" ? 2000 : 20000;
  async function submit() {
    const parsed = MessageInput.safeParse({ type, content, sender, subject, useAi });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check your message."); return; }
    setBusy(true); setError(""); setResult(null);
    try {
      const res = await runScan({ data: parsed.data }); setResult(res);
      if (user && save) {
        const { error: saveError } = await supabase.from("scans").insert({
          user_id: user.id, scan_type: type, url: type === "email" ? subject || "Email message" : "SMS message", host: sender || null,
          message_content: res.content, sender: res.sender || null, subject: res.subject || null, verdict: res.verdict, risk_score: res.riskScore, confidence: 0,
          features: res.features.map((f) => ({ key: f.key, label: f.label, value: f.value, weight: f.weight, hit: f.hit })),
          ai_summary: res.ai?.summary ?? null, ai_indicators: res.ai?.indicators ?? [], ai_recommendation: res.ai?.recommendation ?? null,
          analysis_details: JSON.parse(JSON.stringify(res)),
        });
        if (saveError) toast.error("Analysis completed, but history could not be saved."); else toast.success("Saved to your scan history.");
      }
    } catch { setError("The message could not be analysed. Please try again."); } finally { setBusy(false); }
  }
  return <>
    <form className="mt-8 space-y-5" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
      <div className={type === "email" ? "grid gap-4 sm:grid-cols-2" : "max-w-md"}>
        <div className="space-y-2"><Label htmlFor={`${type}-sender`}>{type === "email" ? "Sender email (optional)" : "Sender number or ID (optional)"}</Label><Input id={`${type}-sender`} type={type === "email" ? "email" : "text"} value={sender} maxLength={320} disabled={busy} onChange={(e) => setSender(e.target.value)} placeholder={type === "email" ? "sender@example.com" : "+91… or sender ID"} /></div>
        {type === "email" ? <div className="space-y-2"><Label htmlFor="email-subject">Subject (optional)</Label><Input id="email-subject" value={subject} maxLength={300} disabled={busy} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" /></div> : null}
      </div>
      <div className="space-y-2"><Label htmlFor={`${type}-content`}>{type === "email" ? "Email body" : "SMS message"}</Label><Textarea id={`${type}-content`} value={content} maxLength={limit} disabled={busy} onChange={(e) => setContent(e.target.value)} placeholder={type === "email" ? "Paste the email body, including any links…" : "Paste the text message…"} className="min-h-48 bg-surface text-sm" /><p className="text-right font-mono text-xs text-muted-foreground">{content.length.toLocaleString()}/{limit.toLocaleString()}</p></div>
      <div className="flex flex-wrap gap-3"><Button type="button" variant="secondary" size="sm" disabled={busy} onClick={() => { const s = SAMPLES[type]; setSender(s.sender); setSubject(s.subject); setContent(s.content); setResult(null); setError(""); }}>Suspicious example</Button><Button type="button" variant="secondary" size="sm" disabled={busy} onClick={() => { setSender(type === "email" ? "classmate@example.edu" : "Classmate"); setSubject(type === "email" ? "Project meeting" : ""); setContent("Our project meeting is at 10 tomorrow in room 204. Please bring your notes."); setResult(null); setError(""); }}>Routine example</Button><Button type="button" variant="ghost" size="icon" aria-label="Clear message" disabled={busy} onClick={() => { setContent(""); setSender(""); setSubject(""); setResult(null); setError(""); }}><RotateCcw className="h-4 w-4" /></Button></div>
      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex items-start gap-2"><Checkbox id={`${type}-ai`} checked={useAi} disabled={busy} onCheckedChange={(v) => setUseAi(v === true)} /><Label htmlFor={`${type}-ai`} className="text-sm leading-5">Include AI explanation — sends message content to the AI service</Label></div>
        {user ? <div className="flex items-start gap-2"><Checkbox id={`${type}-save`} checked={save} disabled={busy} onCheckedChange={(v) => setSave(v === true)} /><Label htmlFor={`${type}-save`} className="text-sm leading-5">Save message and results to my private history</Label></div> : <p className="text-xs text-muted-foreground"><Link to="/auth" className="text-primary">Sign in</Link> to save your results.</p>}
        <p className="text-xs text-muted-foreground">Remove sensitive personal information before scanning. Links and attachments are not opened.</p>
      </div>
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" size="lg" disabled={busy} className="gap-2">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}{busy ? "Analysing…" : type === "email" ? "Analyse email" : "Analyse SMS"}</Button>
    </form>
    {result ? <MessageResult result={result} /> : null}
  </>;
}