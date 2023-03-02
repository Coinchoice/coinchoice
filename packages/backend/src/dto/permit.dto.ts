import { BigNumberish } from '@ethersproject/bignumber';
import { BytesLike } from 'ethers';

export class PermitDto {
	owner: string;
	spender: string;
	value: BigNumberish;
	deadline: BigNumberish;
	v: BigNumberish;
	r: BytesLike;
	s: BytesLike;
}
