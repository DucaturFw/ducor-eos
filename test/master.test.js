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

  it("allow ask for data", async () => {
    const r = await masterContract.ask("eosio", "0x100", {
      authorization: ["eosio"]
    });
  });

  it("create request for unique ask", async () => {
    await masterContract.ask("eosio", "0x100", {
      authorization: ["eosio"]
    });

    const rows = await eos.getTableRows({
      code: masterAccount,
      scope: masterAccount,
      table: "request",
      json: true,
      limit: 999
    });

    console.log(rows);
  });

  it("push data", async () => {
    await masterContract.ask("eosio", "0x100", {
      authorization: ["eosio"]
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

    b.writeUint64(format.encodeName("eosio"));

    console.log(Buffer.from("0x100").toString("hex"));

    const buffer = ByteBuffer.concat([
      b.copy(0, b.offset),
      Buffer.from("0x100")
    ]);

    console.log("BUFFER " + buffer.toString("hex"));

    console.log("HASH: " + ecc.sha256(buffer.toBuffer()).toString("hex"));

    // console.log(fcbuffer.errors.length === 0, fcbuffer.errors);
    // const { requestHash } = fcbuffer.structs;
    // console.log(
    //   "HASH: " +
    //     ecc
    //       .sha256(
    //         fcbuffer.toBuffer(requestHash, {
    //           acc: oraclizeAccount,
    //           task: "0x100"
    //         })
    //       )
    //       .toString("hex")
    // );

    // await masterContract.push()
  });
});
