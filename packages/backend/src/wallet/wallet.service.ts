import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wallet, WalletDocument } from 'schemas/wallet.schema';
import { WalletDto } from '../dto/wallet.dto';

@Injectable()
export class WalletService {
	constructor(
		@InjectModel(Wallet.name) private readonly model: Model<WalletDocument>,
	) {}

	async findAll(): Promise<Wallet[]> {
		return await this.model.find().exec();
	}

	async findOne(id: string): Promise<Wallet> {
		return await this.model.findById(id).exec();
	}

	async create(walletDto: WalletDto): Promise<Wallet> {
		return await new this.model({
			...walletDto,
			createdAt: new Date(),
		}).save();
	}

	async update(id: string, walletDto: WalletDto): Promise<Wallet> {
		return await this.model.findByIdAndUpdate(id, walletDto).exec();
	}

	async delete(id: string): Promise<Wallet> {
		return await this.model.findByIdAndDelete(id).exec();
	}
}
