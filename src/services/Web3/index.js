import { ethers } from "ethers";
import { uploadMetadataToIPFS } from "../../utils/IPFS";
const { abi } = require("../../abi/NFTMinter.json");

export async function mintNFT(name, nftFile, metadataPairs, price) {
  try {
    // Create NFT metadata and upload it to IPFS via Pinata
    const uriResult = await uploadMetadataToIPFS(name, nftFile, metadataPairs);
    console.log("Metadata: ", uriResult.metadata);
    console.log("Metadata Link: ", uriResult.metadataLink);

    // Connect to the Ethereum network using the injected provider (e.g., MetaMask)
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Get the signer (current connected user)
    const signer = provider.getSigner();

    // Create an instance of the NFT Minter contract
    const contract = new ethers.Contract(
      process.env.REACT_APP_CONTRACT_ADDRESS,
      abi,
      signer
    );

    const uri = uriResult.metadataLink;
    const weiPrice = ethers.utils.parseEther(price.toString());

    // Mint the NFT by calling the safeMint function
    const transaction = await contract.safeMint(uri, weiPrice, {
      value: weiPrice, // Include the price as the value to send along with the transaction
    });

    // Wait for the transaction to be mined and get the transaction receipt
    const receipt = await transaction.wait();

    console.log("Receipt:", receipt);

    // Extract the tokenId from the receipt event
    const tokenId = receipt.events[0].args.tokenId.toString();

    // Return the minting result or any other relevant information
    const result = {
      tokenId,
      transactionHash: transaction.hash,
      uri,
      price,
    };

    console.log("NFT minted successfully.");
    return result;
  } catch (error) {
    console.error("Error at minting NFT:", error);
    throw error;
  }
}
