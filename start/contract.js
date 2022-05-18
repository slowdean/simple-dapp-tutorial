/*global ethereum, MetamaskOnboarding */

/*
The `piggybankContract` is compiled from:

  pragma solidity ^0.4.0;
  contract PiggyBank {

      uint private balance;
      address public owner;

      function PiggyBank() public {
          owner = msg.sender;
          balance = 0;
      }

      function deposit() public payable returns (uint) {
          balance += msg.value;
          return balance;
      }

      function withdraw(uint withdrawAmount) public returns (uint remainingBal) {
          require(msg.sender == owner);
          balance -= withdrawAmount;

          msg.sender.transfer(withdrawAmount);

          return balance;
      }
  }
*/
import { BigNumber } from "ethers";
import { signMakerOrder, addressesByNetwork, SupportedChainId, MakerOrder } from "@looksrare/sdk";
import { ethers } from "ethers";

const forwarderOrigin = 'http://localhost:9010'

const initialize = () => {
//Basic Actions Section
const onboardButton = document.getElementById('connectButton');
const getAccountsButton = document.getElementById('getAccounts');
const getAccountsResult = document.getElementById('getAccountsResult');
//Created check function to see if the MetaMask extension is installed
const isMetaMaskInstalled = () => {
  //Have to check the ethereum binding on the window object to see if it's installed
  const { ethereum } = window;
  return Boolean(ethereum && ethereum.isMetaMask);
};
const MetaMaskClientCheck = () => {
  //Now we check to see if MetaMask is installed
  if (!isMetaMaskInstalled()) {
    //If it isn't installed we ask the user to click to install it
    onboardButton.innerText = 'Click here to install MetaMask!';
   //When the button is clicked we call this function
    onboardButton.onclick = onClickInstall;
    //The button is now disabled
    onboardButton.disabled = false;
  } else {
    //If it is installed we change our button text
    onboardButton.innerText = 'Connect';
   //When the button is clicked we call this function to connect the users MetaMask Wallet
    onboardButton.onclick = onClickConnect;
    //The button is now disabled
    onboardButton.disabled = false;
    sign();
    
  }
};
//We create a new MetaMask onboarding object to use in our app
const onboarding = new MetaMaskOnboarding({ forwarderOrigin });

async function sign() {
  let web3 = new web3(window.ethereum)
  let accounts = await web3.eth.getAccounts();
  let message = 'I am signing my one-time nonce: ABCDEF';
  let signature = await web3.eth.personal.sign(message, accounts[0], '');
  console.log('message', message);
  console.log('account', accounts[0]);
  console.log('signature', signature);
}
//This will start the onboarding proccess
const onClickInstall = () => {
  onboardButton.innerText = 'Onboarding in progress';
  onboardButton.disabled = true;
  //On this object we have startOnboarding which will start the onboarding process for our end user
  onboarding.startOnboarding();
};

const onClickConnect = async () => {
  try {
    // Will open the MetaMask UI
    // You should disable this button while the request is pending!
    await ethereum.request({ method: 'eth_requestAccounts' });
  } catch (error) {
    console.error(error);
  }
};
//Eth_Accounts-getAccountsButton
getAccountsButton.addEventListener('click', async () => {
  
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const signerAddress = "0x31ddf44347e89CE1Ee65B31174B690cB66F2713C";
  const chainId = SupportedChainId.MAINNET;
  const addresses = addressesByNetwork[chainId];
  const nonce = 513; // Fetch from the api
  
  const now = Math.floor(Date.now() / 1000);
  const paramsValue = [];
  const paramsTypes = [];
  
  // Get protocolFees and creatorFees from the contracts
  //const netPriceRatio = BigNumber.from(10000).sub(protocolFees.add(creatorFees)).toNumber();
  // This variable is used to enforce a max slippage of 15% on all orders, if a collection change the fees to be >15%, the order will become invalid
  const minNetPriceRatio = 8500;
  
  const makerOrder = {
    isOrderAsk: true,
    signer: signerAddress,
    collection: "0xcE25E60A89F200B1fA40f6c313047FFe386992c3",
    price: "1000000000000000000", // :warning: PRICE IS ALWAYS IN WEI :warning:
    tokenId: "1", // Token id is 0 if you use the STRATEGY_COLLECTION_SALE strategy
    amount: "1",
    strategy: addresses.STRATEGY_STANDARD_SALE,
    currency: addresses.WETH,
    nonce: nonce,
    startTime: now,
    endTime: now + 86400, // 1 day validity
    minPercentageToAsk: minNetPriceRatio,
    params: paramsValue,
  };
  const signatureHash = await signMakerOrder(signer, chainId, addresses.EXCHANGE, makerOrder, paramsTypes);
  getAccountsResult.innerHTML = signatureHash
});


MetaMaskClientCheck();

}
window.addEventListener('DOMContentLoaded', initialize)
