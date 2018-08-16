import * as eosic from "eosic";
import Eos, { IEosContract, Name } from "eosjs";
import { assert } from "chai";
import "mocha";

interface IPriceOraclizeContract extends IEosContract {
  setup(
    administrator: Name,
    oracle: Name,
    master: Name,
    config: any
  ): Promise<any>;
}

interface IRequest {
  task: string;
  memo: string;
  contract: Name;
  timestamp: number;
  active: number;
}

interface IMasterContract extends IEosContract {}

describe("priceoraclize", () => {
  let masterAccount: Name, masterContract: IMasterContract;
  let oraclizeAccount: Name, oraclizeContract: IPriceOraclizeContract;
  let oracle: Name;

  const [pub, wif] = [
    "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
    "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"
  ];

  const ethbtc_id =
    "363e7fe8b47534460fd06dafd5e18a542fe1aaa78038d7ca5e84694f99a788e5";
  const eoseth_id =
    "36f7c5776d9de47314b73961dbc5afe691e66817b2eae3c1260feefbab131347";

  const eos = Eos({
    httpEndpoint: "http://0.0.0.0:8888",
    keyProvider: wif
  });

  beforeEach(async () => {
    ({
      account: masterAccount,
      contract: masterContract
    } = await eosic.createContract(pub, eos, "masteroracle"));
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
    await eosic.allowContract(eos, oraclizeAccount, pub, oraclizeAccount);
    await oraclizeContract.setup(oraclizeAccount, oracle, masterAccount, {
      authorization: [oraclizeAccount]
    });
  });

  it("test setup", async () => {
    const requests = await eos.getTableRows<IRequest>({
      code: masterAccount,
      scope: masterAccount,
      table: "request",
      json: true,
      limit: 999
    });

    assert.equal(requests.rows.length, 2, "Unexpected amount of requests");
    console.log(requests.rows);
    assert.isTrue(
      requests.rows.some(el => el.task === eoseth_id),
      "Unexpected task in first request"
    );
    assert.isTrue(
      requests.rows.some(el => el.task === ethbtc_id),
      "Unexpected task in second request"
    );
  });
});
