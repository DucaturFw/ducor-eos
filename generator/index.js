"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const oraclized = require("./templates/eosgenerator");
console.log(oraclized({
    customs: [
        {
            name: "price",
            fields: [
                { type: "uint64_t", name: "value" },
                { type: "uint8_t", name: "decimals" }
            ]
        }
    ],
    providers: [
        {
            id: "0x00",
            name: "ethbtc",
            alias: "ethbtc",
            type: "price",
            bestBefore: 84600,
            updateAfter: 3600
        },
        {
            id: "0x01",
            name: "eoseth",
            alias: "eoseth",
            type: "price",
            bestBefore: 84600,
            updateAfter: 3600
        },
        {
            id: "0x02",
            name: "random",
            alias: "random",
            type: "uint64_t",
            bestBefore: 84600,
            updateAfter: 3600
        }
    ]
}));
