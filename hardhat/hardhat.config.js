require('dotenv').config()
const { utils } = require('ethers')
const fs = require('fs')
const chalk = require('chalk')

require('@nomiclabs/hardhat-waffle')
require('@tenderly/hardhat-tenderly')
require('@openzeppelin/hardhat-upgrades')

require('hardhat-deploy')
require('hardhat-gas-reporter')

require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-etherscan')

const { isAddress, getAddress, formatUnits, parseUnits } = utils

/*
      📡 This is where you configure your deploy configuration for 🏗 scaffold-eth
      check out `packages/scripts/deploy.js` to customize your deployment
      out of the box it will auto deploy anything in the `contracts` folder and named *.sol
      plus it will use *.args for constructor args
*/

//
// Select the network you want to deploy to here:
//
const defaultNetwork = 'polygonMumbai'

const mainnetGwei = 21

function mnemonic() {
  try {
    return fs.readFileSync('./mnemonic.txt').toString().trim()
  } catch (e) {
    if (defaultNetwork !== 'localhost') {
      console.log(
        '☢️ WARNING: No mnemonic file created for a deploy account. Try `yarn run generate` and then `yarn run account`.',
      )
    }
  }
  return ''
}

module.exports = {
  defaultNetwork,

  /**
   * gas reporter configuration that let's you know
   * an estimate of gas for contract deployments and function calls
   * More here: https://hardhat.org/plugins/hardhat-gas-reporter.html
   */
  gasReporter: {
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP || null,
  },

  // if you want to deploy to a testnet, mainnet, or xdai, you will need to configure:
  // 1. An Infura key (or similar)
  // 2. A private key for the deployer
  // DON'T PUSH THESE HERE!!!
  // An `example.env` has been provided in the Hardhat root. Copy it and rename it `.env`
  // Follow the directions, and uncomment the network you wish to deploy to.

  networks: {
    hardhat: {
      mining: {
        auto: true,
        // interval: [2000, 5000],
      },
    },
    localhost: {
      url: `http://${process.env.HOST}:8545`,
      // url: 'http://127.0.0.1:8545',
      keyHash: '0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc',
      fundAmount: '1000000000000000000',
      // gasPrice: 110000000000,
      /*
        notice no mnemonic here? it will just use account 0 of the hardhat node to deploy
        (you can put in a mnemonic here to set the deployer locally)

      */
    },
    ganache: {
      url: 'http://localhost:7545',
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad', // <---- YOUR INFURA ID! (or it won't work)
      //    url: "https://speedy-nodes-nyc.moralis.io/XXXXXXXXXXXXXXXXXXXXXXX/eth/rinkeby", // <---- YOUR MORALIS ID! (not limited to infura)
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    kovan: {
      url: 'https://kovan.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad', // <---- YOUR INFURA ID! (or it won't work)
      //    url: "https://speedy-nodes-nyc.moralis.io/XXXXXXXXXXXXXXXXXXXXXXX/eth/kovan", // <---- YOUR MORALIS ID! (not limited to infura)
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    mainnet: {
      url: 'https://mainnet.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad', // <---- YOUR INFURA ID! (or it won't work)
      //      url: "https://speedy-nodes-nyc.moralis.io/XXXXXXXXXXXXXXXXXXXXXXXXX/eth/mainnet", // <---- YOUR MORALIS ID! (not limited to infura)
      gasPrice: mainnetGwei * 1000000000,
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    ropsten: {
      url: 'https://ropsten.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad', // <---- YOUR INFURA ID! (or it won't work)
      //      url: "https://speedy-nodes-nyc.moralis.io/XXXXXXXXXXXXXXXXXXXXXXXXX/eth/ropsten",// <---- YOUR MORALIS ID! (not limited to infura)
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    goerli: {
      url: 'https://goerli.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad', // <---- YOUR INFURA ID! (or it won't work)
      //      url: "https://speedy-nodes-nyc.moralis.io/XXXXXXXXXXXXXXXXXXXXXXXXX/eth/goerli", // <---- YOUR MORALIS ID! (not limited to infura)
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    xdai: {
      url: 'https://rpc.xdaichain.com/',
      gasPrice: 1000000000,
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    fantom: {
      url: 'https://rpcapi.fantom.network',
      gasPrice: 1000000000,
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    testnetFantom: {
      url: 'https://rpc.testnet.fantom.network',
      gasPrice: 1000000000,
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    polygon: {
      url: 'https://polygon-rpc.com',
      // url: "https://speedy-nodes-nyc.moralis.io/XXXXXXXXXXXXXXXXXXXx/polygon/mainnet", // <---- YOUR MORALIS ID! (not limited to infura)
      gasPrice: 3200000000,
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    polygonMumbai: {
      url: 'https://matic-mumbai.chainstacklabs.com',
      // url: "https://speedy-nodes-nyc.moralis.io/XXXXXXXXXXXXXXXXXXXXXXX/polygon/mumbai", // <---- YOUR MORALIS ID! (not limited to infura)
      gasPrice: 3200000000,
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    matic: {
      url: 'https://rpc-mainnet.maticvigil.com/',
      gasPrice: 1000000000,
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    optimism: {
      url: 'https://mainnet.optimism.io',
      accounts: {
        mnemonic: mnemonic(),
      },
      companionNetworks: {
        l1: 'mainnet',
      },
    },
    kovanOptimism: {
      url: 'https://kovan.optimism.io',
      accounts: {
        mnemonic: mnemonic(),
      },
      companionNetworks: {
        l1: 'kovan',
      },
    },
    localOptimism: {
      url: 'http://localhost:8545',
      accounts: {
        mnemonic: mnemonic(),
      },
      companionNetworks: {
        l1: 'localOptimismL1',
      },
    },
    localOptimismL1: {
      url: 'http://localhost:9545',
      gasPrice: 0,
      accounts: {
        mnemonic: mnemonic(),
      },
      companionNetworks: {
        l2: 'localOptimism',
      },
    },
    localAvalanche: {
      url: 'http://localhost:9650/ext/bc/C/rpc',
      gasPrice: 225000000000,
      chainId: 43112,
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    fujiAvalanche: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      gasPrice: 225000000000,
      chainId: 43113,
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    mainnetAvalanche: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      gasPrice: 225000000000,
      chainId: 43114,
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    testnetHarmony: {
      url: 'https://api.s0.b.hmny.io',
      gasPrice: 1000000000,
      chainId: 1666700000,
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    mainnetHarmony: {
      url: 'https://api.harmony.one',
      gasPrice: 1000000000,
      chainId: 1666600000,
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    testnetTheta: {
      url: 'https://eth-rpc-api-testnet.thetatoken.org/rpc',
      gasPrice: 4000000000000,
      chainId: 365,
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    mainnetTheta: {
      url: 'https://eth-rpc-api.thetatoken.org/rpc',
      gasPrice: 4000000000000,
      chainId: 361,
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    tronNile: {
      url: 'https://api.nileex.io/',
      gasPrice: 4000000000000,
      accounts: {
        mnemonic: mnemonic(),
      },
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.8.9',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  ovm: {
    solcVersion: '0.7.6',
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
  },
  etherscan: {
    apiKey: {
      mainnet: 'DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW',
      ropsten: 'DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW',
      rinkeby: 'EMXPG9TJQAGBGBN57K532Y22EHYT4DH8J8',
      polygonMumbai: '1BDWJF464DJTCKJ87QAB6V8PE6QAURJTCY',
      // add other network's API key here
    },
  },
}

const DEBUG = false

function debug(text) {
  if (DEBUG) {
    console.log(text)
  }
}

task('wallet', 'Create a wallet (pk) link', async (_, { ethers }) => {
  const randomWallet = ethers.Wallet.createRandom()
  const privateKey = randomWallet._signingKey().privateKey
  console.log('🔐 WALLET Generated as ' + randomWallet.address + '')
  console.log('🔗 http://localhost:3000/pk#' + privateKey)
})

task('fundedwallet', 'Create a wallet (pk) link and fund it with deployer?')
  .addOptionalParam('amount', 'Amount of ETH to send to wallet after generating')
  .addOptionalParam('url', 'URL to add pk to')
  .setAction(async (taskArgs, { network, ethers }) => {
    const randomWallet = ethers.Wallet.createRandom()
    const privateKey = randomWallet._signingKey().privateKey
    console.log('🔐 WALLET Generated as ' + randomWallet.address + '')
    const url = taskArgs.url ? taskArgs.url : 'http://localhost:3000'

    let localDeployerMnemonic
    try {
      localDeployerMnemonic = fs.readFileSync('./mnemonic.txt')
      localDeployerMnemonic = localDeployerMnemonic.toString().trim()
    } catch (e) {
      /* do nothing - this file isn't always there */
    }

    const amount = taskArgs.amount ? taskArgs.amount : '0.01'
    const tx = {
      to: randomWallet.address,
      value: ethers.utils.parseEther(amount),
    }

    // SEND USING LOCAL DEPLOYER MNEMONIC IF THERE IS ONE
    // IF NOT SEND USING LOCAL HARDHAT NODE:
    if (localDeployerMnemonic) {
      let deployerWallet = new ethers.Wallet.fromMnemonic(localDeployerMnemonic)
      deployerWallet = deployerWallet.connect(ethers.provider)
      console.log('💵 Sending ' + amount + ' ETH to ' + randomWallet.address + ' using deployer account')
      const sendresult = await deployerWallet.sendTransaction(tx)
      console.log('\n' + url + '/pk#' + privateKey + '\n')
    } else {
      console.log('💵 Sending ' + amount + ' ETH to ' + randomWallet.address + ' using local node')
      console.log('\n' + url + '/pk#' + privateKey + '\n')
      return send(ethers.provider.getSigner(), tx)
    }
  })

task('generate', 'Create a mnemonic for builder deploys', async (_, { ethers }) => {
  const bip39 = require('bip39')
  const hdkey = require('ethereumjs-wallet/hdkey')
  const mnemonic = bip39.generateMnemonic()
  if (DEBUG) console.log('mnemonic', mnemonic)
  const seed = await bip39.mnemonicToSeed(mnemonic)
  if (DEBUG) console.log('seed', seed)
  const hdwallet = hdkey.fromMasterSeed(seed)
  const wallet_hdpath = "m/44'/60'/0'/0/"
  const account_index = 0
  const fullPath = wallet_hdpath + account_index
  if (DEBUG) console.log('fullPath', fullPath)
  const wallet = hdwallet.derivePath(fullPath).getWallet()
  const privateKey = '0x' + wallet._privKey.toString('hex')
  if (DEBUG) console.log('privateKey', privateKey)
  const EthUtil = require('ethereumjs-util')
  const address = '0x' + EthUtil.privateToAddress(wallet._privKey).toString('hex')
  console.log('🔐 Account Generated as ' + address + ' and set as mnemonic in packages/hardhat')
  console.log("💬 Use 'yarn run account' to get more information about the deployment account.")

  fs.writeFileSync('./' + address + '.txt', mnemonic.toString())
  fs.writeFileSync('./mnemonic.txt', mnemonic.toString())
})

task('mineContractAddress', 'Looks for a deployer account that will give leading zeros')
  .addParam('searchFor', 'String to search for')
  .setAction(async (taskArgs, { network, ethers }) => {
    let contract_address = ''
    let address

    const bip39 = require('bip39')
    const hdkey = require('ethereumjs-wallet/hdkey')

    let mnemonic = ''
    while (contract_address.indexOf(taskArgs.searchFor) != 0) {
      mnemonic = bip39.generateMnemonic()
      if (DEBUG) console.log('mnemonic', mnemonic)
      const seed = await bip39.mnemonicToSeed(mnemonic)
      if (DEBUG) console.log('seed', seed)
      const hdwallet = hdkey.fromMasterSeed(seed)
      const wallet_hdpath = "m/44'/60'/0'/0/"
      const account_index = 0
      const fullPath = wallet_hdpath + account_index
      if (DEBUG) console.log('fullPath', fullPath)
      const wallet = hdwallet.derivePath(fullPath).getWallet()
      const privateKey = '0x' + wallet._privKey.toString('hex')
      if (DEBUG) console.log('privateKey', privateKey)
      const EthUtil = require('ethereumjs-util')
      address = '0x' + EthUtil.privateToAddress(wallet._privKey).toString('hex')

      const rlp = require('rlp')
      const keccak = require('keccak')

      const nonce = 0x00 // The nonce must be a hex literal!
      const sender = address

      const input_arr = [sender, nonce]
      const rlp_encoded = rlp.encode(input_arr)

      const contract_address_long = keccak('keccak256').update(rlp_encoded).digest('hex')

      contract_address = contract_address_long.substring(24) // Trim the first 24 characters.
    }

    console.log('⛏  Account Mined as ' + address + ' and set as mnemonic in packages/hardhat')
    console.log('📜 This will create the first contract: ' + chalk.magenta('0x' + contract_address))
    console.log("💬 Use 'yarn run account' to get more information about the deployment account.")

    fs.writeFileSync('./' + address + '_produces' + contract_address + '.txt', mnemonic.toString())
    fs.writeFileSync('./mnemonic.txt', mnemonic.toString())
  })

task('account', 'Get balance informations for the deployment account.', async (_, { ethers }) => {
  const hdkey = require('ethereumjs-wallet/hdkey')
  const bip39 = require('bip39')
  try {
    const mnemonic = fs.readFileSync('./mnemonic.txt').toString().trim()
    if (DEBUG) console.log('mnemonic', mnemonic)
    const seed = await bip39.mnemonicToSeed(mnemonic)
    if (DEBUG) console.log('seed', seed)
    const hdwallet = hdkey.fromMasterSeed(seed)
    const wallet_hdpath = "m/44'/60'/0'/0/"
    const account_index = 0
    const fullPath = wallet_hdpath + account_index
    if (DEBUG) console.log('fullPath', fullPath)
    const wallet = hdwallet.derivePath(fullPath).getWallet()
    const privateKey = '0x' + wallet._privKey.toString('hex')
    if (DEBUG) console.log('privateKey', privateKey)
    const EthUtil = require('ethereumjs-util')
    const address = '0x' + EthUtil.privateToAddress(wallet._privKey).toString('hex')

    const qrcode = require('qrcode-terminal')
    qrcode.generate(address)
    console.log('‍📬 Deployer Account is ' + address)
    for (const n in config.networks) {
      // console.log(config.networks[n],n)
      try {
        const provider = new ethers.providers.JsonRpcProvider(config.networks[n].url)
        const balance = await provider.getBalance(address)
        console.log(' -- ' + n + ' --  -- -- 📡 ')
        console.log('   balance: ' + ethers.utils.formatEther(balance))
        console.log('   nonce: ' + (await provider.getTransactionCount(address)))
      } catch (e) {
        if (DEBUG) {
          console.log(e)
        }
      }
    }
  } catch (err) {
    console.log(`--- Looks like there is no mnemonic file created yet.`)
    console.log(`--- Please run ${chalk.greenBright('yarn generate')} to create one`)
  }
})

async function addr(ethers, addr) {
  if (isAddress(addr)) {
    return getAddress(addr)
  }
  const accounts = await ethers.provider.listAccounts()
  if (accounts[addr] !== undefined) {
    return accounts[addr]
  }
  throw `Could not normalize address: ${addr}`
}

task('accounts', 'Prints the list of accounts', async (_, { ethers }) => {
  const accounts = await ethers.provider.listAccounts()
  accounts.forEach(account => console.log(account))
})

task('blockNumber', 'Prints the block number', async (_, { ethers }) => {
  const blockNumber = await ethers.provider.getBlockNumber()
  console.log(blockNumber)
})

task('balance', "Prints an account's balance")
  .addPositionalParam('account', "The account's address")
  .setAction(async (taskArgs, { ethers }) => {
    const balance = await ethers.provider.getBalance(await addr(ethers, taskArgs.account))
    console.log(formatUnits(balance, 'ether'), 'ETH')
  })

task('tx', 'Prints a tx')
  .addPositionalParam('hash', "The tx's hash")
  .setAction(async (taskArgs, { ethers }) => {
    const tx = await ethers.provider.getTransaction(taskArgs.hash)
    console.log(tx)
  })

function send(signer, txparams) {
  return signer.sendTransaction(txparams, (error, transactionHash) => {
    if (error) {
      debug(`Error: ${error}`)
    }
    debug(`transactionHash: ${transactionHash}`)
    // checkForReceipt(2, params, transactionHash, resolve)
  })
}

task('send', 'Send ETH')
  .addParam('from', 'From address or account index')
  .addOptionalParam('to', 'To address or account index')
  .addOptionalParam('amount', 'Amount to send in ether')
  .addOptionalParam('data', 'Data included in transaction')
  .addOptionalParam('gasPrice', 'Price you are willing to pay in gwei')
  .addOptionalParam('gasLimit', 'Limit of how much gas to spend')

  .setAction(async (taskArgs, { network, ethers }) => {
    const from = await addr(ethers, taskArgs.from)
    debug(`Normalized from address: ${from}`)
    const fromSigner = await ethers.provider.getSigner(from)

    let to
    if (taskArgs.to) {
      to = await addr(ethers, taskArgs.to)
      debug(`Normalized to address: ${to}`)
    }

    const txRequest = {
      from: await fromSigner.getAddress(),
      to,
      value: parseUnits(taskArgs.amount ? taskArgs.amount : '0', 'ether').toHexString(),
      nonce: await fromSigner.getTransactionCount(),
      gasPrice: parseUnits(taskArgs.gasPrice ? taskArgs.gasPrice : '1.001', 'gwei').toHexString(),
      gasLimit: taskArgs.gasLimit ? taskArgs.gasLimit : 24000,
      chainId: network.config.chainId,
    }

    if (taskArgs.data !== undefined) {
      txRequest.data = taskArgs.data
      debug(`Adding data to payload: ${txRequest.data}`)
    }
    debug(txRequest.gasPrice / 1000000000 + ' gwei')
    debug(JSON.stringify(txRequest, null, 2))

    return send(fromSigner, txRequest)
  })

task('mint', 'Mint an item')
  .addPositionalParam('from', 'From address or account index')
  .addPositionalParam('tokenId', 'The TokenId of the item to mint')
  .addOptionalParam('to', 'To address or account index')
  .setAction(async (taskArgs, { ethers }) => {
    const { deployer } = await getNamedAccounts()
    const Metagate = await ethers.getContract('Metagate', deployer)

    const from = await addr(ethers, taskArgs.from)
    debug(`Normalized from address: ${from}`)
    const fromSigner = await ethers.provider.getSigner(from)

    let to
    if (taskArgs.to) {
      to = await addr(ethers, taskArgs.to)
      debug(`Normalized to address: ${to}`)
    } else {
      to = await from
      debug(`to is not provided, using from address as to: ${to}`)
    }

    const contract = Metagate.connect(fromSigner)

    const tx = await contract.mint(to, taskArgs.tokenId, { value: ethers.utils.parseEther('1.0') })
    console.log(tx)
  })

task('list', 'List an item')
  .addPositionalParam('from', 'From address or account index')
  .addPositionalParam('tokenId', 'The TokenId of the item to list on marketplace')
  .addPositionalParam('price', 'The price of the item')
  .setAction(async (taskArgs, { ethers }) => {
    const { deployer } = await getNamedAccounts()

    const Metagate = await ethers.getContract('Metagate', deployer)

    const from = await addr(ethers, taskArgs.from)
    debug(`Normalized from address: ${from}`)
    const fromSigner = await ethers.provider.getSigner(from)
    const contract = Metagate.connect(fromSigner)

    const tx = await contract.listOnMarketplace(taskArgs.tokenId, ethers.utils.parseEther(taskArgs.price))
    console.log(tx)
  })

task('purchase', 'Purchase an item')
  .addPositionalParam('buyer', 'From address or account index')
  .addPositionalParam('tokenId', 'The TokenId of the item to purchase')
  .addPositionalParam('price', 'The price of the item')
  .setAction(async (taskArgs, { ethers }) => {
    const { deployer } = await getNamedAccounts()

    const Metagate = await ethers.getContract('Metagate', deployer)

    const buyer = await addr(ethers, taskArgs.buyer)
    debug(`Normalized from address: ${buyer}`)
    const buyerSigner = await ethers.provider.getSigner(buyer)
    const contract = Metagate.connect(buyerSigner)

    const tx = await contract.purchase(taskArgs.tokenId, { value: ethers.utils.parseEther(taskArgs.price) })
    console.log(tx)
  })

task('request-random-words', 'Request a random word')
  .addParam('contract', 'The address of the API Consumer contract that you want to call')
  .setAction(async (taskArgs, { network, ethers }) => {
    console.log(taskArgs)
    const contractAddr = taskArgs.contract
    const networkId = network.name
    console.log(
      'Requesting a random word using VRF consumer contract ',
      contractAddr,
      ' on network ',
      networkId,
    )
    const Chest = await ethers.getContractFactory('Chest')

    // Get signer information
    const accounts = await ethers.getSigners()
    const signer = accounts[0]

    const chestConsumer = new ethers.Contract(contractAddr, Chest.interface, signer)
    const trx = await chestConsumer.requestRandomWords(37747709, 37753569, -122454813, -122446553, 0, 0, 1, 5)
    console.log(
      'Contract ',
      contractAddr,
      ' random number request successfully called. Transaction Hash: ',
      trx.hash,
    )
    const res = await trx.wait()
    console.log(trx)
    console.log(res)

    const trx2 = await chestConsumer.fulfillRandomWordsTest(1, [
      Math.floor(Math.random() * 37751024143945),
      Math.floor(Math.random() * 1224516414271),
      Math.floor(Math.random() * 16),
      Math.floor(Math.random() * 16),
    ])
    const res2 = await trx2.wait()
    console.log(trx2)
    console.log(res2)

    console.log('Run the following to read the returned random number:')
    console.log('yarn hardhat read-random-number --contract ' + contractAddr + ' --network ' + network.name)
  })

task('get-chests', 'Get spawned chests')
  .addParam('contract', 'The address of the VRF contract that you want to read')
  .setAction(async (taskArgs, { network, ethers }) => {
    const contractAddr = taskArgs.contract
    const networkId = network.name
    console.log('Reading data from VRF contract ', contractAddr, ' on network ', networkId)
    const Chest = await ethers.getContractFactory('Chest')

    // Get signer information
    const accounts = await ethers.getSigners()
    const signer = accounts[0]

    // Create connection to API Consumer Contract and call the createRequestTo function
    const chestConsumer = new ethers.Contract(contractAddr, Chest.interface, signer)
    const chest = await chestConsumer.treasureChests(0)
    console.log(chest)
  })
