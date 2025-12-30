import { JsonRpcProvider, parseEther } from "ethers";

async function main() {
    // Connect to the local Hardhat node
    const provider = new JsonRpcProvider("http://127.0.0.1:8545");

    // Get the first signer (Account #0, usually pre-funded with 10000 ETH)
    const signer = await provider.getSigner(0);

    const recipient = "0x5f76700092ed38eb98c9cca6caf730982865c8b3";
    const amountStr = "100.0";

    console.log(`Signer address: ${signer.address}`);
    console.log(`Sending ${amountStr} ETH to ${recipient}...`);

    const tx = await signer.sendTransaction({
        to: recipient,
        value: parseEther(amountStr)
    });

    console.log(`Tx sent: ${tx.hash}`);
    await tx.wait();

    console.log(`✅ User successfully funded!`);
}

main().catch((error) => {
    console.error("❌ Error funding user:", error);
    process.exit(1);
});
