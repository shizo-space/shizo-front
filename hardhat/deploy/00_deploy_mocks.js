const DECIMALS = '18'
const INITIAL_PRICE = '200000000000000000000'
const POINT_ONE_LINK = '100000000000000000'

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = await getChainId()
  // If we are on a local development network, we need to deploy mocks!
  if (chainId === 31337 || chainId === '31337' || chainId === '') {
    log('Local network detected! Deploying mocks...')
    console.log(deployer)
    const vrfCoordinator = await deploy('VRFCoordinatorV2Mock', {
      from: deployer,
      log: true,
      args: [
        POINT_ONE_LINK,
        1e9, // 0.000000001 LINK per gas
      ],
    })
    console.log(Object.keys(vrfCoordinator))
    log('Mocks Deployed!')
    log('----------------------------------------------------')
    log("You are deploying to a local network, you'll need a local network running to interact")
    log('Please run `yarn hardhat console` to interact with the deployed smart contracts!')
    log('----------------------------------------------------')
  }
}
module.exports.tags = ['all', 'mocks', 'main']
