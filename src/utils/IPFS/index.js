import axios from "axios";
import { PINATA_API } from "../../constants";

async function pinFileToIPFS(formData) {
  const response = await axios.post(
    `${PINATA_API.URL}/pinning/pinFileToIPFS`,
    formData,
    {
      maxContentLength: Infinity,
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
        pinata_api_key: PINATA_API.KEY,
        pinata_secret_api_key: PINATA_API.SECRET,
      },
    }
  );
  const ipfsHash = response.data.IpfsHash;
  const ipfsLink = `${PINATA_API.BASE_URL}/ipfs/${ipfsHash}`;
  return ipfsLink;
}

async function uploadImageToIPFS(imageFile) {
  try {
    if (!imageFile) {
      throw new Error("No image file provided");
    }

    if (!imageFile.type.startsWith("image/")) {
      throw new Error("Invalid file type. Only image files are allowed");
    }

    const formData = new FormData();
    formData.append("file", imageFile);

    const ipfsLink = await pinFileToIPFS(formData);
    console.log("Image uploaded to IPFS via Pinata. IPFS link:", ipfsLink);

    return ipfsLink;
  } catch (error) {
    console.error("Error uploading image to IPFS via Pinata:", error);
    throw error;
  }
}

async function uploadFileToIPFS(fileContent, fileExtension) {
  try {
    if (!fileContent) {
      throw new Error("No file content provided");
    }

    const fileBlob = new Blob([fileContent], {
      type: `application/octet-stream`,
    });

    const formData = new FormData();
    formData.append("file", fileBlob, `file.${fileExtension}`);

    const ipfsLink = await pinFileToIPFS(formData);
    console.log("File uploaded to IPFS via Pinata. IPFS link:", ipfsLink);

    return ipfsLink;
  } catch (error) {
    console.error("Error uploading file to IPFS via Pinata:", error);
    throw error;
  }
}

export async function uploadMetadataToIPFS(name, nftFile, metadataPairs) {
  // Upload image to IPFS via Pinata
  const imageLink = await uploadImageToIPFS(nftFile);

  // Prepare metadata JSON
  const metadataJSON = {
    name,
    image: imageLink,
    attributes: metadataPairs.map((item) => ({
      trait_type: item.key,
      value: item.value,
    })),
  };

  // Upload metadata JSON to IPFS via Pinata
  const metadataLink = await uploadFileToIPFS(
    JSON.stringify(metadataJSON),
    "json"
  );

  return { metadata: metadataJSON, metadataLink };
}
