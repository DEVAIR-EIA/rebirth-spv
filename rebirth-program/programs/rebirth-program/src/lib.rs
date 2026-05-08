pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("42we4cDKuoWk3bA9ApqP6b3i1UppF3uXtaQkHf2PjgLV");

#[program]
pub mod rebirth_program {
    use super::*;

    pub fn create_spv(
        ctx: Context<CreateSpv>,
        name: String,
        jurisdiction: String,
        target_raise: u64,
    ) -> Result<()> {
        instructions::create_spv::handler(ctx, name, jurisdiction, target_raise)
    }

    pub fn approve_investor(ctx: Context<ApproveInvestor>) -> Result<()> {
        instructions::approve_investor::handler(ctx)
    }

    pub fn revoke_investor(ctx: Context<RevokeInvestor>) -> Result<()> {
        instructions::revoke_investor::handler(ctx)
    }
}
