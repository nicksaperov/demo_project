"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWalletStore } from "@/lib/store";

export default function DashboardClaimsPage() {
  const { address, token } = useWalletStore();

  const claims = useQuery({
    queryKey: ["my-claims"],
    queryFn: () => api("/users/me/claims"),
    enabled: !!token,
  });

  if (!address) {
    return (
      <div className="card">
        <h1 className="text-xl font-semibold">Claims</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Connect your wallet to see the full claim history for your account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-500">Dashboard</p>
        <h1 className="text-3xl font-bold">Claims</h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Review all your past and pending claims, transaction details, and the status of each claim.
        </p>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[var(--muted)]">
              <th className="py-3 px-4">Campaign</th>
              <th className="py-3 px-4">Claim ID</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Transaction</th>
              <th className="py-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {claims.isLoading ? (
              <tr>
                <td colSpan={5} className="p-4 text-sm text-[var(--muted)]">
                  Loading claim history…
                </td>
              </tr>
            ) : claims.error ? (
              <tr>
                <td colSpan={5} className="p-4 text-sm text-red-400">
                  {claims.error.message}
                </td>
              </tr>
            ) : (claims.data?.claims || []).map((claim) => (
              <tr key={claim.id} className="border-b border-white/5 last:border-none">
                <td className="py-3 px-4">{claim.campaign_name}</td>
                <td className="py-3 px-4 font-mono text-xs">{claim.claim_id ?? claim.id}</td>
                <td className="py-3 px-4 capitalize">{claim.status}</td>
                <td className="py-3 px-4 font-mono text-xs">
                  {claim.transaction_hash ? `${claim.transaction_hash.slice(0, 12)}…` : "Pending"}
                </td>
                <td className="py-3 px-4 text-[var(--muted)]">{new Date(claim.claimed_at ?? claim.updated_at ?? claim.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
