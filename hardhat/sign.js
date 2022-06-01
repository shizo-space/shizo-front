const Web3 = require('web3')
const web3 = new Web3()

const TEST_MESSAGE = 'amount:10000000000000000000'

const a = web3.eth.accounts.create()
console.log(a)

const s = web3.eth.accounts.sign(TEST_MESSAGE, 'pkey')

console.log(s)
