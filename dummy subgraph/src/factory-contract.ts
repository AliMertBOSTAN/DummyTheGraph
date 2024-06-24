import { ContractCreated as ContractCreatedEvent } from "../generated/FactoryContract/FactoryContract"
import { ContractCreated } from "../generated/schema"

export function handleContractCreated(event: ContractCreatedEvent): void {
  let entity = new ContractCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newContract = event.params.newContract
  entity.creator = event.params.creator

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
