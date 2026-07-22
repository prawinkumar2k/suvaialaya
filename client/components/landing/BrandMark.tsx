import { Link } from "react-router-dom";

interface BrandMarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BrandMark({ size = "md", className = "" }: BrandMarkProps) {
  const sizeClass = size === "sm" ? "h-10" : size === "lg" ? "h-20" : "h-14";

  return (
    <Link
      to="/"
      className={`inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded ${className}`}
      aria-label="Suvaialaya home"
    >
      <img
        src="/logo.jpg"
        alt="Suvaialaya — South Indian Multi Cuisine Restaurant"
        className={`${sizeClass} w-auto object-contain`}
        onError={(e) => {
          // Fallback: text logo if image fails
          e.currentTarget.style.display = "none";
          const parent = e.currentTarget.parentElement;
          if (parent && !parent.querySelector(".logo-fallback")) {
            const fallback = document.createElement("div");
            fallback.className = "logo-fallback flex items-center gap-2";
            fallback.innerHTML = `
              <div style="width:40px;height:40px;border-radius:50%;background:#1a3d2b;display:flex;align-items:center;justify-content:center;">
                <span style="color:white;font-size:14px;font-weight:900;">S</span>
              </div>
              <div>
                <div style="font-weight:800;font-size:14px;letter-spacing:0.15em;color:#1a3d2b;">SUVAIALAYA</div>
                <div style="font-size:9px;letter-spacing:0.2em;color:#1a3d2b;opacity:0.5;text-transform:uppercase;">South Indian Multi Cuisine</div>
              </div>
            `;
            parent.appendChild(fallback);
          }
        }}
      />
    </Link>
  );
}
