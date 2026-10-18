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
        <div className="space-y-2"><Label htmlFor={`${type}-sender`}>{type === "email" ? "Sender email (optional)" : "Sender number or ID (optional)"}</Label><Input id={`${type}-sender`} type={type === "email" ? "email" : "text"} value={sender} maxLength={320} disabled={busy} onChange={(e) => setSender(e.target.value)} placeholder={type === "email" ? "sender@example.com" : "+91… or sender ID