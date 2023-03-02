import { PermitDto } from './permit.dto';

export class TransactionDto {
	user: string;
	token: string;
	amount: string;
	permit: PermitDto;
	spender: string;
	to: string;
	data: string;
}
