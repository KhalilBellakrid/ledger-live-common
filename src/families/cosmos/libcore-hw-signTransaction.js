// @flow

import invariant from "invariant";
import Cosmos from "ledger-cosmos-js";
import Transport from "@ledgerhq/hw-transport";
import type { CryptoCurrency, Account } from "../../types";
import type { CoreCurrency } from "../../libcore/types";
import type { CoreCosmosLikeTransaction } from "./types";

export async function cosmosSignTransaction({
  transport,
  account,
  coreTransaction,
  tokenAccountId
}: {
  isCancelled: () => boolean,
  transport: Transport<*>,
  account: Account,
  currency: CryptoCurrency,
  tokenAccountId: ?string,
  coreCurrency: CoreCurrency,
  coreTransaction: CoreCosmosLikeTransaction
}) {
  const hwApp = new Cosmos(transport);
  const result = await hwApp.signTransaction(
    account.freshAddressPath,
    await coreTransaction.serialize()
  );
  await coreTransaction.setSignature(result.v, result.r, result.s);
  const raw = await coreTransaction.serialize();
  return raw;
}

export default cosmosSignTransaction;
