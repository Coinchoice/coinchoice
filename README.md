# CoinChoice

## What is it?

CoinChoice is a MetaMask & Browser Extension that gives you choice over which coins are used to pay gas.

### Solving friction

- Go cross-chain sooner
- Minimise steps to interact with Smart Contracts
- Need ETH? Top up your gas directly from MetaMask
- New crypto users no longer need to withdraw gas from a CEX
- Stake and withdraw all of your ETH. Pay gas in another token.

### How does it work?

1. Select a default coin for your gas fees
2. On each transaction, you will be prompted to cover gas in your chosen coin
3. Sign a message
4. A small amount of ETH is deposited into your wallet
5. Continue with your original transaction


### Tech Overview

1. All transactions are simulated using the Tenderly API
2. A gas estimate is compared to your chosen coin using the 0x Quote API
3. You are prompted to pay gas in your chosen coin
4. On approval, your meta-tx is used to swap from your chosen coin to ETH with the 0x Protocol
5. Finally, your original transaction will proceed as though you had ETH all along

**This all happens in a single seamless user experience.**

### Roadmap:

- Receive funds in any currency
- New wallet, no problem. Transfer coins as though you had the gas
- Always have the right coins to stake in an LP Pool

## Connect with us

Learn more: [https://go.usher.so/coinchoice](https://go.usher.so/coinchoice)

## Architecture

![CoinChoice Architecture](https://github.com/coinchoice/coinchoice/blob/main/docs/ethdenver-architecture.jpeg)

## Packages

- `backend`: A NestJS Web Server responsible for
  1. simulating transactions against the Tenderly API and 0x Quote API to yield gas estimates in chosen currency
  2. receive and syndicate messages between the client's Metamask Snap and Browser Extension
  3. receive meta-tx to forward to relayer contracts
- `browser-extension`: A Browser Extension powered by the Plasmo Framework
  1. intercepts RPC requests to MetaMask in order to inject swaps to ETH for gas financing
  2. offers a popup where Gas Coin can be selected
  3. offers a popup for Token management powered by [Cypher Onboarding SDK](https://developer.cypherwallet.io/)
  All data is submitted to `backend` service where Blockchain Interactions and Simulations are managed
- `ceramic`: An alternative approach to data management whereby ComposeDB is used in place of MongoDB for Wallets and Selected Coins
- `frpc`: A package to leverage the Fluence Network's fRPC Gateway
- `meta-mask`: A package that contains a React.js Site and assocated MetaMask Snap.
  1. The Snap is responsible for offering ETH Swaps directly within the MetaMask interface, by showing a message "Need ETH?"
  2. The Snap works by making a request to the `backend` so that a message is forwarded to the client's `browser-extension`, enabling an experience where the MetaMask Snap can initiate the Browser Extension
  3. The associated Site is used to enable MetaMask Snap Installation

## Caveats

The codebase is highly experimental as it was developed at the EthDenver Hackathon in a matter of days!

## Contribution

Simply fork this repo and make it your own, or create a pull request and we can build something awesome together!

## Found this repo interesting?

Star this project ⭐️⭐️⭐️, and feel free to follow the team behind it by visting: [https://go.usher.so/coinchoice](https://go.usher.so/coinchoice)
