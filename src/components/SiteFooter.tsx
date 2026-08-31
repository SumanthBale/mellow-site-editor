export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 text-sm text-muted-foreground md:grid-cols-3">
        <div>
          <p className="font-display text-base font-semibold text-foreground">
            AI Based Phishing Detection System
          </p>
          <p className="mt-2 max-w-xs leading-relaxed">
            Final year major project, Department of Computer Science &amp;
            Engineering (Cyber Security), ACS College of Engineering, VTU.
          </p>
        </div>
        <div>
          <p className="font-medium text-foreground">Guide</p>
          <p className="mt-2">Deepa G</p>
          <p>Assistant Professor</p>
        </div>
        <div>
          <p className="font-medium text-foreground">Disclaimer</p>
          <p className="mt-2 leading-relaxed">
            Results are probabilistic and meant for academic demonstration. Always
            verify with your organisation&apos;s security team before acting.
          </p>
        </div>
      </div>
      <div className="border-t border-border px-5 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} PhishGuard.ai — Academic project prototype.
      </div>
    </footer>
  );
}
