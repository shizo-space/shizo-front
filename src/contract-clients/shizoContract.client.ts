import { BigNumber, ethers } from 'ethers'
import Contracts from '../contracts/hardhat_contracts.json'
import NodeWorker from '../adaptors/evm-provider-adaptor/NodeWorker'
import { MaticRequiredForMint, ShenRequiredForUpgrade } from '../constants'

function getCnt(currentChain: SimpleChain) {
	const { chainId, chainName } = currentChain
	return Contracts[chainId]?.[chainName]?.contracts['Shizo']
}

function getReadContract(currentChain: SimpleChain, provider: ethers.providers.Provider): ethers.Contract {
	const cnt = getCnt(currentChain)
	return new ethers.Contract(cnt.address, cnt.abi, provider)
}

function getWriteContract(currentChain: SimpleChain, signer: ethers.Signer): ethers.Contract {
	const cnt = getCnt(currentChain)
	return new ethers.Contract(cnt.address, cnt.abi, signer)
}

export async function mint(
	mergeId: string,
	type: number,
	rarity: number,
	lat: number,
	lon: number,
	signature: string,
	address: string | null,
	currentChain: SimpleChain,
	signer: ethers.Signer,
): Promise<void> {
	if (!signer || !address || !currentChain) {
		return
	}
	const contract = getWriteContract(currentChain, signer)
	const service = async function() {
		await contract.mint(
			mergeId,
			type,
			rarity,
			Math.floor(lat * 10 ** 6),
			Math.floor(lon * 10 ** 6),
			Buffer.from(signature),
			{
				value: MaticRequiredForMint[rarity],
			},
		)
	}
	return NodeWorker.async(service)
}

export async function mintByShen(
	mergeId: string,
	type: number,
	rarity: number,
	lat: number,
	lon: number,
	signature: string,
	address: string | null,
	currentChain: SimpleChain,
	signer: ethers.Signer,
): Promise<void> {
	if (!signer || !address || !currentChain) {
		return
	}
	const contract = getWriteContract(currentChain, signer)
	const service = async function() {
		await contract.mintByShen(
			mergeId,
			type,
			rarity,
			Math.floor(lat * 10 ** 6),
			Math.floor(lon * 10 ** 6),
			Buffer.from(signature),
		)
	}
	return NodeWorker.async(service)
}

export async function upgrade(
	tokenId: string,
	nextLevel: number,
	currentChain: SimpleChain,
	signer: ethers.Signer,
): Promise<void> {
	if (!signer || !currentChain || !nextLevel) {
		return
	}
	const contract = getWriteContract(currentChain, signer)
	const service = async function() {
		await contract.upgrade(tokenId)
	}
	return NodeWorker.async(service)
}

export async function blockRoad(
	tokenId: string,
	currentChain: SimpleChain,
	signer: ethers.Signer,
): Promise<void> {
	if (!signer || !currentChain) {
		return
	}
	const contract = getWriteContract(currentChain, signer)
	const service = async function() {
		await contract.changeRoadLimitations(tokenId, true)
	}
	return NodeWorker.async(service)
}

export async function getOwnerOf(
	mergeId: string,
	currentChain: SimpleChain,
	provider: ethers.providers.Provider,
): Promise<string | null> {
	if (!mergeId || !currentChain || !provider) {
		return
	}

	const contract = getReadContract(currentChain, provider)
	const service = async function() {
		return await contract.ownerOf(mergeId)
	}
	return NodeWorker.async(service)
}

export async function getMarketDetails(
	mergeId: string,
	currentChain: SimpleChain,
	provider: ethers.providers.Provider,
): Promise<any> {
	if (!mergeId || !currentChain || !provider) {
		return
	}

	const contract = getReadContract(currentChain, provider)
	const service = async function() {
		return await contract.marketplace(mergeId)
	}
	return NodeWorker.async(service)
}

export async function getStaticPosition(
	address: string,
	currentChain: SimpleChain,
	provider: ethers.providers.Provider,
): Promise<any> {
	if (!address || !currentChain || !provider) {
		return
	}

	const contract = getReadContract(currentChain, provider)
	const service = async function() {
		const pos = await contract.staticPositions(address)
		return {
			lat: pos.lat / 10 ** 6,
			lon: pos.lon / 10 ** 6,
		}
	}
	return NodeWorker.async(service)
}

