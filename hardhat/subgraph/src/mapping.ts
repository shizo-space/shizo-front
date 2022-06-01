import { Address } from "@graphprotocol/graph-ts";
import { Purchase as PurchaseEvent, Transfer as TransferEvent } from "../generated/metagate/metagate";
import { Transfer, Mint, Purchase } from "../generated/schema";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function handleTransfer(ev: TransferEvent): void {
  const id =
    ev.params.from.toHexString() +
    "-" +
    ev.params.to.toHexString() +
    "-" +
    ev.params.tokenId.toString() +
    "-" +
    ev.block.timestamp.toString();

  if (ev.params.from.equals(Address.fromHexString(ZERO_ADDRESS))) {
    const mint = new Mint(id);
    mint.to = ev.params.to.toHexString();
    mint.tokenId = ev.params.tokenId;
    mint.timestamp = ev.block.timestamp;
    mint.save();
  } else {
    const transfer = new Transfer(id);
    transfer.to = ev.params.to.toHexString();
    transfer.from = ev.params.from.toHexString();
    transfer.tokenId = ev.params.tokenId;
    transfer.timestamp = ev.block.timestamp;
    transfer.save();
  }
}


export function handlePurchase(ev: PurchaseEvent): void {
  const id =
    ev.params.seller.toHexString() +
    "-" +
    ev.params.buyer.toHexString() +
    "-" +
    ev.params.tokenId.toString() +
    "-" +
    ev.params.price.toString() +
    "-" +
    ev.block.timestamp.toString();

    const purchase = new Purchase(id);
    purchase.seller = ev.params.seller.toHexString();
    purchase.buyer = ev.params.buyer.toHexString();
    purchase.tokenId = ev.params.tokenId;
    purchase.price = ev.params.price;
    purchase.timestamp = ev.block.timestamp;
    purchase.save();
}
