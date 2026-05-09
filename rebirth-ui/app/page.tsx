'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { WalletButton } from '@/components/WalletButton';

export default function Home() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const router = useRouter();

  const onLaunch = () => {
    if (!connected) {
      setVisible(true);
      return;
    }
    router.push('/create');
  };

  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <SiteHeader />

      <section className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-6 md:px-10 pt-16 md:pt-28 pb-20 md:pb-28">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint mb-8">
            ReBirth Protocol&nbsp;·&nbsp;v0.1&nbsp;·&nbsp;Solana Devnet
          </p>

          <h1
            className="font-display font-normal text-ink leading-[0.92] tracking-tightest mb-10"
            style={{ fontSize: 'clamp(56px, 11vw, 132px)' }}
          >
            ReBirth
          </h1>

          <p
            className="font-body text-ink-muted max-w-[34ch] leading-[1.35] mb-12"
            style={{ fontSize: 'clamp(20px, 2.2vw, 26px)' }}
          >
            An on-chain factory for compliant single-purpose investment vehicles.
            <span className="block text-ink-faint mt-2 text-[15px] md:text-base">
              One-click SPV factory on Solana.
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <button
              onClick={onLaunch}
              className="group inline-flex items-center gap-2 bg-signal text-signal-ink
                         px-5 h-11 text-[14px] font-medium tracking-wide
                         transition-colors duration-150
                         hover:bg-[color-mix(in_oklch,_var(--signal)_88%,_var(--ink))]"
              style={{ borderRadius: 2 }}
            >
              {connected ? 'Launch SPV' : 'Connect wallet & launch SPV'}
              <span
                aria-hidden
                className="transition-transform duration-150 group-hover:translate-x-0.5"
              >
                →
              </span>
            </button>

            <Link
              href="#facts"
              className="text-[14px] text-ink-muted hover:text-ink underline underline-offset-4 decoration-rule-strong hover:decoration-ink transition-colors"
            >
              Read the protocol facts
            </Link>
          </div>
        </div>

        <hr className="border-rule" />

        <div id="facts" className="mx-auto w-full max-w-6xl px-6 md:px-10 py-14 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 md:gap-y-0">
            <Fact
              value="60s"
              label="Time to deploy"
              note="From signed transaction to settled mint."
            />
            <Fact
              value="<$1,500"
              label="All-in cost"
              note="Including legal wrapper, on-chain fees, and registry."
              bordered
            />
            <Fact
              value="Enforced"
              label="Compliance"
              note="Token-2022 transfer hook gated by an on-chain registry."
              bordered
            />
          </div>
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

function Fact({
  value,
  label,
  note,
  bordered = false,
}: {
  value: string;
  label: string;
  note: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={
        'pl-0 md:pl-10 ' + (bordered ? 'md:border-l md:border-rule' : '')
      }
    >
      <div
        className="font-display font-normal tabular text-ink leading-none mb-3 tracking-tightest"
        style={{ fontSize: 'clamp(40px, 5vw, 64px)' }}
      >
        {value}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint mb-2">
        {label}
      </div>
      <p className="font-body text-[14px] text-ink-muted leading-relaxed max-w-[28ch]">
        {note}
      </p>
    </div>
  );
}
