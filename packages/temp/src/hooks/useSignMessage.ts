import { ethers, Wallet } from "ethers";
import { Sign } from "../components/utils/permitUtils";
import { ERC20MockWithPermit } from "../types/ERC20MockWithPermit";


export function useSign(
    userAddress: string | undefined,
    chainId: number,
    token: ERC20MockWithPermit | null,
    user: Wallet,
    amount: string,
    spender: string,

) {
    if (!token || !user || !userAddress) return { handleSign: () => null }
    console.log("Sign params", chainId, token, user, amount, spender, ethers.constants.MaxUint256.toString())
    return { handleSign: async () => await Sign(chainId, userAddress, token, user, amount, spender, ethers.constants.MaxUint256.toString()) }
}