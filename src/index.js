const Web3 = require('web3');
const ABI = require('./constants/abi.json');

const PUBLIC_KEY = "0x5AaF4dD22e2997f60c4B28f6c6736Fe506474642";
const PRIVATE_KEY = "";
const GAS = 500000;
const MAX_PRIORITY_FEE_PER_GAS = 1999999987;
const CRON_JOB_INTERVAL_IN_MS = 1000;
const PRICE_PER_NFT = 0.08;

// Mainnet
// const rpcUrl = "https://mainnet.infura.io/v3/4c3b9d39ccc449a38cd19ea316eb3116";
// const contractAddress = "0xAf615B61448691fC3E4c61AE4F015d6e77b6CCa8";

// Rinkeby
const rpcUrl = "https://rinkeby.infura.io/v3/4c3b9d39ccc449a38cd19ea316eb3116";
const contractAddress = "0x36eCEabAA19E023586A1C28e45e8Dd98E8352b82";

const web3 = new Web3(rpcUrl);
const contract = new web3.eth.Contract(ABI, contractAddress);
let mintCount = 1;

const main = async() => {
  const nonce = await getNonce();

  for (;;) {
    try {
      const publicListMaxMint = await getPublicListMaxMint();
      console.log(publicListMaxMint);
      if (publicListMaxMint > 0) {
        // mintCount = publicListMaxMint; TODO：
        console.log("Mint start!");

        await mintPublic(nonce);
        break;
      }
    } catch (e) {
      console.log(e);
    } finally {
      await delayInMs(CRON_JOB_INTERVAL_IN_MS);
    }
  }
};

const mintPublic = async (nonce) => {
  const tx = getTx(nonce);
  const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
  const createReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log(
    `Transaction successful with hash: ${createReceipt.transactionHash}`
  );
}

const getPublicListMaxMint = async () => {
  return contractCall("publicListMaxMint", []);
}

const getNonce = async () => {
  return await web3.eth.getTransactionCount(PUBLIC_KEY, 'latest');
}

const encodeMintPublicData = (count) => {
  return encodeContractCall("mintPublic", [count]);
}

const getTx = (nonce) => ({
  'from': PUBLIC_KEY,
  'to': contractAddress,
  'nonce': nonce,
  'value': web3.utils.toWei((mintCount * PRICE_PER_NFT).toString(), 'ether'),
  'gas': GAS,
  'maxPriorityFeePerGas': MAX_PRIORITY_FEE_PER_GAS,
  'data': encodeMintPublicData(mintCount)
})

const contractCall = async (methodName, params) => {
  return contract.methods[methodName](...params).call();
}

const encodeContractCall = (methodName, params) => {
  return contract.methods[methodName](...params).encodeABI();
}

const delayInMs = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

main();
