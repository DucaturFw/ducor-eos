"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const oraclized = require("../templates/oraclized");
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
            id: "0xa171dc074ec6e8322d342075684229733fc8d05c97cae16c031249a04998b874",
            name: "ethbtc",
            alias: "ethbtc",
            type: "price",
            bestBefore: 84600,
            updateAfter: 3600
        },
        {
            id: "0xa171dc074ec6e8322d342075684229733fc8d05c97cae16c031249a04998b874",
            name: "eoseth",
            alias: "eoseth",
            type: "price",
            bestBefore: 84600,
            updateAfter: 3600
        }
    ],
    endpoints: [{ suffix: "price", type: "price" }]
}));
//# sourceMappingURL=index.js.map