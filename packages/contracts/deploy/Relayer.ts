import '@nomiclabs/hardhat-ethers'
import { ethers } from "hardhat";
import { Relayer__factory } from "../types";
import { addresses } from "../scripts/addresses";

const _addresses = addresses as any

async function main() {
    const accounts = await ethers.getSigners()
    const operator = accounts[0]
    const chainId = await operator.getChainId();

    console.log("operator", operator.address)
    const relayer = await new Relayer__factory(operator).deploy(addresses.weth[chainId])
    console.log("relayer", relayer.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
