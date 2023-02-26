import { MaxUint256 } from "@uniswap/permit2-sdk"
import { splitSignature } from "ethers/lib/utils"
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ERC20 } from "../types"
import { JsonRpcProvider } from "@ethersproject/providers";

const EIP712_DOMAIN_TYPE = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
]

const EIP712_DOMAIN_TYPE_NO_VERSION = [
    { name: 'name', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
]

const EIP2612_TYPE = [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
]

const PERMIT_ALLOWED_TYPE = [
    { name: 'holder', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'expiry', type: 'uint256' },
    { name: 'allowed', type: 'bool' },
]

const permitVersion = '1'

export const produceSig = async (
    provider: SignerWithAddress,
    spender: string,
    nonceNumber: number,
    token: ERC20,
    amount: string
) => {
    const account = provider.address
    const message = {
        owner: account,
        spender,
        value: amount,
        nonce: nonceNumber,
        deadline: MaxUint256,
    }
    const chainId = await provider.getChainId()
    const name = await token.name()
    const domain = {
        name,
        verifyingContract: token.address,
        chainId,
        version: permitVersion
    }


    const rawData = {
        types: {
            EIP712Domain: EIP712_DOMAIN_TYPE,
            Permit: EIP2612_TYPE,
        },
        domain,
        primaryType: 'Permit',
        message,
    }
    const data = JSON.stringify(rawData)
    console.log("DATA", data)
    10
    const signature = await provider._signTypedData(domain, { Permit: rawData.types.Permit }, rawData.message)

    const split = splitSignature(signature)
    return { signature, split }
    // ethersProvider
    //     .send('eth_signTypedData_v4', [account, data])
    //     .then(splitSignature)
    // .then((signature) => {
    //     setSignatureData({
    //         v: signature.v,
    //         r: signature.r,
    //         s: signature.s,
    //         deadline: signatureDeadline,
    //         amount: value,
    //         nonce: nonceNumber,
    //         chainId,
    //         owner: account,
    //         spender,
    //         tokenAddress,
    //         permitType: permitInfo.type,
    //     })
    // })
}