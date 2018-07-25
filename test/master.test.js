const ByteBuffer = require("bytebuffer");
const fs = require("fs");
const eosic = require("eosic");
const Eos = require("eosjs");
const base58 = require("bs58");
const crypto = require("crypto");
const { format, ecc, Fcbuffer } = Eos.modules;
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

describe("exchange", () => {
  let masterAccount, masterContract;
  let oraclizeAccount, oraclizeContract;

  before(async () => {
    ({
      account: masterAccount,
      contract: masterContract
    } = await eosic.createContract(pub, eos, "masteroracle"));
    ({
      account: oraclizeAccount,
      contract: oraclizeContract
    } = await eosic.createContract(pub, eos, "priceoraclize"));
  });

  it("ask", async () => {
    await masterContract.ask(oraclizeAccount, "0x100", {
      authorization: ["eosio", oraclizeAccount]
    });
  });

  it("reject sell", async () => {
    await expectAssert(
      oraclizeContract.sell("eosio", 1, {
        authorization: ["eosio"]
      })
    );
  });

  it("push data", async () => {
    const b = new ByteBuffer(
      ByteBuffer.DEFAULT_CAPACITY,
      ByteBuffer.BIG_ENDIAN
    );

    b.writeUint64(format.encodeName(oraclizeAccount));

    const buffer = ByteBuffer.concat([
      b.copy(0, b.offset),
      Buffer.from("0x100")
    ]);

    await eos.transaction(allowContract("eosio", pub, masterAccount));

    const hash = ecc.sha256(buffer.toBuffer());

    const tx = await masterContract.pushdata("eosio", hash, 840000, 2, {
      authorization: ["eosio", masterAccount]
    });
  });

  it("sell", async () => {
    await oraclizeContract.sell("eosio", 1, {
      authorization: ["eosio"]
    });
  });
});
