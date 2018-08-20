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
}

const oraclized = require("./templates/oraclized") as (
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
  })
);
