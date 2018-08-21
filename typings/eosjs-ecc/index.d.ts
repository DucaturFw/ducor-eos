declare module "eosjs-ecc" {
  export function PrivateKey(d: any): any;

  export function PublicKey(Q: any, ...args: any[]): any;

  export function Signature(r: any, s: any, i: any, ...args: any[]): any;

  export function initialize(...args: any[]): any;

  export function isValidPrivate(wif: any): any;

  export function isValidPublic(pubkey: any): any;

  export function privateToPublic(wif: any): any;

  export function randomKey(cpuEntropyBits: any): any;

  export function recover(signature: any, data: any, ...args: any[]): any;

  export function recoverHash(
    signature: any,
    dataSha256: any,
    ...args: any[]
  ): any;

  export function seedPrivate(seed: any): any;

  export function sha256(data: any, ...args: any[]): any;

  export function sign(data: any, privateKey: any, ...args: any[]): any;

  export function signHash(
    dataSha256: any,
    privateKey: any,
    ...args: any[]
  ): any;

  export function unsafeRandomKey(): any;

  export function verify(
    signature: any,
    data: any,
    pubkey: any,
    ...args: any[]
  ): any;

  export function verifyHash(
    signature: any,
    dataSha256: any,
    pubkey: any,
    ...args: any[]
  ): any;

  export namespace Aes {
    function decrypt(
      private_key: any,
      public_key: any,
      nonce: any,
      message: any,
      checksum: any
    ): any;

    function encrypt(
      private_key: any,
      public_key: any,
      message: any,
      ...args: any[]
    ): any;

    namespace decrypt {
      const prototype: {};
    }

    namespace encrypt {
      const prototype: {};
    }
  }

  export namespace PrivateKey {
    const prototype: {};

    function fromBuffer(buf: any): any;

    function fromHex(hex: any): any;

    function fromSeed(seed: any): any;

    function fromString(privateStr: any): any;

    function fromWif(str: any): any;

    function initialize(...args: any[]): any;

    function isValid(key: any): any;

    function isWif(text: any): any;

    function randomKey(...args: any[]): any;

    function unsafeRandomKey(): any;

    namespace fromBuffer {
      const prototype: {};
    }

    namespace fromHex {
      const prototype: {};
    }

    namespace fromSeed {
      const prototype: {};
    }

    namespace fromString {
      const prototype: {};
    }

    namespace fromWif {
      const prototype: {};
    }

    namespace initialize {
      const prototype: {};
    }

    namespace isValid {
      const prototype: {};
    }

    namespace isWif {
      const prototype: {};
    }

    namespace randomKey {
      const prototype: {};
    }

    namespace unsafeRandomKey {
      const prototype: {};
    }
  }

  export namespace PublicKey {
    const prototype: {};

    function fromBinary(bin: any): any;

    function fromBuffer(buffer: any): any;

    function fromHex(hex: any): any;

    function fromPoint(point: any): any;

    function fromString(public_key: any): any;

    function fromStringHex(hex: any): any;

    function fromStringOrThrow(public_key: any): any;

    function isValid(text: any): any;

    namespace fromBinary {
      const prototype: {};
    }

    namespace fromBuffer {
      const prototype: {};
    }

    namespace fromHex {
      const prototype: {};
    }

    namespace fromPoint {
      const prototype: {};
    }

    namespace fromString {
      const prototype: {};
    }

    namespace fromStringHex {
      const prototype: {};
    }

    namespace fromStringOrThrow {
      const prototype: {};
    }

    namespace isValid {
      const prototype: {};
    }
  }

  export namespace Signature {
    const prototype: {};

    function from(o: any): any;

    function fromBuffer(buf: any): any;

    function fromHex(hex: any): any;

    function fromString(signature: any): any;

    function fromStringOrThrow(signature: any): any;

    function sign(data: any, privateKey: any, ...args: any[]): any;

    function signHash(dataSha256: any, privateKey: any, ...args: any[]): any;

    namespace from {
      const prototype: {};
    }

    namespace fromBuffer {
      const prototype: {};
    }

    namespace fromHex {
      const prototype: {};
    }

    namespace fromString {
      const prototype: {};
    }

    namespace fromStringOrThrow {
      const prototype: {};
    }

    namespace sign {
      const prototype: {};
    }

    namespace signHash {
      const prototype: {};
    }
  }

  export namespace initialize {
    const prototype: {};
  }

  export namespace isValidPrivate {
    const prototype: {};
  }

  export namespace isValidPublic {
    const prototype: {};
  }

  export namespace key_utils {
    function addEntropy(...args: any[]): void;

    function checkDecode(keyString: any, ...args: any[]): any;

    function checkEncode(keyBuffer: any, ...args: any[]): any;

    function cpuEntropy(...args: any[]): any;

    function entropyCount(): any;

    function random32ByteBuffer(...args: any[]): any;

    namespace addEntropy {
      const prototype: {};
    }

    namespace checkDecode {
      const prototype: {};
    }

    namespace checkEncode {
      const prototype: {};
    }

    namespace cpuEntropy {
      const prototype: {};
    }

    namespace entropyCount {
      const prototype: {};
    }

    namespace random32ByteBuffer {
      const prototype: {};
    }
  }

  export namespace privateToPublic {
    const prototype: {};
  }

  export namespace randomKey {
    const prototype: {};
  }

  export namespace recover {
    const prototype: {};
  }

  export namespace recoverHash {
    const prototype: {};
  }

  export namespace seedPrivate {
    const prototype: {};
  }

  export namespace sha256 {
    const prototype: {};
  }

  export namespace sign {
    const prototype: {};
  }

  export namespace signHash {
    const prototype: {};
  }

  export namespace unsafeRandomKey {
    const prototype: {};
  }

  export namespace verify {
    const prototype: {};
  }

  export namespace verifyHash {
    const prototype: {};
  }
}
