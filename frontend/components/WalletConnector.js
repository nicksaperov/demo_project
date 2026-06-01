"use client";

import { useCallback } from "react";
import { BrowserProvider } from "ethers";
import { SiweMessage } from "siwe";
import { api } from "@/lib/api";
import { useWalletStore } from "@/lib/store";

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);

export function WalletConnector() {
  const { address, setWallet, setToken, disconnect } = useWalletStore();

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert("Install MetaMask or another Web3 wallet");
      return;
    }
    const provider = new BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const network = await provider.getNetwork();
    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    setWallet(addr, Number(network.chainId));

    const { nonce } = await api("/auth/nonce", {
      method: "POST",
      body: JSON.stringify({ walletAddress: addr }),
    });

    const message = new SiweMessage({
      domain: window.location.host,
      address: addr,
      statement: "Sign in to NFT Airdrop Platform",
      uri: window.location.origin,
      version: "1",
      chainId: Number(network.chainId),
      nonce,
    });

    const prepared = message.prepareMessage();
    const signature = await signer.signMessage(prepared);

    const { token } = await api("/auth/verify", {
      method: "POST",
      body: JSON.stringify({
        message: prepared,
        signature,
      }),
    });

    localStorage.setItem("jwt", token);
    setToken(token);
  }, [setWallet, setToken]);

  if (address) {
    return (
      <div className="flex items-center gap-3 group">
        <div className="rounded-full bg-gradient-to-r from-brand-500/10 to-blue-500/10 px-3 py-1 border border-brand-500/30 group-hover:border-brand-500/60 transition-all">
          <span className="text-xs text-brand-200 font-medium">
            {address.slice(0, 6)}…{address.slice(-4)}
          </span>
        </div>
        <button type="button" className="btn-ghost text-sm" onClick={disconnect}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button type="button" className="btn-primary text-sm group relative overflow-hidden" onClick={connect}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-500 via-blue-400 to-brand-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-slide-in" />
      
      <span className="relative z-10 flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-white rounded-full group-hover:animate-pulse" />
        Connect Wallet
      </span>
    </button>
  );
}
