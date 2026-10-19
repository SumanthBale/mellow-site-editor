import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasRecoveryMarker } from "@/lib/auth-flow";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Reset password — PhishGuard.ai" },
    { name: "description", content: "Set a new password for your PhishGuard.ai account using your secure email recovery link." },
    { property: "og:title", content: "Reset password — PhishGuard.ai" },
    { property: "og:description", content: "Recover access to your phishing detection account." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const marker = hasRecoveryMarker(window.location.hash, window.location.search);
    const verify = async () => {
      const { data, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      setReady(Boolean(data.user && !authError));
      setChecking(false);
    };
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // Run outside the auth callback to avoid locking the auth client.
        setTimeout(() => { if (active) void verify(); }, 0);
      }
    });
    if (marker) void verify();
    else setChecking(false);
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready) return;
    setError("");
    if (password !== confirmation) { setError("Passwords do not match."); return; }
    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setPassword("");
      setConfirmation("");
      setDone(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to reset your password. Request a new link.");
    } finally { setBusy(false); }
  }

  return <div className="mx-auto w-full max-w-md px-5 py-14">
    <h1 className="text-2xl font-semibold">Set a new password</h1>
    {checking ? <p role="status" className="mt-4 text-muted-foreground">Checking your reset link…</p>
      : done ? <div className="mt-6 space-y-4"><p role="status">Your password has been updated.</p><Button onClick={() => void navigate({ to: "/history" })}>Continue to history</Button></div>
      : ready ? <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="space-y-1.5"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" type="password" autoComplete="new-password" minLength={6} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div>
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : "Update password"}</Button>
      </form> : <div className="mt-6 space-y-4"><p role="alert" className="text-sm text-muted-foreground">This reset link is missing, invalid, or expired. Request a new link using Forgot password.</p><Button asChild><Link to="/auth">Back to sign in</Link></Button></div>}
  </div>;
}