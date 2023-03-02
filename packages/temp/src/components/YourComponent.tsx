import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "ethers";
import { useEffect, useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import { useSign } from "../hooks/useSignMessage";
import { useToken } from "../hooks/useToken";
import { fetchSigner } from '@wagmi/core'

const spender = '0x7E64d52D285E47b088f7b1df2438C1782099101a'

export const YourComponent = () => {
  const account = useAccount()
  const [signer, setSigner] = useState<any>(null)
  const [userChainId, setUserChainId] = useState(5)

  const { chain } = useNetwork()
  console.log("chainId from wagmi", chain?.id)
  const chainId = chain?.id ?? 1

  useEffect(() => {

    if (account) {
      const fetchData = async () => {
        const _signer = await fetchSigner()
        const _chainId = await account.connector?.getChainId()
        setSigner(_signer)
        setUserChainId(_chainId ?? 5)
      }

      // call the function
      fetchData()

    }
  }, [account, signer, chainId, userChainId])

  const token = useToken(signer as Wallet, userChainId, 'USDC')
  const { handleSign } = useSign(account.address, userChainId, token, signer, '10000', spender)
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <ConnectButton />
      <button onClick={handleSign} > Sign Message</button>
    </div>
  );
};
