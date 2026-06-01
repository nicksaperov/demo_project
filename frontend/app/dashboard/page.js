"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { useWalletStore } from "@/lib/store";

function StatCard({ title, value, description }) {
  return (
    <div className="card rounded-3xl p-6 shadow-lg shadow-black/10">
      <p className="text-sm text-[var(--muted)]">{title}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      {description ? <p className="mt-3 text-sm text-[var(--muted)]">{description}</p> : null}
    </div>
  );
}

export default function DashboardOverviewPage() {
  const { address, token } = useWalletStore();

  const claims = useQuery({
    queryKey: ["my-claims"],
    queryFn: () => api("/users/me/claims"),
    enabled: !!token,
  });

  const eligible = useQuery({
    queryKey: ["my-eligible"],
    queryFn: () => api("/users/me/eligible"),
    enabled: !!token,
  });

  if (!address) {
    return (
      <div className="card">
        <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">
          Connect your wallet to view your profile, claim history, and eligible campaigns.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-500">Dashboard</p>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Review your recent airdrop activity, pending claims, and important account details.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Wallet Connected"
          value={address ? address.slice(0, 6) + "…" + address.slice(-4) : "Not connected"}
          description="Your active wallet for claim authorization."
        />
        <StatCard
          title="Eligible campaigns"
          value={eligible.data?.campaigns?.length ?? 0}
          description="Campaigns currently available to claim."
        />
        <StatCard
          title="Claims submitted"
          value={claims.data?.claims?.length ?? 0}
          description="Total claims you have submitted so far."
        />
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Quick actions</h2>
              <p className="text-sm text-[var(--muted)]">Jump directly to key dashboard sections.</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Claims", href: "/dashboard/claims" },
              { label: "Activity", href: "/dashboard/activity" },
              { label: "Rewards", href: "/dashboard/rewards" },
              { label: "Settings", href: "/dashboard/settings" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-white transition hover:border-brand-500 hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-xl font-semibold">Next steps</h2>
          <p className="text-sm text-[var(--muted)]">
            Navigate between claims, activity, rewards, and account settings to manage your wallet and your NFT airdrop allocations.
          </p>
          <div className="space-y-3">
            <Link href="/dashboard/claims" className="block rounded-2xl border border-white/10 bg-brand-500 px-4 py-3 text-sm font-semibold text-black text-center hover:bg-brand-400">
              View claim history
            </Link>
            <Link href="/dashboard/activity" className="block rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white text-center hover:bg-white/10">
              See recent activity
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
