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
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <SiteHeader />

      <section className="flex-1">
        <div className="mx-auto w-full max-w-2xl px-6 md:px-10 pt-12 md:pt-16 pb-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint mb-4">
            Step 01&nbsp;·&nbsp;Vehicle parameters
          </p>
          <h1
            className="font-display font-normal text-ink leading-[0.95] tracking-tightest mb-3"
            style={{ fontSize: 'clamp(36px, 5vw, 52px)' }}
          >
            Create SPV
          </h1>
          <p className="font-body text-[15px] text-ink-muted max-w-[58ch] leading-relaxed mb-10">
            Deploys a Token-2022 mint with a freeze authority, plus an on-chain SPV state
            account, on Solana Devnet. Your connected wallet is the deploying authority.
          </p>

          <form onSubmit={deploy} className="border-y border-rule py-2">
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
                className="input tabular"
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

            <Field label="Deploying Wallet">
              <input
                readOnly
                value={publicKey?.toBase58() ?? 'Not connected'}
                className="input font-mono text-[12px] text-ink-muted"
              />
            </Field>

            {error && (
              <div className="px-1 pt-2 pb-4">
                <p className="font-body text-[13px] text-alert leading-snug break-words">
                  {error}
                </p>
              </div>
            )}

            <div className="px-1 pt-4 pb-2">
              <button
                type="submit"
                disabled={loading || !wallet}
                className="group inline-flex items-center gap-2 bg-signal text-signal-ink
                           px-5 h-11 text-[14px] font-medium tracking-wide
                           transition-colors duration-150
                           hover:bg-[color-mix(in_oklch,_var(--signal)_88%,_var(--ink))]
                           disabled:bg-rule-strong disabled:text-ink-faint disabled:cursor-not-allowed"
                style={{ borderRadius: 2 }}
              >
                {loading ? 'Deploying…' : 'Deploy SPV'}
                {!loading && (
                  <span
                    aria-hidden
                    className="transition-transform duration-150 group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function SiteHeader() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-3 group">
          <span className="font-display text-[20px] leading-none text-ink">ReBirth</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint group-hover:text-ink-muted transition-colors">
            Protocol
          </span>
        </Link>
        <WalletButton />
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10 py-6 flex flex-wrap items-center justify-between gap-3 text-[12px] text-ink-faint">
        <span className="font-mono uppercase tracking-[0.16em]">
          © 2026 ReBirth Labs · Devnet release
        </span>
        <span className="font-mono uppercase tracking-[0.16em]">
          No offer to sell securities · Not legal advice
        </span>
      </div>
    </footer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[14rem_1fr] gap-x-6 gap-y-2 py-4 border-b border-rule last:border-b-0">
      <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint pt-2.5">
        {label}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
