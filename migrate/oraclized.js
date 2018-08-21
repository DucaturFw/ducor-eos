"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eosic = __importStar(require("eosic"));
const eosjs_1 = __importDefault(require("eosjs"));
let masterAccount, masterContract;
let oraclizeAccount, oraclizeContract;
let oracle;
const [pub, wif] = [
    "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
    "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"
];
const nullsbnb_id = "0xae1cb3a8b6b4c49c65d22655c1ec4d28a4b3819065dd6aaf990d18e7ede951f1";
const eos = eosjs_1.default({
    httpEndpoint: "http://0.0.0.0:8888",
    keyProvider: wif
});
async function default_1() {
    ({
        account: masterAccount,
        contract: masterContract
    } = await eosic.createContract(pub, eos, "masteroracle", {
        contractName: "ducormaster"
    }));
    ({
        account: oraclizeAccount,
        contract: oraclizeContract
    } = await eosic.createContract(pub, eos, "priceoraclize", {
        contractName: "priceoracliz"
    }));
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
exports.default = default_1;
