import * as eosic from "eosic";
import Eos, { IEosContract, Name, IEosjsCallsParams } from "eosjs";
import { assert } from "chai";
import "mocha";

interface IPriceOraclizeContract extends IEosContract {
  setup(master: Name, extra?: IEosjsCallsParams): Promise<any>;
}

interface IRequest {
  task: string;
  memo: string;
  contract: Name;
  timestamp: number;
  active: number;
}
interface IOracles {
  account: Name;
}

interface IMasterContract extends IEosContract {
  push(
    oracle: Name,
    contract: Name,
    task: string,
    memo: string,
    data: Buffer,
    extra?: IEosjsCallsParams
  ): Promise<any>;
}

describe("priceoraclize", () => {
  let masterAccount: Name, masterContract: IMasterContract;
  let oraclizeAccount: Name, oraclizeContract: IPriceOraclizeContract;
  let oracle: Name;

  const [pub, wif] = [
    "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
    "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"
  ];

  const nullsbnb_id =
    "0xae1cb3a8b6b4c49c65d22655c1ec4d28a4b3819065dd6aaf990d18e7ede951f1";

  const eos = Eos({
    httpEndpoint: "http://0.0.0.0:8888",
    keyProvider: wif
  });

  beforeEach(async () => {
    ({
      account: masterAccount,
      contract: masterContract
    } = await eosic.createContract<IMasterContract>(pub, eos, "masteroracle"));
    ({
      account: oraclizeAccount,
      contract: oraclizeContract
    } = await eosic.createContract<IPriceOraclizeContract>(
      pub,
      eos,
      "priceoraclize"
    ));

    const charMap = ["a", "b", "c", "d", "e", "f", "g", "h", "k", "l", "m"];
    const pid = Array(5)
      .fill(0)
      .map(() => charMap[Math.floor(Math.random() * charMap.length)])
      .join("");

    oracle = `${pid}oracle`;
    await eosic.createAccount(eos, pub, oracle);
    await eosic.allowContract(eos, masterAccount, pub, masterAccount);
    await eosic.allowContract(eos, oraclizeAccount, pub, oraclizeAccount);
    await oraclizeContract.setup(masterAccount, {
      authorization: [oraclizeAccount]
    });
  });

  it("test setup", async () => {
    const requests = await eos.getTableRows<IRequest>({
      code: masterAccount,
      scope: masterAccount,
      table: "request",
      json: true,
      limit: 9999
    });

    assert.equal(requests.rows.length, 1, "Unexpected amount of requests");
    console.log(requests.rows);
    assert.isTrue(
      requests.rows.some(el => el.task === nullsbnb_id),
      "Unexpected task in first request"
    );
  });

  it("no oracles by default", async () => {
    const oracles = await eos.getTableRows<IOracles>({
      code: masterAccount,
      scope: masterAccount,
      table: "oracles",
      json: true,
      limit: 9999
    });

    assert.lengthOf(oracles.rows, 0, "Not empty list of oracles");
  });

  it("add oracle", async () => {
    await masterContract.addoracle(oracle, {
      authorization: masterAccount
    });

    const oracles = await eos.getTableRows<IOracles>({
      code: masterAccount,
      scope: masterAccount,
      table: "oracles",
      json: true,
      limit: 9999
    });

    assert.lengthOf(oracles.rows, 1, "Not empty list of oracles");
    assert.equal(oracles.rows[0].account, oracle, "Unkown oracle");
  });

  it("oraclize", async () => {
    const price = {
      value: 200000,
      decimals: 4
    };

    const priceBinary = masterContract.fc.toBuffer("price", price);

    await masterContract.addoracle(oracle, {
      authorization: masterAccount
    });

    await masterContract.push(
      oracle,
      oraclizeAccount,
      "0xae1cb3a8b6b4c49c65d22655c1ec4d28a4b3819065dd6aaf990d18e7ede951f1",
      "",
      priceBinary,
      {
        authorization: oracle
      }
    );
  });
});
