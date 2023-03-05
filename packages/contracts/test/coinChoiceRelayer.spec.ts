import hre from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers, network } from 'hardhat'
import { CoinChoiceRelayer, CoinChoiceRelayer__factory, ERC20MockWithPermit, ERC20MockWithPermit__factory, MultiSigWallet, MultiSigWallet__factory, TestCallee__factory, TransparentUpgradeableProxy, TransparentUpgradeableProxy__factory, WETH9, WETH9__factory } from '../types';

import { AbiCoder, formatBytes32String, keccak256, parseEther } from 'ethers/lib/utils';
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
    let weth: WETH9
    let ccRelayerLogic: CoinChoiceRelayer
    let ccRelayer: CoinChoiceRelayer
    let multisig: MultiSigWallet
    let proxy: TransparentUpgradeableProxy
    const chainId = hre.network.config.chainId ?? 0
    beforeEach('Deploy Account, Trader, Uniswap and Compound', async () => {
        [deployer, user] = await ethers.getSigners();
        weth = await new WETH9__factory(deployer).deploy()
        multisig = await new MultiSigWallet__factory(deployer).deploy([deployer.address], [1])

        ccRelayerLogic = await new CoinChoiceRelayer__factory(deployer).deploy()
        const ccRelayerLogicPrev = await new CoinChoiceRelayer__factory(deployer).deploy()
        proxy = await new TransparentUpgradeableProxy__factory(deployer).deploy(ccRelayerLogicPrev.address, multisig.address, '0x')
        // function upgradeTo(address newImplementation) external ifAdmin {
        //     _upgradeToAndCall(newImplementation, bytes(""), false);
        // }
        const tx = proxy.interface.encodeFunctionData('upgradeTo', [ccRelayerLogic.address])
        console.log("submit to multiSig")
        await multisig.submitTransaction(proxy.address, 0, tx)
        console.log("confirm multiSig")
        await multisig.confirmTransaction(0)
        console.log("execute multiSig")
        await multisig.executeTransaction(0)

        ccRelayer = await new CoinChoiceRelayer__factory(deployer).attach(proxy.address)
        console.log("initialize")
        await ccRelayer.initialize(weth.address)
        let role = formatBytes32String("ADMIN")
        console.log(formatBytes32String("ADMIN"), role)
        await ccRelayer.grantRole(role, deployer.address)
        role = formatBytes32String("EXECUTIONER")
        await ccRelayer.grantRole(role, deployer.address)

        token = await new ERC20MockWithPermit__factory(deployer).deploy("Mock", "M")

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
        const sig = await produceSig(user, ccRelayer.address, 0, token, '10')
        console.log("sig", sig)
    })

    it('allows meta transfer', async () => {
        const sig = await produceSig(user, ccRelayer.address, 0, token, '10')
        const balUserBefore = await token.balanceOf(user.address)
        await ccRelayer.connect(deployer).depositERC20(
            user.address,
            token.address,
            10,
            {
                owner: user.address,
                spender: ccRelayer.address,
                value: 10,
                deadline: MaxUint256,
                v: sig.split.v,
                r: sig.split.r,
                s: sig.split.s
            }
        )
        const balUserAfter = await token.balanceOf(user.address)
        const bal = await token.balanceOf(ccRelayer.address)
        expect(bal.toString()).to.equal('10')
        expect(balUserBefore.sub(balUserAfter).toString()).to.equal('10')
    })


    it('allows unsafe call', async () => {
        const testCallee = await new TestCallee__factory(deployer).deploy()

        let call = testCallee.interface.encodeFunctionData('testCall1', [true])

        await ccRelayer.connect(deployer).unsafeGeneralCall(testCallee.address, call)


        call = testCallee.interface.encodeFunctionData('testCall2', [true])

        await ccRelayer.connect(deployer).unsafeGeneralCall(testCallee.address, call)
    })

})
