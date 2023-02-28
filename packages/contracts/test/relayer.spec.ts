import hre from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers, network } from 'hardhat'
import { ERC20MockWithPermit, ERC20MockWithPermit__factory, Relayer, Relayer__factory, TestCallee__factory } from '../types';

import { AbiCoder, parseEther } from 'ethers/lib/utils';
import { MaxUint256, PermitSingle } from '@uniswap/permit2-sdk';
import { TypedDataDomain } from 'ethers';
import { produceSig } from './permitUtils';
import { expect } from 'chai';

interface Permit extends PermitSingle {
    sigDeadline: number
}


interface PermitSignature extends Permit {
    signature: string
}

const TOKEN_PERMISSIONS = [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
]

const PERMIT_TRANSFER_FROM_TYPES = {
    PermitTransferFrom: [
        { name: 'permitted', type: 'TokenPermissions' },
        { name: 'spender', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
    ],
    TokenPermissions: TOKEN_PERMISSIONS,
}


const PERMIT2_DOMAIN_NAME = 'Permit2'

export function permit2Domain(permit2Address: string, chainId: number): TypedDataDomain {
    return {
        name: PERMIT2_DOMAIN_NAME,
        chainId,
        verifyingContract: permit2Address,
    }
}


const PERMIT_EXPIRATION = 1000
const PERMIT_SIG_EXPIRATION = 1000

// we prepare a setup for compound in hardhat
// this series of tests checks that the features used for the margin swap implementation
// are correctly set up and working
describe('relayer', async () => {
    let deployer: SignerWithAddress
    let user: SignerWithAddress
    let token: ERC20MockWithPermit
    let relayer: Relayer
    const chainId = hre.network.config.chainId ?? 0
    beforeEach('Deploy Account, Trader, Uniswap and Compound', async () => {
        [deployer, user] = await ethers.getSigners();
        token = await new ERC20MockWithPermit__factory(deployer).deploy("Mock", "M")
        relayer = await new Relayer__factory(deployer).deploy()

        // mint 
        await token.mint(user.address, parseEther('1000'))
        await network.provider.send("hardhat_setBalance", [
            user.address,
            '0x0'
        ]);
        const bal = await ethers.provider.getBalance(user.address)
        console.log("ETH balance of user", bal.toString())
        console.log("ChainId", chainId)
    })

    it('produces sig', async () => {
        const sig = await produceSig(user, relayer.address, 0, token, '10')
        console.log("sig", sig)
    })

    it('allows meta transfer', async () => {
        const sig = await produceSig(user, relayer.address, 0, token, '10')
        const balUserBefore = await token.balanceOf(user.address)
        await relayer.connect(deployer).depositERC20(
            user.address,
            token.address,
            10,
            {
                owner: user.address,
                spender: relayer.address,
                value: 10,
                deadline: MaxUint256,
                v: sig.split.v,
                r: sig.split.r,
                s: sig.split.s
            }
        )
        const balUserAfter = await token.balanceOf(user.address)
        const bal = await token.balanceOf(relayer.address)
        expect(bal.toString()).to.equal('10')
        expect(balUserBefore.sub(balUserAfter).toString()).to.equal('10')
    })


    it('allows unsafe call', async () => {
        const testCallee = await new TestCallee__factory(deployer).deploy()

        let call = testCallee.interface.encodeFunctionData('testCall1', [true])

        await relayer.connect(deployer).unsafeGeneralCall(testCallee.address, call)


        call = testCallee.interface.encodeFunctionData('testCall2', [true])

        await relayer.connect(deployer).unsafeGeneralCall(testCallee.address, call)
    })

})
