// @flow

import invariant from "invariant";
import { BigNumber } from "bignumber.js";
import { FeeNotLoaded } from "@ledgerhq/errors";
import type { Account, Transaction } from "../../types";
import { isValidRecipient } from "../../libcore/isValidRecipient";
import { bigNumberToLibcoreAmount } from "../../libcore/buildBigNumber";
import type { Core, CoreCurrency, CoreAccount } from "../../libcore/types";
import type { CoreCosmosLikeTransaction } from "./types";


export async function cosmosBuildTransaction({
  account,
  core,
  coreAccount,
  coreCurrency,
  transaction,
  isCancelled
}: {
  account: Account,
  core: Core,
  coreAccount: CoreAccount,
  coreCurrency: CoreCurrency,
  transaction: Transaction,
  isPartial: boolean,
  isCancelled: () => boolean
}): Promise<?CoreCosmosLikeTransaction> {

  const cosmosLikeAccount = await coreAccount.asCosmosLikeAccount();

  await isValidRecipient({
    currency: account.currency,
    recipient: transaction.recipient
  });

  const recipient = transaction.recipient;

  const { gasPrice, gasLimit } = transaction;
  if (!gasPrice || !gasLimit) throw new FeeNotLoaded();

  const gasPriceAmount = await bigNumberToLibcoreAmount(
    core,
    coreCurrency,
    BigNumber(gasPrice)
  );
  const gasLimitAmount = await bigNumberToLibcoreAmount(
    core,
    coreCurrency,
    BigNumber(gasLimit)
  );

  if (isCancelled()) return;
  const transactionBuilder = await cosmosLikeAccount.buildTransaction();
  if (isCancelled()) return;

  if (!transaction.amount) throw new Error("amount is missing");
  const amount = await bigNumberToLibcoreAmount(
    core,
    coreCurrency,
    BigNumber(transaction.amount)
  );
  if (isCancelled()) return;
  await transactionBuilder.sendToAddress(amount, recipient);
  if (isCancelled()) return;

  await transactionBuilder.setGasLimit(gasLimitAmount);
  if (isCancelled()) return;

  await transactionBuilder.setGasPrice(gasPriceAmount);
  if (isCancelled()) return;

  const builded = await transactionBuilder.build();
  if (isCancelled()) return;

  return builded;
}

export default cosmosBuildTransaction;