export async function getTransit(
	address: string,
	currentChain: SimpleChain,
	provider: ethers.providers.Provider,
): Promise<Transit> {
	if (!address || !currentChain || !provider) {
		return
	}

	const contract = getReadContract(currentChain, provider)
	const service = async function() {
		return await contract.transits(address)
	}
	return NodeWorker.async(service)
}

export async function getDistanceTraversed(
	address: string,
	currentChain: SimpleChain,
	provider: ethers.providers.Provider,
): Promise<[number, number]> {
	if (!address || !currentChain || !provider) {
		return
	}

	const contract = getReadContract(currentChain, provider)
	const service = async function() {
		return await contract.getDistanceTraversed(address)
	}
	return NodeWorker.async(service)
}

export async function getTransitSteps(
	address: string,
	currentChain: SimpleChain,
	provider: ethers.providers.Provider,
): Promise<any> {
	if (!address || !currentChain || !provider) {
		return
	}

	const contract = getReadContract(currentChain, provider)
	const service = async function() {
		return await contract.getTransitSteps(address)
	}
	return NodeWorker.async(service)
}

export async function getEntityProps(
	tokenId: string,
	currentChain: SimpleChain,
	provider: ethers.providers.Provider,
): Promise<any> {
	if (!tokenId || !currentChain || !provider) {
		return
	}

	const contract = getReadContract(currentChain, provider)
	const service = async function() {
		return await contract.entities(tokenId)
	}
	return NodeWorker.async(service)
}

export async function setPrice(
	mergeId: string,
	price: string,
	currentChain: SimpleChain,
	signer: ethers.Signer,
): Promise<void> {
	if (!signer || !price || !currentChain) {
		return
	}
	const contract = getWriteContract(currentChain, signer)
	const service = async function() {
		await contract.listOnMarketplace(mergeId, ethers.utils.parseEther(price))
	}
	return NodeWorker.async(service)
}

export async function purchase(
	mergeId: string,
	price: BigNumber,
	currentChain: SimpleChain,
	signer: ethers.Signer,
): Promise<void> {
	if (!signer || !price || !currentChain) {
		return
	}
	const contract = getWriteContract(currentChain, signer)
	const service = async function() {
		await contract.purchase(mergeId, { value: price })
	}
	return NodeWorker.async(service)
}

export async function teleport(
	mergeId: string,
	currentChain: SimpleChain,
	signer: ethers.Signer,
): Promise<void> {
	if (!signer || !currentChain) {
		return
	}
	const contract = getWriteContract(currentChain, signer)
	const service = async function() {
		await contract.teleport(mergeId)
	}
	return NodeWorker.async(service)
}

export async function startTransit(
	transitType: number,
	steps: any[],
	currentChain: SimpleChain,
	signer: ethers.Signer,
): Promise<void> {
	if (!signer || !currentChain || !steps || transitType == null) {
		return
	}
	const contract = getWriteContract(currentChain, signer)
	const service = async function() {
		await contract.startTransit(transitType, steps, Buffer.from('hfjiksh'))
	}
	return NodeWorker.async(service)
}

export async function cancelTransit(currentChain: SimpleChain, signer: ethers.Signer): Promise<void> {
	if (!signer || !currentChain) {
		return
	}
	const contract = getWriteContract(currentChain, signer)
	const service = async function() {
		await contract.cancelTransit()
	}
	return NodeWorker.async(service)
}

export async function finishTransit(currentChain: SimpleChain, signer: ethers.Signer): Promise<void> {
	if (!signer || !currentChain) {
		return
	}
	const contract = getWriteContract(currentChain, signer)
	const service = async function() {
		await contract.finishTransit()
	}
	return NodeWorker.async(service)
}

export async function getTeleportProps(
	tokenId: string,
	currentChain: SimpleChain,
	provider: ethers.providers.Provider,
): Promise<any> {
	if (!tokenId || !currentChain || !provider) {
		return
	}

	const contract = getReadContract(currentChain, provider)
	const service = async function() {
		const res = await contract.teleportsProps(tokenId)
		console.log(res)
		return res
	}
	return NodeWorker.async(service)
}
