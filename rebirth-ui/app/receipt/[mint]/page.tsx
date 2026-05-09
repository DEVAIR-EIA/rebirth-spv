'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { WalletButton } from '@/components/WalletButton';

export default function ReceiptPage({ params }: { params: { mint: string } }) {
  const { mint } = params;
  const sp = useSearchParams();
  const name = sp.get('name') ?? 'SPV';
  const jurisdiction = sp.get('jurisdiction') ?? 'Delaware LLC';
  const target = sp.get('target') ?? '0';
  const explorer = `https://explorer.solana.com/address/${mint}?cluster=devnet`;

  const targetFormatted = Number(target).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center px-6 py-5 border-b border-zinc-900">
        <Link href="/" className="text-lg font-semibold tracking-tight">ReBirth</Link>
        <WalletButton />
      </header>

      <section className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-6 border border-zinc-900 rounded-2xl p-8 bg-zinc-950/40">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-400 mb-1">Deployment successful</div>
              <h2 className="text-3xl font-semibold tracking-tight">{name}</h2>
            </div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950 text-emerald-300 text-xs border border-emerald-900">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Transfer Hook: Active ✓
            </span>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <Row label="Mint Address">
              <a href={explorer} target="_blank" rel="noreferrer" className="font-mono text-xs underline decoration-zinc-700 hover:decoration-zinc-400 break-all">
                {mint}
              </a>
            </Row>
            <Row label="Jurisdiction">{jurisdiction}</Row>
            <Row label="Target Raise">{targetFormatted}</Row>
            <Row label="Network">Solana Devnet</Row>
          </dl>

          <div className="border-t border-zinc-900 pt-6">
            <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Operating Agreement (mock)</div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              This Limited Liability Company Operating Agreement of <span className="text-zinc-200 font-medium">{name}</span>, a {jurisdiction}{' '}
              limited liability company, is entered into and effective as of the date first written above. The Company is formed for the
              purpose of acquiring, holding, and disposing of investments tokenized on the Solana network. Membership interests are
              represented by Token-2022 units issued from mint <span className="font-mono text-xs text-zinc-300">{mint}</span> and are transferable
              only among investors approved by the Company&apos;s on-chain authority via the protocol&apos;s transfer-hook compliance
              mechanism.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Link href="/create" className="px-4 py-2 rounded-lg bg-zinc-100 text-zinc-950 text-sm font-semibold hover:bg-white transition">
              Deploy another
            </Link>
            <a href={explorer} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg border border-zinc-800 text-sm font-semibold hover:border-zinc-600 transition">
              View on Explorer
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-zinc-500 mb-1">{label}</dt>
      <dd className="text-sm text-zinc-200">{children}</dd>
    </div>
  );
}
