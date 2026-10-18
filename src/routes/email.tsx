import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { MessageScanner } from "@/components/MessageScanner";
import { DetectorNavigation } from "@/components/DetectorNavigation";
export const Route = createFileRoute("/email")({
  head: () => ({ meta: [
    { title: "Email Phishing Detection — PhishGuard.ai" },
    { name: "description", content: "Analyse email content, sender clues and embedded links for phishing risk with optional AI explanations." },
    { property: "og:title", content: "Email Phishing Detection — PhishGuard.ai" },
    { property: "og:description", content: "Check suspicious emails for credential theft, impersonation and unsafe links." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: EmailPage,
});
function EmailPage() {
  return <div className="mx-auto max-w-4xl px-5 py-12"><DetectorNavigation /><div className="mt-8 flex items-center gap-3"><Mail className="h-7 w-7 text-primary" /><h1 className="text-3xl font-semibold">Email phishing detection</h1></div><p className="mt-3 text-sm text-muted-foreground">Check an email before replying, sharing sensitive information, or following its links.</p><MessageScanner type="email" /></div>;
}