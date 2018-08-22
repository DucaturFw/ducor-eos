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
            name: "rnd",
            alias: "rnd",
            type: "int",
            bestBefore: 84600,
            updateAfter: 3600,
            args: []
        }
    ]
}));
