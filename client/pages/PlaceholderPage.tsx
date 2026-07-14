import { ArrowLeft, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { BrandMark } from "@/components/landing/BrandMark";

export default function PlaceholderPage() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  const title = (segments[segments.length - 1] ?? "Page").replace(/-/g, " ");

  return (
    <main className="min-h-screen bg-background px-6 py-6 text-foreground sm:px-10">
      <BrandMark />
      <section className="mx-auto flex min-h-[80vh] max-w-xl flex-col items-center justify-center text-center">
        <span className="mb-6 grid size-14 place-items-center rounded-2xl bg-secondary text-primary"><Sparkles size={24} /></span>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Coming next</p>
        <h1 className="text-4xl font-bold capitalize tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">This area is ready for its dedicated experience. Continue prompting to shape this part of Gatefold.</p>
        <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ArrowLeft size={16} /> Back to home
        </Link>
      </section>
    </main>
  );
}
