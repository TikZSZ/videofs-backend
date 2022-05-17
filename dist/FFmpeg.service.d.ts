/// <reference types="node" />
import { Readable } from 'node:stream';
import ffmpeg from 'fluent-ffmpeg';
export declare enum Codecs {
    'X264' = "h264_nvenc",
    'AAC' = "aac",
    'VP9' = "libvpx-vp9",
    'OPUS' = "libopus",
    'X265' = "libx265",
    'AV1' = "libaom-av1"
}
export declare class FFmpegService {
    getCodecs(): typeof Codecs;
    getThumbnail(path: string | Readable, options: ffmpeg.ScreenshotsConfig): Promise<string>;
    encodeVideo(path: string | Readable, options: {
        audioCodec: Codecs;
        videoCodec: Codecs;
        resolution: string;
        des: string;
        outFormat: 'matroska' | 'mp4' | 'avi' | 'hls';
    }): Promise<void>;
    encodeInHLS(path: string | Readable, options: {
        audioCodec: Codecs;
        des: string;
        outputOptions: any[];
    }): Promise<void>;
    encodeMPEGDASH(sourcePath: string, destFolder: string, onProgresss: (p: number) => void): Promise<string>;
}
