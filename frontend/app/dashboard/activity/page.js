"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWalletStore } from "@/lib/store";

function ActivityItem({ title, subtitle, time }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{time}</p>
    </div>
  );
}

export default function DashboardActivityPage() {
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
        <h1 className="text-xl font-semibold">Activity</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Connect your wallet to review recent campaign activity and claim updates.
        </p>
      </div>
    );
  }

  const recentClaims = (claims.data?.claims || []).slice(0, 4);
  const recentEligible = (eligible.data?.campaigns || []).slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-500">Dashboard</p>
        <h1 className="text-3xl font-bold">Recent activity</h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Track your latest claim activity and the campaigns you are eligible to claim from.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent claims</h2>
            <span className="text-sm text-[var(--muted)]">Last 4</span>
          </div>
          {claims.isLoading ? (
            <p className="text-sm text-[var(--muted)]">Loading claims…</p>
          ) : claims.error ? (
            <p className="text-sm text-red-400">{claims.error.message}</p>
          ) : recentClaims.length ? (
            <div className="space-y-3">
              {recentClaims.map((claim) => (
                <ActivityItem
                  key={claim.id}
                  title={`${claim.campaign_name} — ${claim.status}`}
                  subtitle={claim.transaction_hash ? `Tx ${claim.transaction_hash.slice(0, 10)}…` : "Pending confirmation"}
                  time={new Date(claim.claimed_at || claim.updated_at || claim.created_at).toLocaleString()}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">You have no recent claims yet.</p>
          )}
        </section>

        <section className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Eligibility updates</h2>
            <span className="text-sm text-[var(--muted)]">Available now</span>
          </div>
          {eligible.isLoading ? (
            <p className="text-sm text-[var(--muted)]">Checking eligible campaigns…</p>
          ) : eligible.error ? (
            <p className="text-sm text-red-400">{eligible.error.message}</p>
          ) : recentEligible.length ? (
            <div className="space-y-3">
              {recentEligible.map((campaign) => (
                <ActivityItem
                  key={campaign.id}
                  title={campaign.name}
                  subtitle={campaign.description || "Eligible for claim"}
                  time={campaign.startTime ? new Date(campaign.startTime).toLocaleDateString() : "Live now"}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">No eligible campaigns were found for your wallet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
