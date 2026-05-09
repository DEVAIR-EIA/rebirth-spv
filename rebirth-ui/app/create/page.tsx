'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConnection, useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program, BN, Idl } from '@coral-xyz/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';

import idl from '@/lib/idl.json';
import { WalletButton } from '@/components/WalletButton';

const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

export default function CreatePage() {
  const router = useRouter();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { publicKey } = useWallet();

  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [jurisdiction, setJurisdiction] = useState('Delaware LLC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deploy(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!wallet) {
      setError('Connect your wallet to deploy.');
      return;
    }
    setLoading(true);
    try {
      const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
      const program = new Program(idl as Idl, provider);

      const mint = Keypair.generate();
      const targetUsd = Math.max(0, Math.floor(Number(target) || 0));
      const targetRaise = new BN(targetUsd);

      await program.methods
        .createSpv(name, jurisdiction, targetRaise)
        .accounts({
          authority: wallet.publicKey,
          mint: mint.publicKey,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
        } as any)
        .signers([mint])
        .rpc();

      const qs = new URLSearchParams({
        name,
        jurisdiction,
        target: String(targetUsd),
      }).toString();
      router.push(`/receipt/${mint.publicKey.toBase58()}?${qs}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? 'Deploy failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center px-6 py-5 border-b border-zinc-900">
        <Link href="/" className="text-lg font-semibold tracking-tight">ReBirth</Link>
        <WalletButton />
      </header>

      <section className="flex-1 flex items-center justify-center p-6">
        <form onSubmit={deploy} className="w-full max-w-md space-y-5 border border-zinc-900 rounded-2xl p-8 bg-zinc-950/40">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-1">Create SPV</h2>
            <p className="text-sm text-zinc-500">Deploys a Token-2022 mint and on-chain SPV state on devnet.</p>
          </div>

          <Field label="SPV Name">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Ventures I"
              className="input"
            />
          </Field>

          <Field label="Target Raise (USD)">
            <input
              required
              type="number"
              min={0}
              step={1}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="1000000"
              className="input"
            />
          </Field>

          <Field label="Jurisdiction">
            <select
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="input"
            >
              <option>Delaware LLC</option>
              <option>Cayman Islands</option>
            </select>
          </Field>

          <Field label="Wallet">
            <input
              readOnly
              value={publicKey?.toBase58() ?? 'Not connected'}
              className="input opacity-70 font-mono text-xs"
            />
          </Field>

          {error && <div className="text-sm text-red-400 break-words">{error}</div>}

          <button
            type="submit"
            disabled={loading || !wallet}
            className="w-full py-3 rounded-lg bg-zinc-100 text-zinc-950 font-semibold disabled:opacity-50 hover:bg-white transition"
          >
            {loading ? 'Deploying…' : 'Deploy SPV'}
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
