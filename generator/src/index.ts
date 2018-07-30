export interface IFieldConfguration {
  type: string
  name: string
}

export interface IEndpointConfiguration {
  suffix: string
  type: string
}

export interface IDataProviderConfiguration {
  id: string
  name: string
  alias: string
  type: string
  bestBefore: number
  updateAfter: number
}

export interface ICustomTypeConfiguration {
  name: string
  fields?: IFieldConfguration[]
}
export interface IEOSGeneratorConfiguration {
  customs?: ICustomTypeConfiguration[]
  providers?: IDataProviderConfiguration[]
  endpoints?: IEndpointConfiguration[]
}

const oraclized = require("../templates/oraclized") as (
  config: IEOSGeneratorConfiguration
) => string

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
        name: "ethbtc",
        alias: "ethbtc",
        type: "price",
        bestBefore: 84600,
        updateAfter: 3600
      },
      {
        id:
          "0xa171dc074ec6e8322d342075684229733fc8d05c97cae16c031249a04998b874",
        name: "eoseth",
        alias: "eoseth",
        type: "price",
        bestBefore: 84600,
        updateAfter: 3600
      }
    ],
    endpoints: [{ suffix: "price", type: "price" }]
  })
)
