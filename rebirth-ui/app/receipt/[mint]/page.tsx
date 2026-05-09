'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { WalletButton } from '@/components/WalletButton';

const TOKEN_2022_PROGRAM = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

export default function ReceiptPage({ params }: { params: { mint: string } }) {
  const { mint } = params;
  const sp = useSearchParams();
  const name = sp.get('name')?.trim() || 'Untitled SPV';
  const jurisdiction = sp.get('jurisdiction') ?? 'Delaware LLC';
  const target = sp.get('target') ?? '0';

  const explorer = `https://explorer.solana.com/address/${mint}?cluster=devnet`;
  const programExplorer = `https://explorer.solana.com/address/${TOKEN_2022_PROGRAM}?cluster=devnet`;

  const targetFormatted = Number(target).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  // Settled-at timestamp is rendered client-side to avoid hydration drift.
  const [settledAt, setSettledAt] = useState<string | null>(null);
  useEffect(() => {
    setSettledAt(formatUtcStamp(new Date()));
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <SiteHeader />

      <section className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-6 md:px-10 pt-12 md:pt-16 pb-20">
          {/* ─── Receipt masthead ─────────────────────────────────────── */}
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint mb-6 tabular">
            Deployment Receipt
            <span aria-hidden className="mx-2 text-rule-strong">·</span>
            {settledAt ?? '—'}
          </p>

          <h1
            className="font-display font-normal text-ink leading-[0.95] tracking-tightest mb-6"
            style={{ fontSize: 'clamp(40px, 6vw, 64px)' }}
          >
            {name}
          </h1>

          <p className="flex items-center gap-2.5 text-[14px] text-ink mb-12">
            <span
              aria-hidden
              className="inline-block w-1.5 h-1.5 rounded-full bg-signal"
            />
            <span className="font-medium">Transfer hook active</span>
            <span className="text-ink-faint">·</span>
            <span className="text-ink-muted">Compliance enforced on-chain</span>
          </p>

          {/* ─── Definition list (hairline-separated rows) ─────────────── */}
          <dl className="border-y border-rule">
            <Row label="Instrument">
              <span className="font-body text-ink">{name}</span>
            </Row>
            <Row label="Mint address">
              <a
                href={explorer}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[13px] text-ink hover:text-signal break-all underline underline-offset-4 decoration-rule-strong hover:decoration-signal transition-colors"
              >
                {mint}
              </a>
              <a
                href={explorer}
                target="_blank"
                rel="noreferrer"
                className="block mt-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint hover:text-ink-muted transition-colors"
              >
                Open in Solana Explorer&nbsp;↗
              </a>
            </Row>
            <Row label="Jurisdiction">{jurisdiction}</Row>
            <Row label="Target raise">
              <span className="tabular">{targetFormatted}</span>
              <span className="ml-1.5 text-ink-faint text-[12px] font-mono uppercase tracking-[0.14em]">
                USD
              </span>
            </Row>
            <Row label="Network">Solana&nbsp;·&nbsp;Devnet</Row>
            <Row label="Token program">
              <a
                href={programExplorer}
                target="_blank"
                rel="noreferrer"
                className="hover:text-signal transition-colors"
              >
                <span className="font-body">Token-2022</span>
                <span className="ml-1.5 font-mono text-[11px] text-ink-faint">
                  {TOKEN_2022_PROGRAM.slice(0, 6)}…{TOKEN_2022_PROGRAM.slice(-6)}
                </span>
              </a>
            </Row>
          </dl>

          {/* ─── Operating agreement (mock) ────────────────────────────── */}
          <section className="mt-14">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint mb-5">
              Operating Agreement
              <span aria-hidden className="mx-2 text-rule-strong">·</span>
              Unexecuted draft
            </p>
            <p className="font-body text-[15px] leading-[1.65] text-ink-muted max-w-[68ch]">
              This Limited Liability Company Operating Agreement of{' '}
              <em className="font-display italic text-ink not-italic md:italic">
                {name}
              </em>
              , a {jurisdiction.replace(' LLC', '')} limited liability company, is entered into and effective as of the date first written above.
              The Company is formed for the purpose of acquiring, holding, and disposing of investments tokenized on the Solana network.
              Membership interests are represented by Token-2022 units issued from mint{' '}
              <span className="font-mono text-[12px] text-ink whitespace-nowrap">
                {mint.slice(0, 8)}…{mint.slice(-8)}
              </span>{' '}
              and are transferable only among investors approved by the Company&apos;s on-chain authority via the protocol&apos;s
              transfer-hook compliance mechanism.
            </p>
          </section>

          {/* ─── Actions ────────────────────────────────────────────────── */}
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3">
            <a
              href={explorer}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 bg-signal text-signal-ink
                         px-5 h-11 text-[14px] font-medium tracking-wide
                         transition-colors duration-150
                         hover:bg-[color-mix(in_oklch,_var(--signal)_88%,_var(--ink))]"
              style={{ borderRadius: 2 }}
            >
              View on Solana Explorer
              <span
                aria-hidden
                className="transition-transform duration-150 group-hover:translate-x-0.5"
              >
                ↗
              </span>
            </a>

            <Link
              href="/create"
              className="text-[14px] text-ink-muted hover:text-ink underline underline-offset-4 decoration-rule-strong hover:decoration-ink transition-colors"
            >
              Deploy another vehicle
            </Link>
          </div>
        </article>
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="grid grid-cols-[10rem_1fr] md:grid-cols-[14rem_1fr]
                 gap-x-6 py-4 border-b border-rule last:border-b-0"
    >
      <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint pt-0.5">
        {label}
      </dt>
      <dd className="font-body text-[14px] text-ink min-w-0">{children}</dd>
    </div>
  );
}

function formatUtcStamp(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min} UTC`;
}
