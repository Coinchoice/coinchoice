import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { ERC20__factory } from "../types";
import { addresses } from "./addresses";

const _addresses = addresses as any

async function main() {
    const accounts = await ethers.getSigners()
    const operator = accounts[0]
    const chainId = await operator.getChainId();

    const testLINK = _addresses.link[chainId]
    const relayerAddress = _addresses.relayer[chainId]

    console.log("operator", operator.address)
    const linkContract = await new ERC20__factory(operator).attach(testLINK)
    console.log("token", linkContract.address)
    await linkContract.transfer(relayerAddress, parseUnits('1', 18))

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
