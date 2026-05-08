use anchor_lang::prelude::*;
use anchor_spl::token_2022::{freeze_account, FreezeAccount, Token2022};

use crate::state::SpvState;

#[derive(Accounts)]
pub struct RevokeInvestor<'info> {
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"spv", mint.key().as_ref()],
        bump = spv_state.bump,
        has_one = authority,
        has_one = mint,
    )]
    pub spv_state: Account<'info, SpvState>,

    /// CHECK: Validated via spv_state.mint constraint above
    pub mint: UncheckedAccount<'info>,

    /// CHECK: Token account to freeze; ownership verified by the token program
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token2022>,
}

pub fn handler(ctx: Context<RevokeInvestor>) -> Result<()> {
    freeze_account(CpiContext::new(
        ctx.accounts.token_program.key(),
        FreezeAccount {
            account: ctx.accounts.token_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        },
    ))
}
