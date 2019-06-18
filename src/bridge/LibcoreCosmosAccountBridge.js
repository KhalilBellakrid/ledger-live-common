// @flow
import invariant from "invariant";
import { BigNumber } from "bignumber.js";
import {
  FeeNotLoaded,
  InvalidAddress,
  NotEnoughBalance
} from "@ledgerhq/errors";
import type { Unit, Account } from "../types";
import type { AccountBridge } from "./types";
import { syncAccount } from "../libcore/syncAccount";
import { isValidRecipient } from "../libcore/isValidRecipient";
import { getFeesForTransaction } from "../libcore/getFeesForTransaction";
import libcoreSignAndBroadcast from "../libcore/signAndBroadcast";
import { makeLRUCache } from "../cache";
import { apiForCurrency } from "../api/Ethereum";

export type Transaction = {
  recipient: string,
  amount: BigNumber,
  gasPrice: ?BigNumber,
  gasLimit: BigNumber,
  feeCustomUnit: ?Unit,
  useAllAmount?: boolean,
  networkInfo: ?{ serverFees: { gas_price: number } }
};

const getTransactionAccount = (a, t): Account | TokenAccount => {
  // const { tokenAccountId } = t;
  // return tokenAccountId
  //   ? (a.tokenAccounts || []).find(ta => ta.id === tokenAccountId) || a
  //   : a;
    return a;
};

const asLibcoreTransaction = ({
  amount,
  recipient,
  gasPrice,
  gasLimit,
  useAllAmount
}) => ({
  amount,
  recipient,
  gasPrice: gasPrice || undefined,
  gasLimit: gasLimit || undefined,
  useAllAmount
});

const startSync = (initialAccount, _observation) => syncAccount(initialAccount);

const checkValidRecipient = makeLRUCache(
  (account, recipient) => {
    if (!recipient)
      return Promise.reject(
        new InvalidAddress("", { currencyName: account.currency.name })
      );
    return isValidRecipient({ currency: account.currency, recipient });
  },
  (currency, recipient) => `${currency.id}_${recipient}`
);

const createTransaction = a => ({
  amount: BigNumber(0),
  recipient: "",
  gasPrice: null,
  gasLimit: BigNumber(0x5208),
  networkInfo: null,
  feeCustomUnit: a.currency.units[1] || a.currency.units[0],
  useAllAmount: false
});

//TODO: get fees from network
// export type Fees = {
//   [_: string]: number
// };
const getEstimatedFees = async () => {
  return {
    0: 2500,
    1: 2500,
    2: 2500,
  }
}
const fetchTransactionNetworkInfo = async account => {
  const serverFees = await getEstimatedFees();
  return {
    serverFees
  };
};

const getTransactionNetworkInfo = (account, transaction) =>
  transaction.networkInfo;

const applyTransactionNetworkInfo = (account, transaction, networkInfo) => ({
  ...transaction,
  networkInfo,
  gasPrice:
    transaction.gasPrice ||
    (networkInfo.serverFees.gas_price
      ? BigNumber(networkInfo.serverFees.gas_price)
      : null)
});

const editTransactionAmount = (account, t, amount) => ({
  ...t,
  amount
});

const getTransactionAmount = (a, t) => t.amount;

const editTransactionRecipient = (account, t, recipient) => ({
  ...t,
  recipient
});

const getTransactionRecipient = (a, t) => t.recipient;

const editTransactionExtra = (a, t, field, value) => {
  switch (field) {
    case "gasLimit":
      invariant(
        value && BigNumber.isBigNumber(value),
        "editTransactionExtra(a,t,'gasLimit',value): BigNumber value expected"
      );
      return { ...t, gasLimit: value };

    case "gasPrice":
      invariant(
        !value || BigNumber.isBigNumber(value),
        "editTransactionExtra(a,t,'gasPrice',value): BigNumber value expected"
      );
      return { ...t, gasPrice: value };

    case "feeCustomUnit":
      invariant(
        value,
        "editTransactionExtra(a,t,'feeCustomUnit',value): value is expected"
      );
      return { ...t, feeCustomUnit: value };

    default:
      return t;
  }
};

const getTransactionExtra = (a, t, field) => {
  switch (field) {
    case "gasLimit":
      return t.gasLimit;

    case "gasPrice":
      return t.gasPrice;

    case "feeCustomUnit":
      return t.feeCustomUnit;

    default:
      return undefined;
  }
};

const signAndBroadcast = (account, transaction, deviceId) =>
  libcoreSignAndBroadcast({
    account,
    transaction: asLibcoreTransaction(transaction),
    deviceId
  });

const addPendingOperation = (account, optimisticOperation) => ({
  ...account,
  pendingOperations: [...account.pendingOperations, optimisticOperation]
});

const getFees = makeLRUCache(
  async (a, t) => {
    await checkValidRecipient(a, t.recipient);
    return getFeesForTransaction({
      account: a,
      transaction: asLibcoreTransaction(t)
    });
  },
  (a, t) =>
    `${a.id}_${a.blockHeight || 0}_${t.amount.toString()}_${t.recipient}_${
      t.gasLimit ? t.gasLimit.toString() : ""
    }_${t.gasPrice ? t.gasPrice.toString() : ""}`
);

const checkValidTransaction = async (a, t) =>
  !t.gasPrice
    ? Promise.reject(new FeeNotLoaded())
    : t.amount.isLessThanOrEqualTo(a.balance)
    ? Promise.resolve(null)
    : Promise.reject(new NotEnoughBalance());

const getTotalSpent = (a, t) => {
  const tAccount = getTransactionAccount(a, t);

  if (t.useAllAmount) {
    return Promise.resolve(tAccount.balance);
  }

  const amount = BigNumber(t.amount || "0");
  if (
    amount.isZero() ||
    !t.gasPrice ||
    t.gasPrice.isZero() ||
    t.gasLimit.isZero()
  ) {
    return Promise.resolve(amount);
  }

  return getFees(a, t).then(totalFees => amount.plus(totalFees || 0));
};

const getMaxAmount = async (a, t) =>
  getFees(a, t).then(totalFees => a.balance.minus(totalFees || 0));

const estimateGasLimit = () => {
  console.warn(
    "bridge.estimateGasLimit DEPRECATED. use prepareTransaction instead"
  );
  return 40000;
};

const prepareTransaction = (a, t) => {
  const api = apiForCurrency(a.currency);
  const tAccount = getTransactionAccount(a, t);
  const o = estimateGasLimit();
  return o.then(gasLimit => ({ ...t, gasLimit: BigNumber(gasLimit) }));
};

const bridge: AccountBridge<Transaction> = {
  startSync,
  checkValidRecipient,
  createTransaction,
  fetchTransactionNetworkInfo,
  getTransactionNetworkInfo,
  applyTransactionNetworkInfo,
  editTransactionAmount,
  getTransactionAmount,
  editTransactionRecipient,
  getTransactionRecipient,
  editTransactionExtra,
  getTransactionExtra,
  checkValidTransaction,
  getTotalSpent,
  getMaxAmount,
  signAndBroadcast,
  addPendingOperation,
  estimateGasLimit,
  prepareTransaction
};

export default bridge;
