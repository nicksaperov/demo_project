"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const eligibilityLabels = {
  public: "Public",
  whitelist: "Whitelist",
  erc20: "ERC-20 holders",
  erc721: "NFT holders",
  role: "Guild / role",
  multi: "Multi-condition",
};

export default function EditCampaignPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    nftContractAddress: "",
    startTime: "",
    endTime: "",
    totalSupply: 0,
    maxClaimsPerWallet: 1,
    eligibilityType: "public",
    eligibilityConfig: {},
  });

  const router = useRouter();

  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => api(`/campaigns/${id}`),
    onSuccess: (data) => {
      setForm({
        name: data.name || "",
        description: data.description || "",
        imageUrl: data.imageUrl || "",
        nftContractAddress: data.nftContractAddress || "",
        startTime: data.startTime || "",
        endTime: data.endTime || "",
        totalSupply: data.totalSupply || 0,
        maxClaimsPerWallet: data.maxClaimsPerWallet || 1,
        eligibilityType: data.eligibilityType || "public",
        eligibilityConfig: data.eligibilityConfig || {},
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      api(`/campaigns/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          imageUrl: form.imageUrl,
          nftContractAddress: form.nftContractAddress,
          startTime: form.startTime || null,
          endTime: form.endTime || null,
          totalSupply: Number(form.totalSupply),
          maxClaimsPerWallet: Number(form.maxClaimsPerWallet),
          eligibilityType: form.eligibilityType,
          eligibilityConfig: form.eligibilityConfig,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      setStatusMessage("Campaign saved successfully.");
      setTimeout(() => setStatusMessage(""), 2000);
    },
  });

  const actionMutation = useMutation({
    mutationFn: ({ action }) => api(`/campaigns/${id}/${action}`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaign", id] }),
  });

  const uploadWhitelist = async (e) => {
    e.preventDefault();
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const token = localStorage.getItem("jwt");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/campaigns/${id}/whitelist`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      }
    );
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Upload failed");
    } else {
      alert(`Merkle root: ${data.merkleRoot}`);
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
    }
  };

  const handleAction = async (action) => {
    try {
      await actionMutation.mutateAsync({ action });
    } catch (error) {
      alert(error.message || "Action failed");
    }
  };

  const eligibilityNotes = useMemo(() => {
    if (form.eligibilityType === "whitelist") {
      return "Upload a CSV file to generate a Merkle root and finalize whitelist eligibility.";
    }
    if (form.eligibilityType === "erc20") {
      return "Enter the ERC-20 contract address used to verify token holder eligibility.";
    }
    if (form.eligibilityType === "erc721") {
      return "Enter the ERC-721 contract address used to verify NFT holder eligibility.";
    }
    return "Public campaigns are open to all eligible wallets.";
  }, [form.eligibilityType]);

  if (isLoading) return <p>Loading…</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Edit campaign</h1>
              <p className="mt-2 text-sm text-[var(--muted)]">{campaign.name}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-ghost text-sm"
                onClick={() => handleAction("pause")}
                disabled={actionMutation.isLoading || campaign.status !== "active"}
              >
                Pause
              </button>
              <button
                type="button"
                className="btn-ghost text-sm"
                onClick={() => handleAction("resume")}
                disabled={actionMutation.isLoading || campaign.status !== "paused"}
              >
                Resume
              </button>
              <button
                type="button"
                className="btn-ghost text-sm"
                onClick={() => handleAction("cancel")}
                disabled={actionMutation.isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary text-sm"
                onClick={() => handleAction("duplicate")}
                disabled={actionMutation.isLoading}
              >
                Duplicate
              </button>
            </div>
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Status: <span className="font-semibold capitalize">{campaign.status.replace("_", " ")}</span>
          </p>
          <div className="mt-4 flex gap-3 flex-wrap">
            <button
              type="button"
              className="btn-primary text-sm"
              onClick={() => handleAction("submit")}
              disabled={actionMutation.isLoading || campaign.status !== "draft"}
            >
              Submit for review
            </button>
            {statusMessage ? <span className="text-sm text-brand-400">{statusMessage}</span> : null}
          </div>
        </div>

        <form className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                Name
                <input
                  className="input mt-1"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                Image URL
                <input
                  className="input mt-1"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </label>
            </div>

            <label className="block text-sm">
              Description
              <textarea
                className="input mt-1"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                NFT contract address
                <input
                  className="input mt-1"
                  value={form.nftContractAddress}
                  onChange={(e) => setForm({ ...form, nftContractAddress: e.target.value })}
                  placeholder="0x..."
                />
              </label>
              <label className="block text-sm">
                Total supply
                <input
                  type="number"
                  className="input mt-1"
                  value={form.totalSupply}
                  onChange={(e) => setForm({ ...form, totalSupply: Number(e.target.value) })}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                Start time
                <input
                  type="datetime-local"
                  className="input mt-1"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                End time
                <input
                  type="datetime-local"
                  className="input mt-1"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                Max claims per wallet
                <input
                  type="number"
                  className="input mt-1"
                  value={form.maxClaimsPerWallet}
                  onChange={(e) => setForm({ ...form, maxClaimsPerWallet: Number(e.target.value) })}
                />
              </label>
              <label className="block text-sm">
                Eligibility type
                <select
                  className="input mt-1"
                  value={form.eligibilityType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      eligibilityType: e.target.value,
                      eligibilityConfig: {},
                    })
                  }
                >
                  {Object.entries(eligibilityLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-[var(--muted)]">{eligibilityNotes}</p>
            </div>

            {form.eligibilityType === "erc20" && (
              <label className="block text-sm">
                ERC-20 contract address
                <input
                  className="input mt-1"
                  value={form.eligibilityConfig.contractAddress || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      eligibilityConfig: {
                        ...form.eligibilityConfig,
                        contractAddress: e.target.value,
                      },
                    })
                  }
                  placeholder="0x..."
                />
              </label>
            )}

            {form.eligibilityType === "erc721" && (
              <label className="block text-sm">
                ERC-721 contract address
                <input
                  className="input mt-1"
                  value={form.eligibilityConfig.contractAddress || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      eligibilityConfig: {
                        ...form.eligibilityConfig,
                        contractAddress: e.target.value,
                      },
                    })
                  }
                  placeholder="0x..."
                />
              </label>
            )}

            <button
              type="button"
              className="btn-primary w-full"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isLoading}
            >
              Save campaign details
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Whitelist upload</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Upload a list of wallet addresses and allocations to generate a Merkle root for whitelist campaigns.
            </p>
            <form onSubmit={uploadWhitelist} className="mt-4 flex flex-col gap-3">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <button type="submit" className="btn-ghost w-full">
                Upload & generate Merkle tree
              </button>
            </form>
            {campaign.merkleRoot ? (
              <p className="mt-3 text-xs text-[var(--muted)] break-all">
                Current merkle root: {campaign.merkleRoot}
              </p>
            ) : null}
          </div>
        </form>
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-xl font-semibold">Campaign overview</h2>
          <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em]">Eligibility</p>
              <p className="mt-1 text-white">{eligibilityLabels[form.eligibilityType]}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em]">Claim limit</p>
              <p className="mt-1 text-white">{form.maxClaimsPerWallet} per wallet</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em]">Schedule</p>
              <p className="mt-1 text-white">{form.startTime || "Start not set"} → {form.endTime || "No end date"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Quick actions</h2>
          <div className="mt-4 space-y-3">
            <button
              type="button"
              className="btn-ghost w-full text-left"
              onClick={() => router.push(`/creator/campaigns/${id}/edit`)}
            >
              Refresh campaign details
            </button>
            <button
              type="button"
              className="btn-ghost w-full text-left"
              onClick={() => setFile(null)}
            >
              Reset upload selection
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
