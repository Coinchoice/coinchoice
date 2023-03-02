import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletDto } from '../dto/wallet.dto';

@Controller('wallet')
export class WalletController {
	constructor(private readonly service: WalletService) {}

	@Get()
	async index() {
		return await this.service.findAll();
	}

	@Get(':id')
	async find(@Param('id') id: string) {
		return await this.service.findOne(id);
	}

	@Post()
	async create(@Body() walletDto: WalletDto) {
		return await this.service.create(walletDto);
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() walletDto: WalletDto) {
		return await this.service.update(id, walletDto);
	}

	@Delete(':id')
	async delete(@Param('id') id: string) {
		return await this.service.delete(id);
	}
}
