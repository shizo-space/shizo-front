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

const TransitTypes = {
  Walk: 0,
  Taxi: 1,
}

const PRICE = ethers.utils.parseEther('0.001')

let shizoAccount,
  account,
  cinergy,
  shizo,
  boundShizo,
  tokenId = '123',
  rarity = Rarity.Common

beforeEach(async () => {
  const [_, _shizoAccount, _account] = await ethers.getSigners()
  shizoAccount = _shizoAccount
  account = _account
  // const shizoWallet = new ethers.Wallet(pKey)

  const Shizo = await ethers.getContractFactory('Shizo', shizoAccount)
  const Cinergy = await ethers.getContractFactory('Cinergy', shizoAccount)
  cinergy = await Cinergy.deploy()
  shizo = await Shizo.deploy(cinergy.address)
  await shizo.deployed()

  boundShizo = shizo.connect(account)
})

describe('Shizo', function () {
  it('Should teleport to the minted entity', async function () {
    const t = Types.Land
    const sign = await shizoAccount.signMessage(
      `shizo:mint:${tokenId},${t},${rarity},${Position.lat},${Position.lon}`,
    )

    const mintTx = await boundShizo
      .connect(account)
      .mint(tokenId, t, rarity, Position.lat, Position.lon, sign, {
        value: PRICE,
      })
    await mintTx.wait()
    const teleportTx = await boundShizo.teleport(tokenId)
    await teleportTx.wait()

    const pos = await shizo.positions(account.address)
    expect(pos.lat).to.equal(pos.lat)
    expect(pos.lon).to.equal(Position.lon)

    const teleportProps = await shizo.teleportProps(tokenId)
    expect(teleportProps.cooldown).to.be.above(0)
    expect(teleportProps.lastTeleportTime).to.be.above(0)

    const steps = [{ tokenId, lat: 377589544, lon: -122463936, distance: 50 }]
    const signTransit = await shizoAccount.signMessage(
      `shizo:transit:${steps.map(s => [s.tokenId, s.lat, s.lon, s.distance]).join(',')}`,
    )
    await boundShizo.transit(TransitTypes.Walk, steps, signTransit)
  })

  it('Should not teleport to the a road', async function () {
    const t = Types.Road
    const sign = await shizoAccount.signMessage(
      `shizo:mint:${tokenId},${t},${rarity},${Position.lat},${Position.lon}`,
    )
    const mintTx = await boundShizo
      .connect(account)
      .mint(tokenId, t, rarity, Position.lat, Position.lon, sign, {
        value: PRICE,
      })
    await mintTx.wait()

    await expect(boundShizo.teleport(tokenId)).to.be.revertedWith('You can only teleport to lands')
  })

  it('Should block a road', async () => {
    const t = Types.Road
    const sign = await shizoAccount.signMessage(
      `shizo:mint:${tokenId},${t},${rarity},${Position.lat},${Position.lon}`,
    )
    const mintTx = await boundShizo
      .connect(account)
      .mint(tokenId, t, rarity, Position.lat, Position.lon, sign, {
        value: PRICE,
      })
    await mintTx.wait()

    const blockTx = await boundShizo.blockRoad(tokenId)
    await blockTx.wait()

    const blockedRoad = await shizo.blockedRoads(tokenId)
    expect(blockedRoad).to.be.equal(true)
  })

  it('Should not block a land', async () => {
    const t = Types.Land
    const sign = await shizoAccount.signMessage(
      `shizo:mint:${tokenId},${t},${rarity},${Position.lat},${Position.lon}`,
    )
    const mintTx = await boundShizo
      .connect(account)
      .mint(tokenId, t, rarity, Position.lat, Position.lon, sign, {
        value: PRICE,
      })
    await mintTx.wait()

    await expect(boundShizo.blockRoad(tokenId)).to.be.revertedWith('You can only block roads')
  })

  // it('Should transit', async () => {
  //   const t = Types.Road

  //   const steps = [{ tokenId, lat: 377589544, lon: -122463936, distance: 50 }]
  //   const sign = await shizoAccount.signMessage(
  //     `shizo:transit:${steps.map(s => [s.tokenId, s.lat, s.lon, s.distance]).join(',')}`,
  //   )
  //   // const signBlock = await shizoAccount.signMessage(
  //   //   `shizo:mint:${tokenId},${t},${rarity},${Position.lat},${Position.lon}`,
  //   // )
  //   // const mintTx = await boundShizo
  //   //   .connect(account)
  //   //   .mint(tokenId, t, rarity, Position.lat, Position.lon, signBlock, {
  //   //     value: PRICE,
  //   //   })
  //   // await mintTx.wait()

  //   // const blockTx = await boundShizo.blockRoad(tokenId)
  //   // await blockTx.wait()

  //   await boundShizo.transit(TransitTypes.Walk, steps, sign)
  // })
})
