
import { ethers } from "ethers";
import fs from "fs";
import path from "path";

// ABI for Minting (Minimal)
const TOKEN_ABI = [
    "function mint(address to, uint256 amount)",
    "function balanceOf(address owner) view returns (uint256)"
];

async function main() {
    const targetAddress = process.argv[2];

    if (!targetAddress || !ethers.isAddress(targetAddress)) {
        console.error("❌ Please provide a valid Ethereum address as an argument.");
        console.error("Usage: npx tsx src/scripts/fund-wallet.ts <YOUR_WALLET_ADDRESS>");
        process.exit(1);
    }

    console.log(`💰 Funding wallet: ${targetAddress}`);

    // Read contract addresses
    const configPath = path.join(__dirname, "../../../frontend-react/src/lib/config/contract-addresses.ts");
    const configContent = fs.readFileSync(configPath, 'utf8');

    // Extract token address using regex to avoid importing problems
    const match = configContent.match(/CARBON_CREDIT_TOKEN: "0x[a-fA-F0-9]{40}"/);
    if (!match) {
        throw new Error("Could not find CARBON_CREDIT_TOKEN address in config");
    }
    const tokenAddress = match[0].split('"')[1];

    console.log(`📍 Token Contract: ${tokenAddress}`);

    // Connect to local node
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Use the first account (Deployer) which usually has minting rights
    const signer = await provider.getSigner(0);

    const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);

    // Mint 20,000 Tokens (Proposal Threshold is 10,000)
    const amount = ethers.parseEther("20000");
    const tx = await tokenContract.mint(targetAddress, amount);

    console.log("⏳ Transaction sent:", tx.hash);
    await tx.wait();

    const balance = await tokenContract.balanceOf(targetAddress);
    console.log(`✅ Successfully funded! New Balance: ${ethers.formatEther(balance)} EcoCredits`);
    console.log("👉 You can now create governance proposals.");
}

main()
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
