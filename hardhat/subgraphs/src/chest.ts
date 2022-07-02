import { BigInt } from '@graphprotocol/graph-ts'
import { Spawned } from '../generated/schema'
import {
  Spawned as SpawnedEvent,
  // Approval as ApprovalEvent,
  // ApprovalForAll as ApprovalForAllEvent,
  // Claimed as ClaimedEvent,
  // Transfer as TransferEvent,
} from '../generated/Chest/Chest'
// export function handleApproval(event: ApprovalEvent): void {
// Entities can be loaded from the store using a string ID; this ID
// // needs to be unique across all entities of the same type
// let entity = ExampleEntity.load(event.transaction.from.toHex())
// // Entities only exist after they have been saved to the store;
// // `null` checks allow to create entities on demand
// if (!entity) {
//   entity = new ExampleEntity(event.transaction.from.toHex())
//   // Entity fields can be set using simple assignments
//   entity.count = BigInt.fromI32(0)
// }
// // BigInt and BigDecimal math are supported
// entity.count = entity.count + BigInt.fromI32(1)
// // Entity fields can be set based on event parameters
// entity.owner = event.params.owner
// entity.approved = event.params.approved
// // Entities can be written to the store with `.save()`
// entity.save()
// Note: If a handler doesn't require existing field values, it is faster
// _not_ to load the entity from the store. Instead, create it fresh with
// `new Entity(...)`, set the fields that should be updated and save the
// entity back to the store. Fields that were not set or unset remain
// unchanged, allowing for partial updates to be applied.
// It is also possible to access smart contracts from mappings. For
// example, the contract that has emitted the event can be connected to
// with:
//
// let contract = Contract.bind(event.address)
//
// The following functions can then be called on this contract to access
// state variables and other data:
//
// - contract.LAT_LON_PRECISION(...)
// - contract.balanceOf(...)
// - contract.getApproved(...)
// - contract.isApprovedForAll(...)
// - contract.mint(...)
// - contract.name(...)
// - contract.nextTokenId(...)
// - contract.owner(...)
// - contract.ownerOf(...)
// - contract.pending_randomness(...)
// - contract.s_requestId(...)
// - contract.supportsInterface(...)
// - contract.symbol(...)
// - contract.tokenURI(...)
// - contract.treasureChests(...)
// }

// export function handleApprovalForAll(event: ApprovalForAllEvent): void {}

// export function handleClaimed(event: ClaimedEvent): void {}

export function handleSpawned(event: SpawnedEvent): void {
  const id = event.params.tokenId.toString() + '-' + event.block.timestamp.toString()
  const spawned = new Spawned(id)
  spawned.tokenId = event.params.tokenId.toString()
  spawned.lat = event.params.lat
  spawned.lon = event.params.lon
  spawned.t = event.params.t
  spawned.tier = event.params.tier
  spawned.save()
}

// export function handleTransfer(event: TransferEvent): void {}
