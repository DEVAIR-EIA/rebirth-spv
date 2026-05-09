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
    <main className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center px-6 py-5 border-b border-zinc-900">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          ReBirth
        </Link>
        <WalletButton />
      </header>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-5">ReBirth</h1>
        <p className="text-xl md:text-2xl text-zinc-400 mb-10">
          One-click SPV Factory on Solana
        </p>
        <button
          onClick={onLaunch}
          className="px-8 py-4 rounded-lg bg-zinc-100 text-zinc-950 font-semibold hover:bg-white transition"
        >
          {connected ? 'Launch SPV' : 'Connect & Launch SPV'}
        </button>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
          <Stat value="60 seconds" label="Time to launch" />
          <Stat value="Sub-$1,500" label="Total cost" />
          <Stat value="Protocol-enforced compliance" label="Built-in transfer hook" />
        </div>
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border border-zinc-900 rounded-xl p-6 text-left bg-zinc-950/40">
      <div className="text-xl font-semibold mb-1">{value}</div>
      <div className="text-sm text-zinc-500">{label}</div>
    </div>
  );
}
