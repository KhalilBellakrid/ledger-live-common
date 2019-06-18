// @flow

import { libcoreAmountToBigNumber } from "../../libcore/buildBigNumber";
import buildTransaction from "./libcore-buildTransaction";

async function cosmos(arg: *) {
  const builded = await buildTransaction(arg);
  if (!builded) return;
  const gasPrice = await libcoreAmountToBigNumber(await builded.getGasPrice());
  const gasLimit = await libcoreAmountToBigNumber(await builded.getGasLimit());
  return gasPrice.times(gasLimit);
}

export default cosmos;
