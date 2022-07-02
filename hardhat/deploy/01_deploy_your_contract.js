// deploy/00_deploy_your_contract.js

const { ethers } = require('hardhat')
const networkConfig = require('../hardhat.config')

module.exports = async ({ deployments, network, getChainId }) => {
  const { deploy } = deployments
  const [deployer] = await ethers.getSigners()
  console.log(`>> deployer: ${deployer.address}`)
  const networkName = network.name
  const chainId = await getChainId()
  let VRFCoordinatorV2Mock
  let vrfCoordinatorAddress
  let subscriptionId

  if (networkName === 'localhost') {
    VRFCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock')

    vrfCoordinatorAddress = VRFCoordinatorV2Mock.address

    const fundAmount = networkConfig.networks[networkName].fundAmount
    const transaction = await VRFCoordinatorV2Mock.createSubscription()
    const transactionReceipt = await transaction.wait(1)
    subscriptionId = ethers.BigNumber.from(transactionReceipt.events[0].topics[1])
    await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, fundAmount)
  } else {
    subscriptionId = networkConfig.networks[networkName].subscriptionId
    vrfCoordinatorAddress = networkConfig.networks[networkName].vrfCoordinator
    console.log(vrfCoordinatorAddress)
  }

  const keyHash = networkConfig.networks[networkName].keyHash
  const Cinergy = await deploy('Cinergy', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer.address,
    log: true,
  })

  const Chest = await deploy('Chest', {
    from: deployer.address,
    log: true,
    args: [vrfCoordinatorAddress, keyHash, subscriptionId],
  })

  const Shizo = await deploy('Shizo', {
    from: deployer.address,
    args: [Cinergy.address],
    log: true,
  })

  await verifyOnEtherscan(chainId, Cinergy, Shizo, Chest)
}

async function verifyOnEtherscan(chainId, Cinergy, Shizo, Chest) {
  if (chainId === 31337 || chainId === '31337') {
    return
  }
  try {
    console.log(' 🎫 Verifing Contract on Etherscan... ')
    await sleep(5000)
    await run('verify:verify', {
      address: Cinergy.address,
      contract: 'contracts/Cynergy.sol:Cynergy',
    })
  } catch (e) {
    console.log(' ⚠️ Failed to verify contract on Etherscan ', e)
  }

  // ToDo: Verify your contract with Etherscan for public chains
  try {
    console.log(' 🎫 Verifing Contract on Etherscan... ')
    await sleep(5000)
    await run('verify:verify', {
      address: Shizo.address,
      contract: 'contracts/Shizo.sol:',
      constructorArguments: [Cinergy.address],
    })
  } catch (e) {
    console.log(' ⚠️ Failed to verify contract on Etherscan ', e)
  }

  try {
    console.log(' 🎫 Verifing Contract on Etherscan... ')
    await sleep(5000)
    await run('verify:verify', {
      address: Chest.address,
      contract: 'contracts/Chest.sol:Chest',
    })
  } catch (e) {
    console.log(' ⚠️ Failed to verify contract on Etherscan ', e)
  }
}

async function sleep(ms) {
  return new Promise(() => setTimeout(() => {}, ms))
}
module.exports.tags = ['']
