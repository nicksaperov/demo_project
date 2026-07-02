"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CampaignCard } from "@/components/CampaignCard";
import Web3Login from "@/components/Web3Login";

const statusOptions = ["", "active", "draft", "pending_review"];
const eligibilityOptions = ["", "public", "whitelist", "erc20", "erc721", "role", "multi"];

export default function HomePage() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [eligibilityType, setEligibilityType] = useState("");

  const queryKey = useMemo(
    () => ["campaigns", status, eligibilityType, search],
    [status, eligibilityType, search]
  );

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (eligibilityType) params.set("eligibilityType", eligibilityType);
      if (search) params.set("q", search);
      return api(`/campaigns?${params.toString()}`);
    },
    keepPreviousData: true,
  });

  const campaigns = data?.campaigns || [];
  const resultsLabel = campaigns.length ? `${campaigns.length} campaigns found` : "No matching campaigns";

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-8 shadow-2xl shadow-blue-500/10">
        {/* Background image */}
        <div className="absolute inset-0 bg-hero bg-cover bg-center opacity-40" />
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
        
        {/* Glow effects */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-glow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-glow" style={{animationDelay: '1s'}} />
        
        {/* Content */}
        <div className="relative z-10">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-500 font-semibold animate-fade-in">Airdrop marketplace</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold leading-tight text-white animate-fade-in" style={{animationDelay: '0.1s'}}>
            Discover the next NFT campaign to claim.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--muted)] animate-fade-in" style={{animationDelay: '0.2s'}}>
            Explore curated airdrops, verify eligibility, and claim NFTs from vetted creators. Use filters to find public, whitelist, or holder-only drops.
          </p>

          {/* Injected Web3 Auth Block */}
          <div className="mt-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <Web3Login />
          </div>
        </div>

        {/* Search and filter section */}
        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto] relative z-10">
          <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md p-4 hover:bg-black/50 transition">
            <label className="text-sm text-[var(--muted)]">Search campaigns</label>
            <input
              className="input mt-2"
              placeholder="Search by name, description, or contract"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md p-4 hover:bg-black/50 transition">
              <label className="text-sm text-[var(--muted)]">Status</label>
              <select
                className="input mt-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option || "all"} value={option}>
                    {option ? option.replace("_", " ") : "All statuses"}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md p-4 hover:bg-black/50 transition">
              <label className="text-sm text-[var(--muted)]">Eligibility</label>
              <select
                className="input mt-2"
                value={eligibilityType}
                onChange={(e) => setEligibilityType(e.target.value)}
              >
                {eligibilityOptions.map((option) => (
                  <option key={option || "all"} value={option}>
                    {option ? option.replace("erc", "ERC-") : "All eligibility"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">{resultsLabel}</p>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((s) => (
            <button
              key={s || "all"}
              type="button"
              className={`btn-ghost text-sm ${status === s ? "border-brand-500 bg-brand-500/10 text-white" : ""}`}
              onClick={() => setStatus(s)}
            >
              {s ? s.replace("_", " ") : "All"}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="rounded-3xl border border-white/10 bg-black/30 p-6 text-center text-sm text-[var(--muted)]">
          Loading campaigns…
        </div>
      )}
      {error && <p className="text-red-400">{error.message}</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}