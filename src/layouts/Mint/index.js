import React, { useRef, useState } from "react";
import logo from "../../assets/logo.svg";
import { Link } from "react-router-dom";
import { mintNFT } from "../../services/Web3";
import { prefNetwork } from "../../constants";

const NFTMinter = () => {
  const [name, setName] = useState("");
  const [metadataPairs, setMetadataPairs] = useState([{ key: "", value: "" }]);
  const [price, setPrice] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [nftFile, setNftFile] = useState(null);
  const fileInputRef = useRef(null);
  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [mintResult, setMintResult] = useState("");
  const [showMintResultPopup, setShowMintResultPopup] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleNameChange = (event) => {
    const value = event.target.value;
    setName(value);
    setNameError(!value.trim() ? "Name is required" : "");
  };

  const handleNFTFileChange = (event) => {
    const file = event.target.files[0];
    setNftFile(file);

    // Preview image
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleMetadataChange = (index, field, value) => {
    const updatedMetadata = [...metadataPairs];
    updatedMetadata[index][field] = value;
    setMetadataPairs(updatedMetadata);
  };

  const addMetadataPair = () => {
    const updatedMetadata = [...metadataPairs, { key: "", value: "" }];
    setMetadataPairs(updatedMetadata);
  };

  const removeMetadataPair = (index) => {
    const updatedMetadata = [...metadataPairs];
    updatedMetadata.splice(index, 1);
    setMetadataPairs(updatedMetadata);
  };

  const handlePriceChange = (event) => {
    const value = event.target.value;
    setPrice(value);
    setPriceError(
      isNaN(Number(value)) || value.trim() === ""
        ? "Price must be a valid number"
        : Number(value) <= 0
        ? "Price must be bigger than 0"
        : ""
    );
  };

  const resetFormData = () => {
    setName("");
    setMetadataPairs([{ key: "", value: "" }]);
    setPrice("");
    setPreviewImage("");
    setNftFile(null);
    fileInputRef.current.value = null;
    setNameError("");
    setPriceError("");
  };

  const handleMint = async () => {
    if (!name || !nftFile || !price || nameError || priceError) {
      alert("Please fill in all fields with valid inputs.");
      return;
    }

    setLoading(true);

    try {
      const mintResult = await mintNFT(name, nftFile, metadataPairs, price);
      console.log("Minting Result:", mintResult);

      setMintResult(mintResult);
      setShowMintResultPopup(true);
      resetFormData();
    } catch (error) {
      console.error("Minting error:", error);
    } finally {
      setLoading(false);
    }
  };

  const MintResultPopup = ({ mintResult, onClose }) => (
    <div className="minting-result-popup">
      <div className="card-container">
        <div className="card-box">
          <div className="row-start-to-end">
            <div className="logo">
              <div>
                <h2 className="titles">Successfully Minted!</h2>
              </div>
            </div>
            {/* <button className="popup-close-button" onClick={onClose}>
              <span className="close-icon">&times;</span>
            </button> */}
          </div>
          <table className="popup-table">
            <tbody>
              <tr className="subtitles">
                <td>Token ID:</td>
                <td>{mintResult.tokenId}</td>
              </tr>
              <tr className="subtitles">
                <td>Metadata Link:</td>
                <td>{mintResult.uri}</td>
              </tr>
              <tr className="subtitles">
                <td>Price:</td>
                <td>
                  {mintResult.price} {prefNetwork.nativeCurrency.name}
                </td>
              </tr>
              <tr className="subtitles">
                <td>Transaction Hash:</td>
                <td>{mintResult.transactionHash}</td>
              </tr>
            </tbody>
          </table>
          <button className="popup-action-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const closeMintResultPopup = () => {
    setShowMintResultPopup(false);
    setMintResult("");
  };

  return (
    <div style={{ position: "relative" }}>
      {/* loading state */}
      {loading && <div className="loading-container"></div>}

      {/* Minting result popup */}
      {showMintResultPopup && mintResult && (
        <MintResultPopup
          mintResult={mintResult}
          onClose={closeMintResultPopup}
        />
      )}

      {/* mint card */}
      <div className="card-container">
        <div className="card-box">
          {/* header */}
          <div className="row-start-to-end">
            {/* Link to account */}
            <div>
              <Link to="/" style={{ textDecoration: "none" }}>
                <div className="row-start">
                  <div className="left-arrow"></div>
                  <h5 className="link-text">Go to Account</h5>
                </div>
              </Link>
            </div>

            {/* logo */}
            <div className="logo">
              <div>
                <h2 className="logo-text">NFT Minter</h2>
              </div>
              <div>
                <span style={{ display: "flex", justifyContent: "center" }}>
                  <img width="45" height="45" src={logo} alt="box" />
                </span>
              </div>
            </div>
          </div>

          {/* section 1 */}
          <div style={{ marginBottom: "1rem" }}>
            <h4 className="titles">General Info</h4>

            <div style={{ display: "flex", height: "120px" }}>
              {/* info */}
              <div style={{ flex: "1.2", marginRight: "0.5rem" }}>
                {/* name label */}
                <div className="subtitles">
                  <label htmlFor="name">Name</label>
                </div>
                {/* name input */}
                <div style={{ marginBottom: "0.5rem" }}>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={handleNameChange}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                  />
                </div>
                {/* upload button */}
                <div
                  style={{
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    id="nftFile"
                    onChange={handleNFTFileChange}
                    style={{ display: "none" }}
                  />
                  <button
                    onClick={() => document.getElementById("nftFile").click()}
                    className="upload-button"
                  >
                    Upload
                  </button>
                  <span className="image-path">
                    {nftFile ? nftFile.name : "No image selected"}
                  </span>
                </div>
                {/* error section */}
                <div style={{ display: "flex", height: "10px" }}>
                  {nameError && <span className="error-text">{nameError}</span>}
                </div>
              </div>

              {/* preview */}
              <div className="image-container">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="preview-image"
                  />
                ) : (
                  <span style={{ color: "#999" }}>Item Preview</span>
                )}
              </div>
            </div>
          </div>

          {/* section 2 */}
          <div style={{ marginBottom: "1rem" }}>
            <h4 className="titles">Metadata</h4>
            {/* metadata pair row */}
            {metadataPairs.map((item, index) => (
              <div key={index} className="metadata-row">
                {/* key */}
                <input
                  type="text"
                  className="metadata-input"
                  value={item.key}
                  placeholder="Key"
                  onChange={(e) =>
                    handleMetadataChange(index, "key", e.target.value)
                  }
                />
                {/* value */}
                <input
                  type="text"
                  className="metadata-input"
                  value={item.value}
                  placeholder="Value"
                  onChange={(e) =>
                    handleMetadataChange(index, "value", e.target.value)
                  }
                />
                {/* remove button */}
                <button
                  onClick={() => removeMetadataPair(index)}
                  className="remove-metadata-button"
                >
                  -
                </button>
              </div>
            ))}

            {/* add button */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button onClick={addMetadataPair} className="add-metadata-button">
                +
              </button>
            </div>
          </div>

          {/* section 3 */}
          <div style={{ marginBottom: "1rem" }}>
            <h4 style={{ margin: "0" }}>Price</h4>
            {/* price */}
            <div className="row-start-to-end">
              {/* amount label */}
              <div className="subtitles">
                <label htmlFor="price">Amount</label>
              </div>

              {/* amount input */}
              <div>
                <input
                  type="number"
                  className="price-amount"
                  id="price"
                  value={price}
                  onChange={handlePriceChange}
                />
              </div>
            </div>

            {/* error section */}
            <div style={{ display: "flex", height: "10px" }}>
              {priceError && <span className="error-text">{priceError}</span>}
            </div>
          </div>

          {/* mint button */}
          <div>
            <button
              className="action-button"
              onClick={handleMint}
              disabled={loading}
              style={{ cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Minting..." : "Mint NFT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTMinter;
