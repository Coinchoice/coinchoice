import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Observable } from 'rxjs';
import { SimulationDto } from './dto/simulation.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('products')
  getDummyProducts(): Observable<Array<object>> {
    return this.appService.getDummyProducts();
  }

  @Get('query')
  getQuery(@Query('version') version): string {
    return version;
  }

  @Get('gasprice')
  getGasPrices() {
    return this.appService.getGasPrice();
  }

  @Post('simulation/gas')
  getTenderlySimulation(@Body() simulationDto: SimulationDto) {
    return this.appService.getTenderlySimulation(
      simulationDto.from,
      simulationDto.to,
      simulationDto.input,
    );
  }

  @Post('simulation/gasfee')
  getTenderlySimulationGasFee(@Body() simulationDto: SimulationDto) {
    return this.appService.getTenderlySimulationGasFee(
      simulationDto.from,
      simulationDto.to,
      simulationDto.input,
    );
  }

  @Get('tokenprice')
  getTokenSwapInfo(@Query('token') token, @Query('amount') amount) {
    return this.appService.getTokenSwapInfo(token, amount);
  }

  @Get('ethbalance')
  getEthBalance(@Query('address') address) {
    return this.appService.getEthBalance(address);
  }

  @Get('tokenbalance')
  getTokenBalance(
    @Query('token') tokenAddress,
    @Query('address') walletAddress,
  ) {
    return this.appService.getTokenBalance(tokenAddress, walletAddress);
  }
}
