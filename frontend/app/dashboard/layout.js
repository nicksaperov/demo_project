import Link from "next/link";

const tabs = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/claims", label: "Claims" },
  { href: "/dashboard/activity", label: "Activity" },
  { href: "/dashboard/rewards", label: "Rewards" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardLayout({ children }) {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/5">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-2">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="rounded-2xl px-4 py-2 text-sm font-semibold text-[var(--muted)] transition hover:bg-white/10 hover:text-white"
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
