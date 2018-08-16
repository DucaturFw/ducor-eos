declare module "dirsum" {
  type DigestMethods = "md5" | "sha1";
  export interface DirectorySum {
    files: { [name: string]: any };
    hash: string;
  }
  export function digest(
    root: string,
    callback: (err: any, res: DirectorySum) => void
  ): void;
  export function digest(
    root: string,
    method: DigestMethods,
    callback: (err: any, res: DirectorySum) => void
  ): void;
}
