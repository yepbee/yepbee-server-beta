export type RetripJs = {
  version: '0.1.0';
  name: 'retrip_js';
  instructions: [
    {
      name: 'initialize';
      accounts: [
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'mint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'programTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'nftMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'programNftTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'whiteList';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'totalSupply';
          isMut: true;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'faucet';
      accounts: [
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'whiteList';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'mint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'programTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'payerTokenAccount';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'createUser';
      accounts: [
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'whiteList';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'mint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'nftMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'programTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'programNftTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userPubkey';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userNftTokenAccount';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'transferSystemToken';
      accounts: [
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'whiteList';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'mint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'programTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'fromPubkey';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'fromTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'toTokenAccount';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'transferSystemNftToken';
      accounts: [
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'whiteList';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'nftMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'programNftTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'fromPubkey';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'fromNftTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'toNftTokenAccount';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'mintNftAsWhitelist';
      accounts: [
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'whiteList';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'totalSupply';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'toPubkey';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'nftMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'programNftTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'toNftTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenMetadataProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'metadata';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'masterEdition';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'mintArgs';
          type: {
            defined: 'MintArgs';
          };
        },
      ];
    },
    {
      name: 'suggestAsWhitelist';
      accounts: [
        {
          name: 'whiteList';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'suggestion';
          type: {
            defined: 'Suggestion';
          };
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'addresses';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'whiteList';
            type: 'publicKey';
          },
        ];
      };
    },
    {
      name: 'totalSupply';
      docs: ['* Map<type_name, count>'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'name';
            type: {
              vec: {
                array: ['u8', 64];
              };
            };
          },
          {
            name: 'count';
            type: {
              vec: 'u64';
            };
          },
        ];
      };
    },
    {
      name: 'whiteList';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'president';
            type: {
              option: {
                defined: 'President';
              };
            };
          },
          {
            name: 'listers';
            type: {
              vec: {
                defined: 'Lister';
              };
            };
          },
        ];
      };
    },
  ];
  types: [
    {
      name: 'MintArgs';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'creatorKey';
            type: 'publicKey';
          },
          {
            name: 'metadataUri';
            type: 'string';
          },
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'symbol';
            type: 'string';
          },
          {
            name: 'typeName';
            type: 'string';
          },
          {
            name: 'royalty';
            type: 'u16';
          },
        ];
      };
    },
    {
      name: 'Lister';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'pubkey';
            type: 'publicKey';
          },
          {
            name: 'suggestion';
            type: {
              defined: 'Suggestion';
            };
          },
        ];
      };
    },
    {
      name: 'President';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'pubkey';
            type: 'publicKey';
          },
          {
            name: 'expirationDate';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'TransactionAccount';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'pubkey';
            type: 'publicKey';
          },
          {
            name: 'isSigner';
            type: 'bool';
          },
          {
            name: 'isWritable';
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'Transaction';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'programId';
            type: 'publicKey';
          },
          {
            name: 'accounts';
            type: {
              vec: {
                defined: 'TransactionAccount';
              };
            };
          },
          {
            name: 'data';
            type: 'bytes';
          },
        ];
      };
    },
    {
      name: 'Suggestion';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'ExecTransactions';
            fields: [
              {
                name: 'txs';
                type: {
                  vec: {
                    defined: 'Transaction';
                  };
                };
              },
            ];
          },
          {
            name: 'AddWhiteList';
            fields: [
              {
                name: 'pubkeys';
                type: {
                  vec: 'publicKey';
                };
              },
            ];
          },
          {
            name: 'DelWhiteList';
            fields: [
              {
                name: 'pubkeys';
                type: {
                  vec: 'publicKey';
                };
              },
            ];
          },
          {
            name: 'VotePresident';
            fields: [
              {
                name: 'vote';
                type: {
                  option: {
                    defined: 'President';
                  };
                };
              },
            ];
          },
          {
            name: 'None';
          },
        ];
      };
    },
  ];
  events: [
    {
      name: 'UserIsCreated';
      fields: [
        {
          name: 'mintAddress';
          type: 'string';
          index: false;
        },
        {
          name: 'userPubkey';
          type: 'string';
          index: false;
        },
        {
          name: 'userTokenAccount';
          type: 'string';
          index: false;
        },
        {
          name: 'userNftTokenAccount';
          type: 'string';
          index: false;
        },
        {
          name: 'whitelist';
          type: 'string';
          index: false;
        },
      ];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'DuplicatedPubkeys';
      msg: 'Each Pubkeys Must Be Unique';
    },
    {
      code: 6001;
      name: 'TargetIsNotInWhiteList';
      msg: 'The Target Is Not In The Whitelist';
    },
    {
      code: 6002;
      name: 'NotInWhiteList';
      msg: 'Not In The Whitelist';
    },
    {
      code: 6003;
      name: 'NotEnoughMajorityNumber';
      msg: 'Not Enough Majority Number';
    },
    {
      code: 6004;
      name: 'AtLeaseOneMustExist';
      msg: 'At Least One Must Exist';
    },
    {
      code: 6005;
      name: 'OutOfBounds';
      msg: 'Out Of Bounds';
    },
    {
      code: 6006;
      name: 'CouldntFind';
      msg: "Couldn't Find";
    },
    {
      code: 6007;
      name: 'UnexpectKind';
      msg: 'Unexpect Kind';
    },
    {
      code: 6008;
      name: 'Parsing';
      msg: 'Parsing Error';
    },
    {
      code: 6009;
      name: 'Time';
      msg: "Couldn't Get Time";
    },
    {
      code: 6010;
      name: 'TooSmall';
      msg: 'Target Value Is Too Small';
    },
    {
      code: 6011;
      name: 'PresidentDateNotOver';
      msg: 'The President Expiration Date Still Not Over';
    },
  ];
};

