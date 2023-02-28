import { MaxUint256 } from "@uniswap/permit2-sdk";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { produceSig, Sign } from "../test/permitUtils";
import { ERC20MockWithPermit__factory, Relayer__factory } from "../types";
import { addresses } from "./addresses";


const _addresses = addresses as any

const plusMargin = (num: any) => {
    return BigNumber.from(11).mul(String(num)).div(10).toString()
}

async function main() {

    const accounts = await ethers.getSigners()
    const operator = accounts[0]
    const user = accounts[1]
    const chainId = await operator.getChainId();
    const usdc = _addresses.aaveUSDC[chainId]
    const relayerAddress = _addresses.relayer[chainId]

    console.log("operator", operator.address, 'on', chainId, "with relayer", relayerAddress, "with user", user.address)



    const relayerContract = await new Relayer__factory(operator).attach(relayerAddress)

    // buy this amount of ether
    const buyAmount = '100000000000000'
    const buyToken = _addresses.weth[chainId]

    const fetchData = await fetch(
        `https://${chainId === 5 ? 'goerli' : 'mumbai'}.api.0x.org/swap/v1/quote?buyToken=${buyToken}&sellToken=${usdc}&buyAmount=${buyAmount}`
    ).then((response) => response.json())

    console.log('data', fetchData)

    const amount = plusMargin(fetchData.sellAmount)
    // get usdc
    const usdcContract = await new ERC20MockWithPermit__factory(operator).attach(usdc)

    // produce erc20Permit signature
    const sig = await Sign(chainId, usdcContract, user, amount, relayerContract.address, MaxUint256.toString())

    // estimate gas for transaction
    const gasEst = await relayerContract.estimateGas.relaySwapToETH(
        user.address,
        usdc,
        {
            owner: user.address,
            spender: relayerContract.address,
            value: amount,
            deadline: MaxUint256,
            v: sig.split.v,
            r: sig.split.r,
            s: sig.split.s
        },
        fetchData.allowanceTarget,
        fetchData.to,
        fetchData.data
    )

    console.log(gasEst.toString())
    const tx = await relayerContract.relaySwapToETH(
        user.address,
        usdc,
        {
            owner: user.address,
            spender: relayerContract.address,
            value: amount,
            deadline: MaxUint256,
            v: sig.split.v,
            r: sig.split.r,
            s: sig.split.s
        },
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
