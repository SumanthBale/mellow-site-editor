import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { MessageScanner } from "@/components/MessageScanner";
import { DetectorNavigation } from "@/components/DetectorNavigation";
export const Route = createFileRoute("/sms")({
  head: () => ({ meta: [
    { title: "SMS Phishing Detection — PhishGuard.ai" },
    { name: "description", content: "Detect smishing indicators in SMS messages, including payment scams, OTP requests and suspicious links." },
    { property: "og:title", content: "SMS Phishing Detection — PhishGuard.ai" },
    { property: "og:description", content: "Check text messages for phishing and smishing risk with explainable indicators." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: SmsPage,
});
function SmsPage() {
  return <div className="mx-auto max-w-4xl px-5 py-12"><DetectorNavigation /><div className="mt-8 flex items-center gap-3"><MessageSquare className="h-7 w-7 text-primary" /><h1 className="text-3xl font-semibold">SMS phishing detection</h1></div><p className="mt-3 text-sm text-muted-foreground">Check unexpected text messages for smishing, payment scams, and credential requests.</p><MessageScanner type="sms" /></div>;
}