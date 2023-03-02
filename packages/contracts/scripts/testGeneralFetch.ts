import { ethers } from "hardhat";
import { addresses } from "./addresses";


const _addresses = addresses as any

async function main() {
    const accounts = await ethers.getSigners()
    const operator = accounts[0]
    const chainId = await operator.getChainId();

    console.log("operator", operator.address, "user", accounts[1].address)

    const testLINK = _addresses.link[chainId]
    const relayerAddress = _addresses.relayer[chainId]
    const buyToken = _addresses.weth[chainId]
    const fetchData = await fetch(
        `https://${chainId === 5 ? 'goerli' : 'mumbai'}.api.0x.org/swap/v1/quote?buyToken=${buyToken}&sellToken=${testLINK}&sellAmount=100000000000000000`
    ).then((response) => response.json())
    console.log('data', fetchData)

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
