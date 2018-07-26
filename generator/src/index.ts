export interface IFieldConfguration {
  type: string;
  name: string;
}

export interface IEndpointConfiguration {
  suffix: string;
  type: string;
}

export interface IDataProviderConfiguration {
  id: string;
  name: string;
  alias: string;
  type: string;
  bestBefore: number;
  updateAfter: number;
}

export interface ICustomTypeConfiguration {
  name: string;
  fields?: IFieldConfguration[];
}
export interface IEOSGeneratorConfiguration {
  customs?: ICustomTypeConfiguration[];
  providers?: IDataProviderConfiguration[];
  endpoints?: IEndpointConfiguration[];
}

const oraclized = require("../templates/oraclized") as (
  config: IEOSGeneratorConfiguration
) => string;

console.log(
  oraclized({
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
          "0xa171dc074ec6e8322d342075684229733fc8d05c97cae16c031249a04998b874",
        name: "btcprice",
        alias: "btcprice",
        type: "price",
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
    endpoints: [
      { suffix: "uint", type: "uint64_t" },
      { suffix: "str", type: "std::string" },
      { suffix: "price", type: "price" }
    ]
  })
);
