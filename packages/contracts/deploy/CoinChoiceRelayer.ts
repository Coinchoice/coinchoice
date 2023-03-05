import '@nomiclabs/hardhat-ethers'
import { ethers } from "hardhat";
import { CoinChoiceRelayer__factory, MultiSigWallet__factory, TransparentUpgradeableProxy__factory } from "../types";
import { addresses } from "../scripts/addresses";

const _addresses = addresses as any

async function main() {
    const accounts = await ethers.getSigners()
    const operator = accounts[0]
    const chainId = await operator.getChainId();

    console.log("operator", operator.address)

    const multisig = await new MultiSigWallet__factory(operator).deploy([operator.address], [1])
    await multisig.deployed()

    const relayerLogic = await new CoinChoiceRelayer__factory(operator).deploy()
    await relayerLogic.deployed()

    const proxy = await new TransparentUpgradeableProxy__factory(operator).deploy(relayerLogic.address, multisig.address, '0x')
    await proxy.deployed()


    console.log("multisig", multisig.address)
    console.log("relayerLogic", relayerLogic.address)
    console.log("relayerProxy", proxy.address)

    const relayerContract = await new CoinChoiceRelayer__factory(operator).attach(proxy.address)

    // await relayerContract.initialize(_addresses.weth[chainId])

    const tx = relayerContract.interface.encodeFunctionData('initialize', [_addresses.weth[chainId]])

    const mstx = await multisig.submitTransaction(relayerContract.address, 0, tx)
    await mstx.wait()

    const msConfirm = await multisig.confirmTransaction(0)
    await msConfirm.wait()

    const msSend = await multisig.executeTransaction(0)
    await msSend.wait()

    console.log("completed")

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
