import { ContractCreated as ContractCreatedEvent } from "../generated/FactoryContract/FactoryContract"
import { ValueChanged as ValueChangedEvent,
         swapExecuted as swapExecutedEvent
} from "../generated/templates/SimpleAccountContract/SimpleAccountContract"
import { ContractCreated, ValueChanged, swapExecuted } from "../generated/schema"
import { SimpleAccountContract } from "../generated/templates"


export function handleContractCreated(event: ContractCreatedEvent): void {
    let entity = new ContractCreated(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.newContract = event.params.newContract
    entity.creator = event.params.creator
  
    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash
  
    SimpleAccountContract.create(event.params.newContract)
  
    entity.save()
}
  
export function handleValueChanged(event: ValueChangedEvent): void {
    let entity = new ValueChanged(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.newValue = event.params.newValue
  
    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash
  
    entity.save()
}
  
export function handleswapExecuted(event: swapExecutedEvent): void {
    let entity = new swapExecuted(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.newSwap_tokenBuy = event.params.newSwap.tokenBuy
    entity.newSwap_tokenSell = event.params.newSwap.tokenSell
    entity.newSwap_value = event.params.newSwap.value
    entity.newSwap_timestamp = event.params.newSwap.timestamp
  
    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash
  
    entity.save()
}