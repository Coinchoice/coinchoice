import { PermitDto } from './permit.dto';

export class TransactionDto {
	user: string;
	token: string;
	swapAmount: string;
	permit: PermitDto;
	swapSpender: string;
	to: string;
	swapCall: string;
}

export class TransactionTestDto {
	swapSpender: string;
	to: string;
	swapCall: string;
}
