const ByteBuffer = require("bytebuffer");
const eosic = require("eosic");
const Eos = require("eosjs");
const { assert } = require("chai");

const [pub, wif] = [
  "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
  "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"
];

const eos = Eos({
  httpEndpoint: "http://0.0.0.0:8888",
  keyProvider: wif
});

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

async function expectAssert(promise) {
  try {
    await promise;
    assert.fail("Expected revert not received");
  } catch (error) {
    console.log(error);
    const revertFound = error.search("eosio_assert_message_exception") >= 0;
    assert(revertFound, `Expected "revert", got ${error} instead`);
  }
}

const btcusd_id =
  "0xa171dc074ec6e8322d342075684229733fc8d05c97cae16c031249a04998b874";
const btcprice_id =
  "0xfa6bfea31ea21819ca2de9f530fcc2ebc80d0a1b6130c600f5c3c085a335fdec";
const eosusd_id =
  "0x43f298fa9ef0590967e26fd3d183de6c13475ab810b287ea643a94ce75806eb9";
const hash_id =
  "0xd65485674abcd1e477aa423556787039cec0c41fe373423c44feff042997f8ae";

describe("exchange", () => {
  let masterAccount, masterContract;
  let oraclizeAccount, oraclizeContract;
  let oracle;

  beforeEach(async () => {
    ({
      account: masterAccount,
      contract: masterContract
    } = await eosic.createContract(pub, eos, "masteroracle"));
    ({
      account: oraclizeAccount,
      contract: oraclizeContract
    } = await eosic.createContract(pub, eos, "priceoraclize"));

    const charMap = ["a", "b", "c", "d", "e", "f", "g", "h", "k", "l", "m"];
    const pid = Array(5)
      .fill(0)
      .map(() => charMap[Math.floor(Math.random() * charMap.length)])
      .join("");

    oracle = `${pid}oracle`;
    await eosic.createAccount(eos, pub, oracle);
    await eos.transaction(allowContract("eosio", pub, oraclizeAccount));
    await oraclizeContract.setup("eosio", oracle, masterAccount, {
      authorization: ["eosio", oraclizeAccount]
    });
  });

  it("read request", async () => {
    console.log(
      await eos.getTableRows({
        code: masterAccount,
        scope: masterAccount,
        table: "request",
        json: true,
        limit: 999
      })
    );
  });

  it("reject sell", async () => {
    await expectAssert(
      oraclizeContract.sell("eosio", 1, {
        authorization: ["eosio"]
      })
    );
  });

  it("push data", async () => {
    await eos.transaction(allowContract("eosio", pub, masterAccount));

    await oraclizeContract.pushuint(oracle, btcusd_id, 840000, {
      authorization: [oracle]
    });

    await oraclizeContract.pushuint(oracle, eosusd_id, 500, {
      authorization: [oracle]
    });
  });

  it("sell", async () => {
    await eos.transaction(allowContract("eosio", pub, masterAccount));

    await oraclizeContract.pushuint(oracle, btcusd_id, 840000, {
      authorization: [oracle]
    });

    await oraclizeContract.pushuint(oracle, eosusd_id, 500, {
      authorization: [oracle]
    });

    await oraclizeContract.pushprice(
      oracle,
      btcprice_id,
      {
        value: 100500,
        decimals: 8
      },
      {
        authorization: [oracle]
      }
    );
    await oraclizeContract.sell("eosio", 5, {
      authorization: ["eosio"]
    });
  });
});
