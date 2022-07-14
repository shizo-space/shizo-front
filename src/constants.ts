import { ethers } from "ethers"

export const Rarity = {
	Common: 0,
	Uncommon: 1,
	Rare: 2,
	Epic: 3,
	Legendary: 4,
}

export const ShenRequiredForMint = {	
	[Rarity.Common]: ethers.utils.parseEther('10'),
	[Rarity.Uncommon]: ethers.utils.parseEther('20'),
	[Rarity.Rare]: ethers.utils.parseEther('50'),
	[Rarity.Epic]: ethers.utils.parseEther('100'),
	[Rarity.Legendary]: ethers.utils.parseEther('1000'),
}

export const MaticRequiredForMint = {	
	[Rarity.Common]: ethers.utils.parseEther('1'),
	[Rarity.Uncommon]: ethers.utils.parseEther('2'),
	[Rarity.Rare]: ethers.utils.parseEther('5'),
	[Rarity.Epic]: ethers.utils.parseEther('10'),
	[Rarity.Legendary]: ethers.utils.parseEther('100'),
}