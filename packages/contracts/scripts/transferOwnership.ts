import '@nomiclabs/hardhat-ethers'
import { ethers } from "hardhat";
import { Relayer__factory } from "../types";
import { addresses } from "./addresses";


const _addresses = addresses as any

async function main() {

    const accounts = await ethers.getSigners()
    const operator = accounts[0]
    const user = accounts[1]
    const chainId = await operator.getChainId();
    const relayerAddress = _addresses.relayer[chainId]

    console.log("operator", operator.address, 'on', chainId, "with relayer", relayerAddress, "with user", user.address)

    const relayerContract = await new Relayer__factory(operator).attach(relayerAddress)
    // estimate gas for transaction
    const tx = await relayerContract.transferOwnership(_addresses.multisig[chainId])

    console.log("TX", tx)
    await tx.wait()
    console.log("completed")

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
