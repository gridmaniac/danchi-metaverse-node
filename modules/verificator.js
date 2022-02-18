const ethers = require("ethers");
const abi = require("../abi/erc1155.abi.json");
const nftMap = require("../nft-map.json");
const authorizedList = {};

const Web3 = require("web3");

async function ownerOf(tokenId, address) {
  const web3 = new Web3(Web3.givenProvider || process.env.ETHEREUM_NODE);
  const contract = new web3.eth.Contract(abi, process.env.CONTRACT);
  const balance = await contract.methods.balanceOf(address, tokenId).call();
  return balance != 0;
}

module.exports.verifySignature = async function (message, signature, address) {
  const signerAddr = await ethers.utils.verifyMessage(message, signature);
  if (signerAddr !== address) throw new Error("Invalid signature.");
};

module.exports.verifyOwner = async function (nonce, tokenName, address) {
  const tokenId = nftMap[tokenName];
  if (tokenId == null)
    throw new Error("This aparment is not listed.");

  const owner = await ownerOf(tokenId, address);
  if (owner) throw new Error("Ownership verification failed.");

  // Authorize passed nonce
  authorizedList[nonce] = true;
};

module.exports.verifyNonce = async function (nonce) {
  if (!authorizedList.hasOwnProperty(nonce))
    throw new Error("Not authorized.");

  // Expire nonce
  delete authorizedList[nonce];
}