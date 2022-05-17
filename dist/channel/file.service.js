"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const node_stream_1 = require("node:stream");
const common_1 = require("@nestjs/common");
const promises_1 = __importDefault(require("node:fs/promises"));
let FileService = class FileService {
    async appendStream(fh, start, data) {
        const writeStream = fh.createWriteStream({ start });
        const readStream = node_stream_1.Readable.from(data instanceof Buffer ? node_stream_1.Readable.from(data) : data);
        await this.writeToStream(writeStream, readStream);
    }
    getFileHandle(path, flags) {
        return promises_1.default.open(path, flags);
    }
    getFileStats(fileHandle) {
        return fileHandle.stat();
    }
    writeToStream(writeStream, readStream) {
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
    getStatsFromPath(path) {
        return promises_1.default.stat(path);
    }
    getFilesFromDir(path, options) {
        return promises_1.default.opendir(path, options);
    }
};
FileService = __decorate([
    (0, common_1.Injectable)()
], FileService);
exports.FileService = FileService;
//# sourceMappingURL=file.service.js.map