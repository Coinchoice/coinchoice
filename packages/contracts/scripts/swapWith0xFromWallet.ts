import { MaxUint256 } from "@uniswap/permit2-sdk";
import { ethers } from "hardhat";
import { ERC20__factory, Relayer__factory } from "../types";
import { addresses } from "./addresses";


const _addresses = addresses as any

async function main() {

    const accounts = await ethers.getSigners()
    const operator = accounts[0]
    const chainId = await operator.getChainId();
    console.log("operator", operator.address, 'on', chainId)
    const testLINK = _addresses.link[chainId]
    const relayerAddress = _addresses.relayer[chainId]


    console.log("operator", operator.address)
    const linkContract = await new ERC20__factory(operator).attach(testLINK)
    console.log("token", linkContract.address)
    const fetchData = await fetch(
        `https://${chainId === 5 ? 'goerli' : 'mumbai'}.api.0x.org/swap/v1/quote?buyToken=${chainId === 5 ? 'ETH' : 'MATIC'}&sellToken=${testLINK}&sellAmount=100000000000000000&allowanceTarget=${operator.address}`
    ).then((response) => response.json())
    console.log('data', fetchData)

    let tx = await linkContract.approve(fetchData.to, MaxUint256)
    await tx.wait()
    tx = await operator.sendTransaction({ to: fetchData.to, data: fetchData.data })
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
