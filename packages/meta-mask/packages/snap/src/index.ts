import { OnTransactionHandler } from '@metamask/snaps-types';
import { heading, panel, text } from '@metamask/snaps-ui';

const onTriggerAPI = async (address: string) => {
  await fetch(`https://api.coinchoice.link/metamask/${address}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error('Bad response from server');
      }
      return res.json();
    })
    .then((json) => console.log(json))
    .catch((err) => console.error(err));
};

// Handle outgoing transactions
export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  // trigger browser extension for swap
  const response = await onTriggerAPI(transaction.from as string);
  // this is shown if no transaction is triggered
  if (typeof transaction.data === 'string' && transaction.data !== '0x') {
    return {
      content: panel([
        heading('Need ETH for gas?'),
        text('Receive ETH gasless for any currency with Coinchoice!'),
      ]),
    };
  }

  const currentGasPrice = await ethereum.request<string>({
    method: 'eth_gasPrice',
  });

  const transactionGas = parseInt(transaction.gas as string, 16);
  const currentGasPriceInWei = parseInt(currentGasPrice ?? '', 16);
  const maxFeePerGasInWei = parseInt(transaction.maxFeePerGas as string, 16);
  const maxPriorityFeePerGasInWei = parseInt(
    transaction.maxPriorityFeePerGas as string,
    16,
  );

  const gasFees = Math.min(
    maxFeePerGasInWei * transactionGas,
    (currentGasPriceInWei + maxPriorityFeePerGasInWei) * transactionGas,
  );

  const transactionValueInWei = parseInt(transaction.value as string, 16);
  const gasFeesPercentage = (gasFees / (gasFees + transactionValueInWei)) * 100;

  return {
    content: panel([
      heading('Need ETH for gas?'),
      text(
        `As setup, you are paying **${gasFeesPercentage.toFixed(
          2,
        )}%** in gas fees for this transaction.`,
      ),
      text(`Also: **${response}**`),
    ]),
  };
};
