import { Readable, Writable } from 'node:stream';
import { Inject, Injectable } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
export enum Codecs {
  'X264' = 'h264_nvenc',
  'AAC' = 'aac',
  'VP9' = 'libvpx-vp9',
  'OPUS' = 'libopus',
  'X265' = 'libx265',
  'AV1' = 'libaom-av1',
}

@Injectable()
export class FFmpegService {
  getCodecs() {
    return Codecs;
  }

  getThumbnail(
    path: string | Readable,
    options: ffmpeg.ScreenshotsConfig,
  ): Promise<string> {
    return new Promise((res, rej) => {
      let fileName: string;
      ffmpeg(path)
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

  encodeVideo(
    path: string | Readable,
    options: {
      audioCodec: Codecs;
      videoCodec: Codecs;
      resolution: string;
      des: string;
      outFormat: 'matroska' | 'mp4' | 'avi' | 'hls';
    },
  ): Promise<void> {
    return new Promise((res, rej) => {
      ffmpeg(path)
        .on('end', () => {
          res();
        })
        .on('error', (err) => {
          rej(err);
        })
        .on('codecData', function (data) {
          console.log(
            'Input is ' +
              data.audio +
              ' audio ' +
              'with ' +
              data.video +
              ' video',
          );
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

  encodeInHLS(
    path: string | Readable,
    options: {
      audioCodec: Codecs;
      des: string;
      outputOptions: any[];
    },
  ): Promise<void> {
    return new Promise((res, rej) => {
      ffmpeg(path)
        .on('end', () => {
          res();
        })
        .on('error', (err) => {
          rej(err);
        })
        .on('codecData', function (data) {
          console.log(
            'Input is ' +
              data.audio +
              ' audio ' +
              'with ' +
              data.video +
              ' video',
          );
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

  encodeMPEGDASH(
    sourcePath: string,
    destFolder:string,
    onProgresss:(p:number) => void
  ): Promise<string> {
    return new Promise((res, rej) => {
      // height, bitrate
      const sizes = [
        [240, 350],
        [480, 700],
        [720, 2500],
      ];
      const fallback = [480, 400];

      let name = path.basename(sourcePath, path.extname(sourcePath));
      const targetPath = path.join(destFolder,name);
      console.log('source', sourcePath);
      console.log('info', targetPath);

      try {
        var targetdirInfo = fs.statSync(targetPath);
      } catch (err) {
        if (err.code === 'ENOENT') {
          fs.mkdirSync(targetPath);
        } else {
          throw err;
        }
      }

      var proc = ffmpeg({
        source: sourcePath,
        cwd: targetPath
      });

      var targetfn = path.join(targetPath, `${name}.mpd`);

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

      //Fallback version
      proc
        .output(path.join(targetPath, `${name}.mkv`))
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
          onProgresss(info.percent)
          //console.log('progress', info);
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
}
