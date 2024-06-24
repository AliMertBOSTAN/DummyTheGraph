import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { ContractCreated } from "../generated/schema"
import { ContractCreated as ContractCreatedEvent } from "../generated/FactoryContract/FactoryContract"
import { handleContractCreated } from "../src/dummy"
import { createContractCreatedEvent } from "./factory-contract-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let newContract = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let creator = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newContractCreatedEvent = createContractCreatedEvent(
      newContract,
      creator
    )
    handleContractCreated(newContractCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ContractCreated created and stored", () => {
    assert.entityCount("ContractCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ContractCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "newContract",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ContractCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "creator",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
