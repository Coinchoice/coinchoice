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

![CoinChoice Architecture](https://github.com/coinchoice/coinchoice/blob/master/docs/ethdenver-architecture.jpeg)

