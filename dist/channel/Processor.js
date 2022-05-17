"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoConsumer = exports.SCREENSHOT_JOB = exports.PROCESS_JOB = exports.TRANSCODE_JOB = void 0;
const ipfs_service_1 = require("./IpfsModule/ipfs.service");
const events_1 = require("./events");
const FFmpeg_service_1 = require("./../FFmpeg.service");
const web3_storage_1 = require("web3.storage");
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const video_que_name_1 = require("./video.que.name");
const event_emitter_1 = require("@nestjs/event-emitter");
const path_1 = __importDefault(require("path"));
exports.TRANSCODE_JOB = 'transcode';
exports.PROCESS_JOB = 'process';
exports.SCREENSHOT_JOB = 'screenshot';
let VideoConsumer = class VideoConsumer {
    constructor(ffmpegService, eventEmitter, web3Service) {
        this.ffmpegService = ffmpegService;
        this.eventEmitter = eventEmitter;
        this.web3Service = web3Service;
    }
    transcode(job) {
        return new Promise(async (res, rej) => {
            try {
                const destPath = await this.ffmpegService.encodeMPEGDASH(job.data.src, job.data.destFolder, (p) => {
                    job.progress(Math.floor(p));
                });
                const thumbnail = await this.ffmpegService.getThumbnail(job.data.src, {
                    folder: destPath,
                    filename: `${path_1.default.basename(destPath, path_1.default.extname(destPath))}.jpeg`,
                    count: 1
                });
                res({ videoId: job.data.videoId, destDir: destPath });
            }
            catch (err) {
                rej(err);
            }
        });
    }
    async process(job) {
        return new Promise(async (res, rej) => {
            try {
                const files = await (0, web3_storage_1.getFilesFromPath)(job.data.destDir);
                const folderCid = await this.web3Service._Web3Storage.put(files, {
                    wrapWithDirectory: false,
                    name: path_1.default.basename(job.data.destDir),
                });
                res(folderCid);
            }
            catch (err) {
                rej(err);
            }
        });
    }
    jobTranscodeCompleted(job, result) {
        console.log('Job done', { id: job.id, name: job.name });
        this.eventEmitter.emit(events_1.VIDEO_TRANSCODED_EVENT, result);
    }
    jobProcessCompleted(job, result) {
        console.log('Job done uploaded to ipfs', { id: job.id, name: job.name });
        this.eventEmitter.emit(events_1.VIDEO_PROCESSED_EVENT, {
            videoId: job.data.videoId,
            cid: result,
        });
    }
    error(error) {
        console.log(error);
    }
    newJobStarted(job) {
        console.log('new job started with ', job.name, job.id);
    }
    onProgress(job, progress) {
        console.log(job.name, progress + ' done');
    }
    handler(job, err) {
        console.log(job.id, 'failed due to ', err);
    }
    jobRemoved(job) {
        console.log(job);
    }
};
__decorate([
    (0, bull_1.Process)({ name: exports.TRANSCODE_JOB }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VideoConsumer.prototype, "transcode", null);
__decorate([
    (0, bull_1.Process)({ name: exports.PROCESS_JOB }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VideoConsumer.prototype, "process", null);
__decorate([
    (0, bull_1.OnQueueCompleted)({ name: exports.TRANSCODE_JOB }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], VideoConsumer.prototype, "jobTranscodeCompleted", null);
__decorate([
    (0, bull_1.OnQueueCompleted)({ name: exports.PROCESS_JOB }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VideoConsumer.prototype, "jobProcessCompleted", null);
__decorate([
    (0, bull_1.OnQueueError)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Error]),
    __metadata("design:returntype", void 0)
], VideoConsumer.prototype, "error", null);
__decorate([
    (0, bull_1.OnQueueActive)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VideoConsumer.prototype, "newJobStarted", null);
__decorate([
    (0, bull_1.OnQueueProgress)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], VideoConsumer.prototype, "onProgress", null);
__decorate([
    (0, bull_1.OnQueueFailed)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Error]),
    __metadata("design:returntype", void 0)
], VideoConsumer.prototype, "handler", null);
__decorate([
    (0, bull_1.OnQueueRemoved)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VideoConsumer.prototype, "jobRemoved", null);
VideoConsumer = __decorate([
    (0, bull_1.Processor)(video_que_name_1.VIDEO_PROCESSOR_QUEUE),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [FFmpeg_service_1.FFmpegService,
        event_emitter_1.EventEmitter2,
        ipfs_service_1.Web3Service])
], VideoConsumer);
exports.VideoConsumer = VideoConsumer;
//# sourceMappingURL=Processor.js.map