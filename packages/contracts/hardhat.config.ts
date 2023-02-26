// hardhat.config.ts

import 'dotenv/config';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-solhint';
// import '@tenderly/hardhat-tenderly';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-abi-exporter';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import 'hardhat-gas-reporter';
import 'hardhat-spdx-license-identifier';
import '@typechain/hardhat';
import 'hardhat-watcher';
import 'solidity-coverage';
import "hardhat-contract-sizer";
// import '@openzeppelin/hardhat-upgrades';
// import {accounts} from './utils/networks';

//import './tasks';
import * as dotenv from 'dotenv';

dotenv.config();

import { HardhatUserConfig } from 'hardhat/types';
import { removeConsoleLog } from 'hardhat-preprocessor';

const accounts = {
	mnemonic:
		'test test test test test test test test test test test junk',
	accountsBalance: "990000000000000000000",
};

const pk1: string = process.env.PK_1 || '';
const pk2: string = process.env.PK_2 || '';
const pk3: string = process.env.PK_3 || '';
const pk4: string = process.env.PK_3 || '';
const pk5: string = process.env.PK_5 || '';

// fetch wallet addresses from env
const address1: string = process.env.ADDRESS_1 || '';
const address2: string = process.env.ADDRESS_2 || '';
const address3: string = process.env.ADDRESS_3 || '';
const address4: string = process.env.ADDRESS_3 || '';
const address5: string = process.env.ADDRESS_5 || '';

const config: HardhatUserConfig = {
	abiExporter: {
		path: './abi',
		clear: false,
		flat: true,
		// only: [],
		// except: []
	},
	defaultNetwork: 'hardhat',
	etherscan: {
		apiKey: 
		{
			arbitrumOne: process.env.ARBISCAN_API_KEY || '',
			avalanche: process.env.SNOWTRACE_API_KEY || '',
			bsc: process.env.BSCSCAN_API_KEY || '',
			mainnet: process.env.ETHERSCAN_API_KEY || '',
			optimisticEthereum: process.env.OPTIMISM_API_KEY || '',
			polygon: process.env.POLYGONSCAN_API_KEY || '',
			polygonMumbai: process.env.POLYGONSCAN_API_KEY || '',
			sepolia: process.env.ETHERSCAN_API_KEY || '',
		},
	},
	gasReporter: {
		coinmarketcap: process.env.COINMARKETCAP_API_KEY,
		currency: 'USD',
		enabled: true,
		excludeContracts: ['contracts/mocks/', 'contracts/libraries/'],
	},
	mocha: {
		timeout: 50000,
	},
	namedAccounts: {
		operator: address1,
		deployer: {
			default: address2,
			localhost: address3,
			ropsten: address2,
			'bsc-testnet': address2,
			kovan: address2,
			mumbai: address2,
			fuji: address2,
			goerli: address2,
			matic: address5
		},
		localhost: {
			default: address3,
		},
		user: {
			default: address4,
		},
		dev: {
			default: address2,
			localhost: address3,
		},
	},
	networks: {
		mainnet: {
			url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
			accounts,
			gasPrice: 120 * 1000000000,
			chainId: 1,
		},
		localhost: {
			url: 'http://localhost:8545',
			accounts
		},
		hardhat: {
			forking: {
				enabled: false,
				url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
			},
		},
		ropsten: {
			url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
			accounts,
			chainId: 3,
			gasPrice: 5000000000,
			gasMultiplier: 2,
		},
		goerli: {
			url: 'https://rpc.ankr.com/eth_goerli', // 
			// url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
			accounts: [pk1],
			chainId: 5,
			// gasPrice: 5000000000,
			// gasMultiplier: 2,
		},
		moonbase: {
			url: 'https://rpc.testnet.moonbeam.network',
			accounts,
			chainId: 1287,
			gas: 5198000,
			gasMultiplier: 2,
		},
		matic: {
			url: 'https://rpc-mainnet.maticvigil.com',
			accounts: [pk5],
			chainId: 137,
		},
		mumbai: {
			url: 'https://rpc-mumbai.maticvigil.com/',
			accounts: [pk3, pk2],
			chainId: 80001,
			gasMultiplier: 2,
		},
		bsc: {
			url: 'https://bsc-dataseed.binance.org',
			accounts,
			chainId: 56,
		},
		'bsc-testnet': {
			url: 'https://data-seed-prebsc-2-s3.binance.org:8545',
			//accounts,
			chainId: 97,
			gasMultiplier: 1,
			accounts: [pk1, pk2],
			gas: 2100000,
			gasPrice: 10000000000,
			// blockGasLimit: 900000000,
		},
	},
	paths: {
		artifacts: 'artifacts',
		cache: 'cache',
		sources: 'src',
		tests: 'test',
	},
	preprocess: {
		eachLine: removeConsoleLog(
			(bre: any) =>
				bre.network.name !== 'hardhat' && bre.network.name !== 'localhost'
		),
	},
	solidity: {
		compilers: [
			{
				version: '0.8.18',
				settings: {
					optimizer: {
						enabled: true,
						runs: 1_000_000,
					},
					evmVersion: 'london',
				},
			},
			{
				version: '0.8.17',
				settings: {
					viaIR: true,
					optimizer: {
						enabled: true,
						runs: 1_000_000,
					},
					evmVersion: 'london',
				},
			},
			{
				version: '0.7.6',
				settings: {
					optimizer: {
						enabled: true,
						runs: 800,
					},
					metadata: {
						// do not include the metadata hash, since this is machine dependent
						// and we want all generated code to be deterministic
						// https://docs.soliditylang.org/en/v0.7.6/metadata.html
						bytecodeHash: 'none',
					},
				},
			},
			{
				version: '0.8.10',
			}
		],
	},
	spdxLicenseIdentifier: {
		overwrite: false,
		runOnCompile: true,
	},
	tenderly: {
		project: process.env.TENDERLY_PROJECT!,
		username: process.env.TENDERLY_USERNAME!,
	},
	typechain: {
		outDir: 'types',
		target: 'ethers-v5',
	},
	watcher: {
		compile: {
			tasks: ['compile'],
			files: ['./src'],
			verbose: true,
		},
	},
	contractSizer: {
		runOnCompile: false,
		disambiguatePaths: false,
	},
};

export default config;
