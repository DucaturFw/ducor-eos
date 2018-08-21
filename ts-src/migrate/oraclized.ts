import * as eosic from "eosic";
import Eos, { IEosContract, Name, IEosjsCallsParams } from "eosjs";

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

export default async function() {
  ({
    account: masterAccount,
    contract: masterContract
  } = await eosic.createContract<IMasterContract>(pub, eos, "masteroracle", {
    contractName: "ducormaster"
  }));
  ({
    account: oraclizeAccount,
    contract: oraclizeContract
  } = await eosic.createContract<IPriceOraclizeContract>(
    pub,
    eos,
    "priceoraclize",
    {
      contractName: "priceoracliz"
    }
  ));

  oracle = `oracle`;
  await eosic.createAccount(eos, pub, oracle);
  await eosic.allowContract(eos, masterAccount, pub, masterAccount);
  await eosic.allowContract(eos, oraclizeAccount, pub, oraclizeAccount);
  await oraclizeContract.setup(masterAccount, {
    authorization: [oraclizeAccount]
  });
  await masterContract.addoracle(oracle, {
    authorization: [masterAccount]
  });
}
