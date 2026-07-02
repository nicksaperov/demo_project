'use client';

import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { SiweMessage } from 'siwe';

export default function Web3Login() {
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // DIAGNOSTIC 1: Verify React Hydration
  useEffect(() => {
    console.log("🚀 Web3Login Component Hydrated Successfully!");
    console.log("🦊 window.ethereum status:", typeof window !== 'undefined' ? window.ethereum : 'undefined');
  }, []);

  const API_BASE = 'http://localhost:4000/api/auth';

  const handleLogin = async () => {
    console.log("1. Button Clicked! Starting handleLogin execution...");
    try {
      setLoading(true);
      setError(null);

      console.log("2. Checking MetaMask injection...");
      if (!window.ethereum) {
        throw new Error("No Web3 wallet detected. Please install MetaMask.");
      }

      console.log("3. Initializing Ethers BrowserProvider...");
      const provider = new BrowserProvider(window.ethereum);

      console.log("4. Awaiting Wallet Signer (MetaMask should pop up now)...");
      const signer = await provider.getSigner();
      
      console.log("5. Extracting User Address...");
      const userAddress = await signer.getAddress();
      console.log("✅ Wallet Address:", userAddress);

      const network = await provider.getNetwork();
      console.log("🌐 Network Chain ID:", network.chainId);

      console.log("6. Fetching Nonce from Backend...");
      const nonceRes = await fetch(`${API_BASE}/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: userAddress })
      });
      
      if (!nonceRes.ok) {
        const errorData = await nonceRes.json();
        console.error("❌ Nonce Error:", errorData);
        throw new Error(errorData.error || "Failed to fetch nonce");
      }
      
      const { nonce } = await nonceRes.json();
      console.log("✅ Nonce Received:", nonce);

      console.log("7. Constructing SIWE Message...");
      const domain = window.location.host;
      const origin = window.location.origin;
      
      const message = new SiweMessage({
        domain,
        address: userAddress,
        statement: 'Sign in to the NFT Airdrop Platform.',
        uri: origin,
        version: '1',
        chainId: Number(network.chainId),
        nonce,
      });

      const messageToSign = message.prepareMessage();
      console.log("📝 Message to Sign:", messageToSign);

      console.log("8. Requesting User Signature...");
      const signature = await signer.signMessage(messageToSign);
      console.log("✅ Signature Received:", signature);

      console.log("9. Sending Signature to Backend for Verification...");
      const verifyRes = await fetch(`${API_BASE}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSign,
          signature
        }),
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        console.error("❌ Verification Error:", errorData);
        throw new Error(errorData.error || "Verification failed");
      }

      const verifiedData = await verifyRes.json();
      console.log("✅ Authentication Successful!", verifiedData);
      
      if (verifiedData.token) {
        localStorage.setItem('auth_token', verifiedData.token);
      }
      
      setAddress(userAddress);

    } catch (err) {
      console.error("🔥 CATCH BLOCK TRIGGERED:");
      console.error(err);
      setError(err.message || "An unexpected error occurred during login.");
    } finally {
      console.log("10. Execution Finished. Removing loading state.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-xl shadow-lg border border-slate-700 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4">Web3 Authentication</h2>
      
      {address ? (
        <div className="text-center">
          <div className="text-green-400 font-semibold mb-2">Successfully Authenticated</div>
          <div className="text-sm text-slate-400 break-all">{address}</div>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Awaiting Signature...' : 'Connect & Sign In'}
        </button>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm w-full text-center">
          {error}
        </div>
      )}
    </div>
  );
}