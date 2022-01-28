const Web3 = require('web3');
const ABI = require('./constants/abi.json');

const CRON_JOB_INTERVAL_IN_MS = 1000;

// Mainnet
const rpcUrl = "https://mainnet.infura.io/v3/4c3b9d39ccc449a38cd19ea316eb3116";
const contractAddress = "0xAf615B61448691fC3E4c61AE4F015d6e77b6CCa8";

// Rinkeby
// const rpcUrl = "https://rinkeby.infura.io/v3/4c3b9d39ccc449a38cd19ea316eb3116";
// const contractAddress = "0x36eCEabAA19E023586A1C28e45e8Dd98E8352b82";

const web3 = new Web3(rpcUrl);
const contract = new web3.eth.Contract(ABI, contractAddress);

const main = async() => {
  for (;;) {
    try {
      const publicListMaxMint = await getPublicListMaxMint();
      console.log(publicListMaxMint);
      if (publicListMaxMint > 0) {
        console.log("Mint start!");

      }
    } catch (e) {
      console.log(e);
    } finally {
    await delayInMs(CRON_JOB_INTERVAL_IN_MS);
    }
  }
};

const contractCall = async (methodName, params) => {
  return contract.methods[methodName](...params).call();
}

const getPublicListMaxMint = async () => {
  return contractCall("publicListMaxMint", []);
}

const delayInMs = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

main();
