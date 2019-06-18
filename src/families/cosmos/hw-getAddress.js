// @flow

import Cosmos from "ledger-cosmos-js";
import type { Resolver } from "../../hw/getAddress/types";

const getAddress = async (app, path, verify, askChainCode) => {
  let accountPath = path.split("'").map(p => p.replace("/", "")).slice(0, 2);
  accountPath.push('0');
  accountPath.push('0');
  accountPath.push('0');
  accountPath = accountPath.map(p => parseInt(p));
  const resp = await app.getAddressAndPubKey(accountPath, "cosmos");
  return {
    address: resp.bech32_address,
    publicKey: resp.compressed_pk,
    chainCode: Buffer.alloc(0),
  }
}
const resolver: Resolver = async (
  transport,
  { path, verify, askChainCode }
) => {
  const cosmos = new Cosmos(transport);
  const { address, publicKey, chainCode } = await getAddress(
    cosmos,
    path,
    verify,
    askChainCode || false
  );
  return { path, address, publicKey, chainCode };
};

export default resolver;
