import { Logger, Injectable, ForbiddenException } from '@nestjs/common';
import { firstValueFrom, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { InjectEthersProvider } from 'nestjs-ethers';
import { BaseProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectEthersProvider()
    private readonly ethersProvider: BaseProvider,
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

  async getEthBalance(): Promise<BigNumber> {
    //return this.ethersProvider.getNetwork();
    return this.ethersProvider.getBalance(
      '0x152A80F617006a4d8513e8a47D85afb317eEC479',
    );
  }

  // Endpoint for saving the preferred gas currency

  // Endpoint to check if wallet has enough balance in the preferred gas currency

  // https://docs.0x.org/0x-swap-api/api-references/get-swap-v1-price
  async getTokenSwapInfo(token: string, amount: string) {
    this.logger.log(`0x Swap Price for token ${token} and amount ${amount}`);
    return this.httpService
      .get(
        `https://api.0x.org/swap/v1/price?sellToken=ETH&buyToken=${token}&sellAmount=${amount}`,
      )
      .pipe(
        map((result) => {
          return result?.data;
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

          network_id: '1', // network to simulate on

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
