export interface IFieldConfguration {
  type: string;
  name: string;
}

export interface IEndpointConfiguration {
  suffix: string;
  type: string;
}

export interface IDataProviderArgumentConfiguration {
  type: number;
  default: string;
}

export interface IDataProviderConfiguration {
  id: string;
  name: string;
  alias: string;
  type: string;
  bestBefore: number;
  updateAfter: number;
  args: IDataProviderArgumentConfiguration[];
}

export interface ICustomTypeConfiguration {
  name: string;
  fields?: IFieldConfguration[];
}

export interface IEOSGeneratorConfiguration {
  customs?: ICustomTypeConfiguration[];
  providers?: IDataProviderConfiguration[];
}

const oraclized = require("./templates/eosgenerator") as (
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
        name: "rnd",
        alias: "rnd",
        type: "int",
        bestBefore: 84600,
        updateAfter: 3600,
        args: []
      }
    ]
  })
);
