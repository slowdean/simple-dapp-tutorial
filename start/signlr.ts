import { BigNumber } from "ethers";
import { signMakerOrder, addressesByNetwork, SupportedChainId, MakerOrder } from "@looksrare/sdk";
import { ethers } from "ethers";


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

const makerOrder: MakerOrder = {
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