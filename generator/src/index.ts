const oraclized = require("../templates/oraclized");
console.log(
  oraclized({
    providers: [
      {
        id:
          "0xa171dc074ec6e8322d342075684229733fc8d05c97cae16c031249a04998b874",
        name: "btcusd",
        alias: "btcusd",
        type: "uint64_t",
        bestBefore: 84600,
        updateAfter: 3600
      },
      {
        id:
          "0x43f298fa9ef0590967e26fd3d183de6c13475ab810b287ea643a94ce75806eb9",
        name: "eosusd",
        alias: "eosusd",
        type: "uint64_t",
        bestBefore: 84600,
        updateAfter: 3600
      },
      {
        id:
          "0xd65485674abcd1e477aa423556787039cec0c41fe373423c44feff042997f8ae",
        name: "latest_hash",
        alias: "latest.hash",
        type: "std::string",
        bestBefore: 600,
        updateAfter: 60
      }
    ],
    endpoint: [
      { suffix: "uint", type: "uint64_t" },
      { suffix: "str", type: "std::string" }
    ]
  })
);
