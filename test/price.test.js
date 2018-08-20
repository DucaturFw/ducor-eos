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
const chai_1 = require("chai");
require("mocha");
describe("priceoraclize", () => {
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
        await eosic.allowContract(eos, masterAccount, pub, masterAccount);
        await eosic.allowContract(eos, oraclizeAccount, pub, oraclizeAccount);
        await oraclizeContract.setup(oraclizeAccount, masterAccount, {
            authorization: [oraclizeAccount]
        });
    });
    it("test setup", async () => {
        const requests = await eos.getTableRows({
            code: masterAccount,
            scope: masterAccount,
            table: "request",
            json: true,
            limit: 9999
        });
        chai_1.assert.equal(requests.rows.length, 1, "Unexpected amount of requests");
        console.log(requests.rows);
        chai_1.assert.isTrue(requests.rows.some(el => el.task === nullsbnb_id), "Unexpected task in first request");
    });
    it("no oracles by default", async () => {
        const oracles = await eos.getTableRows({
            code: masterAccount,
            scope: masterAccount,
            table: "oracles",
            json: true,
            limit: 9999
        });
        chai_1.assert.lengthOf(oracles.rows, 0, "Not empty list of oracles");
    });
    it("add oracle", async () => {
        await masterContract.addoracle(oracle, {
            authorization: masterAccount
        });
        const oracles = await eos.getTableRows({
            code: masterAccount,
            scope: masterAccount,
            table: "oracles",
            json: true,
            limit: 9999
        });
        chai_1.assert.lengthOf(oracles.rows, 1, "Not empty list of oracles");
        chai_1.assert.equal(oracles.rows[0].account, oracle, "Unkown oracle");
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
        await masterContract.push(oracle, oraclizeAccount, "0xae1cb3a8b6b4c49c65d22655c1ec4d28a4b3819065dd6aaf990d18e7ede951f1", "", priceBinary, {
            authorization: oracle
        });
    });
});
