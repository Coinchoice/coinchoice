import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "ethers";
import { useEffect, useState } from "react";
import { useAccount, useSignMessage, useNetwork } from "wagmi";
import { useSign } from "../hooks/useSignMessage";
import { useToken } from "../hooks/useToken";
import { fetchSigner } from '@wagmi/core'

const spender = '0x7E64d52D285E47b088f7b1df2438C1782099101a'

export const YourComponent = () => {
  const test = useSignMessage({ message: '', })
  const account = useAccount()
  const [signer, setSigner] = useState<any>(null)
  useEffect(() => {

    if (account && !signer) {
      const fetchData = async () => {
        const _signer = await fetchSigner()
        setSigner(_signer)
      }

      // call the function
      fetchData()

    }
  }, [account, signer])

  const { chain } = useNetwork()
  const chainId = chain?.id ?? 1
  const token = useToken(signer as Wallet, chainId, 'USDC')
  const { handleSign } = useSign(account.address, chainId, token, signer, '10000', spender)
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
