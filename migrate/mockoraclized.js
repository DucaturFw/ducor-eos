const fs = require("fs")
const Eos = require("eosjs")
const eosic = require("eosic")
const { ecc } = Eos.modules

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
  }
}

const allowContract = (auth, key, contract, parent) => {
  let [account, permission] = auth.split("@")
  permission = permission || "active"
  parent = parent || "owner"

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
  }

  return tx_data
}

async function execute() {
  const [pub, wif] = [
    "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
    "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"
  ]
  const eos = Eos({
    httpEndpoint: "http://0.0.0.0:8888",
    keyProvider: wif
  })

  let {
    account: masterAccount,
    contract: masterContract
  } = await eosic.createContract(pub, eos, "masteroracle", {
    contractName: "master"
  })

  let {
    account: oraclizeAccount,
    contract: oraclizeContract
  } = await eosic.createContract(pub, eos, "priceoraclize", {
    contractName: "oraclized"
  })

  oracle = `oracle`
  await eosic.createAccount(eos, pub, oracle)
  await eos.transaction(allowContract("eosio", pub, oraclizeAccount))
  await oraclizeContract.setup("eosio", oracle, masterAccount, {
    authorization: ["eosio", oraclizeAccount]
  })
}

execute()
