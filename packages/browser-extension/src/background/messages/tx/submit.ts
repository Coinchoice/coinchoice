import type { PlasmoMessaging } from '@plasmohq/messaging';
// import { Storage } from '@plasmohq/storage';
import { ethers } from 'ethers';
import type {
	GasPayload,
	Signature, // StoredWallet
} from '~types';
// import type { Simulation } from '~types';
// import type { TxRequest } from '~types/requests';
import { api, handleReqErr } from '~utils/api';

// import { storageKeyWallet } from '~utils/constants';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
	// const storage = new Storage();

	// const wallet = (await storage.get(storageKeyWallet)) as StoredWallet;

	const { sig, payload }: { sig: Signature; payload: GasPayload } = req.body;
	const [txParams] = payload.tx.params || [{}]; // Original transaction parameters

	const submitBody = {
		user: txParams.from.toLowerCase(),
		amount: Math.round(payload.sim.amount * 10).toString(), // This is amount of USDC being sold + a margin
		spender: payload.sim.spender,
		to: payload.sim.to,
		permit: {
			// value: '1000000000000000', // This is amount of USDC being permitted for transferFrom
			value: Math.round(payload.sim.amount * 10.5).toString(), // This is amount of USDC being permitted for transferFrom
			owner: txParams.from.toLowerCase(),
			spender: payload.sim.relayer,
			deadline: ethers.constants.MaxUint256.toString(),
			v: sig.split.v,
			r: sig.split.r,
			s: sig.split.s,
		},
		data: payload.sim.data,
	};

	/**
	 * Sample Body
	 * {
    "user": "0xe220825b597e4D5867218E0Efa9684Dd26957b00",
		"amount": "25450704",
		"spender": "0xf91bb752490473b8342a3e964e855b9f9a2a668e",
		"to": "0xf91bb752490473b8342a3e964e855b9f9a2a668e",
		"permit": {
				"value": "1000000000000000",
				"owner": "0xe220825b597e4D5867218E0Efa9684Dd26957b00",
				"spender": "0xC38f5162545995b75103Bb11796A7ae0f17602AA",
				"deadline": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
				"v": 28,
				"r": "0xc63f4a4ddd50354c17133fe178f93369e12144392642d27bcede19d1a83e20a2",
				"s": "0x6188bb5bd16c66df98109bd39cae35fc35c5e19078e0d7038c0760419eeb18a4"
			},
		"data": "0x415565b000000000000000000000000065afadd39029741b3b8f0756952c74678c9cec93000000000000000000000000b4fbf271143f4fbf7b91a5ded31805e42b2208d600000000000000000000000000000000000000000000000000000000016492b700000000000000000000000000000000000000000000000000005af3107a400000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000042000000000000000000000000000000000000000000000000000000000000007c00000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000003600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000065afadd39029741b3b8f0756952c74678c9cec9300000000000000000000000011fe4b6ae13d2a6055c8d9cf65c55bac32b5d84400000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000032000000000000000000000000000000000000000000000000000000000000002e000000000000000000000000000000000000000000000000000000000016492b7000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000012556e697377617056330000000000000000000000000000000000000000000000000000000000000000000000016492b70000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000e592427a0aece92de3edee1f18e0157c058615640000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004265afadd39029741b3b8f0756952c74678c9cec93000bb8b4fbf271143f4fbf7b91a5ded31805e42b2208d60001f411fe4b6ae13d2a6055c8d9cf65c55bac32b5d8440000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000003400000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011fe4b6ae13d2a6055c8d9cf65c55bac32b5d844000000000000000000000000b4fbf271143f4fbf7b91a5ded31805e42b2208d600000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000002c0ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000253757368695377617000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000005af3107a4000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000001b02da8cb0d097eb8d57a175b88c7d8b479975060000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000200000000000000000000000011fe4b6ae13d2a6055c8d9cf65c55bac32b5d844000000000000000000000000b4fbf271143f4fbf7b91a5ded31805e42b2208d60000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000300000000000000000000000065afadd39029741b3b8f0756952c74678c9cec9300000000000000000000000011fe4b6ae13d2a6055c8d9cf65c55bac32b5d844000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000000000000000000000000000000000000000000000869584cd00000000000000000000000010000000000000000000000000000000000000110000000000000000000000000000000000000000000000b63a3b324d6401301c"
		}
	 */

	console.log('TX:SUBMIT BGSW: Submit with params', submitBody);
	try {
		const resp = await api
			.post('transactions/relayed', {
				json: submitBody,
			})
			.text();

		console.log('TX:SUBMIT BGSW: Submit response', resp);

		return res.send({
			success: true,
			data: {
				id: resp,
			},
		});
	} catch (e) {
		console.log('TX:SUBMIT BGSW ERROR: Cannot submit meta-tx');
		await handleReqErr(e);
	}

	return res.send({
		success: false,
		data: {},
	});
};

export default handler;
