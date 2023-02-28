import { ethers } from "hardhat";

async function main() {
    const data = await fetch(
        'https://goerli.api.0x.org/swap/v1/quote?buyToken=ETH&sellToken=0x326C977E6efc84E512bB9C30f76E30c160eD06FB&sellAmount=100000000000000000'
    ).then((response) => response.json())

    console.log("0x fetch data", data)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
