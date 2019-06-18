// @flow

import type { CoreOperation } from "../../libcore/types";

async function cosmosBuildOperation({
  coreOperation
}: {
  coreOperation: CoreOperation
}) {
  console.log(">>> Start cosmosBuildOperation");
  console.log(coreOperation);
  console.log(coreOperation.getWalletType());
  const cosmosLikeOperation = await coreOperation.asCosmosLikeOperation();
  console.log(">>> Start getTransaction");
  const cosmosLikeTransaction = await cosmosLikeOperation.getTransaction();
  const hash = await cosmosLikeTransaction.getHash();
  return { hash };
}

export default cosmosBuildOperation;
