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
exports.FFmpegService = exports.Codecs = void 0;
const common_1 = require("@nestjs/common");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
var Codecs;
(function (Codecs) {
    Codecs["X264"] = "h264_nvenc";
    Codecs["AAC"] = "aac";
    Codecs["VP9"] = "libvpx-vp9";
    Codecs["OPUS"] = "libopus";
    Codecs["X265"] = "libx265";
    Codecs["AV1"] = "libaom-av1";
})(Codecs = exports.Codecs || (exports.Codecs = {}));
let FFmpegService = class FFmpegService {
    getCodecs() {
        return Codecs;
    }
    getThumbnail(path, options) {
        return new Promise((res, rej) => {
            let fileName;
            (0, fluent_ffmpeg_1.default)(path)
                .on('filenames', function (filenames) {
                fileName = filenames.join('.');
                console.log('Will generate thumbail at' + filenames.join(', '));
            })
                .on('error', (err) => {
                rej(err);
            })
                .on('end', () => {
                res(fileName);
            })
                .screenshot(options);
        });
    }
    encodeVideo(path, options) {
        return new Promise((res, rej) => {
            (0, fluent_ffmpeg_1.default)(path)
                .on('end', () => {
                res();
            })
                .on('error', (err) => {
                rej(err);
            })
                .on('codecData', function (data) {
                console.log('Input is ' +
                    data.audio +
                    ' audio ' +
                    'with ' +
                    data.video +
                    ' video');
            })
                .on('progress', function (progress) {
                console.log('Processing: ' + progress.percent + '% done');
            })
                .audioCodec(options.audioCodec)
                .videoCodec(options.videoCodec)
                .size(options.resolution)
                .outputFormat(options.outFormat)
                .save(options.des);
        });
    }
    encodeInHLS(path, options) {
        return new Promise((res, rej) => {
            (0, fluent_ffmpeg_1.default)(path)
                .on('end', () => {
                res();
            })
                .on('error', (err) => {
                rej(err);
            })
                .on('codecData', function (data) {
                console.log('Input is ' +
                    data.audio +
                    ' audio ' +
                    'with ' +
                    data.video +
                    ' video');
            })
                .on('progress', function (progress) {
                console.log('Processing: ' + progress.percent + '% done');
            })
                .output(`${options.des}.mpd`)
                .format('dash')
                .videoCodec('libx264')
                .audioCodec('aac')
                .audioChannels(2)
                .audioFrequency(44100)
                .outputOptions([
                '-preset veryslow',
                '-keyint_min 60',
                '-g 60',
                '-sc_threshold 0',
                '-profile:v main',
                '-use_template 1',
                '-use_timeline 1',
                '-b_strategy 0',
                '-bf 1',
                '-map 0:a',
                '-b:a 96k',
            ])
                .run();
        });
    }
    encodeMPEGDASH(sourcePath, destFolder, onProgresss) {
        return new Promise((res, rej) => {
            const sizes = [
                [240, 350],
                [480, 700],
                [720, 2500],
            ];
            const fallback = [480, 400];
            let name = path_1.default.basename(sourcePath, path_1.default.extname(sourcePath));
            const targetPath = path_1.default.join(destFolder, name);
            console.log('source', sourcePath);
            console.log('info', targetPath);
            try {
                var targetdirInfo = fs_1.default.statSync(targetPath);
            }
            catch (err) {
                if (err.code === 'ENOENT') {
                    fs_1.default.mkdirSync(targetPath);
                }
                else {
                    throw err;
                }
            }
            var proc = (0, fluent_ffmpeg_1.default)({
                source: sourcePath,
                cwd: targetPath
            });
            var targetfn = path_1.default.join(targetPath, `${name}.mpd`);
            proc
                .output(targetfn)
                .format('dash')
                .videoCodec('libx264')
                .audioCodec('aac')
                .audioChannels(2)
                .audioFrequency(44100)
                .outputOptions([
                '-preset fast',
                '-keyint_min 60',
                '-g 60',
                '-sc_threshold 0',
                '-profile:v main',
                '-use_template 1',
                '-use_timeline 1',
                '-b_strategy 0',
                '-bf 1',
                '-map 0:a',
                '-b:a 96k',
            ]);
            for (var size of sizes) {
                let index = sizes.indexOf(size);
                proc.outputOptions([
                    `-filter_complex [0]format=pix_fmts=yuv420p[temp${index}];[temp${index}]scale=-2:${size[0]}[A${index}]`,
                    `-map [A${index}]:v`,
                    `-b:v:${index} ${size[1]}k`,
                ]);
            }
            proc
                .output(path_1.default.join(targetPath, `${name}.mkv`))
                .format('matroska')
                .videoCodec('libx264')
                .videoBitrate(fallback[1])
                .size(`?x${fallback[0]}`)
                .audioCodec('aac')
                .audioChannels(2)
                .audioFrequency(44100)
                .audioBitrate(128)
                .outputOptions([
                '-preset fast',
                '-movflags +faststart',
                '-keyint_min 60',
                '-refs 5',
                '-g 60',
                '-pix_fmt yuv420p',
                '-sc_threshold 0',
                '-profile:v main',
            ]);
            proc.on('start', function (commandLine) {
                console.log('progress', 'Spawned Ffmpeg with command: ' + commandLine);
            });
            proc
                .on('progress', function (info) {
                onProgresss(info.percent);
            })
                .on('end', function () {
                res(targetPath);
                console.log('complete');
            })
                .on('error', function (err) {
                console.log('error', err);
                rej(err);
            });
            proc.run();
        });
    }
};
FFmpegService = __decorate([
    (0, common_1.Injectable)()
], FFmpegService);
exports.FFmpegService = FFmpegService;
//# sourceMappingURL=FFmpeg.service.js.map