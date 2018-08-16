const fs = require("fs");
const Eos = require("eosjs");
const eosic = require("eosic");
const { ecc } = Eos.modules;

const require_permissions = ({ account, key, actor, parent }) => {
  return {
    account: `${account}`,
    permission: "active",
    parent: `${parent}`,
    auth: {
      threshold: 1,
      keys: [
        {
          key: `${key}`,
          weight: 1
        }
      ],
      accounts: [
        {
          permission: {
            actor: `${actor}`,
            permission: "eosio.code"
          },
          weight: 1
        }
      ],
      waits: []
    }
  };
};

const allowContract = (auth, key, contract, parent) => {
  let [account, permission] = auth.split("@");
  permission = permission || "active";
  parent = parent || "owner";

  const tx_data = {
    actions: [
      {
        account: "eosio",
        name: "updateauth",
        authorization: [
          {
            actor: account,
            permission: permission
          }
        ],
        data: require_permissions({
          account: account,
          key: key,
          actor: contract,
          parent: parent
        })
      }
    ]
  };

  return tx_data;
};

module.exports = {
  async default() {
    const [pub, wif] = [
      "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
      "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"
    ];
    const eos = Eos({
      httpEndpoint: "http://0.0.0.0:8888",
      keyProvider: wif
    });

    console.log("create master contract");
    let {
      account: masterAccount,
      contract: masterContract
    } = await eosic.createContract(pub, eos, "masteroracle", {
      contractName: "ducormaster"
    });

    console.log("create price oraclize contract");
    let {
      account: oraclizeAccount,
      contract: oraclizeContract
    } = await eosic.createContract(pub, eos, "priceoraclize", {
      contractName: "oraclized"
    });

    oracle = `oracle`;
    await eosic.createAccount(
      eos,
      // predefined pub in backend
      "EOS5PxNPCfDQbWPzx8xYhXU253DQGZD7sKAsCAh5Sm7B5W3fKvx9a",
      oracle
    );

    console.log("setup contract permission");
    await eos.transaction(allowContract(oraclizeAccount, pub, oraclizeAccount));

    console.log("setup contract requests");
    await oraclizeContract.setup(oraclizeAccount, oracle, masterAccount, {
      authorization: [oraclizeAccount]
    });
  }
};
