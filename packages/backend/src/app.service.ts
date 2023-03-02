import { Logger, Injectable, ForbiddenException } from '@nestjs/common';
import { firstValueFrom, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import {
	EthersContract,
	EthersSigner,
	InjectContractProvider,
	InjectEthersProvider,
	InjectSignerProvider,
} from 'nestjs-ethers';

import { Contract } from '@ethersproject/contracts';
import {
	BaseProvider,
	Web3Provider,
	JsonRpcSigner,
} from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { parseEther, formatUnits } from '@ethersproject/units';
import {
	FireblocksWeb3Provider,
	ApiBaseUrl,
} from '@fireblocks/fireblocks-web3-provider';
import { ethers, Wallet } from 'ethers';

import * as ERC20ABI from './utils/erc20.json';
import * as RELAYERABI from './utils/relayer.json';
import { Sign } from './utils/permitUtils';
import { getToken, TOKEN_DICT } from './utils/getToken';
import { Relayer } from './types/Relayer';
import { PermitDto } from './dto/permit.dto';

import fs = require('fs');
import path = require('path');

@Injectable()
export class AppService {
	private readonly logger = new Logger(AppService.name);

	constructor(
		@InjectEthersProvider()
		private readonly ethersProvider: BaseProvider,
		@InjectContractProvider()
		private readonly ethersContract: EthersContract,
		@InjectSignerProvider()
		private readonly ethersSigner: EthersSigner,
		private readonly httpService: HttpService,
	) {}

	getHello(): string {
		return 'Hello World!';
	}

	getDummyProducts(): Observable<Array<object>> {
		return this.httpService.get('https://dummyjson.com/products/1').pipe(
			map((axiosResponse: AxiosResponse) => {
				return axiosResponse.data;
			}),
		);
	}

	async executeMetaTransaction(
		user: string,
		token: string,
		swapAmount: string,
		permit: PermitDto,
		swapSpender: string,
		to: string,
		swapCall: string,
	): Promise<any> {
		const contract = new Contract(
			process.env.RELAYER_CONTRACT_ADDRESS,
			RELAYERABI.abi,
			this.getSigner(),
		) as Relayer;

		const tx = await contract.relaySwapToETH(
			user,
			token,
			swapAmount,
			permit,
			swapSpender,
			to,
			swapCall,
		);
		console.log('tx:', tx);
		return tx;
	}

	async test_executeMetaTransaction(
		swapSpender: string,
		to: string,
		swapCall: string,
	): Promise<any> {
		const sign_wallet: Wallet = this.ethersSigner.createWallet(
			process.env.WALLET_PRIVATE_KEY,
		);

		const signer = this.getSigner();
		const relayer = new Contract(
			process.env.RELAYER_CONTRACT_ADDRESS,
			RELAYERABI.abi,
			signer,
		) as Relayer;
		this.logger.log(`test 2`);
		const signAmount = '1000000000000000'; // in usdc
		const chainId = 5;

		// buy this amount of ether
		const buyAmount = '100000000000000';
		const buyToken = TOKEN_DICT.WETH[chainId];

		const token = getToken(signer, chainId, 'USDC');

		const fetchData = await fetch(
			`https://${
				chainId === 5 ? 'goerli' : 'mumbai'
			}.api.0x.org/swap/v1/quote?buyToken=${buyToken}&sellToken=${
				token.address
			}&buyAmount=${buyAmount}`,
		).then((response) => response.json());

		const plusMargin = (num: any) => {
			return BigNumber.from(11).mul(String(num)).div(10).toString();
		};

		const amount = plusMargin(fetchData.sellAmount);

		const signedParams = await Sign(
			5,
			token,
			sign_wallet,
			sign_wallet.address,
			signAmount,
			relayer.address,
			ethers.constants.MaxUint256.toString(),
		);

		const tx = await relayer.relaySwapToETH(
			sign_wallet.address,
			token.address,
			amount,
			{
				value: signAmount,
				owner: sign_wallet.address,
				spender: relayer.address,
				deadline: ethers.constants.MaxUint256.toString(),
				v: signedParams.split.v,
				r: signedParams.split.r,
				s: signedParams.split.s,
			},
			fetchData.allowanceTarget,
			fetchData.to,
			fetchData.data,
		);
		console.log('tx:', tx);
		await tx.wait();
		return tx;
	}

	// https://github.com/blockcoders/nestjs-ethers
	async executeApprove(
		token: string,
		spender: string,
		amount: string,
	): Promise<any> {
		const contract = new Contract(token, ERC20ABI.abi, this.getSigner());

		const tx = await contract.approve(spender, amount);
		console.log('tx:', tx);
		//await tx.wait();
		return tx;
	}

	getSigner(): JsonRpcSigner {
		const privateKey = fs.readFileSync(
			path.resolve('fireblocks_secret.key'),
			'utf8',
		);
		const fbksProvider = new FireblocksWeb3Provider({
			apiKey: process.env.FIREBLOCKS_API_KEY,
			apiBaseUrl: ApiBaseUrl.Sandbox,
			privateKey: privateKey,
			rpcUrl: process.env.ALCHEMY_URL,
			vaultAccountIds: ['2'],
		});
		const provider = new Web3Provider(fbksProvider);
		return provider.getSigner(process.env.FIREBLOCKS_WALLET_ADDRESS);
	}

	// Check if the user has enough balance to pay the gas fee in the preferred currency
	async simulation(
		from: string,
		to: string,
		input: string,
		value: string,
		token: string,
	) {
		// Original Transaction
		const txGasFeeEth = await this.getTenderlySimulationGasFee(
			from,
			to,
			input,
			value,
		);
		this.logger.log(`txGasFeeEth: ${txGasFeeEth}`);
		const txGasFeeBig = parseEther(txGasFeeEth.toString());

		// Swap Transaction
		const [tokenPrice, swapGasFeeEth] = await firstValueFrom(
			await this.getTokenSwapInfo(token, txGasFeeBig.toString()),
		);
		this.logger.log(`swapGasFeeEth: ${swapGasFeeEth}`);
		this.logger.log(`tokenPrice: ${tokenPrice}`);

		const feeEth = swapGasFeeEth + txGasFeeEth;
		const feeToken = feeEth / tokenPrice;
		this.logger.log(`feeToken: ${feeToken}`);

		const balanceTokenBig = await this.getTokenBalance(token, from);
		this.logger.log(`balanceToken: ${formatUnits(balanceTokenBig)}`);

		// return parseInt(formatUnits(balanceTokenBig)) > feeToken; // considering 18 decimals for now

		return {
			feeEth: feeEth,
			feeToken: feeToken,
			price: +tokenPrice,
			token: token,
			balance: balanceTokenBig,
		};
	}

	async getEthBalance(address: string): Promise<BigNumber> {
		return this.ethersProvider.getBalance(address);
	}

	async getTokenBalance(
		tokenAddress: string,
		walletAddress: string,
	): Promise<BigNumber> {
		const contract: Contract = this.ethersContract.create(
			tokenAddress,
			ERC20ABI.abi,
		);
		return await contract.balanceOf(walletAddress);
	}

	// https://docs.0x.org/0x-swap-api/api-references/get-swap-v1-price
	// Netwok: Configurable via .env file (OX_ENDPOINT)
	async getTokenSwapInfo(token: string, amount: string) {
		this.logger.log(`0x Swap Price for token ${token} and amount ${amount}`);
		return this.httpService
			.get(
				`${process.env.OX_ENDPOINT}/swap/v1/price?buyToken=ETH&sellToken=${token}&sellAmount=${amount}`,
			)
			.pipe(
				map((result) => {
					return [
						result?.data.price, // X ETH/TOKEN
						+(
							(result?.data.gasPrice * result?.data.estimatedGas) /
							1e18
						).toFixed(18), // ETH
					];
				}),
			)
			.pipe(
				catchError(() => {
					this.logger.log(`0x API Error`);
					throw new ForbiddenException('API not available');
				}),
			);
	}

	async getTenderlySimulationGasFee(
		from: string,
		to: string,
		input: string,
		value: string,
	) {
		const gasPrice = await firstValueFrom(await this.getGasPrice());
		const gasUsed = await firstValueFrom(
			await this.getTenderlySimulation(from, to, input, value),
		);
		const gasGwei = gasPrice * gasUsed; // Gwei = 1e-9 ETH
		return +(gasGwei / 1e9).toFixed(18); // ETH
	}

	// https://ethereum.org/en/developers/docs/gas/#base-fee
	// https://docs.etherscan.io/api-endpoints/gas-tracker
	// Netwok: Configurable via .env file (ETHERSCAN_API_ENDPOINT)
	async getGasPrice() {
		this.logger.log(`Etherscan Gas Oracle`);
		return this.httpService
			.get(
				`${process.env.ETHERSCAN_API_ENDPOINT}/api?module=proxy&action=eth_gasPrice&apikey=${process.env.ETHERSCAN_API_KEY}`,
			)
			.pipe(
				map((res) => res.data?.result),
				map((result) => {
					return +(parseInt(result) / 1e9).toFixed(18); // Gwei
				}),
			)
			.pipe(
				catchError(() => {
					this.logger.log(`Etherscan Gas Oracle Error`);
					throw new ForbiddenException('API not available');
				}),
			);
	}

	// https://docs.tenderly.co/simulations-and-forks/simulation-api/using-simulation-api
	// Netwok: Configurable via .env file (NETWORK_ID)
	async getTenderlySimulation(
		from: string,
		to: string,
		input: string,
		value: string,
	) {
		this.logger.log(`Tenderly Simulation`);
		return this.httpService
			.post(
				`https://api.tenderly.co/api/v1/account/${process.env.TENDERLY_USER}/project/${process.env.TENDERLY_PROJECT}/simulate`,
				// the transaction
				{
					/* Simulation Configuration */
					save: false, // if true simulation is saved and shows up in the dashboard
					save_if_fails: false, // if true, reverting simulations show up in the dashboard
					simulation_type: 'full', // full or quick (full is default)

					network_id: process.env.NETWORK_ID, // network to simulate on

					/* Standard EVM Transaction object */
					from: from,
					to: to,
					input: input,
					gas: 8000000,
					gas_price: 0,
					value: value,
				},
				{
					headers: {
						'X-Access-Key': process.env.TENDERLY_ACCESS_KEY as string,
					},
				},
			)
			.pipe(
				map((res) => res.data?.transaction),
				map((transaction) => {
					return transaction?.gas_used;
				}),
			)
			.pipe(
				catchError(() => {
					this.logger.log(`Tenderly Simulation Error`);
					throw new ForbiddenException('API not available');
				}),
			);
	}
}
