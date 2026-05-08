use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct SpvState {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub target_raise: u64,
    pub bump: u8,
    #[max_len(64)]
    pub name: String,
    #[max_len(64)]
    pub jurisdiction: String,
}
