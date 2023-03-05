import '@nomiclabs/hardhat-ethers'
import { formatBytes32String } from 'ethers/lib/utils';
import { ethers } from "hardhat";
import { CoinChoiceRelayer__factory, MultiSigWallet__factory } from "../types";
import { addresses } from "./addresses";


const _addresses = addresses as any

async function main() {

    const accounts = await ethers.getSigners()
    const operator = accounts[0]
    const user = accounts[1]
    const chainId = await operator.getChainId();
    const relayerAddress = _addresses.relayer[chainId]

    console.log("operator", operator.address, 'on', chainId, "with relayer", relayerAddress, "with user", user.address)

    const relayerContract = await new CoinChoiceRelayer__factory(operator).attach(relayerAddress)

    const multisig = await new MultiSigWallet__factory(operator).attach(_addresses.multisig[chainId])

    let role = formatBytes32String("EXECUTIONER")
    console.log("ROLE", role, '0x88f60f9ea56d782d191a80676b73d8ebbbb9c9c7a342429de636e25ab8e45a80')
    // estimate gas for transaction
    const tx = relayerContract.interface.encodeFunctionData('grantRole', ['0x88f60f9ea56d782d191a80676b73d8ebbbb9c9c7a342429de636e25ab8e45a80', operator.address])

    const mstx = await multisig.submitTransaction(relayerContract.address, 0, tx)
    await mstx.wait()

    const _txCount = await multisig.getTransactionCount()
    const txIndex = _txCount.sub(1)
    const msConfirm = await multisig.confirmTransaction(txIndex)
    await msConfirm.wait()

    const msSend = await multisig.executeTransaction(txIndex)
    await msSend.wait()

    console.log("completed")

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
