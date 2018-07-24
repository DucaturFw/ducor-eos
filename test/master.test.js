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

describe("exchange", () => {
  let masterAccount, masterContract;
  let oraclizeAccount, oraclizeContract;

  beforeEach(async () => {
    ({
      account: masterAccount,
      contract: masterContract
    } = await eosic.createContract(pub, eos, "masteroracle"));
    ({
      account: oraclizeAccount,
      contract: oraclizeContract
    } = await eosic.createContract(pub, eos, "priceoraclize"));
  });

  // it("allow ask for data", async () => {
  //   const r = await masterContract.ask("eosio", "0x100", {
  //     authorization: ["eosio"]
  //   });
  // });

  // it("create request for unique ask", async () => {
  //   await masterContract.ask("eosio", "0x100", {
  //     authorization: ["eosio"]
  //   });

  //   const rows = await eos.getTableRows({
  //     code: masterAccount,
  //     scope: masterAccount,
  //     table: "request",
  //     json: true,
  //     limit: 999
  //   });

  //   console.log(rows);
  // });

  it("push data", async () => {
    await masterContract.ask(oraclizeAccount, "0x100", {
      authorization: ["eosio", oraclizeAccount]
    });

    const definitions = {
      requestHash: {
        fields: {
          acc: "account_name",
          task: "string"
        }
      }
    };

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

    const tx = await masterContract.pushdata("eosio", hash, "hello world", {
      authorization: ["eosio", masterAccount]
    });
  });
});
