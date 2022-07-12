import { BigNumber, ethers } from 'ethers'
import Contracts from '../contracts/hardhat_contracts.json'
import NodeWorker from '../adaptors/evm-provider-adaptor/NodeWorker'

function getCnt(currentChain: SimpleChain) {
    const { chainId, chainName } = currentChain
    return Contracts[chainId]?.[chainName]?.contracts['ShizoEnergy']
}

function getShizoCnt(currentChain: SimpleChain) {
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

export async function allowance(
    walletAddress: string,
    currentChain: SimpleChain,
    provider: ethers.providers.Provider,
): Promise<BigNumber> {
    if (!walletAddress || !currentChain || !provider) {
        return
    }

    const contract = getReadContract(currentChain, provider)
    const service = async function () {
        const res = await contract.allowance(walletAddress, getShizoCnt(currentChain).address)
        console.log(res)
        return res
    }
    return NodeWorker.async(service)
}

export async function approve(
    amount: BigNumber,
    currentChain: SimpleChain,
    signer: ethers.Signer,
): Promise<void> {
    if (!amount || !signer || !currentChain) {
        return
    }
    const contract = getWriteContract(currentChain, signer)
    const service = async function () {
        await contract.approve(getShizoCnt(currentChain).address, amount)
    }
    return NodeWorker.async(service)
}

export async function balanceOf(
    walletAddress: string,
    currentChain: SimpleChain,
    provider: ethers.providers.Provider,
): Promise<BigNumber> {
    if (!walletAddress || !currentChain || !provider) {
        return
    }

    const contract = getReadContract(currentChain, provider)
    const service = async function () {
        const res = await contract.balanceOf(walletAddress)
        console.log(res)
        return res
    }
    return NodeWorker.async(service)
}
