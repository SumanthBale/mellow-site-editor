import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Brain,
  Cpu,
  Database,
  Gauge,
  Link2,
  Lock,
  ScanLine,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import { UrlScanner } from "@/components/UrlScanner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PhishGuard.ai — AI Based Phishing URL Detection" },
      {
        name: "description",
        content:
          "Paste any link and get an explainable phishing verdict from a machine-learning feature pipeline combined with AI reasoning. Live demo of an AI based phishing detection system.",
      },
      { property: "og:title", content: "PhishGuard.ai — AI Based Phishing URL Detection" },
      {
        property: "og:description",
        content:
          "Explainable phishing detection: 17 lexical URL features, risk scoring and AI-generated reasoning.",
      },
    ],
  }),
  component: HomePage,
});

const PIPELINE = [
  {
    icon: Link2,
    title: "URL intake",
    body: "The submitted link is normalised, parsed and split into host, path and query components.",
  },
  {
    icon: Cpu,
    title: "Feature extraction",
    body: "16 lexical and structural features are computed — IP hosts, '@' tricks, subdomain depth, TLD risk, entropy and more.",
  },
  {
    icon: Gauge,
    title: "Risk scoring",
    body: "Feature weights derived from the Random Forest importance ranking produce a 0–100 risk score and verdict.",
  },
  {
    icon: Brain,
    title: "AI reasoning",
    body: "A large language model turns the feature vector into a plain-English explanation the end user can act on.",
  },
];

const METRICS = [
  { label: "Random Forest", value: "98.1%", note: "Accuracy on the test split" },
  { label: "Neural Network", value: "96.5%", note: "Accuracy on the test split" },
  { label: "SVM", value: "94.2%", note: "Accuracy on the test split" },
  { label: "Latency", value: "< 2s", note: "End-to-end scan with AI reasoning" },
];

function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-backdrop" aria-hidden />
        <div className="absolute left-1/2 top-0 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs text-primary">
              <ScanLine className="h-3.5 w-3.5" />
              AI + ML phishing detection
            </span>
            <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
              Know if a link is{" "}
              <span className="text-primary">phishing</span> before you click it
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground">
              PhishGuard.ai extracts the lexical and structural fingerprints of a URL,
              scores them against machine-learning derived weights, and uses AI to
              explain the verdict in plain language.
            </p>
          </div>

          <div className="mt-10">
            <UrlScanner />
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m) => (
            <div key={m.label} className="rounded-xl border border-border bg-surface p-5">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {m.label}
              </p>
              <p className="mt-2 font-display text-3xl font-semibold text-primary">
                {m.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{m.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-2xl font-semibold sm:text-3xl">How the detection works</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            A four-stage pipeline that mirrors the architecture proposed in the project
            report: preprocessing, feature engineering, classification and explanation.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {PIPELINE.map((step, i) => (
              <div
                key={step.title}
                className="relative rounded-xl border border-border bg-surface p-5"
              >
                <span className="absolute right-4 top-4 font-mono text-xs text-muted-foreground">
                  0{i + 1}
                </span>
                <step.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Built as a final year cyber security project
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Phishing remains the entry point for the majority of data breaches.
              Traditional blacklists only catch links that have already been reported,
              which leaves a dangerous window for zero-hour attacks. This system learns
              the patterns that phishing URLs share, so previously unseen links can still
              be flagged.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/project">Read the project</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/team">Meet the team</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: ShieldCheck, t: "Zero-hour coverage", d: "Detects new phishing URLs that no blacklist has seen yet." },
              { icon: Workflow, t: "Explainable output", d: "Every verdict lists the exact features that triggered it." },
              { icon: Database, t: "Scan history", d: "Signed-in users keep an auditable log of every analysed link." },
              { icon: Lock, t: "Privacy first", d: "Only the URL is analysed — the page itself is never fetched." },
            ].map((c) => (
              <div key={c.t} className="rounded-xl border border-border bg-surface p-5">
                <c.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 text-sm font-semibold">{c.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {c.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
