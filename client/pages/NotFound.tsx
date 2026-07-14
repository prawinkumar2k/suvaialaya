import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 text-center text-foreground">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">404</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">This page is not here.</h1>
        <p className="mt-3 text-muted-foreground">Let’s get you back to the events that are.</p>
        <Link to="/" className="mt-7 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Go home</Link>
      </div>
    </main>
  );
}
