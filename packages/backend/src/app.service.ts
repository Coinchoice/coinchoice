import { Logger, Injectable, ForbiddenException } from '@nestjs/common';
import { firstValueFrom, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import {
  EthersContract,
  InjectContractProvider,
  InjectEthersProvider,
} from 'nestjs-ethers';
import { Contract } from '@ethersproject/contracts';
import { BaseProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { parseEther, formatUnits } from '@ethersproject/units';
import * as ERC20ABI from './utils/erc20.json';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectEthersProvider()
    private readonly ethersProvider: BaseProvider,
    @InjectContractProvider()
    private readonly ethersContract: EthersContract,
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

  async getEthBalance(address: string): Promise<BigNumber> {
    //return this.ethersProvider.getNetwork();
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

  // TODO: Endpoint for saving the preferred gas currency for the user

  // TODO: Endpoint -> abrir um Websocket dentro deste endpoint -> devolver uma msg pro usuário

  // Check if the user has enough balance to pay the gas fee in the preferred currency
  async checkBalanceForToken(
    from: string,
    to: string,
    input: string,
    token: string,
  ) {
    // Original Transaction
    const txGasFeeEth = await this.getTenderlySimulationGasFee(from, to, input);
    const txGasFeeBig = parseEther(txGasFeeEth.toString());

    // Swap Transaction
    const [tokenPrice, swapGasFeeEth] = await firstValueFrom(
      await this.getTokenSwapInfo(token, formatUnits(txGasFeeBig)),
    );

    const feeEth = swapGasFeeEth + txGasFeeEth;
    const feeToken = feeEth * tokenPrice; // considering 18 decimals for now

    const balanceTokenBig = await this.getTokenBalance(token, from); // considering 18 decimals for now

    return parseInt(formatUnits(balanceTokenBig)) > feeToken;
  }

  // https://docs.0x.org/0x-swap-api/api-references/get-swap-v1-price
  // Netwok: Ethereum Mainnet
  async getTokenSwapInfo(token: string, amount: string) {
    this.logger.log(`0x Swap Price for token ${token} and amount ${amount}`);
    return this.httpService
      .get(
        `${process.env.OX_ENDPOINT}/swap/v1/price?sellToken=ETH&buyToken=${token}&sellAmount=${amount}`,
      )
      .pipe(
        map((result) => {
          return [
            result?.data.price, // $1650 / ETH
            (result?.data.gasPrice * result?.data.estimatedGas) / 1e18, // ETH
          ];
        }),
      )
      .pipe(
        catchError(() => {
          throw new ForbiddenException('API not available');
        }),
      );
  }

  async getTenderlySimulationGasFee(from: string, to: string, input: string) {
    const gasPrice = await firstValueFrom(await this.getGasPrice());
    const gasUsed = await firstValueFrom(
      await this.getTenderlySimulation(from, to, input),
    );
    const gasGwei = gasPrice * gasUsed; // Gwei = 1e-9 ETH
    return gasGwei / 1e9; // ETH
  }

  // https://ethereum.org/en/developers/docs/gas/#base-fee
  // https://docs.etherscan.io/api-endpoints/gas-tracker
  // Netwok: Ethereum Mainnet
  async getGasPrice() {
    this.logger.log(`Etherscan Gas Oracle`);
    return this.httpService
      .get(
        `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${process.env.ETHERSCAN_API_KEY}`,
      )
      .pipe(
        map((res) => res.data?.result),
        map((result) => {
          return result?.FastGasPrice;
        }),
      )
      .pipe(
        catchError(() => {
          throw new ForbiddenException('API not available');
        }),
      );
  }

  // https://docs.tenderly.co/simulations-and-forks/simulation-api/using-simulation-api
  // Netwok: NETWORK_ID
  async getTenderlySimulation(from: string, to: string, input: string) {
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
          value: 0,
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
          throw new ForbiddenException('API not available');
        }),
      );
  }
}
