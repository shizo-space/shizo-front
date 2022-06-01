const { expect } = require('chai')
const { ethers } = require('hardhat')

const Rarity = {
  Common: 0,
  Uncommon: 1,
  Rare: 2,
  Epic: 3,
  Legendary: 4,
}

const Types = {
  Land: 0,
  Road: 1,
}

const Position = {
  lat: 377589544,
  lon: -122463936,
}

const PRICE = ethers.utils.parseEther('0.001')

describe('Shizo', function () {
  it('Should teleport to the minted entity', async function () {
    const tokenId = '267296981'
    const t = Types.Land
    const rarity = Rarity.Common

    const [_, shizoAccount, account] = await ethers.getSigners()
    // const shizoWallet = new ethers.Wallet(pKey)

    const Shizo = await ethers.getContractFactory('Shizo', shizoAccount)
    const Cinergy = await ethers.getContractFactory('Cinergy', shizoAccount)
    const cinergy = await Cinergy.deploy()
    const shizo = await Shizo.deploy(cinergy.address)
    await shizo.deployed()

    const shizoContract = shizo.connect(account)
    const sign = await shizoAccount.signMessage(
      `shizo:mint:${tokenId},${t},${rarity},${Position.lat},${Position.lon}`,
    )

    const mintTx = await shizoContract
      .connect(account)
      .mint(tokenId, t, rarity, Position.lat, Position.lon, sign, {
        value: PRICE,
      })
    await mintTx.wait()
    const teleportTx = await shizoContract.teleport(tokenId)
    await teleportTx.wait()

    const pos = await shizo.positions(account.address)
    expect(pos.lat).to.equal(pos.lat)
    expect(pos.lon).to.equal(Position.lon)

    const teleportProps = await shizo.teleportProps(tokenId)
    expect(teleportProps.cooldown).to.be.above(0)
    expect(teleportProps.lastTeleportTime).to.be.above(0)
  })

  it('Should not teleport to the a road', async function () {
    const tokenId = '267296981'
    const t = Types.Road
    const rarity = Rarity.Common
    const [_, shizoAccount, account] = await ethers.getSigners()
    // const shizoWallet = new ethers.Wallet(pKey)

    const Shizo = await ethers.getContractFactory('Shizo', shizoAccount)
    const Cinergy = await ethers.getContractFactory('Cinergy', shizoAccount)
    const cinergy = await Cinergy.deploy()
    const shizo = await Shizo.deploy(cinergy.address)
    await shizo.deployed()

    const shizoContract = shizo.connect(account)
    const sign = await shizoAccount.signMessage(
      `shizo:mint:${tokenId},${t},${rarity},${Position.lat},${Position.lon}`,
    )
    const mintTx = await shizoContract
      .connect(account)
      .mint(tokenId, t, rarity, Position.lat, Position.lon, sign, {
        value: PRICE,
      })
    await mintTx.wait()

    await expect(shizoContract.teleport(tokenId)).to.be.revertedWith('You can only teleport to lands')
  })
})
