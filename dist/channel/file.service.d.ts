/// <reference types="node" />
import { Readable } from 'node:stream';
import fs, { FileHandle } from 'node:fs/promises';
import { OpenDirOptions, ReadStream, WriteStream } from 'node:fs';
export declare class FileService {
    appendStream(fh: FileHandle, start: number, data: Buffer | Readable | ReadStream): Promise<void>;
    getFileHandle(path: string, flags: string): Promise<fs.FileHandle>;
    getFileStats(fileHandle: FileHandle): Promise<import("fs").Stats>;
    writeToStream(writeStream: WriteStream, readStream: ReadStream | Readable): Promise<void>;
    getStatsFromPath(path: string): Promise<import("fs").Stats>;
    getFilesFromDir(path: string, options?: OpenDirOptions): Promise<import("fs").Dir>;
}
