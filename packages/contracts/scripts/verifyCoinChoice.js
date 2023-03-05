module.exports = [
  '0xd51bF91faF29E8e9E63659EF1f7f79f16b9f8071',
  '0xB424540a1b15F16a2ccEC7e6a6B94267043ffaCa',
  '0x'
  ];

  // operator 0xBe7cdd945079210dA9C871417966a0E0bDC08719
  // multisig 0xB424540a1b15F16a2ccEC7e6a6B94267043ffaCa
  // relayerLogic 0xd51bF91faF29E8e9E63659EF1f7f79f16b9f8071
  // relayerProxy 0x701539b8e013E0995aA6eD73e4Cef32ceAF9796d
  

  // npx hardhat verify --network goerli 0xd51bF91faF29E8e9E63659EF1f7f79f16b9f8071 --contract src/CoinChoiceRelayer.sol:CoinChoiceRelayer 
  // npx hardhat verify --network goerli 0x701539b8e013E0995aA6eD73e4Cef32ceAF9796d --contract src/openzeppelin/upgradeable/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy  --constructor-args scripts/verifyCoinChoice.js
