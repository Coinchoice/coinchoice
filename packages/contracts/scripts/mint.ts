import '@nomiclabs/hardhat-ethers'
import { ethers } from "hardhat";
import { FiatWithPermit__factory, Relayer__factory } from "../types";
import { addresses } from "./addresses";
import { parseUnits } from 'ethers/lib/utils';

const _addresses = addresses as any
const recipient = '0x1629F32bE1C0a47acbD268373E2f529788792ffe'
async function main() {
    const accounts = await ethers.getSigners()
    const operator = accounts[0]
    const chainId = await operator.getChainId();

    console.log("operator", operator.address)
    const token = await new FiatWithPermit__factory(operator).attach(_addresses.aaveUSDC[chainId])
    await token.deployed()
    console.log("token", token.address)

    await token.connect(operator).mint(recipient, parseUnits('1000000', 6))
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
