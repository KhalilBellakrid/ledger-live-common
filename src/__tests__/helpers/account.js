// @flow
import flatMap from "lodash/flatMap";
import {
  getFiatCurrencyByTicker,
  getCryptoCurrencyById
} from "../../currencies";
import {
  groupAccountOperationsByDay,
  groupAccountsOperationsByDay,
  reorderTokenAccountsByCountervalues
} from "../../account";
import { genAccount } from "../../mock/account";

test("groupAccountOperationsByDay", () => {
  const account = genAccount("seed_7");
  const res1 = groupAccountOperationsByDay(account, 10);
  expect(res1.completed).toBe(false);
  expect(res1).toMatchSnapshot();
  const res2 = groupAccountOperationsByDay(account, Infinity);
  expect(res2.completed).toBe(true);
  expect(
    // $FlowFixMe
    flatMap(res2.sections, s => s.data).slice(0, 10)
  ).toMatchObject(
    // $FlowFixMe
    flatMap(res1.sections, s => s.data)
  );
});

test("groupAccountsOperationsByDay", () => {
  const accounts = Array(10)
    .fill(null)
    .map((_, i) => genAccount("gaobd" + i));
  const res1 = groupAccountsOperationsByDay(accounts, 100);
  expect(res1.completed).toBe(false);
  expect(res1).toMatchSnapshot();
  const res2 = groupAccountsOperationsByDay(accounts, Infinity);
  expect(res2.completed).toBe(true);
  expect(
    // $FlowFixMe
    flatMap(res2.sections, s => s.data).slice(0, 100)
  ).toMatchObject(
    // $FlowFixMe
    flatMap(res1.sections, s => s.data)
  );
});

test("reorderTokenAccountsByCountervalues", () => {
  const account = genAccount("toto", {
    currency: getCryptoCurrencyById("ethereum"),
    tokenAccountsCount: 10
  });
  const tickers = {
    NEXO: 200000,
    WEB: 1
  };
  const reordered = reorderTokenAccountsByCountervalues(tickers)(
    account.tokenAccounts
  );
  expect(reordered.map(ta => ta.token.ticker)).toMatchSnapshot();
  expect(reorderTokenAccountsByCountervalues(tickers)(reordered)).toBe(
    reordered
  );
});

// TODO testing calculateCounterValue is correctly called for picking diff coins/dates.
