// @flow

import last from "lodash/last";
import {
  encodeAccountId,
  getAccountPlaceholderName,
  getNewAccountPlaceholderName
} from "../../account";
import type { Account, CryptoCurrency, DerivationMode } from "../../types";
import { libcoreAmountToBigNumber } from "../buildBigNumber";
import type { CoreWallet, CoreAccount, CoreOperation } from "../types";
import { buildOperation } from "./buildOperation";
import { buildTokenAccounts } from "./buildTokenAccounts";
import { minimalOperationsBuilder } from "../../reconciliation";

export async function buildAccount({
  coreWallet,
  coreAccount,
  coreOperations,
  currency,
  accountIndex,
  derivationMode,
  seedIdentifier,
  existingAccount
}: {
  coreWallet: CoreWallet,
  coreAccount: CoreAccount,
  coreOperations: CoreOperation[],
  currency: CryptoCurrency,
  accountIndex: number,
  derivationMode: DerivationMode,
  seedIdentifier: string,
  existingAccount: ?Account
}) {
  const nativeBalance = await coreAccount.getBalance();
  const balance = await libcoreAmountToBigNumber(nativeBalance);
  const coreAccountCreationInfo = await coreWallet.getAccountCreationInfo(
    accountIndex
  );
  console.log("#### Got coreAccountCreationInfo");

  const derivations = await coreAccountCreationInfo.getDerivations();
  const accountPath = last(derivations);
  console.log("#### Got derivations");
  const coreBlock = await coreAccount.getLastBlock();
  const blockHeight = await coreBlock.getHeight();

  const freshAddresses = await coreAccount.getFreshPublicAddresses();
  console.log("#### Got getFreshPublicAddresses");
  const [coreFreshAddress] = freshAddresses;
  if (!coreFreshAddress) throw new Error("expected at least one fresh address");
  const [freshAddressStr, freshAddressPath] = await Promise.all([
    coreFreshAddress.toString(),
    coreFreshAddress.getDerivationPath()
  ]);
  let freshAddress = {
    str: freshAddressStr,
    path: freshAddressPath ? `${accountPath}/${freshAddressPath}` : accountPath
  };

  const name =
    coreOperations.length === 0
      ? getNewAccountPlaceholderName({
          currency,
          index: accountIndex,
          derivationMode
        })
      : getAccountPlaceholderName({
          currency,
          index: accountIndex,
          derivationMode
        });

  // retrieve xpub
  const xpub = await coreAccount.getRestoreKey();

console.log("#### Got getRestoreKey");
console.log(xpub);
  const accountId = encodeAccountId({
    type: "libcore",
    version: "1",
    currencyId: currency.id,
    xpubOrAddress: xpub,
    derivationMode
  });

  const tokenAccounts = await buildTokenAccounts({
    currency,
    coreAccount,
    accountId,
    existingAccount
  });

console.log("#### Got tokenAccounts");
console.log(tokenAccounts);
  const operations = await minimalOperationsBuilder(
    (existingAccount && existingAccount.operations) || [],
    coreOperations,
    coreOperation =>
      buildOperation({
        coreOperation,
        accountId,
        currency,
        contextualTokenAccounts: tokenAccounts
      })
  );
console.log("@@@@@ after minimalOperationsBuilder");
freshAddress.path = "44\'/118\'/0\'"
console.log(freshAddress);
console.log(currency);

const ourData = {
  type: "Account",
  id: accountId,
  seedIdentifier,
  xpub,
  derivationMode,
  index: accountIndex,
  freshAddress: freshAddress.str,
  freshAddressPath: freshAddress.path,
  name,
  balance,
  blockHeight,
  currency,
  unit: currency.units[0],
  operations,
  pendingOperations: [],
  lastSyncDate: new Date()
};
console.log(ourData);
  const account: $Exact<Account> = {
    type: "Account",
    id: accountId,
    seedIdentifier,
    xpub,
    derivationMode,
    index: accountIndex,
    freshAddress: freshAddress.str,
    freshAddressPath: freshAddress.path,
    name,
    balance,
    blockHeight,
    currency,
    unit: currency.units[0],
    operations,
    pendingOperations: [],
    lastSyncDate: new Date()
  };

console.log("@@@@ End BuildAccount");
console.log(account);
  if (tokenAccounts) {
    account.tokenAccounts = tokenAccounts;
  }

  return account;
}
