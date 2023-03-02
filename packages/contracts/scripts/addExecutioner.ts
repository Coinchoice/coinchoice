import { MaxUint256 } from "@uniswap/permit2-sdk";
import { BigNumber } from "ethers";
import '@nomiclabs/hardhat-ethers'
import { ethers } from "hardhat";
import { produceSig, Sign } from "../test/permitUtils";
import { Relayer__factory } from "../types";
import { addresses } from "./addresses";


const _addresses = addresses as any

const plusMargin = (num: any) => {
    return BigNumber.from(11).mul(String(num)).div(10).toString()
}

const executioner = '0x36176f5A332cB5a26e0B4924747BC3dB3Bd9aA05'

async function main() {

    const accounts = await ethers.getSigners()
    const operator = accounts[0]
    const user = accounts[1]
    const chainId = await operator.getChainId();
    const relayerAddress = _addresses.relayer[chainId]

    console.log("operator", operator.address, 'on', chainId, "with relayer", relayerAddress, "with user", user.address)

    const relayerContract = await new Relayer__factory(operator).attach(relayerAddress)

    // estimate gas for transaction
    const gasEst = await relayerContract.estimateGas.addExecutioner(executioner)

    console.log(gasEst.toString())
    const tx = await relayerContract.addExecutioner(
        executioner,
        { gasLimit: plusMargin(gasEst) }
    )
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
