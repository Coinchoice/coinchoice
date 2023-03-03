// This is an auto-generated file, do not edit manually
export const definition = {
	models: {
		Wallets: {
			id: 'kjzl6hvfrbw6c9ggfud46mmd8vs5qhpujzddvw81raf7qq69vgom67h6z1vdzxk',
			accountRelation: { type: 'list' },
		},
	},
	objects: {
		Wallets: {
			token: { type: 'string', required: true },
			amount: { type: 'string', required: false },
			edited: { type: 'datetime', required: false },
			address: { type: 'string', required: true },
			created: { type: 'datetime', required: true },
			network: { type: 'integer', required: true },
		},
	},
	enums: {},
	accountData: { walletsList: { type: 'connection', name: 'Wallets' } },
};