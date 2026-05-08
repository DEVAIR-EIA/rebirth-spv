use anchor_lang::{
    prelude::*,
    system_program::{create_account, CreateAccount},
};
use anchor_spl::{
    token_2022::{initialize_mint2, InitializeMint2, Token2022},
    token_2022_extensions::{
        default_account_state::{default_account_state_initialize, DefaultAccountStateInitialize},
        metadata_pointer::{metadata_pointer_initialize, MetadataPointerInitialize},
        spl_token_metadata_interface::state::Field,
        token_metadata::{
            token_metadata_initialize, token_metadata_update_field, TokenMetadataInitialize,
            TokenMetadataUpdateField,
        },
    },
};

use anchor_spl::token_2022::spl_token_2022;
use spl_token_2022::{extension::ExtensionType, state::AccountState, state::Mint};

use crate::{error::ErrorCode, state::SpvState};

/// Returns the byte size of the TokenMetadata TLV entry written into the mint.
///
/// Layout: 8-byte ArrayDiscriminator + 4-byte Length u32 + borsh(TokenMetadata)
fn token_metadata_extension_len(name: &str, jurisdiction: &str, target_raise: u64) -> usize {
    let target_raise_str = target_raise.to_string();
    let tlv_header: usize = 12; // ArrayDiscriminator (8) + Length u32 (4)
    let content: usize = 32                                               // update_authority
        + 32                                                              // mint
        + 4 + name.len()                                                  // name
        + 4 + 3                                                           // symbol "SPV"
        + 4                                                               // uri ""
        + 4                                                               // Vec count
        + (4 + "jurisdiction".len() + 4 + jurisdiction.len())
        + (4 + "target_raise".len() + 4 + target_raise_str.len());
    tlv_header + content
}

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

    // 1. Calculate total mint account size
    let base_size = ExtensionType::try_calculate_account_len::<Mint>(&[
        ExtensionType::MetadataPointer,
        ExtensionType::DefaultAccountState,
    ])
    .map_err(|_| error!(ErrorCode::MintSizeError))?;

    let total_size = base_size + token_metadata_extension_len(&name, &jurisdiction, target_raise);

    // 2. Create the mint account funded with rent-exempt lamports
    let lamports = Rent::get()?.minimum_balance(total_size);
    create_account(
        CpiContext::new(
            system_program.key(),
            CreateAccount {
                from: authority.to_account_info(),
                to: mint.to_account_info(),
            },
        ),
        lamports,
        total_size as u64,
        &token_program.key(),
    )?;

    // 3. Initialize MetadataPointer — points to the mint itself (embedded metadata)
    metadata_pointer_initialize(
        CpiContext::new(
            token_program.key(),
            MetadataPointerInitialize {
                token_program_id: token_program.to_account_info(),
                mint: mint.to_account_info(),
            },
        ),
        Some(authority.key()),
        Some(mint.key()),
    )?;

    // 4. Initialize DefaultAccountState — new token accounts start frozen
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

    // 5. Initialize the mint (0 decimals, mint_authority = authority, freeze_authority = authority)
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

    // 6. Initialize embedded TokenMetadata
    token_metadata_initialize(
        CpiContext::new(
            token_program.key(),
            TokenMetadataInitialize {
                program_id: token_program.to_account_info(),
                metadata: mint.to_account_info(),
                update_authority: authority.to_account_info(),
                mint_authority: authority.to_account_info(),
                mint: mint.to_account_info(),
            },
        ),
        name.clone(),
        "SPV".to_string(),
        String::new(),
    )?;

    // 7. Write jurisdiction into additional_metadata
    token_metadata_update_field(
        CpiContext::new(
            token_program.key(),
            TokenMetadataUpdateField {
                program_id: token_program.to_account_info(),
                metadata: mint.to_account_info(),
                update_authority: authority.to_account_info(),
            },
        ),
        Field::Key("jurisdiction".to_string()),
        jurisdiction.clone(),
    )?;

    // 8. Write target_raise into additional_metadata
    token_metadata_update_field(
        CpiContext::new(
            token_program.key(),
            TokenMetadataUpdateField {
                program_id: token_program.to_account_info(),
                metadata: mint.to_account_info(),
                update_authority: authority.to_account_info(),
            },
        ),
        Field::Key("target_raise".to_string()),
        target_raise.to_string(),
    )?;

    // 9. Persist SPV state
    let spv_state = &mut ctx.accounts.spv_state;
    spv_state.authority = authority.key();
    spv_state.mint = mint.key();
    spv_state.name = name;
    spv_state.jurisdiction = jurisdiction;
    spv_state.target_raise = target_raise;
    spv_state.bump = ctx.bumps.spv_state;

    Ok(())
}
