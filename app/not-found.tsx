import type { Metadata } from "next";
import Link from "next/link";
import SystemPage from "@/components/SystemPage";

export const metadata: Metadata = {
  title: "Page not found — Nutravey",
};

const destinations = [
  { name: "The Collection", path: "/shop" },
  { name: "Our Standards", path: "/standards" },
  { name: "About Nutravey", path: "/about" },
  { name: "Home", path: "/" },
];

export default function NotFound() {
  return (
    <SystemPage
      eyebrow="404 — Not Found"
      heading="Nothing formulated here."
      copy="The address may have changed, or it never existed. Everything we make is a short walk away."
    >
      <ul className="system-index">
        {destinations.map((d) => (
          <li key={d.path}>
            <Link href={d.path}>
              <span className="name">{d.name}</span>
              <span className="path">{d.path}</span>
            </Link>
          </li>
        ))}
      </ul>
    </SystemPage>
  );
}
