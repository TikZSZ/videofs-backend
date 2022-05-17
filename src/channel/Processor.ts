import { Readable } from 'node:stream';
import { Web3Service } from './IpfsModule/ipfs.service';
import { VIDEO_TRANSCODED_EVENT, VIDEO_PROCESSED_EVENT } from './events';
import { FFmpegService, Codecs } from './../FFmpeg.service';
import { getFilesFromPath, File, CIDString, filesFromPath } from 'web3.storage';
import {
  Process,
  Processor,
  OnQueueCompleted,
  OnQueueError,
  OnQueueActive,
  OnQueueProgress,
  OnQueueFailed,
  OnQueueRemoved,
} from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { VIDEO_PROCESSOR_QUEUE } from './video.que.name';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileService } from './file.service';
import path from 'path';

export interface TranscodeJobData {
  videoId: number;
  src: string;
  destFolder: string;
}

export interface ProcessJobData {
  videoId: number;
  destDir: string;
}

export interface ScreenshotJobData {
  videoId: number;
  src: string;
}

export const TRANSCODE_JOB = 'transcode';
export const PROCESS_JOB = 'process';
export const SCREENSHOT_JOB = 'screenshot';

@Processor(VIDEO_PROCESSOR_QUEUE)
@Injectable()
export class VideoConsumer {
  constructor(
    private ffmpegService: FFmpegService,
    private eventEmitter: EventEmitter2,
    private web3Service: Web3Service,
  ) {}

  @Process({ name: TRANSCODE_JOB })
  transcode(job: Job<TranscodeJobData>) {
    return new Promise(async (res, rej) => {
      try {
        const destPath = await this.ffmpegService.encodeMPEGDASH(
          job.data.src,
          job.data.destFolder,
          (p) => {
            job.progress(Math.floor(p));
          },
        );
        const thumbnail = await this.ffmpegService.getThumbnail(job.data.src, {
          folder: destPath,
          filename: `${path.basename(destPath, path.extname(destPath))}.jpeg`,
          count:1
        });
        res({ videoId: job.data.videoId, destDir:destPath });
      } catch (err) {
        rej(err);
      }
    });
  }

  @Process({ name: PROCESS_JOB })
  async process(job: Job<ProcessJobData>) {
    return new Promise(async (res, rej) => {
      try {
        const files = await getFilesFromPath(job.data.destDir);
        const folderCid = await this.web3Service._Web3Storage.put(
          files as any,
          {
            wrapWithDirectory: false,
            name: path.basename(job.data.destDir),
          },
        );
        res(folderCid);
      } catch (err) {
        rej(err);
      }
    });
  }

  @OnQueueCompleted({ name: TRANSCODE_JOB })
  jobTranscodeCompleted(
    job: Job<TranscodeJobData>,
    result: { videoId: string; destDir: string },
  ) {
    console.log('Job done', { id: job.id, name: job.name });
    // emit an event to inform the service that video has been transcoded
    this.eventEmitter.emit(VIDEO_TRANSCODED_EVENT, result);
  }

  @OnQueueCompleted({ name: PROCESS_JOB })
  jobProcessCompleted(job: Job<ProcessJobData>, result: CIDString) {
    console.log('Job done uploaded to ipfs', { id: job.id, name: job.name });
    // emit an event to inform the service that video has been uploaded to ipfs
    this.eventEmitter.emit(VIDEO_PROCESSED_EVENT, {
      videoId: job.data.videoId,
      cid: result,
    });
  }

  @OnQueueError()
  error(error: Error) {
    console.log(error);
  }

  @OnQueueActive()
  newJobStarted(job: Job) {
    console.log('new job started with ',job.name,job.id);
  }

  @OnQueueProgress()
  onProgress(job: Job, progress: number) {
    console.log(job.name, progress + ' done');
  }

  @OnQueueFailed()
  handler(job: Job, err: Error) {
    console.log(job.id, 'failed due to ', err);
  }

  @OnQueueRemoved()
  jobRemoved(job: Job) {
    console.log(job);
  }
}
