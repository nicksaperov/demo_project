"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminModerationTable } from "@/components/AdminModerationTable";
import { api } from "@/lib/api";

export default function AdminPage() {
  const [wallet, setWallet] = useState("");
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();

  const analytics = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => api("/admin/analytics"),
  });

  const blacklist = useQuery({
    queryKey: ["admin-blacklist"],
    queryFn: () => api("/admin/blacklist"),
  });

  async function addBlacklist(e) {
    e.preventDefault();
    try {
      await api("/admin/blacklist", {
        method: "POST",
        body: JSON.stringify({ walletAddress: wallet, reason }),
      });
      setWallet("");
      setReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-blacklist"] });
    } catch (err) {
      alert(err.message);
    }
  }

  async function removeEntry(address) {
    if (!confirm(`Remove ${address} from blacklist?`)) return;
    try {
      await api(`/admin/blacklist/${encodeURIComponent(address)}`, {
        method: "DELETE",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-blacklist"] });
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Admin dashboard</h1>
        <p className="text-sm text-[var(--muted)]">
          Monitor campaign health, moderate pending drops, and manage blacklist access.
        </p>
      </div>

      {analytics.data && (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Campaigns", analytics.data.campaigns],
            ["Claims", analytics.data.claims],
            ["Unique claimers", analytics.data.uniqueClaimers],
            ["Users", analytics.data.users],
          ].map(([label, value]) => (
            <div key={label} className="card text-center">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-[var(--muted)]">{label}</p>
            </div>
          ))}
        </div>
      )}

      <section className="card">
        <h2 className="mb-4 font-semibold">Pending moderation</h2>
        <AdminModerationTable />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="card">
          <h2 className="mb-4 font-semibold">Blacklist wallet</h2>
          <form onSubmit={addBlacklist} className="flex flex-wrap gap-3">
            <input
              className="input flex-1"
              placeholder="0x…"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
            />
            <input
              className="input flex-1"
              placeholder="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <button type="submit" className="btn-primary">
              Add
            </button>
          </form>
          <p className="mt-3 text-xs text-[var(--muted)]">
            Blacklisted wallets are prevented from submitting claims or accessing restricted campaigns.
          </p>
        </div>

        <div className="card">
          <h2 className="mb-4 font-semibold">Current blacklist</h2>
          {blacklist.isLoading ? (
            <p className="text-sm text-[var(--muted)]">Loading blacklist…</p>
          ) : blacklist.error ? (
            <p className="text-sm text-red-400">{blacklist.error.message}</p>
          ) : !blacklist.data?.entries?.length ? (
            <p className="text-sm text-[var(--muted)]">No blacklisted wallets yet.</p>
          ) : (
            <div className="space-y-3">
              {blacklist.data.entries.map((entry) => (
                <div key={entry.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{entry.wallet_address}</p>
                      <p className="text-sm text-[var(--muted)]">{entry.reason || "No reason provided"}</p>
                    </div>
                    <button
                      type="button"
                      className="btn-ghost text-xs"
                      onClick={() => removeEntry(entry.wallet_address)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
