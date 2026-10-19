import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { signupOutcome } from "@/lib/auth-flow";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — PhishGuard.ai Phishing Detection" },
      {
        name: "description",
        content:
          "Sign in to PhishGuard.ai to save your URL phishing scans and review your detection history.",
      },
      { property: "og:title", content: "Sign in — PhishGuard.ai" },
      {
        property: "og:description",
        content: "Access your saved phishing scan history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/history" });
  }, [loading, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice("");
    setFormError("");
    try {
      const address = email.trim();
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(address, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setNotice("If an account exists for this email, a password reset link has been sent. Check your inbox and spam folder.");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: address,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        const outcome = signupOutcome(data);
        if (outcome === "signed-in") {
          toast.success("Account created. You're signed in.");
        } else {
          setNotice(outcome === "existing-account"
            ? "This email may already have an account. Sign in with Google if you registered with Google, or use Forgot password to set a password."
            : "Check your email for a confirmation link before signing in. If you already registered with Google, continue with Google or use Forgot password to set a password.");
          setPassword("");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: address, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
    } catch (error) {
      const authError = error as { code?: string; message?: string };
      setFormError(authError.code === "invalid_credentials"
        ? "Email or password is incorrect. If you created your account with Google, continue with Google or use Forgot password to set a password."
        : authError.message || "Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Try email instead.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/history" });
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-5 py-14">
      <div className="rounded-xl border border-border bg-surface p-6 glow-ring">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="h-5 w-5" />
          <span className="font-mono text-xs uppercase tracking-widest">
            Secure access
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold">
          {mode === "signin" ? "Sign in" : mode === "forgot" ? "Reset your password" : "Create an account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Save every scan and review your phishing detection history.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="bg-background"
              />
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
              className="bg-background"
            />
          </div>
          {mode !== "forgot" ? <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-background"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </div> : null}
          {notice ? <p role="status" className="text-sm text-foreground">{notice}</p> : null}
          {formError ? <p role="alert" className="text-sm text-destructive">{formError}</p> : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : mode === "forgot" ? "Send reset link" : "Sign up"}
          </Button>
        </form>
        {mode === "signin" ? <Button variant="link" className="mt-2 px-0" disabled={busy} onClick={() => { setMode("forgot"); setNotice(""); setFormError(""); }}>Forgot password?</Button> : null}

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <Button variant="secondary" className="w-full" onClick={() => void handleGoogle()}>
          Continue with Google
        </Button>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New here? " : "Already registered? "}
          <Button
            variant="link"
            type="button"
            className="h-auto p-0"
            disabled={busy}
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setNotice(""); setFormError(""); setPassword(""); }}
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </Button>
        </p>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Back to the detector
          </Link>
        </p>
      </div>
    </div>
  );
}
