import { ethers } from "hardhat";
import { addresses } from "./addresses";

async function main() {
    const data = await fetch(
        `https://mumbai.api.0x.org/swap/v1/quote?buyToken=MATIC&sellToken=${addresses.link[80001]}&sellAmount=100000000000000000`
    ).then((response) => response.json())

    console.log("0x fetch data", data)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
