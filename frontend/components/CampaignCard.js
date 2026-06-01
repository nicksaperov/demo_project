import Link from "next/link";

const BADGES = {
  public: "Public",
  whitelist: "Whitelist",
  erc20: "Token Holders",
  erc721: "NFT Holders",
  role: "Guild",
  multi: "Multi",
};

const STATUS_CLASSES = {
  active: "bg-emerald-500/10 text-emerald-200",
  draft: "bg-slate-500/10 text-slate-200",
  pending_review: "bg-amber-500/10 text-amber-200",
  cancelled: "bg-rose-500/10 text-rose-200",
};

export function CampaignCard({ campaign }) {
  const badge = BADGES[campaign.eligibilityType] || campaign.eligibilityType;
  const statusClass = STATUS_CLASSES[campaign.status] || "bg-white/10 text-white";
  const total = campaign.totalSupply || 0;
  const remaining = campaign.remainingSupply ?? 0;
  const progress = total ? Math.min(100, Math.round(((total - remaining) / total) * 100)) : 0;

  return (
    <Link href={`/campaign/${campaign.id}`} className="group card block overflow-hidden border-white/10 transition-all duration-300 hover:-translate-y-2 hover:border-brand-500/80 hover:shadow-2xl hover:shadow-brand-500/20">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-950/80 to-slate-900/60 backdrop-blur-sm">
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-card-pattern opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/70" />
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        
        <div className="relative p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold leading-tight text-white group-hover:text-brand-300 transition-colors">{campaign.name}</h3>
            <span className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] ${statusClass} transition-all group-hover:scale-105`}>
              {campaign.status.replace("_", " ")}
            </span>
          </div>
          <p className="mb-4 min-h-[3rem] text-sm text-[var(--muted)] line-clamp-3 group-hover:text-white/80 transition-colors">
            {campaign.description || "No description available."}
          </p>
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-brand-500/20 px-3 py-1 text-brand-200 border border-brand-500/30 group-hover:bg-brand-500/30 transition-all">{badge}</span>
            {campaign.nftContractAddress ? (
              <span className="rounded-full bg-white/5 px-3 py-1 border border-white/10 group-hover:border-brand-500/50 transition-all">{campaign.nftContractAddress.slice(0, 8)}…</span>
            ) : null}
          </div>
          <div className="space-y-2 text-sm text-[var(--muted)]">
            <div className="flex items-center justify-between">
              <span>Supply</span>
              <span className="font-semibold text-white group-hover:text-brand-400 transition-colors">{remaining} / {total}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gradient-to-r from-white/5 to-white/10">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-blue-400 transition-all duration-500 shadow-lg shadow-brand-500/50 group-hover:shadow-brand-500/80" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
