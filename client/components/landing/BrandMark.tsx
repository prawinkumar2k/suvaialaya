import { Link } from "react-router-dom";

export function BrandMark() {
  return (
    <Link to="/" className="inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded" aria-label="Suvaialaya home">
      <img 
        src="/suvaialaya-logo.png" 
        alt="Suvaialaya Logo" 
        className="h-14 w-auto object-contain drop-shadow-sm" 
      />
    </Link>
  );
}
