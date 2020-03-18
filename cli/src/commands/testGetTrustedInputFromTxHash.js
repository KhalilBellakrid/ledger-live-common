// @flow
/* eslint-disable no-console */
import { withDevice } from "@ledgerhq/live-common/lib/hw/deviceAccess";
import { deviceOpt } from "../scan";
import { from } from "rxjs";
import invariant from "invariant";
import axios from "axios";
import Btc from "@ledgerhq/hw-app-btc";
import { findCurrencyExplorer } from "@ledgerhq/live-common/lib/api/Ledger";
import { findCryptoCurrencyById } from "@ledgerhq/live-common/lib/data/cryptocurrencies";

const command = async (transport, currencyId, hash) => {
  const btc = new Btc(transport);
  const currency = findCryptoCurrencyById(currencyId);
  invariant(currency.family==="bitcoin", "currency of bitcoin family only");

  if (!currency) return `No currency found with id ${currencyId}`;

  const ledgerExplorer = findCurrencyExplorer(currency);
  const { endpoint, version, id } = ledgerExplorer;

  const res = await axios.get(
    `${endpoint}/blockchain/${version}/${id}/transactions/${hash}/hex`
  );

  const hex = res.data[0] && res.data[0].hex;

  if (!hex) return `Backend returned no hex for this hash`

  const tx = btc.splitTransaction(
    hex,
    currency.supportsSegwit,
    currency.bitcoinLikeInfo.hasTimestamp,
    true
  );

  const outHash = await btc.getTrustedInput(transport, 0, tx, [currency.id]);
  const ouHash = outHash.substring(8, 72);
  const finalOut = Buffer.from(ouHash, 'hex').reverse().toString('hex');

  return { inHash: hash, finalOut };
};

export default {
  args: [
    deviceOpt,
    { name: "currency", alias: "c", type: String },
    { name: "hash", alias: "h", type: String }
  ],
  job: ({
    device,
    currency,
    hash
  }: $Shape<{ device: string, currency: string, hash: string }>) =>
    withDevice(device || "")(transport =>
      from(command(transport, currency, hash))
    )
};
