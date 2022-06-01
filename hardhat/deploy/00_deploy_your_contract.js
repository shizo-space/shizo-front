// deploy/00_deploy_your_contract.js

const { ethers } = require('hardhat')

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = await getChainId()

  const Cinergy = await deploy('Cinergy', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    log: true,
  })

  const Chest = await deploy('Chest', {
    from: deployer,
    log: true,
  })

  const Shizo = await deploy('Shizo', {
    from: deployer,
    args: [Cinergy.address],
    log: true,
  })

  try {
    console.log(' 🎫 Verifing Contract on Etherscan... ')
    await sleep(1000)
    await run('verify:verify', {
      address: Cinergy.address,
      contract: 'contracts/Cynergy.sol:Cynergy',
    })
  } catch (e) {
    console.log(' ⚠️ Failed to verify contract on Etherscan ', e)
  }

  // ToDo: Verify your contract with Etherscan for public chains
  if (chainId !== '31337') {
    try {
      console.log(' 🎫 Verifing Contract on Etherscan... ')
      await sleep(15000) // wait 15 seconds for deployment to propagate bytecode
      await run('verify:verify', {
        address: Shizo.address,
        contract: 'contracts/Shizo.sol:',
        constructorArguments: [Cinergy.address],
      })
    } catch (e) {
      console.log(' ⚠️ Failed to verify contract on Etherscan ', e)
    }
  }

  try {
    console.log(' 🎫 Verifing Contract on Etherscan... ')
    await sleep(1000)
    await run('verify:verify', {
      address: Chest.address,
      contract: 'contracts/Chest.sol:Chest',
    })
  } catch (e) {
    console.log(' ⚠️ Failed to verify contract on Etherscan ', e)
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports.tags = ['']
