declare module "signale" {
  type SignaleInput = string | Error | SignaleInputObject;
  interface SignaleInputObject {
    prefix?: string;
    suffix?: string;
    message: string;
  }
  interface Signale {
    error(...input: SignaleInput[]): void;
    fatal(...input: SignaleInput[]): void;
    fav(...input: SignaleInput[]): void;
    info(...input: SignaleInput[]): void;
    star(...input: SignaleInput[]): void;
    success(...input: SignaleInput[]): void;
    warn(...input: SignaleInput[]): void;
    complete(...input: SignaleInput[]): void;
    pending(...input: SignaleInput[]): void;
    note(...input: SignaleInput[]): void;
    start(...input: SignaleInput[]): void;
    pause(...input: SignaleInput[]): void;
    debug(...input: SignaleInput[]): void;
    await(...input: SignaleInput[]): void;
    watch(...input: SignaleInput[]): void;
    log(...input: SignaleInput[]): void;

    Signale: new (opts?: any) => any;
  }

  var signale: Signale;
  export = signale;
}
