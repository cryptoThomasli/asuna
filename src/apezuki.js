const Web3 = require('web3');
const ABI = require('./constants/apezuki.json');

const PUBLIC_KEY = "0x5AaF4dD22e2997f60c4B28f6c6736Fe506474642";
const PRIVATE_KEY = "";
const GAS = 500000;
const MAX_PRIORITY_FEE_PER_GAS = 1999999987;
const CRON_JOB_INTERVAL_IN_MS = 800;
let pricePerNft = 0;

// Mainnet
const rpcUrl = "https://mainnet.infura.io/v3/4c3b9d39ccc449a38cd19ea316eb3116";
const contractAddress = "0x31c67B007f3951F0cfcE119680Fb41a22381d5Ae";

// Rinkeby
// const rpcUrl = "https://rinkeby.infura.io/v3/4c3b9d39ccc449a38cd19ea316eb3116";
// const contractAddress = "0xF615d3a70e785629CCBb3C26E8B811A78b541265";

const web3 = new Web3(rpcUrl);
const contract = new web3.eth.Contract(ABI, contractAddress);
let mintCount = 1;

const main = async() => {
  let nonce = await getNonce();

  for (;;) {
    try {
      const totalSupply = await getTotalSupply();
      console.log(totalSupply);
      if (totalSupply > 0) {
        console.log("Mint start!");

        const status = await mint(nonce);
        console.log({status});
        break;
      }
    } catch (e) {
      pricePerNft = 0.06;
      nonce++;
      console.log(e);
    } finally {
      await delayInMs(CRON_JOB_INTERVAL_IN_MS);
    }
  }
};
// ==== Custom functions start ==== //
const mint = async (nonce) => {
  const tx = getTx(nonce);
  const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
  const createReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log(
    `Transaction successful with hash: ${createReceipt.transactionHash}`
  );
  return createReceipt.status;
}

const getTotalSupply = async () => {
  return contractCall("totalSupply", []);
}

const getNonce = async () => {
  return await web3.eth.getTransactionCount(PUBLIC_KEY, 'latest');
}

const encodeData = (count) => {
  return encodeContractCall("adoptApes", [count]);
}
// ==== Custom functions end ==== //

const getTx = (nonce) => ({
  'from': PUBLIC_KEY,
  'to': contractAddress,
  'nonce': nonce,
  'value': web3.utils.toWei((mintCount * pricePerNft).toString(), 'ether'),
  'gas': GAS,
  'maxPriorityFeePerGas': MAX_PRIORITY_FEE_PER_GAS,
  'data': encodeData(mintCount)
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
