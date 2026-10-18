import { Link } from "@tanstack/react-router";
import { Link2, Mail, MessageSquare } from "lucide-react";
export function DetectorNavigation() {
  return <nav aria-label="Detection modules" className="flex flex-wrap gap-2">
    {([{ to: "/", label: "URL", icon: Link2 }, { to: "/email", label: "Email", icon: Mail }, { to: "/sms", label: "SMS", icon: MessageSquare }] as const).map((item) => <Link key={item.to} to={item.to} activeOptions={{ exact: true }} activeProps={{ className: "border-primary bg-primary/10 text-primary" }} className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-muted-foreground"><item.icon className="h-4 w-4" />{item.label}</Link>)}
  </nav>;
}