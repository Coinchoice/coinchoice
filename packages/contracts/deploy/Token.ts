import '@nomiclabs/hardhat-ethers'
import { ethers } from "hardhat";
import { FiatWithPermit__factory, Relayer__factory } from "../types";
import { addresses } from "../scripts/addresses";
import { parseUnits } from 'ethers/lib/utils';

const _addresses = addresses as any

async function main() {
    const accounts = await ethers.getSigners()
    const operator = accounts[0]
    const chainId = await operator.getChainId();

    console.log("operator", operator.address)
    const token = await new FiatWithPermit__factory(operator).deploy("USD Coin", "USDC", 6)
    await token.deployed()
    console.log("token", token.address)

    await token.mint(operator.address, parseUnits('1000000', 6))
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
