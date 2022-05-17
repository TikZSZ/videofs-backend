import { Readable } from 'node:stream';
import { BadRequestException, Injectable } from '@nestjs/common';
import fs, { FileHandle } from 'node:fs/promises';
import { OpenDirOptions, ReadStream, WriteStream } from 'node:fs';

@Injectable()
export class FileService {
  async appendStream(
    fh: FileHandle,
    start: number,
    data: Buffer | Readable | ReadStream,
  ) {
    const writeStream = fh.createWriteStream({ start });
    const readStream = Readable.from(
      data instanceof Buffer ? Readable.from(data) : data,
    );
    await this.writeToStream(writeStream, readStream);
  }

  getFileHandle(path: string, flags: string) {
    return fs.open(path, flags);
  }

  getFileStats(fileHandle: FileHandle) {
    return fileHandle.stat();
  }

  writeToStream(
    writeStream: WriteStream,
    readStream: ReadStream | Readable,
  ): Promise<void> {
    return new Promise((res, rej) => {
      readStream.pipe(writeStream);
      writeStream.on('finish', (err) => {
        console.log('releasing the stream');
        res();
      });
      writeStream.on('error', (err) => {
        rej(err);
      });
    });
  }

  getStatsFromPath(path:string){
    return fs.stat(path)
  }

  getFilesFromDir(path:string,options?:OpenDirOptions){
    return fs.opendir(path,options)
  }
}
