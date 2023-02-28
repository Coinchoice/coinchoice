import { MaxUint256 } from "@uniswap/permit2-sdk"
import { keccak256, splitSignature } from "ethers/lib/utils"
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ERC20, ERC20MockWithPermit } from "../types"
import { JsonRpcProvider } from "@ethersproject/providers";
import { BigNumber, constants } from "ethers";
import { ethers } from "ethers";

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

const structure = (name: string, version: string, chainId: number, tokenAddress: string, nonce: string, value: string, owner: string, spender: string, deadline: string) => {
    return {
        "types": {
            // "EIP712Domain": [
            //     {
            //         "name": "name",
            //         "type": "string"
            //     },
            //     {
            //         "name": "version",
            //         "type": "string"
            //     },
            //     {
            //         "name": "chainId",
            //         "type": "uint256"
            //     },
            //     {
            //         "name": "verifyingContract",
            //         "type": "address"
            //     }
            // ],
            "Permit": [{
                "name": "owner",
                "type": "address"
            },
            {
                "name": "spender",
                "type": "address"
            },
            {
                "name": "value",
                "type": "uint256"
            },
            {
                "name": "nonce",
                "type": "uint256"
            },
            {
                "name": "deadline",
                "type": "uint256"
            }
            ]
        },
        "primaryType": "Permit",
        "domain": {
            "name": name,
            "version": version,
            "chainId": chainId,
            "verifyingContract": tokenAddress
        },
        "message": {
            "owner": owner,
            "spender": spender,
            "value": value,
            "nonce": nonce,
            "deadline": deadline
        }
    }
}

const permitVersion = '1'
const buildData = async (amount: string, owner: string, spender: string, chainId: any, token: ERC20MockWithPermit, deadline: string) => {
    const _name = await token.name()
    const version = '1' 
    const value = amount 
    const nonce = await token.nonces(owner);
    return structure(_name, version, chainId, token.address, nonce.toString(), value, owner, spender, deadline)

}

export const Sign = async (
    chainId: number,
    token: ERC20MockWithPermit,
    user: SignerWithAddress,
    amount: string,
    spender: string,
    deadline: string,
) => {
    const data = await buildData(amount, user.address, spender, chainId, token, deadline);
    const digest = await user._signTypedData(data.domain, data.types, data.message);
    const { v, r, s } = ethers.utils.splitSignature(digest);

    return { signature: digest, split: { v, r, s } }
}

export const produceSig = async (
    provider: SignerWithAddress,
    spender: string,
    nonceNumber: number | BigNumber | string,
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


    const signature = await provider._signTypedData(domain, { Permit: rawData.types.Permit }, rawData.message)

    const split = splitSignature(signature)
    const data = JSON.stringify(rawData)
    console.log("Data", data)
    console.log("Signature", signature)
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