export const IDL: RetripJs = {
  version: '0.1.0',
  name: 'retrip_js',
  instructions: [
    {
      name: 'initialize',
      accounts: [
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'mint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'programTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'nftMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'programNftTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'whiteList',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'totalSupply',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'faucet',
      accounts: [
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'whiteList',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'mint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'programTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'payerTokenAccount',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'createUser',
      accounts: [
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'whiteList',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'mint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'nftMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'programTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'programNftTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userPubkey',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userNftTokenAccount',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'transferSystemToken',
      accounts: [
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'whiteList',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'mint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'programTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'fromPubkey',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'fromTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'toTokenAccount',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'transferSystemNftToken',
      accounts: [
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'whiteList',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'nftMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'programNftTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'fromPubkey',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'fromNftTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'toNftTokenAccount',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'mintNftAsWhitelist',
      accounts: [
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'whiteList',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'totalSupply',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'toPubkey',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'nftMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'programNftTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'toNftTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenMetadataProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'metadata',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'masterEdition',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'mintArgs',
          type: {
            defined: 'MintArgs',
          },
        },
      ],
    },
    {
      name: 'suggestAsWhitelist',
      accounts: [
        {
          name: 'whiteList',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'suggestion',
          type: {
            defined: 'Suggestion',
          },
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'addresses',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'whiteList',
            type: 'publicKey',
          },
        ],
      },
    },
    {
      name: 'totalSupply',
      docs: ['* Map<type_name, count>'],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'name',
            type: {
              vec: {
                array: ['u8', 64],
              },
            },
          },
          {
            name: 'count',
            type: {
              vec: 'u64',
            },
          },
        ],
      },
    },
    {
      name: 'whiteList',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'president',
            type: {
              option: {
                defined: 'President',
              },
            },
          },
          {
            name: 'listers',
            type: {
              vec: {
                defined: 'Lister',
              },
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'MintArgs',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'creatorKey',
            type: 'publicKey',
          },
          {
            name: 'metadataUri',
            type: 'string',
          },
          {
            name: 'name',
            type: 'string',
          },
          {
            name: 'symbol',
            type: 'string',
          },
          {
            name: 'typeName',
            type: 'string',
          },
          {
            name: 'royalty',
            type: 'u16',
          },
        ],
      },
    },
    {
      name: 'Lister',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'pubkey',
            type: 'publicKey',
          },
          {
            name: 'suggestion',
            type: {
              defined: 'Suggestion',
            },
          },
        ],
      },
    },
    {
      name: 'President',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'pubkey',
            type: 'publicKey',
          },
          {
            name: 'expirationDate',
            type: 'i64',
          },
        ],
      },
    },
    {
      name: 'TransactionAccount',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'pubkey',
            type: 'publicKey',
          },
          {
            name: 'isSigner',
            type: 'bool',
          },
          {
            name: 'isWritable',
            type: 'bool',
          },
        ],
      },
    },
    {
      name: 'Transaction',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'programId',
            type: 'publicKey',
          },
          {
            name: 'accounts',
            type: {
              vec: {
                defined: 'TransactionAccount',
              },
            },
          },
          {
            name: 'data',
            type: 'bytes',
          },
        ],
      },
    },
    {
      name: 'Suggestion',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'ExecTransactions',
            fields: [
              {
                name: 'txs',
                type: {
                  vec: {
                    defined: 'Transaction',
                  },
                },
              },
            ],
          },
          {
            name: 'AddWhiteList',
            fields: [
              {
                name: 'pubkeys',
                type: {
                  vec: 'publicKey',
                },
              },
            ],
          },
          {
            name: 'DelWhiteList',
            fields: [
              {
                name: 'pubkeys',
                type: {
                  vec: 'publicKey',
                },
              },
            ],
          },
          {
            name: 'VotePresident',
            fields: [
              {
                name: 'vote',
                type: {
                  option: {
                    defined: 'President',
                  },
                },
              },
            ],
          },
          {
            name: 'None',
          },
        ],
      },
    },
  ],
  events: [
    {
      name: 'UserIsCreated',
      fields: [
        {
          name: 'mintAddress',
          type: 'string',
          index: false,
        },
        {
          name: 'userPubkey',
          type: 'string',
          index: false,
        },
        {
          name: 'userTokenAccount',
          type: 'string',
          index: false,
        },
        {
          name: 'userNftTokenAccount',
          type: 'string',
          index: false,
        },
        {
          name: 'whitelist',
          type: 'string',
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'DuplicatedPubkeys',
      msg: 'Each Pubkeys Must Be Unique',
    },
    {
      code: 6001,
      name: 'TargetIsNotInWhiteList',
      msg: 'The Target Is Not In The Whitelist',
    },
    {
      code: 6002,
      name: 'NotInWhiteList',
      msg: 'Not In The Whitelist',
    },
    {
      code: 6003,
      name: 'NotEnoughMajorityNumber',
      msg: 'Not Enough Majority Number',
    },
    {
      code: 6004,
      name: 'AtLeaseOneMustExist',
      msg: 'At Least One Must Exist',
    },
    {
      code: 6005,
      name: 'OutOfBounds',
      msg: 'Out Of Bounds',
    },
    {
      code: 6006,
      name: 'CouldntFind',
      msg: "Couldn't Find",
    },
    {
      code: 6007,
      name: 'UnexpectKind',
      msg: 'Unexpect Kind',
    },
    {
      code: 6008,
      name: 'Parsing',
      msg: 'Parsing Error',
    },
    {
      code: 6009,
      name: 'Time',
      msg: "Couldn't Get Time",
    },
    {
      code: 6010,
      name: 'TooSmall',
      msg: 'Target Value Is Too Small',
    },
    {
      code: 6011,
      name: 'PresidentDateNotOver',
      msg: 'The President Expiration Date Still Not Over',
    },
  ],
};
