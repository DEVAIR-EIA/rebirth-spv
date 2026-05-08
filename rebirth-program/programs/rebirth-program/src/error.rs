use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Only the SPV authority can perform this action")]
    Unauthorized,
    #[msg("Failed to calculate mint account size")]
    MintSizeError,
}
