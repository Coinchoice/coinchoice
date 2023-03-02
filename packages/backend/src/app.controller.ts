import {
	Body,
	Controller,
	Get,
	NotFoundException,
	Post,
	Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { WalletService } from './wallet/wallet.service';
import { Observable } from 'rxjs';
import { SimulationDto } from './dto/simulation.dto';
import { ApproveDto } from './dto/approve.dto';
import { TransactionDto } from './dto/transaction.dto';

@Controller()
export class AppController {
	constructor(
		private readonly appService: AppService,
		private readonly walletService: WalletService,
	) {}

	@Get('hello')
	getHello(): string {
		return this.appService.getHello();
	}

	@Get('products')
	getDummyProducts(): Observable<Array<object>> {
		return this.appService.getDummyProducts();
	}

	@Post('transactions/test')
	testMetaTransaction() {
		return this.appService.test_executeMetaTransaction();
	}

	@Post('transactions/relayed')
	async executeMetaTransaction(@Body() transactionDto: TransactionDto) {
		const wallet = await this.walletService.findOne(transactionDto.user);
		if (wallet)
			return this.appService.executeMetaTransaction(
				transactionDto.user,
				wallet.token,
				transactionDto.amount,
				transactionDto.permit,
				transactionDto.spender,
				transactionDto.to,
				transactionDto.data,
			);
		else throw new NotFoundException('Wallet not found');
	}

	@Post('transactions/approve')
	executeApprove(@Body() approveDto: ApproveDto) {
		return this.appService.executeApprove(
			approveDto.token,
			approveDto.spender,
			approveDto.amount,
		);
	}

	@Post('simulation')
	async simulation(@Body() simulationDto: SimulationDto) {
		const wallet = await this.walletService.findOne(simulationDto.from);
		if (wallet)
			return this.appService.simulation(
				simulationDto.from,
				simulationDto.to,
				simulationDto.input,
				simulationDto.value,
				wallet.token,
			);
		else throw new NotFoundException('Wallet not found');
	}

	@Post('simulation/gasfee')
	getTenderlySimulationGasFee(@Body() simulationDto: SimulationDto) {
		return this.appService.getTenderlySimulationGasFee(
			simulationDto.from,
			simulationDto.to,
			simulationDto.input,
			simulationDto.value,
		);
	}

	@Post('simulation/gas')
	getTenderlySimulation(@Body() simulationDto: SimulationDto) {
		return this.appService.getTenderlySimulation(
			simulationDto.from,
			simulationDto.to,
			simulationDto.input,
			simulationDto.value,
		);
	}

	@Get('gasprice')
	getGasPrices() {
		return this.appService.getGasPrice();
	}

	@Get('tokenprice')
	getTokenSwapQuote(@Query('token') token, @Query('amount') amount) {
		return this.appService.getTokenSwapQuote(token, amount);
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
