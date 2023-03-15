import * as anchor from "@project-serum/anchor";
import { Program, web3 } from "@project-serum/anchor";
import { Token2022 } from "../target/types/token2022";
import { TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, 
  getMintLen, ExtensionType, getMinimumBalanceForRentExemptMint, 
  NON_TRANSFERABLE_SIZE, createInitializeNonTransferableMintInstruction, createMint, createInitializeMint2Instruction } from "@solana/spl-token";


describe("token2022", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const connection = anchor.getProvider().connection;
  const program = anchor.workspace.Token2022 as Program<Token2022>;

  const mint = web3.Keypair.generate();
  const payer = web3.Keypair.generate();

  before(async () => {
    let res = await connection.requestAirdrop(payer.publicKey, 100 * web3.LAMPORTS_PER_SOL);

    let latestBlockHash = await connection.getLatestBlockhash()

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: res,
    });
  });

  it("Is initialized!", async () => {
    // Add your test here.
    
    //create the account
    



    /*let ix = await program.methods.initialize()
      .accounts({
        mint: mint.publicKey,
        mintAuthority: payer.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      }).instruction()

    transaction.add(ix);
    */
   let tx = await createNonTransferableMint(payer, connection, mint);

    try {
      let txid = await web3.sendAndConfirmTransaction(connection, tx, [payer, mint]);
      console.log("Your transaction signature", txid);
    } catch (err) {
      console.log(err);
    }

  });
});

async function createNonTransferableMint(payer: web3.Keypair, connection: web3.Connection, mint: web3.Keypair  | undefined) {
  const mintLength = getMintLen([ExtensionType.NonTransferable]);
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLength);

    const tx = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint.publicKey,
        space:  mintLength,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      })
    );

    tx.add(
      createInitializeNonTransferableMintInstruction(
        mint.publicKey, TOKEN_2022_PROGRAM_ID
      )
    );

    tx.add(
      createInitializeMint2Instruction(
        mint.publicKey, 6, payer.publicKey, null, TOKEN_2022_PROGRAM_ID
      )
    );

    return tx;
}
