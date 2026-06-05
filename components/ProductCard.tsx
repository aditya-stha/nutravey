import Link from "next/link";

interface ProductCardProps {
  name: string;
  flavour: "strawberry" | "lychee" | "lemon";
  slug: string;
  price: string;
  tagline: string;
}

const flavourAccent: Record<ProductCardProps["flavour"], string> = {
  strawberry: "var(--color-strawberry)",
  lychee: "var(--color-lychee)",
  lemon: "var(--color-lemon)",
};

export default function ProductCard({
  name,
  flavour,
  slug,
  price,
  tagline,
}: ProductCardProps) {
  const accent = flavourAccent[flavour];

  return (
    <Link href={`/products/${slug}`} className="group block">
      {/* Product visual placeholder */}
      <div
        style={{
          width: "100%",
          aspectRatio: "3 / 4",
          backgroundColor: "var(--color-surface-warm)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Flavour accent strip at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            backgroundColor: accent,
          }}
        />
      </div>

      {/* Card metadata */}
      <div style={{ paddingTop: "16px", paddingBottom: "24px" }}>
        <p
          className="mono-label"
          style={{ color: accent, marginBottom: "4px" }}
        >
          {flavour}
        </p>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "20px",
            letterSpacing: "-0.01em",
            color: "var(--color-ink)",
            marginBottom: "8px",
          }}
        >
          {name}
        </h3>
        <p
          className="mono-body"
          style={{
            fontSize: "13px",
            color: "var(--color-ink-muted)",
            marginBottom: "16px",
          }}
        >
          {tagline}
        </p>
        <div className="flex items-center justify-between">
          <span
            className="mono-cta"
            style={{ color: "var(--color-ink)" }}
          >
            {price}
          </span>
          <span
            className="mono-cta transition-opacity duration-200 group-hover:opacity-50"
            style={{ color: "var(--color-ink)" }}
          >
            Add to cart →
          </span>
        </div>
      </div>
    </Link>
  );
}
