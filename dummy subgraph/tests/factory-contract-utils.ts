import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import { ContractCreated } from "../generated/FactoryContract/FactoryContract"

export function createContractCreatedEvent(
  newContract: Address,
  creator: Address
): ContractCreated {
  let contractCreatedEvent = changetype<ContractCreated>(newMockEvent())

  contractCreatedEvent.parameters = new Array()

  contractCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "newContract",
      ethereum.Value.fromAddress(newContract)
    )
  )
  contractCreatedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )

  return contractCreatedEvent
}
