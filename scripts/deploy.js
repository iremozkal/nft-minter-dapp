// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const NFTMinter = await hre.ethers.getContractFactory("NFTMinter");

  // Set the wallet addresses
  const treasuryWallet = "0x8f908A1f2805252Fc4aB92b5c22Dd9BDBFf6b7e6";
  const liquidityWallet = "0xF9F28C2D1B75BF83F8756968027D46B5FF6a8873";

  // Deploy the contract
  const nftMinter = await NFTMinter.deploy(treasuryWallet, liquidityWallet);
  await nftMinter.waitForDeployment();

  console.log("🔹 NFTMinter contract deployed to:", nftMinter.target);

  // Connect to an account that will mint the NFT
  const [owner] = await hre.ethers.getSigners();

  // Set NFT info
  const uri =
    "https://dl.openseauserdata.com/cache/originImage/files/5203cc97c7c8e602c0adc5f789224c77.png";
  const price = hre.ethers.parseEther("1");

  // Call the mint function
  const tx = await nftMinter.safeMint(uri, price, {
    value: price, // Pay the specified price for minting
    from: owner.address, // Mint from the owner's address
  });

  console.log("🔸 1 NFT minted. Transaction hash:", tx.hash);
}

// Run the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
