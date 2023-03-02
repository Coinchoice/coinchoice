# Coinchoice Relayer Contract

The coinchoice relayer contract allows the execution of a swap transaction on behalf of a user - provided the user has signed the approval for spending the first amount.

The contract can be used to swap user's ERC20 tokens gasless for ETH - which is equivalent to using the specified ERC20 as gas token if this transaction is triggered before another contract call.

Deploy the relayer:
`
npx hardhat run deploy/Relayer.ts --network mumbai
`

Swap with permit:
`
npx hardhat run scripts/relaySwapWithPermit.ts --network mumbai
`

The swap is done without approval and the owner does not call a contract, instead, the relayer is executed by a wallet with execution permission.

Test the baseline signature:
`
npx hardhat test test/relayer.spec.ts
`
