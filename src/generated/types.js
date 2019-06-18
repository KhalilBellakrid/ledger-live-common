// @flow
import { reflect as bitcoinReflect } from "../families/bitcoin/types";
import type { CoreStatics as CoreStatics_bitcoin } from "../families/bitcoin/types";
import type { CoreAccountSpecifics as CoreAccountSpecifics_bitcoin } from "../families/bitcoin/types";
import type { CoreOperationSpecifics as CoreOperationSpecifics_bitcoin } from "../families/bitcoin/types";
import type { CoreCurrencySpecifics as CoreCurrencySpecifics_bitcoin } from "../families/bitcoin/types";
import { reflect as cosmosReflect } from "../families/cosmos/types";
import type { CoreStatics as CoreStatics_cosmos } from "../families/cosmos/types";
import type { CoreAccountSpecifics as CoreAccountSpecifics_cosmos } from "../families/cosmos/types";
import type { CoreOperationSpecifics as CoreOperationSpecifics_cosmos } from "../families/cosmos/types";
import type { CoreCurrencySpecifics as CoreCurrencySpecifics_cosmos } from "../families/cosmos/types";
import { reflect as ethereumReflect } from "../families/ethereum/types";
import type { CoreStatics as CoreStatics_ethereum } from "../families/ethereum/types";
import type { CoreAccountSpecifics as CoreAccountSpecifics_ethereum } from "../families/ethereum/types";
import type { CoreOperationSpecifics as CoreOperationSpecifics_ethereum } from "../families/ethereum/types";
import type { CoreCurrencySpecifics as CoreCurrencySpecifics_ethereum } from "../families/ethereum/types";
import { reflect as rippleReflect } from "../families/ripple/types";
import type { CoreStatics as CoreStatics_ripple } from "../families/ripple/types";
import type { CoreAccountSpecifics as CoreAccountSpecifics_ripple } from "../families/ripple/types";
import type { CoreOperationSpecifics as CoreOperationSpecifics_ripple } from "../families/ripple/types";
import type { CoreCurrencySpecifics as CoreCurrencySpecifics_ripple } from "../families/ripple/types";

export type SpecificStatics = {}
& CoreStatics_bitcoin
& CoreStatics_cosmos
& CoreStatics_ethereum
& CoreStatics_ripple
export type CoreAccountSpecifics = {}
& CoreAccountSpecifics_bitcoin
& CoreAccountSpecifics_cosmos
& CoreAccountSpecifics_ethereum
& CoreAccountSpecifics_ripple
export type CoreOperationSpecifics = {}
& CoreOperationSpecifics_bitcoin
& CoreOperationSpecifics_cosmos
& CoreOperationSpecifics_ethereum
& CoreOperationSpecifics_ripple
export type CoreCurrencySpecifics = {}
& CoreCurrencySpecifics_bitcoin
& CoreCurrencySpecifics_cosmos
& CoreCurrencySpecifics_ethereum
& CoreCurrencySpecifics_ripple
export const reflectSpecifics = (declare: *) => {
bitcoinReflect(declare);
cosmosReflect(declare);
ethereumReflect(declare);
rippleReflect(declare);
};
