"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useWalletStore } from "@/lib/store";

const eligibilityLabels = {
  public: "Public",
  whitelist: "Whitelist",
  erc20: "ERC-20 holders",
  erc721: "NFT holders",
  role: "Role / Guild",
  multi: "Multi-condition",
};

export default function NewCampaignPage() {
  const router = useRouter();
  const { token } = useWalletStore();
  const [form, setForm] = useState({
    name: "",
    description: "",
    totalSupply: 100,
    maxClaimsPerWallet: 1,
    eligibilityType: "public",
    eligibilityConfig: {},
    nftContractAddress: "",
    imageUrl: "",
    startTime: "",
    endTime: "",
  });
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);

  const eligibilityFields = useMemo(() => {
    if (form.eligibilityType === "erc20") {
      return (
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
      );
    }
    if (form.eligibilityType === "whitelist") {
      return (
        <div className="space-y-3 text-sm text-[var(--muted)]">
          <p>Upload a CSV later from the campaign editor to generate a Merkle root.</p>
          <p>Required columns: wallet/address, allocation</p>
        </div>
      );
    }
    if (form.eligibilityType === "erc721") {
      return (
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
      );
    }
    return null;
  }, [form, setForm]);

  async function submit(e) {
    e.preventDefault();
    if (!token) {
      setError("Connect and sign in with your wallet first.");
      return;
    }
    try {
      const campaign = await api("/campaigns", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          totalSupply: form.totalSupply,
          maxClaimsPerWallet: form.maxClaimsPerWallet,
          eligibilityType: form.eligibilityType,
          eligibilityConfig: form.eligibilityConfig,
          nftContractAddress: form.nftContractAddress,
          imageUrl: form.imageUrl,
          startTime: form.startTime || null,
          endTime: form.endTime || null,
        }),
      });
      router.push(`/creator/campaigns/${campaign.id}/edit`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.3fr_0.9fr]">
      <div>
        <div className="mb-6 space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-500">Creator tools</p>
          <h1 className="text-4xl font-bold">Create a new NFT airdrop campaign</h1>
          <p className="text-sm text-[var(--muted)]">
            Configure your campaign, preview the drop, and publish it for review. You can upload a whitelist later from the editor.
          </p>
        </div>

        <form onSubmit={submit} className="card space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              Campaign name
              <input
                required
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
              Total supply
              <input
                type="number"
                className="input mt-1"
                value={form.totalSupply}
                onChange={(e) =>
                  setForm({ ...form, totalSupply: Number(e.target.value) })
                }
              />
            </label>
            <label className="block text-sm">
              Max claims per wallet
              <input
                type="number"
                className="input mt-1"
                value={form.maxClaimsPerWallet}
                onChange={(e) =>
                  setForm({ ...form, maxClaimsPerWallet: Number(e.target.value) })
                }
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
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>

          {eligibilityFields}

          <button type="submit" className="btn-primary w-full text-sm">
            Create draft campaign
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Campaign preview</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-3xl bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Name</p>
              <p className="mt-2 text-lg font-semibold">{form.name || "Untitled campaign"}</p>
            </div>
            <div className="rounded-3xl bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Eligibility</p>
              <p className="mt-2 text-sm text-white">{eligibilityLabels[form.eligibilityType]}</p>
            </div>
            <div className="rounded-3xl bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Supply</p>
              <p className="mt-2 text-sm text-white">{form.totalSupply} total</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <h3 className="text-lg font-semibold">Quick tips</h3>
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
            <li>• Use a clear campaign title and description.</li>
            <li>• Set a realistic supply and max wallet limit.</li>
            <li>• Add a whitelist file after creation for exclusive drops.</li>
            <li>• Configure start/end times to schedule your airdrop.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
