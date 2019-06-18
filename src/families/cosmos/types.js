import type { CoreAmount, Spec } from "../../libcore/types";

declare class CoreCosmosLikeAddress {
  toBech32(): Promise<string>;
}

declare class CoreCosmosLikeTransaction {
  getHash(): Promise<string>;
  getGasPrice(): Promise<CoreAmount>;
  getGasLimit(): Promise<CoreAmount>;
  getValue(): Promise<CoreAmount>;
  getReceiver(): Promise<CoreCosmosLikeAddress>;
  getSender(): Promise<CoreCosmosLikeAddress>;
  serialize(): Promise<string>;
  setSignature(string, string): Promise<void>;
  setDERSignature(string): Promise<void>;
}

declare class CoreCosmosLikeOperation {
  getTransaction(): Promise<CoreCosmosLikeTransaction>;
}

declare class CoreCosmosLikeTransactionBuilder {
  wipeToAddress(address: string): Promise<void>;
  sendToAddress(amount: CoreAmount, recipient: string): Promise<void>;
  setGasPrice(gasPrice: CoreAmount): Promise<void>;
  setGasLimit(gasLimit: CoreAmount): Promise<void>;
  build(): Promise<CoreCosmosLikeTransaction>;
}

declare class CoreCosmosLikeAccount {
  buildTransaction(): Promise<CoreCosmosLikeTransactionBuilder>;
  broadcastRawTransaction(signed: string): Promise<string>;
}

export type CoreStatics = {
  CosmosLikeOperation: Class<CoreCosmosLikeOperation>,
  CosmosLikeAddress: Class<CoreCosmosLikeAddress>,
  CosmosLikeTransaction: Class<CoreCosmosLikeTransaction>,
  CosmosLikeAccount: Class<CoreCosmosLikeAccount>,
  CosmosLikeTransactionBuilder: Class<CoreCosmosLikeTransactionBuilder>,
  CosmosLikeTransaction: Class<CoreCosmosLikeTransaction>
};

export type {
  CoreCosmosLikeAccount,
  CoreCosmosLikeAddress,
  CoreCosmosLikeOperation,
  CoreCosmosLikeTransaction,
  CoreCosmosLikeTransactionBuilder
};

export type CoreAccountSpecifics = {
  asCosmosLikeAccount(): Promise<CoreCosmosLikeAccount>
};

export type CoreOperationSpecifics = {
  asCosmosLikeOperation(): Promise<CoreCosmosLikeOperation>
};

export type CoreCurrencySpecifics = {};

export const reflect = (declare: (string, Spec) => void) => {
  declare("CosmosLikeAddress", {
    methods: {
      toBech32: {}
    }
  });

  declare("CosmosLikeOperation", {
    methods: {
      getTransaction: {
        returns: "CosmosLikeTransaction"
      }
    }
  });

  declare("CosmosLikeTransaction", {
    methods: {
      getHash: {},
      getGasPrice: { returns: "Amount" },
      getGasLimit: { returns: "Amount" },
      getValue: { returns: "Amount" },
      getReceiver: { returns: "CosmosLikeAddress" },
      getSender: { returns: "CosmosLikeAddress" },
      serialize: { returns: "hex" },
      setSignature: {
        params: ["hex", "hex"]
      },
      setDERSignature: {
        params: ["hex"]
      }
    }
  });

  declare("CosmosLikeTransactionBuilder", {
    methods: {
      wipeToAddress: {},
      sendToAddress: {
        params: ["Amount"]
      },
      setGasPrice: {
        params: ["Amount"]
      },
      setGasLimit: {
        params: ["Amount"]
      },
      build: {
        returns: "CosmosLikeTransaction"
      }
    }
  });
  
//TODO: check broadcastRawTransaction
  declare("CosmosLikeAccount", {
    methods: {
      buildTransaction: {
        returns: "CosmosLikeTransactionBuilder"
      },
      broadcastRawTransaction: {
        params: ["string"]
      }
    }
  });
};
