# ReBirth — One-Click SPV Factory on Solana
> Instantly deploy a legally-wrapped, Token-2022-powered Special Purpose Vehicle. No lawyers. No weeks. No $25k fees.
## Live Demo
- App: https://rebirth-ui.vercel.app
- Program ID: 42we4cDKuoWk3bA9ApqP6b3i1UppF3uXtaQkHf2PjgLV (Solana Devnet)
- Explorer: link to the program on Solana Explorer devnet
## What It Does
ReBirth is a self-serve factory that deploys in one transaction:
- A Token-2022 mint representing ownership in the SPV
- DefaultAccountState extension — every wallet starts frozen. Transfers are blocked at the protocol level until explicitly approved
- On-chain SPV state storing name, jurisdiction, and target raise
## Why This Matters
Forming a legal SPV costs $8k–$25k and takes 3–14 days on AngelList or Allocations. For $50k–$250k crypto syndicates this eats 4–16% of the raise before carry. ReBirth collapses this to under $1,500 and 60 seconds — with compliance enforced by the Solana Token-2022 program itself, not a UI checkbox.
## How It Works
1. Connect Phantom wallet
2. Enter SPV name, target raise, jurisdiction
3. Click Deploy — one transaction creates the mint and SPV state account
4. Share the receipt link with investors
5. Approve investor wallets one by one from the management page
## Program Instructions
- create_spv(name, jurisdiction, target_raise) — deploys Token-2022 mint with DefaultAccountState frozen + SpvState PDA
- approve_investor(token_account) — thaws investor ATA, enabling transfers
- revoke_investor(token_account) — re-freezes investor ATA
## Tech Stack
- Solana / Token-2022 / Anchor 1.0
- Next.js 14 / Tailwind CSS / Solana Wallet Adapter
- Deployed on Vercel + Solana Devnet
## Repo Structure
- rebirth-program/ — Anchor smart contract
- rebirth-ui/ — Next.js frontend
## Built At
Dev3pack x Colosseum Hackathon — May 2026
