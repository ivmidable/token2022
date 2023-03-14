import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Token2022 } from "../target/types/token2022";
import { TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, 
  MINT_SIZE, getMinimumBalanceForRentExemptMint, 
  NON_TRANSFERABLE_SIZE, createInitializeNonTransferableMintInstruction, createMint, createInitializeMint2Instruction } from "@solana/spl-token";



describe("token2022", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const connection = anchor.getProvider().connection;
  const program = anchor.workspace.Token2022 as Program<Token2022>;

  const mint = anchor.web3.Keypair.generate();
  const payer = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    // Add your test here.
    let res = await connection.requestAirdrop(payer.publicKey, 100 * anchor.web3.LAMPORTS_PER_SOL);

    let latestBlockHash = await connection.getLatestBlockhash()

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: res,
    });
    //create the account
    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    const transaction = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint.publicKey,
        space: NON_TRANSFERABLE_SIZE,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      })
    );

    transaction.add(
      createInitializeNonTransferableMintInstruction(
        mint.publicKey, TOKEN_2022_PROGRAM_ID
      )
    );

    transaction.add(
      createInitializeMint2Instruction(
        mint.publicKey, 6, payer.publicKey, null, TOKEN_2022_PROGRAM_ID
      )
    );



    /*let ix = await program.methods.initialize()
      .accounts({
        mint: mint.publicKey,
        mintAuthority: payer.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      }).instruction()

    transaction.add(ix);
    */

    try {
      let tx = await anchor.web3.sendAndConfirmTransaction(connection, transaction, [payer, mint]);
      console.log("Your transaction signature", tx);
    } catch (err) {
      console.log(err);
    }

  });
});
