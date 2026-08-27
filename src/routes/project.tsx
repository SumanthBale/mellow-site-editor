import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/project")({
  head: () => ({
    meta: [
      { title: "Project Report — AI Based Phishing Detection System" },
      {
        name: "description",
        content:
          "Problem statement, objectives, system architecture, datasets, machine learning models and results of the AI based phishing detection system major project.",
      },
      { property: "og:title", content: "Project Report — AI Based Phishing Detection System" },
      {
        property: "og:description",
        content:
          "Objectives, architecture, ML models and results of the phishing detection major project.",
      },
    ],
  }),
  component: ProjectPage,
});

const OBJECTIVES = [
  "Detect phishing URLs at an early stage, before the victim submits credentials.",
  "Engineer lexical, host-based and content-based features from raw URLs.",
  "Train and compare Random Forest, SVM and Neural Network classifiers.",
  "Reduce false positives so that legitimate traffic is not disrupted.",
  "Deliver the trained model through an accessible web interface.",
  "Explain each verdict so that non-technical users can act on it.",
];

const FEATURES = [
  ["Address bar", "URL length, '@' symbol, '//' redirect, hyphenated domain, subdomain depth, IP-as-host, port, punycode"],
  ["Domain", "Domain age from WHOIS, registration length, DNS record presence, web traffic rank"],
  ["Security", "HTTPS validity, SSL certificate issuer and age, favicon origin"],
  ["Content", "iFrame redirection, right-click disabling, pop-up windows, anchor and form action targets"],
];

const MODELS = [
  { name: "Random Forest", acc: "98.1%", note: "Best overall; ensemble of decision trees handles mixed feature types and resists overfitting." },
  { name: "Neural Network", acc: "96.5%", note: "Multi-layer perceptron; captures non-linear feature interactions but needs more data." },
  { name: "Support Vector Machine", acc: "94.2%", note: "Strong margin-based baseline; slower to train on large feature sets." },
];

const STACK = [
  ["Language", "Python 3"],
  ["ML libraries", "Scikit-learn, Pandas, NumPy"],
  ["Datasets", "PhishTank, UCI Phishing Websites, Alexa/Tranco legitimate URLs"],
  ["Backend", "Server functions running the feature pipeline and AI reasoning layer"],
  ["Frontend", "React web application with live scanning and scan history"],
  ["Database", "PostgreSQL with row-level security for per-user scan history"],
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border py-12">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ProjectPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">
        Major Project · Phase 1
      </p>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
        AI Based Phishing Detection System
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Submitted in partial fulfilment of the requirements for the Bachelor of
        Engineering degree in Computer Science &amp; Engineering (Cyber Security),
        ACS College of Engineering, affiliated to Visvesvaraya Technological
        University, Belagavi.
      </p>

      <Section title="Problem statement">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Phishing attacks impersonate trusted organisations to steal credentials,
          financial data and personal information. Signature and blacklist based
          defences only recognise URLs that have already been reported, so newly
          registered phishing domains stay effective during their most dangerous
          hours. An intelligent system is required that generalises from the
          structural patterns of known phishing links to unseen ones.
        </p>
      </Section>

      <Section title="Objectives">
        <ul className="grid gap-2 sm:grid-cols-2">
          {OBJECTIVES.map((o) => (
            <li
              key={o}
              className="rounded-lg border border-border bg-surface p-3 text-sm leading-relaxed text-muted-foreground"
            >
              {o}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="System architecture">
        <div className="rounded-xl border border-border bg-surface p-5">
          <pre className="overflow-x-auto font-mono text-xs leading-6 text-muted-foreground">{`  URL input
      |
      v
  [ Preprocessing ]  normalise, parse, tokenize
      |
      v
  [ Feature extraction ]  address-bar | domain | security | content
      |
      v
  [ Classifier ]  Random Forest / SVM / Neural Network
      |
      v
  [ Risk score + verdict ]  safe | suspicious | phishing
      |
      v
  [ AI reasoning layer ]  natural-language explanation
      |
      v
  [ Web interface ]  result card + persisted scan history`}</pre>
        </div>
      </Section>

      <Section title="Feature groups">
        <div className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map(([group, detail]) => (
            <div key={group} className="rounded-xl border border-border bg-surface p-4">
              <p className="font-display text-sm font-semibold text-primary">{group}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {detail}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          The live demo on this site implements the address-bar and security feature
          groups, which are computable from the URL alone without fetching the target
          page. Domain-age and content features require WHOIS and page retrieval and
          are part of the offline training pipeline.
        </p>
      </Section>

      <Section title="Models and results">
        <div className="space-y-3">
          {MODELS.map((m) => (
            <div
              key={m.name}
              className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-display text-base font-semibold">{m.name}</p>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {m.note}
                </p>
              </div>
              <p className="font-display text-2xl font-semibold text-primary">{m.acc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Technology stack">
        <dl className="grid gap-3 sm:grid-cols-2">
          {STACK.map(([k, v]) => (
            <div key={k} className="rounded-xl border border-border bg-surface p-4">
              <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {k}
              </dt>
              <dd className="mt-1.5 text-sm">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <section className="py-12">
        <h2 className="text-2xl font-semibold">Future scope</h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>• Browser extension that scores links in place before the user clicks.</li>
          <li>• Real-time retraining from live PhishTank feeds to counter concept drift.</li>
          <li>• Page-content and screenshot analysis for visual brand-impersonation detection.</li>
          <li>• Email gateway integration to scan links inside incoming mail.</li>
          <li>• Adversarial robustness testing against deliberately obfuscated URLs.</li>
        </ul>
      </section>
    </div>
  );
}
