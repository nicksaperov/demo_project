"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWalletStore } from "@/lib/store";

function RewardCard({ label, value, description }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-4 text-3xl font-semibold">{value}</p>
      <p className="mt-3 text-sm text-[var(--muted)]">{description}</p>
    </div>
  );
}

export default function DashboardRewardsPage() {
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

  const totalClaims = claims.data?.claims?.length ?? 0;
  const eligibleCampaigns = eligible.data?.campaigns?.length ?? 0;
  const completedClaims = (claims.data?.claims || []).filter((claim) => claim.status === "confirmed").length;

  if (!address) {
    return (
      <div className="card">
        <h1 className="text-xl font-semibold">Rewards</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Connect your wallet to track your reward totals and claim progress.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-500">Dashboard</p>
        <h1 className="text-3xl font-bold">Rewards</h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          See how many campaigns you qualify for, how many claims are completed, and your pending reward opportunities.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <RewardCard
          label="Active reward opportunities"
          value={eligibleCampaigns}
          description="Campaigns with NFT allocations you can still claim."
        />
        <RewardCard
          label="Total claims"
          value={totalClaims}
          description="All claim attempts associated with your wallet."
        />
        <RewardCard
          label="Completed claims"
          value={completedClaims}
          description="Successful claims with a completed status."
        />
      </div>

      <section className="card space-y-4">
        <h2 className="text-xl font-semibold">Reward insights</h2>
        <p className="text-sm text-[var(--muted)]">
          Rewards are updated automatically when your claim is confirmed on-chain and when new eligibility data is available.
        </p>
        <ul className="space-y-2 text-sm text-[var(--muted)]">
          <li>• Eligible campaigns are refreshed when your wallet signs in.</li>
          <li>• Completed claims count only includes finalized transactions.</li>
          <li>• Track transactions in the claims section once claims are submitted.</li>
        </ul>
      </section>
    </div>
  );
}
