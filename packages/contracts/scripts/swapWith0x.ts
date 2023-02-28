import { formatEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { ERC20__factory, Relayer__factory } from "../types";
import { addresses } from "./addresses";


const _addresses = addresses as any

async function main() {

    const accounts = await ethers.getSigners()
    const operator = accounts[0]
    const chainId = await operator.getChainId();
    const testLINK = _addresses.link[chainId]
    const relayerAddress = _addresses.relayer[chainId]
    console.log("operator", operator.address, 'on', chainId, "with relayer", relayerAddress)

    const relayerContract = await new Relayer__factory(operator).attach(relayerAddress)

    const buyToken = _addresses.weth[chainId]
    const fetchData = await fetch(
        `https://${chainId === 5 ? 'goerli' : 'mumbai'}.api.0x.org/swap/v1/quote?buyToken=${buyToken}&sellToken=${testLINK}&buyAmount=1000000000000000`
    ).then((response) => response.json())
    console.log('data', fetchData)

    const linkContract = await new ERC20__factory(operator).attach(testLINK)

    const bal = await linkContract.balanceOf(relayerAddress)
    console.log("balance relayer", formatEther(bal))
    const gasEst = await relayerContract.estimateGas.swap0x(
        operator.address,
        testLINK,
        fetchData.allowanceTarget,
        fetchData.to,
        fetchData.data
    )

    console.log(gasEst.toString())
    const tx = await relayerContract.swap0x(
        operator.address,
        testLINK,
        fetchData.allowanceTarget,
        fetchData.to,
        fetchData.data,
        { gasLimit: gasEst.mul(20).div(10) }
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
