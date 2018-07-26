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
