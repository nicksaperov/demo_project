"use client";

import Link from "next/link";
import { WalletConnector } from "./WalletConnector";

const links = [
  { href: "/", label: "Campaigns" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/creator/campaigns", label: "Creator" },
  { href: "/admin", label: "Admin" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-xl shadow-lg shadow-black/20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="relative group">
          <span className="text-lg font-bold bg-gradient-to-r from-brand-500 via-blue-400 to-purple-500 bg-clip-text text-transparent group-hover:from-brand-400 group-hover:to-blue-300 transition-all">
            AirdropHub
          </span>
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-500 to-blue-400 group-hover:w-full transition-all duration-300" />
        </Link>
        <nav className="hidden gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="relative text-sm text-[var(--muted)] hover:text-white transition-colors group"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-500 to-blue-400 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </nav>
        <WalletConnector />
      </div>
    </header>
  );
}
