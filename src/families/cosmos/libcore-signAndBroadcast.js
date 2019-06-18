// @flow

import { BigNumber } from "bignumber.js";
import type { Operation } from "../../types";
import { libcoreAmountToBigNumber } from "../../libcore/buildBigNumber";
import { getEnv } from "../../env";

async function cosmos({
  account: { id: accountId, freshAddress },
  signedTransaction,
  builded,
  coreAccount,
  transaction
}: *) {
  const cosmosLikeAccount = await coreAccount.asCosmosLikeAccount();

  const txHash = getEnv("DISABLE_TRANSACTION_BROADCAST")
    ? ""
    : await cosmosLikeAccount.broadcastRawTransaction(signedTransaction);
  const senders = [freshAddress];
  const receiver = await builded.getReceiver();
  const recipients = [await receiver.toBech32()];
  const gasPrice = await libcoreAmountToBigNumber(await builded.getGasPrice());
  const gasLimit = await libcoreAmountToBigNumber(await builded.getGasLimit());
  const fee = gasPrice.times(gasLimit);

  const op: $Exact<Operation> = {
    id: `${accountId}-${txHash}-OUT`,
    hash: txHash,
    type: "OUT",
    value: transaction.tokenAccountId
      ? fee
      : BigNumber(transaction.amount).plus(fee),
    fee,
    blockHash: null,
    blockHeight: null,
    senders,
    recipients,
    accountId,
    date: new Date(),
    extra: {}
  };

  return op;
}

export default cosmos;
