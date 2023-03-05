import '@nomiclabs/hardhat-ethers'
import { ethers } from "hardhat";
import { MultiSigWallet__factory } from "../types";
import { addresses } from "./addresses";


const _addresses = addresses as any

async function main() {

    const accounts = await ethers.getSigners()
    const operator = accounts[0]
    const user = accounts[1]
    const chainId = await operator.getChainId();
    const relayerAddress = _addresses.relayer[chainId]

    console.log("operator", operator.address, 'on', chainId, "with relayer", relayerAddress, "with user", user.address)


    const multisig = await new MultiSigWallet__factory(operator).attach(_addresses.multisig[chainId])


    const msConfirm = await multisig.confirmTransaction(4)
    await msConfirm.wait()

    const msSend = await multisig.executeTransaction(4)
    await msSend.wait()

    console.log("completed")

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
