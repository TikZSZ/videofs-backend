import { CIDString } from 'web3.storage';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { randomUUID, randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma.service';
import {
  VIDEO_PROCESSED_EVENT,
  VIDEO_TRANSCODED_EVENT,
  VIDEO_UPLOADED_EVENT,
} from './events';
import {
  TranscodeJobData,
  TRANSCODE_JOB,
  PROCESS_JOB,
  ProcessJobData,
} from './Processor';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { VIDEO_PROCESSOR_QUEUE } from './video.que.name';
import {join} from "path"

const VIDEOS_TAKE_LIMIT = 40;
const PLAYLISTS_TAKE_LIMIT = 5;

const UPLOAD_PATH = join(__dirname, '..', '..', 'uploaded');
const PROCCESSED_PATH = join(__dirname, '..', '..', 'processed');



@Injectable()
export class ChannelService {
  constructor(
    private prismaService: PrismaService,
    @InjectQueue(VIDEO_PROCESSOR_QUEUE) private videoQue: Queue,
  ) {}

  private findChannel(args: Prisma.ChannelFindFirstArgs) {
    return this.prismaService.channel.findFirst(args);
  }

  getChannelForJWTToken(userId: number) {
    return this.findChannel({ where: { userId } });
  }

  getChannel(channelId: number) {
    return this.findChannel({ where: { id: channelId } });
  }

  async createChannel(data: Prisma.ChannelCreateInput, userId: number) {
    return this.prismaService.channel.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async createVideo(
    data: Prisma.VideoCreateInput,
    userId: number,
    channelId: number,
    videoMeta: Prisma.VideoTokenCreateInput,
    playlistId?: number,
  ) {
    // check if channel exists
    if (!channelId) throw new BadRequestException('channel id not provided');
    const channel = await this.prismaService.channel.findUnique({
      where: { id: channelId },
      include: {
        playlists: playlistId ? true : false,
      },
    });
    if (!channel) throw new NotFoundException('chnnael not found');

    // check if jwt tokwn user owns the channel
    if (channel.userId !== userId)
      throw new UnauthorizedException('You do not own the channel');

    const connectObj = {
      channel: {
        connect: {
          id: channelId,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
      videoToken: {
        create: {
          ...videoMeta,
          fileName: this.getFileName(videoMeta.fileName),
        },
      },
    };

    const uploadedAt = this.getCurrentTime();

    // create video record with channel connection and without playlist connection
    if (!playlistId) {
      return this.prismaService.video.create({
        data: {
          ...data,
          ...connectObj,
          uploadedAt,
        },
      });
    }

    // find if user owns the playlist
    const playlistIndex = channel.playlists.findIndex((playlist) => {
      return playlist.id === playlistId;
    });
    if (playlistIndex === -1) throw new UnauthorizedException();

    // user owns playlist create video and connect with playlist
    return this.prismaService.video.create({
      data: {
        ...data,
        ...connectObj,
        uploadedAt,
        playlists: {
          connect: { id: playlistId },
        },
      },
    });
  }

  async updateVideo(
    data: {
      videoCid?: string;
      completed?: boolean;
      processed?: boolean;
    },
    userId: number,
    videoId: number,
  ) {
    const video = await this.prismaService.video.findUnique({
      where: { id: videoId },
    });
    if (video.userId !== userId)
      throw new UnauthorizedException('permission denied to modify this video');
    if (data.videoCid && video.videoCid)
      throw new UnauthorizedException(
        'Video cid cannot be edited once it is set',
      );
    const {completed,...rest} = data
    if (video) {
      return await this.prismaService.video.update({
        where: { id: videoId },
        data: {
          videoToken: {
            update: {
              completed: data.completed,
            },
          },
          ...rest
        },
      });
    }
    return video;
  }

  async createPlaylist(
    data: Prisma.PlaylistCreateInput,
    channelId: number,
    userId: number,
  ) {
    // check channel id is valid
    if (!channelId) throw new BadRequestException();
    // find channel and check ownership
    const channel = await this.prismaService.channel.findUnique({
      where: { id: channelId },
    });
    if (!channel) throw new NotFoundException('Channel does not exist');
    if (channel.userId !== userId)
      throw new UnauthorizedException('You do not own this channel');

    return this.prismaService.playlist.create({
      data: {
        ...data,
        channel: {
          connect: {
            id: channelId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async addVideosToPlaylist(
    playlistId: number,
    userId: number,
    videoIds: number[],
  ) {
    const playlist = await this.prismaService.playlist.findFirst({
      where: { id: playlistId },
    });
    if (!playlist) throw new NotFoundException();
    if (playlist.userId !== userId) throw new UnauthorizedException();
    return this.prismaService.playlist.update({
      where: {
        id: playlistId,
      },
      data: {
        videos: {
          connect: videoIds.map((videoId) => ({ id: videoId })),
        },
      },
    });
  }

  async getVideo(id: number) {
    return this.prismaService.video.findUnique({ where: { id } });
  }

  async getVideos(channelId: number, where: Prisma.VideoWhereInput) {
    return this.prismaService.video.findMany({
      where: {
        ...where,
      },
      orderBy: {
        id: 'desc',
      },
      take: VIDEOS_TAKE_LIMIT,
      include: {
        videoToken: true,
      },
    });
  }

  async getPlaylists(channelId: number, playlistId?: number) {
    return this.prismaService.playlist.findMany({
      where: {
        id: {
          lte: playlistId,
        },
        channelId: channelId,
      },
      orderBy: {
        id: 'desc',
      },
      include: {
        videos: {
          orderBy: {
            id: 'desc',
          },
          take: 5,
        },
      },
      take: PLAYLISTS_TAKE_LIMIT,
    });
  }

  async getPlaylist(playlistId: number) {
    return this.prismaService.playlist.findFirst({
      where: {
        id: playlistId,
      },
    });
  }

  async getVideosForPlaylist(playlistId: number, videoId?: number) {
    return this.prismaService.playlist.findFirst({
      where: {
        id: playlistId,
      },
      include: {
        videos: {
          where: {
            id: {
              lt: videoId,
            },
          },
          take: VIDEOS_TAKE_LIMIT,
        },
      },
    });
  }

  async getVideoToken(videoId: number, userId: number) {
    const video = await this.prismaService.video.findUnique({
      where: { id: videoId },
      include: {
        videoToken: true,
      },
    });
    if (!video || !video.videoToken) throw new BadRequestException();
    if (video.userId !== userId) throw new UnauthorizedException();
    return video;
  }

  private getFileName(fileName: string) {
    const uuid = randomUUID();
    return `${uuid}-${fileName}`;
  }

  @OnEvent(VIDEO_UPLOADED_EVENT)
  handleVideoUpload(payload: { videoId: number; src: string }) {
    console.log('got video uploaded event with payload ', payload);
    this.videoQue.add(TRANSCODE_JOB, {
      videoId: payload.videoId,
      src: payload.src,
      destFolder:PROCCESSED_PATH
    } as TranscodeJobData);
  }

  @OnEvent(VIDEO_TRANSCODED_EVENT)
  handleVideoTransCodeEvent(payload: { videoId: number; destDir: string }) {
    console.log('received video transcoded event with payload ', payload);
    // upload to ipfs
    this.videoQue.add(PROCESS_JOB, {
      videoId: payload.videoId,
      destDir: payload.destDir,
    } as ProcessJobData);
  }

  @OnEvent(VIDEO_PROCESSED_EVENT)
  async handleUploadToIpfsEvent(payload: { videoId: number; cid: CIDString }) {
    console.log('received video processed event with payload ', payload);
    try {
      const video = await this.prismaService.video.update({
        where: { id: payload.videoId },
        data: {
          ipfsLocation: payload.cid,
        },
      });
      console.log(`added ipfs location to video ${video.id} , cid is ${video.ipfsLocation}`);
    } catch (err) {
      console.log(err);
    }
  }

  private getCurrentTime() {
    return new Date().toUTCString();
  }
}
