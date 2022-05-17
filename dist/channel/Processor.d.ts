import { Web3Service } from './IpfsModule/ipfs.service';
import { FFmpegService } from './../FFmpeg.service';
import { CIDString } from 'web3.storage';
import { Job } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
export declare const TRANSCODE_JOB = "transcode";
export declare const PROCESS_JOB = "process";
export declare const SCREENSHOT_JOB = "screenshot";
export declare class VideoConsumer {
    private ffmpegService;
    private eventEmitter;
    private web3Service;
    constructor(ffmpegService: FFmpegService, eventEmitter: EventEmitter2, web3Service: Web3Service);
    transcode(job: Job<TranscodeJobData>): Promise<unknown>;
    process(job: Job<ProcessJobData>): Promise<unknown>;
    jobTranscodeCompleted(job: Job<TranscodeJobData>, result: {
        videoId: string;
        destDir: string;
    }): void;
    jobProcessCompleted(job: Job<ProcessJobData>, result: CIDString): void;
    error(error: Error): void;
    newJobStarted(job: Job): void;
    onProgress(job: Job, progress: number): void;
    handler(job: Job, err: Error): void;
    jobRemoved(job: Job): void;
}
