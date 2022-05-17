import { Web3Storage, type CIDString } from "web3.storage";
import type { PutOptions } from "web3.storage";
export interface RateLimiter {
    (): Promise<void>;
}
export interface Options {
    token: string;
    endpoint?: URL;
    rateLimiter?: RateLimiter;
}
export interface Filelike {
    name: string;
    stream: () => ReadableStream;
}
declare type Range = [Number, Number];
export declare class Web3Service {
    options: Options;
    _Web3Storage: Web3Storage;
    constructor(options: Options);
    uploadFiles<T extends Iterable<Filelike> = Iterable<Filelike>>(files: T, options?: PutOptions): Promise<import("web3.storage/dist/src/lib/interface").CIDString>;
    getObjectFile<T extends object = any>(obj: T, fileName: string): File;
    convertDataToFile(data: Uint8Array, fileName: string, options?: FilePropertyBag): File;
    storeFilesWithProgress(files: File[], options: {
        name?: string;
        wrapWithDirectory: boolean;
    }, afterChunkStored?: (size: number, progress: number) => void, afterUpload?: (cid: CIDString) => void): Promise<import("web3.storage/dist/src/lib/interface").CIDString>;
    getFiles(cid: CIDString): Promise<import("web3.storage/dist/src/lib/interface").Web3Response>;
    getFileUsingGateway<T = any>(cid: CIDString, ...ranges: Range[]): Promise<import("axios").AxiosResponse<T, any>>;
}
export {};
