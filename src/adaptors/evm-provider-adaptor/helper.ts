import { ethers } from 'ethers';
import legitTokens from "./legitTokens";

export function wait(time: number) : Promise<void> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, time);
	});
}

export function getAmountOfFractionalAmount(amount: string | number, decimals: string | number) : string {
	const fixedAmount = Number(amount).toFixed(Number(decimals))
	return ethers.utils.parseUnits(fixedAmount, Number(decimals)).toString()
}

export function getDisplayAmount(inputAmount: ethers.BigNumberish, decimals: string | ethers.BigNumberish) : number {
	return  Number(ethers.utils.formatUnits(inputAmount, decimals))
}

export function getTokenObject(address: string, chainId: string | number) {
	const tokens: Token[] | undefined = legitTokens[String(chainId)];
	if (tokens) {
		const token =  tokens.find(t => t.ethContract.toLowerCase() === address.toLowerCase())
		if (token) {
			return token
		}
		console.error('Token not found address: ', address)
		return null
	}
	console.error('Tokens not found chain Id: ', chainId)
	return null
}
