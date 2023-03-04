import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema()
export class Wallet {
	@Prop({ required: true })
	address: string;

	@Prop({ required: true })
	token: string;

	@Prop()
	amount: number;

	@Prop({ required: true })
	network: number;

	@Prop()
	clientId: string;

	@Prop({ required: true })
	createdAt: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
