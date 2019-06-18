// @flow
import invariant from "invariant";
import Transport from "@ledgerhq/hw-transport";
import type { Core, CoreWallet, CoreAccount } from "./types";
import type { CryptoCurrency } from "../types";
import type { DerivationMode } from "../derivation";
import getAddress from "../hw/getAddress";

type F = ({
  core: Core,
  wallet: CoreWallet,
  transport: Transport<*>,
  currency: CryptoCurrency,
  index: number,
  derivationMode: DerivationMode
}) => Promise<CoreAccount>;

export const createAccountFromDevice: F = async ({
  core,
  wallet,
  transport,
  currency,
  derivationMode
}) => {
  const accountCreationInfos = await wallet.getNextAccountCreationInfo();
  const chainCodes = await accountCreationInfos.getChainCodes();
  const publicKeys = await accountCreationInfos.getPublicKeys();
  const index = await accountCreationInfos.getIndex();
  const derivations = await accountCreationInfos.getDerivations();
  const owners = await accountCreationInfos.getOwners();

  await derivations.reduce(
    (promise, derivation) =>
      promise.then(async () => {
        const { publicKey, chainCode } = await getAddress(transport, {
          currency,
          path: derivation,
          derivationMode,
          askChainCode: true,
          skipAppFailSafeCheck: true
        });
        invariant(chainCode, "createAccountFromDevice: chainCode is required");
        publicKeys.push(publicKey);
        chainCodes.push(chainCode);
      }),
    Promise.resolve()
  );

  let account;
  if (currency.id === "cosmos") {
    //MEGA hack
    //const finalPubKey = Buffer.from(publicKeys[1], 'hex').toString('hex');
    const finalPubKey = "cosmospub1addwnpepqdtwj8njf68zedmfhzru54tg2475nnfjrrgtfd533prvs7sljk7nzxvtkpd";
    const finalDerivations = derivations[1];
    const finalOwner = owners[1];
    console.log("########");
    console.log(finalDerivations);
    console.log(finalPubKey);
    console.log(finalOwner);
    console.log("########");
    const newExtenderKeyAccountCreationInfos = await core.ExtendedKeyAccountCreationInfo.init(
      index,
      [finalOwner],
      [finalDerivations],
      [finalPubKey]
    );
    console.log("#### Creating account");
    account = await wallet.newAccountWithExtendedKeyInfo(newExtenderKeyAccountCreationInfos);
    console.log("#### !!!!! Account created");
  } else {
    const newAccountCreationInfos = await core.AccountCreationInfo.init(
      index,
      owners,
      derivations,
      publicKeys,
      chainCodes
    );
    account = await wallet.newAccountWithInfo(newAccountCreationInfos);
  }

  return account;
};
