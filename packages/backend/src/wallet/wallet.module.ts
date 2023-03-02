import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Wallet, WalletSchema } from 'schemas/wallet.schema';

@Module({
	providers: [WalletService],
	controllers: [WalletController],
	imports: [
		MongooseModule.forFeature([{ name: Wallet.name, schema: WalletSchema }]),
	],
})
export class WalletModule {}
