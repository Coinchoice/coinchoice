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
import { TransactionDto, TransactionTestDto } from './dto/transaction.dto';

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
	testMetaTransaction(@Body() transactionTestDto: TransactionTestDto) {
		return this.appService.test_executeMetaTransaction(
			transactionTestDto.swapSpender,
			transactionTestDto.to,
			transactionTestDto.swapCall,
		);
	}

	@Post('transactions/relayswap')
	executeMetaTransaction(@Body() transactionDto: TransactionDto) {
		return this.appService.executeMetaTransaction(
			transactionDto.user,
			transactionDto.token,
			transactionDto.swapAmount,
			transactionDto.permit,
			transactionDto.swapSpender,
			transactionDto.to,
			transactionDto.swapCall,
		);
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
