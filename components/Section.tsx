import { CSSProperties, ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Skip the default section-padding (useful for hero sections with custom heights) */
  noPadding?: boolean;
  /** Skip the content-rail max-width wrapper */
  fullBleed?: boolean;
}

export default function Section({
  children,
  className = "",
  style,
  noPadding = false,
  fullBleed = false,
}: SectionProps) {
  return (
    <section className={className} style={style}>
      <div className={`${fullBleed ? "" : "content-rail"} ${noPadding ? "" : "section-padding"}`}>
        {children}
      </div>
    </section>
  );
}
