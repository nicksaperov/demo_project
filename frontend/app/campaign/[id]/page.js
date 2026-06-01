"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { EligibilityChecker } from "@/components/EligibilityChecker";
import { ClaimButton } from "@/components/ClaimButton";

const badgeLabels = {
  public: "Public drop",
  whitelist: "Whitelist only",
  erc20: "ERC-20 holders",
  erc721: "NFT holders",
  role: "Role-based",
  multi: "Multi-condition",
};

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString();
}

export default function CampaignDetailPage() {
  const { id } = useParams();
  const [shareMessage, setShareMessage] = useState("");

  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => api(`/campaigns/${id}`),
  });

  const countdown = useMemo(() => {
    if (!campaign) return null;
    const now = Date.now();
    const start = campaign.startTime ? new Date(campaign.startTime).getTime() : null;
    const end = campaign.endTime ? new Date(campaign.endTime).getTime() : null;
    if (start && now < start) {
      return `Starts ${new Date(start).toLocaleDateString()}`;
    }
    if (end && now > end) {
      return `Ended ${new Date(end).toLocaleDateString()}`;
    }
    if (end) {
      return `Ends ${new Date(end).toLocaleDateString()}`;
    }
    return "Live now";
  }, [campaign]);

  if (isLoading) return <p>Loading campaign…</p>;
  if (error) return <p className="text-red-400">{error.message}</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-500">Campaign details</p>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <p className="max-w-3xl text-sm text-[var(--muted)]">{campaign.description}</p>
            <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
              <span className="rounded-full bg-brand-500/15 px-3 py-1 text-brand-200">{badgeLabels[campaign.eligibilityType] || campaign.eligibilityType}</span>
              <span className="rounded-full bg-white/5 px-3 py-1">{countdown}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-ghost text-sm"
              onClick={async () => {
                await navigator.clipboard.writeText(window.location.href);
                setShareMessage("Link copied!");
                setTimeout(() => setShareMessage(""), 1200);
              }}
            >
              Copy link
            </button>
            {shareMessage ? <span className="text-sm text-brand-400">{shareMessage}</span> : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Campaign snapshot</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-black/20 p-4">
                <p className="text-sm text-[var(--muted)]">Status</p>
                <p className="mt-2 font-semibold capitalize">{campaign.status.replace("_", " ")}</p>
              </div>
              <div className="rounded-3xl bg-black/20 p-4">
                <p className="text-sm text-[var(--muted)]">Supply</p>
                <p className="mt-2 font-semibold">{campaign.remainingSupply} / {campaign.totalSupply}</p>
              </div>
              <div className="rounded-3xl bg-black/20 p-4">
                <p className="text-sm text-[var(--muted)]">Max per wallet</p>
                <p className="mt-2 font-semibold">{campaign.maxClaimsPerWallet}</p>
              </div>
              <div className="rounded-3xl bg-black/20 p-4">
                <p className="text-sm text-[var(--muted)]">NFT contract</p>
                <p className="mt-2 font-semibold">{campaign.nftContractAddress || "Not configured"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Schedule</h2>
            <dl className="mt-5 grid gap-4 text-sm text-[var(--muted)]">
              <div>
                <dt>Start time</dt>
                <dd className="mt-1 text-white">{formatDate(campaign.startTime)}</dd>
              </div>
              <div>
                <dt>End time</dt>
                <dd className="mt-1 text-white">{formatDate(campaign.endTime)}</dd>
              </div>
              <div>
                <dt>Merkle root</dt>
                <dd className="mt-1 font-mono text-xs text-[var(--muted)] break-all">{campaign.merkleRoot || "Not configured"}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-3 text-xl font-semibold">Eligibility</h2>
            <EligibilityChecker campaignId={id} />
          </div>

          <div className="rounded-3xl border border-white/10 bg-brand-500/5 p-6">
            <h2 className="mb-3 text-xl font-semibold">Claim</h2>
            <p className="mb-4 text-sm text-[var(--muted)]">
              Connect your wallet, confirm eligibility, and claim your NFT allocation securely through the platform.
            </p>
            <ClaimButton campaign={campaign} />
          </div>
        </div>
      </div>
    </div>
  );
}
