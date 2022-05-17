import { VIDEO_UPLOADED_EVENT } from './events';
import { VIDEO_PROCESSOR_QUEUE } from './video.que.name';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  Headers,
  ParseBoolPipe,
  Req,
  DefaultValuePipe,
  Put,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GetJwtToken } from 'src/global/decorators/jwt.decorator';
import { IJwtToken } from 'src/global/types/JwtToken';
import { AuthGuard } from '../global/guards/auth.guard';
import { ChannelService } from './channel.service';
import type { Express, Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { FileService } from './file.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

const UPLOAD_PATH = join(__dirname, '..', '..', 'uploaded');
const PROCCESSED_PATH = join(__dirname, '..', '..', 'processed');

@Controller('/channels')
@UseGuards(AuthGuard)
export class ChannelController {
  constructor(
    private channelService: ChannelService,
    @InjectQueue(VIDEO_PROCESSOR_QUEUE) private videoQueue: Queue,
    private fileService: FileService,
    private eventEmitter: EventEmitter2,
  ) {
    async function main() {
      await videoQueue.removeJobs('*');
    }
    main();
  }

  @Get()
  getChannelForToken(@GetJwtToken() token: IJwtToken) {
    return this.channelService.getChannelForJWTToken(token.id);
  }

  @Post()
  createChannel(
    @Body('data') data: Prisma.ChannelCreateInput,
    @GetJwtToken() token: IJwtToken,
  ) {
    return this.channelService.createChannel(data, token.id);
  }

  @Get('/:channelId')
  getChannel(@Param('channelid', ParseIntPipe) channelId: number) {
    return this.channelService.getChannel(channelId);
  }

  @Get('/videos/:videoid')
  getVideo(@Param('videoid', ParseIntPipe) videoId: number) {
    return this.channelService.getVideo(videoId);
  }

  @Get('/:channelid/videos')
  async getVideos(
    @Param('channelid', ParseIntPipe) channelId: number,
    @GetJwtToken() token: IJwtToken,
    @Req() req: Request,
    @Query('user', new DefaultValuePipe(false), ParseBoolPipe) user?: boolean,
    @Query('videoid', new DefaultValuePipe(undefined)) videoId?: number,
  ) {
    const videos = await this.channelService.getVideos(channelId, {
      channelId: channelId,
      id: {
        lte: videoId,
      },
      userId: user ? token.id : undefined,
    });
    return videos;
  }

  @Post('/:channelid/videos')
  async createVideo(
    @Param('channelid', ParseIntPipe) channelid: string,
    @Body('data')
    data: Prisma.VideoCreateInput & { videoMeta: Prisma.VideoTokenCreateInput },
    @GetJwtToken() token: IJwtToken,
  ) {
    const { videoMeta, ...rest } = data;
    const video = await this.channelService.createVideo(
      rest,
      token.id,
      parseInt(channelid),
      videoMeta,
    );
    return video;
  }
  // get video token
  @Get('/:channelid/videos/:videoid')
  async getVideoToken(
    @Param('videoid', ParseIntPipe) videoId: number,
    @GetJwtToken() jwtToken: IJwtToken,
  ) {
    const video = await this.channelService.getVideoToken(videoId, jwtToken.id);
    let uploadedSize: number;
    try {
      const fileStats = await this.fileService.getStatsFromPath(
        `${UPLOAD_PATH}/${video.videoToken.fileName}`,
      );
      uploadedSize = fileStats.size;
    } catch (err) {
      const doesNotExist = this.isErrorNotFound(err);
      if (doesNotExist) {
        uploadedSize = 0;
      }
    }
    return { ...video, uploadedSize };
  }

  @Patch('/:channelid/videos/:videoid')
  async updateVideo(
    @GetJwtToken() jwtToken: IJwtToken,
    @Param('videoid', ParseIntPipe) videoId: number,
    @Body('data')
    body: {
      videoCid: string;
    },
  ) {
    return this.channelService.updateVideo(
      { videoCid: body.videoCid },
      jwtToken.id,
      videoId,
    );
  }

  // upload data for video token
  @Post('/:channelid/videos/:videoid')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @GetJwtToken() jwtToken: IJwtToken,
    @Headers('content-range') range: string,
    @Param('videoid', ParseIntPipe) videoId: number,
    @Body() body: any,
  ) {
    // check if ranges are valid
    const [rangeStart, rangeEnd, totalSize] = range
      .match(/\d+/g)
      .map((val) => parseInt(val));
    console.log([rangeStart, rangeEnd, totalSize]);

    // check video token is valid and owned by user
    const { fileName, fileSize, completed } = await (
      await this.channelService.getVideoToken(videoId, jwtToken.id)
    ).videoToken;

    // check if video has completed loading
    if (completed)
      throw new BadRequestException('Video has uploaded completely');

    const filePath = join(UPLOAD_PATH, '/', fileName);
    const fh = await this.fileService.getFileHandle(filePath, 'a+');
    const fileStats = await fh.stat();
    if (
      rangeStart !== fileStats.size ||
      totalSize > fileSize ||
      rangeEnd > fileSize
    ) {
      throw new BadRequestException('Bad Range');
    }

    await this.fileService.appendStream(fh, rangeStart, file.buffer);

    if (fileSize === rangeEnd) {
      await this.channelService.updateVideo(
        { completed: true },
        jwtToken.id,
        videoId,
      );
      this.eventEmitter.emit(VIDEO_UPLOADED_EVENT, {
        videoId: videoId,
        src: filePath,
      });
      return {
        completed: true,
      };
    } else {
      return {
        done: true,
      };
    }
  }

  @Get('/:channelid/playlists')
  getPlaylists(
    @Param('channelid', ParseIntPipe) channelId: number,
    @GetJwtToken() token: IJwtToken,
    @Query('playlistId', ParseIntPipe) playlistId?: number,
  ) {
    return this.channelService.getPlaylists(channelId, playlistId);
  }

  @Post('/:channelid/playlists')
  createPlaylist(
    @Param('channelId', ParseIntPipe) channelId: number,
    @Body('data') data: Prisma.PlaylistCreateInput,
    @GetJwtToken() token: IJwtToken,
  ) {
    return this.channelService.createPlaylist(data, channelId, token.id);
  }

  @Get('/playlists/:playlistid')
  getPlaylist(
    @Param('playlistId', ParseIntPipe) playlistId: number,
    @GetJwtToken() token: IJwtToken,
  ) {
    return this.channelService.getPlaylist(playlistId);
  }

  @Get('/playlists/:playlistId/videos')
  getVideosForPlaylist(
    @Param('playlistId', ParseIntPipe) playlistId: number,
    @GetJwtToken() token: IJwtToken,
    @Query('videoid', ParseIntPipe) videoId?: number,
  ) {
    return this.channelService.getVideosForPlaylist(playlistId, videoId);
  }

  @Post('/playlists/:playlistid/videos')
  addVideosToPlaylist(
    @Param('playlistid', ParseIntPipe) playlistId: number,
    @Body('data') data: { videos: number[] },
    @GetJwtToken() token: IJwtToken,
  ) {
    return this.channelService.addVideosToPlaylist(
      playlistId,
      token.id,
      data.videos,
    );
  }
  isErrorNotFound(err) {
    return err.code === 'ENOENT';
  }
}
