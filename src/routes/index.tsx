import { createFileRoute } from "@tanstack/react-router";
import heroImage from "../assets/hero.jpg";
import workOneImage from "../assets/work-1.jpg";
import workTwoImage from "../assets/work-2.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meridian Studio — Quiet brands for thoughtful companies" },
      { name: "description", content: "Meridian is a creative studio for brand identity, digital products, and art direction." },
      { property: "og:title", content: "Meridian Studio — Quiet brands for thoughtful companies" },
      { property: "og:description", content: "Meridian is a creative studio for brand identity, digital products, and art direction." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Header />

      <main>
        <Hero />
        <ClientList />
        <Services />
        <Work />
        <Testimonial />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="#" className="font-display text-2xl leading-none tracking-tight text-foreground">
          Meridian
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-stone sm:flex">
          <a href="#services" className="transition-colors hover:text-foreground">
            Services
          </a>
          <a href="#work" className="transition-colors hover:text-foreground">
            Work
          </a>
          <a href="#contact" className="transition-colors hover:text-foreground">
            Contact
          </a>
        </nav>
        <a
          href="#contact"
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
        >
          Start a project
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-16 lg:grid-cols-12 lg:gap-14 lg:pb-28 lg:pt-24">
      <div className="flex flex-col justify-end lg:col-span-7">
        <p className="mb-6 text-xs font-medium uppercase tracking-widest text-clay">
          Independent creative studio · Est. 2014
        </p>
        <h1 className="max-w-[16ch] text-balance text-5xl leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
          We build quiet brands that refuse to shout.
        </h1>
        <p className="mt-8 max-w-[44ch] text-lg leading-relaxed text-stone">
          A small studio working with founders and cultural institutions on identity, digital products, and the writing that carries them.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
          >
            Start a project
            <span aria-hidden="true">→</span>
          </a>
          <a href="#work" className="text-sm font-medium text-foreground transition-colors hover:text-clay">
            See selected work
          </a>
        </div>
      </div>
      <div className="lg:col-span-5">
        <figure>
          <img
            src={heroImage}
            alt="A still life of a ceramic vessel and folded linen on a warm cream surface"
            width={1024}
            height={1280}
            className="aspect-[4/5] w-full rounded-2xl object-cover"
          />
          <figcaption className="mt-3 text-xs text-stone">Studio still life, Copenhagen</figcaption>
        </figure>
      </div>
    </section>
  );
}

function ClientList() {
  const clients = [
    "Meridian Press",
    "Kestrel & Co",
    "The Fieldhouse",
    "Northwind Atlas",
    "Studio Halden",
  ];

  return (
    <section className="border-y border-border bg-secondary">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-6 py-6 text-sm text-stone">
        <span className="text-xs font-medium uppercase tracking-widest text-stone/70">Selected clients</span>
        {clients.map((client) => (
          <span key={client} className="font-display text-base">
            {client}
          </span>
        ))}
      </div>
    </section>
  );
}

function Services() {
  const services = [
    {
      number: "01",
      title: "Brand identity",
      description: "Naming, visual systems, and the voice that ties a brand together across every touchpoint.",
    },
    {
      number: "02",
      title: "Digital product",
      description: "Websites, interfaces, and product experiences designed to feel calm, legible, and precise.",
    },
    {
      number: "03",
      title: "Art direction",
      description: "Campaigns, photography, and editing guidance for teams shipping a considered image.",
    },
  ];

  return (
    <section id="services" className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <p className="text-xs font-medium uppercase tracking-widest text-clay">What we do</p>
          <h2 className="mt-5 max-w-[16ch] text-balance text-4xl leading-[1.02] tracking-tight lg:text-5xl">
            A short list, done with care.
          </h2>
        </div>
        <ul className="border-t border-border lg:col-span-8">
          {services.map((service) => (
            <li
              key={service.number}
              className="grid grid-cols-12 items-baseline gap-4 border-b border-border py-7 transition-colors hover:bg-paper/60"
            >
              <span className="col-span-2 text-sm text-stone lg:col-span-1">{service.number}</span>
              <span className="col-span-10 font-display text-2xl lg:col-span-4">{service.title}</span>
              <span className="col-span-12 text-pretty leading-relaxed text-stone lg:col-span-7">
                {service.description}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Work() {
  const projects = [
    {
      title: "Meridian Press",
      category: "Identity",
      image: workOneImage,
      alt: "A tablet displaying a clean editorial website on a warm paper surface",
      description: "A complete visual identity for an independent literary publisher.",
    },
    {
      title: "Fieldhouse",
      category: "Digital",
      image: workTwoImage,
      alt: "Branded packaging flat lay with business cards and rigid boxes",
      description: "A commerce experience for a maker-led homewares brand.",
    },
  ];

  return (
    <section id="work" className="mx-auto max-w-6xl px-6 pb-20 lg:pb-28">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-clay">Selected work</p>
          <h2 className="mt-4 text-balance text-4xl tracking-tight lg:text-5xl">Recent projects</h2>
        </div>
        <a href="#" className="hidden text-sm text-stone transition-colors hover:text-foreground sm:inline">
          All work →
        </a>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:gap-10">
        {projects.map((project, index) => (
          <article key={project.title} className={index === 1 ? "sm:mt-16" : ""}>
            <img
              src={project.image}
              alt={project.alt}
              width={1200}
              height={900}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
            <div className="mt-5 flex items-baseline justify-between gap-4">
              <h3 className="font-display text-2xl text-balance">{project.title}</h3>
              <span className="text-sm text-stone">{project.category}</span>
            </div>
            <p className="mt-2 max-w-[40ch] text-pretty text-stone">{project.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section className="border-y border-border bg-paper">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:py-28">
        <span className="font-display text-6xl leading-none text-clay/40 select-none" aria-hidden="true">
          “
        </span>
        <blockquote className="-mt-6 text-balance text-3xl leading-tight tracking-tight lg:text-4xl">
          Meridian gave our brand a stillness it had been missing for years. The work is precise, generous, and quietly
          confident.
        </blockquote>
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="grid size-11 place-items-center overflow-hidden rounded-full bg-stone/20">
            <span className="text-[8px] font-medium uppercase tracking-widest text-stone">IV</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">Ines Varga</p>
            <p className="text-sm text-stone">Founder, Meridian Press</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
      <div className="grid items-start gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-xs font-medium uppercase tracking-widest text-clay">Contact</p>
          <h2 className="mt-6 max-w-[14ch] text-balance text-5xl leading-[0.98] tracking-tight lg:text-6xl">
            Have something to make?
          </h2>
          <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-stone">
            We take on a small number of projects each season. Tell us a little about yours and we will reply within two
            days.
          </p>
        </div>
        <div className="lg:col-span-5 lg:pl-10">
          <a
            href="mailto:hello@meridian.studio"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
          >
            hello@meridian.studio
            <span aria-hidden="true">→</span>
          </a>
          <div className="mt-8 space-y-2 text-sm text-stone">
            <p>Studio Halden, Copenhagen</p>
            <p>By appointment only</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 sm:flex-row sm:items-center">
        <span className="font-display text-xl text-foreground">Meridian</span>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone">
          <a href="#services" className="transition-colors hover:text-foreground">
            Services
          </a>
          <a href="#work" className="transition-colors hover:text-foreground">
            Work
          </a>
          <a href="#contact" className="transition-colors hover:text-foreground">
            Contact
          </a>
        </nav>
        <p className="text-xs text-stone/70">© 2024 Meridian Studio — Made slowly</p>
      </div>
    </footer>
  );
}
