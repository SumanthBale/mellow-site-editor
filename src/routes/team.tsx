import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, User } from "lucide-react";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team — AI Based Phishing Detection System" },
      {
        name: "description",
        content:
          "The final year cyber security engineering team behind the AI based phishing detection system at ACS College of Engineering, VTU.",
      },
      { property: "og:title", content: "Team — AI Based Phishing Detection System" },
      {
        property: "og:description",
        content: "Students and guide behind the AI based phishing detection major project.",
      },
    ],
  }),
  component: TeamPage,
});

const MEMBERS = [
  "Bale Sumanth",
  "Nishanth K J",
  "Saiprem Gadde",
  "Tanmay Preetam Bele",
];

function TeamPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">
        Project team
      </p>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
        Built by four cyber security engineering students
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Department of Computer Science &amp; Engineering (Cyber Security), ACS College
        of Engineering, Bengaluru — affiliated to Visvesvaraya Technological
        University, Belagavi.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {MEMBERS.map((name) => (
          <div key={name} className="rounded-xl border border-border bg-surface p-5">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/12 text-primary">
              <User className="h-5 w-5" />
            </span>
            <p className="mt-4 font-display text-lg font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">
              B.E. Computer Science &amp; Engineering (Cyber Security)
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-5">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
          <GraduationCap className="h-5 w-5" />
        </span>
        <p className="mt-4 font-display text-lg font-semibold">Ms. Sanjana R Chavan</p>
        <p className="text-sm text-muted-foreground">
          Project Guide · Assistant Professor, Department of CSE (Cyber Security)
        </p>
      </div>
    </div>
  );
}
