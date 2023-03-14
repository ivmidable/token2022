use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

pub mod tk22;

use tk22::{
    initialize_mint2, initialize_non_transferable_mint, InitializeMint2,
    InitializeNonTransferableMint, Token2022,
};

#[program]
pub mod token2022 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let token_program_acct_info = ctx.accounts.token_program.to_account_info();
        let authority = ctx.accounts.mint_authority.to_account_info();

        let cpi_init_non_transfer = InitializeNonTransferableMint {
            mint: ctx.accounts.mint.to_account_info(),
        };

        let cpi_ctx_non_tx =
            CpiContext::new(token_program_acct_info.clone(), cpi_init_non_transfer);

        initialize_non_transferable_mint(cpi_ctx_non_tx)?;

        let cpi_init_mint2 = InitializeMint2 {
            mint: ctx.accounts.mint.to_account_info(),
        };

        let cpi_context = CpiContext::new(token_program_acct_info, cpi_init_mint2);

        initialize_mint2(cpi_context, 6u8, &authority.key(), Some(&authority.key()))?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    /// CHECK: for testing
    pub mint: UncheckedAccount<'info>,
    /// CHECK: for testing
    pub mint_authority: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token2022>,
}
