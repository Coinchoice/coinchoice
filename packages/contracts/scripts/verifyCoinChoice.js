module.exports = [
  '0xd51bF91faF29E8e9E63659EF1f7f79f16b9f8071',
  '0xB424540a1b15F16a2ccEC7e6a6B94267043ffaCa',
  '0x'
  ];

  // operator 0xBe7cdd945079210dA9C871417966a0E0bDC08719
  // multisig 0xABb5218B12a37e95422e273c63A9d72D5A99ccDa
  // relayerLogic 0x937b351969D229158c4CE41C7b1266A077016545
  // relayerProxy 0x2B8DFD530D51235F384C0E746B5Fa9999Ffc239B
  
  
  

  // npx hardhat verify --network goerli 0x937b351969D229158c4CE41C7b1266A077016545 --contract src/CoinChoiceRelayer.sol:CoinChoiceRelayer 
  // npx hardhat verify --network goerli 0x2B8DFD530D51235F384C0E746B5Fa9999Ffc239B --contract src/openzeppelin/upgradeable/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy  --constructor-args scripts/verifyCoinChoice.js
