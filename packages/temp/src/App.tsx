import { FC } from 'react'
import Navbar from './components/navbar/Navbar'
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { YourComponent } from "./components/YourComponent";

const { chains, provider } = configureChains(
  [chain.mainnet, chain.polygon, chain.polygonMumbai, chain.goerli],
  [jsonRpcProvider({
    rpc(chain) {
      switch (chain.id) {
        case (137):
          return { http: 'https://rpc.ankr.com/polygon' }
        case (1):
          return { http: 'https://rpc.ankr.com/eth' }
        case (5):
          return { http: 'https://rpc.ankr.com/eth_goerli' }
        default: // mumbai
          return { http: 'https://rpc.ankr.com/polygon_mumbai' }
      }
    }
  }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
});

const App: FC = () => {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <div id="App">
          <Navbar />
          <YourComponent />
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default App
