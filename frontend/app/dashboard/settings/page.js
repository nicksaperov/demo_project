"use client";

import { useState } from "react";
import { useWalletStore } from "@/lib/store";

export default function DashboardSettingsPage() {
  const { address, disconnect, token } = useWalletStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-500">Dashboard</p>
        <h1 className="text-3xl font-bold">Account settings</h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Manage your wallet connection and local session state for the airdrop dashboard.
        </p>
      </div>

      <div className="card space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Connected wallet</h2>
            <p className="mt-3 text-sm text-white">{address ?? "No wallet connected."}</p>
            {address ? (
              <button
                type="button"
                onClick={handleCopy}
                className="mt-4 inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                {copied ? "Copied" : "Copy address"}
              </button>
            ) : null}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Session token</h2>
            <p className="mt-3 text-sm text-white">{token ? "Connected" : "No active session"}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Your token is stored locally and used to access private claim data.</p>
          </div>
        </div>

        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/20 p-6">
          <h2 className="text-lg font-semibold">Danger zone</h2>
          <p className="text-sm text-[var(--muted)]">
            Disconnecting will clear your local auth token and wallet connection. You can reconnect anytime.
          </p>
          <button
            type="button"
            onClick={disconnect}
            className="inline-flex rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-rose-400"
          >
            Disconnect wallet
          </button>
        </div>
      </div>
    </div>
  );
}
