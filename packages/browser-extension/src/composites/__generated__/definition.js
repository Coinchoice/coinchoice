// This is an auto-generated file, do not edit manually
export const definition = {
	models: {
		Wallets: {
			id: 'kjzl6hvfrbw6c8k9xauimr9d1jfdrtumd650cllu9i8q8lninv91wc04r532uws',
			accountRelation: { type: 'list' },
		},
		BasicProfile: {
			id: 'kjzl6hvfrbw6c57p6t99krxnhqbxb24suuvxfhq1hnqujfecq0fap356ai7sjk9',
			accountRelation: { type: 'single' },
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
			ownerId: { type: 'streamid', required: true },
			clientId: { type: 'string', required: false },
			owner: {
				type: 'view',
				viewType: 'relation',
				relation: {
					source: 'document',
					model:
						'kjzl6hvfrbw6c57p6t99krxnhqbxb24suuvxfhq1hnqujfecq0fap356ai7sjk9',
					property: 'ownerId',
				},
			},
		},
		BasicProfile: {
			name: { type: 'string', required: true },
			emoji: { type: 'string', required: false },
			gender: { type: 'string', required: false },
			username: { type: 'string', required: true },
			description: { type: 'string', required: false },
		},
	},
	enums: {},
	accountData: {
		walletsList: { type: 'connection', name: 'Wallets' },
		basicProfile: { type: 'node', name: 'BasicProfile' },
	},
};
