use anchor_lang::prelude::*;
use anchor_lang::system_program::{create_account, CreateAccount};
use anchor_spl::{
    token_2022::{
        initialize_mint2,
        spl_token_2022::{
            extension::ExtensionType,
            pod::PodMint,
            state::AccountState,
        },
        InitializeMint2,
    },
    token_interface::{
        default_account_state_initialize,
        DefaultAccountStateInitialize,
        Token2022,
    },
};

use crate::{error::ErrorCode, state::SpvState};

#[derive(Accounts)]
#[instruction(name: String, jurisdiction: String, target_raise: u64)]
pub struct CreateSpv<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Initialized manually as a Token-2022 mint in the handler
    #[account(mut, signer)]
    pub mint: UncheckedAccount<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + SpvState::INIT_SPACE,
        seeds = [b"spv", mint.key().as_ref()],
        bump,
    )]
    pub spv_state: Account<'info, SpvState>,

    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateSpv>,
    name: String,
    jurisdiction: String,
    target_raise: u64,
) -> Result<()> {
    let authority = &ctx.accounts.authority;
    let mint = &ctx.accounts.mint;
    let token_program = &ctx.accounts.token_program;
    let system_program = &ctx.accounts.system_program;

    // 1. Mint size — base PodMint + DefaultAccountState extension only.
    let mint_size = ExtensionType::try_calculate_account_len::<PodMint>(
        &[ExtensionType::DefaultAccountState],
    )
    .map_err(|_| error!(ErrorCode::MintSizeError))?;

    // 2. Allocate + fund the mint account, owned by Token-2022.
    let lamports = Rent::get()?.minimum_balance(mint_size);
    create_account(
        CpiContext::new(
            system_program.key(),
            CreateAccount {
                from: authority.to_account_info(),
                to: mint.to_account_info(),
            },
        ),
        lamports,
        mint_size as u64,
        &token_program.key(),
    )?;

    // 3. DefaultAccountState = Frozen — must precede InitializeMint2.
    default_account_state_initialize(
        CpiContext::new(
            token_program.key(),
            DefaultAccountStateInitialize {
                token_program_id: token_program.to_account_info(),
                mint: mint.to_account_info(),
            },
        ),
        &AccountState::Frozen,
    )?;

    // 4. Base mint init — 0 decimals, freeze_authority required for DefaultAccountState=Frozen.
    initialize_mint2(
        CpiContext::new(
            token_program.key(),
            InitializeMint2 {
                mint: mint.to_account_info(),
            },
        ),
        0,
        &authority.key(),
        Some(&authority.key()),
    )?;

    // 5. SPV state PDA stores all human-readable metadata.
    let spv_state = &mut ctx.accounts.spv_state;
    spv_state.authority = authority.key();
    spv_state.mint = mint.key();
    spv_state.name = name;
    spv_state.jurisdiction = jurisdiction;
    spv_state.target_raise = target_raise;
    spv_state.bump = ctx.bumps.spv_state;

    Ok(())
}
