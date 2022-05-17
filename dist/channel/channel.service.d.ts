import { CIDString } from 'web3.storage';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { Queue } from 'bull';
export declare class ChannelService {
    private prismaService;
    private videoQue;
    constructor(prismaService: PrismaService, videoQue: Queue);
    private findChannel;
    getChannelForJWTToken(userId: number): Prisma.Prisma__ChannelClient<import(".prisma/client").Channel>;
    getChannel(channelId: number): Prisma.Prisma__ChannelClient<import(".prisma/client").Channel>;
    createChannel(data: Prisma.ChannelCreateInput, userId: number): Promise<import(".prisma/client").Channel>;
    createVideo(data: Prisma.VideoCreateInput, userId: number, channelId: number, videoMeta: Prisma.VideoTokenCreateInput, playlistId?: number): Promise<import(".prisma/client").Video>;
    updateVideo(data: {
        videoCid?: string;
        completed?: boolean;
        processed?: boolean;
    }, userId: number, videoId: number): Promise<import(".prisma/client").Video>;
    createPlaylist(data: Prisma.PlaylistCreateInput, channelId: number, userId: number): Promise<import(".prisma/client").Playlist>;
    addVideosToPlaylist(playlistId: number, userId: number, videoIds: number[]): Promise<import(".prisma/client").Playlist>;
    getVideo(id: number): Promise<import(".prisma/client").Video>;
    getVideos(channelId: number, where: Prisma.VideoWhereInput): Promise<(import(".prisma/client").Video & {
        videoToken: import(".prisma/client").VideoToken;
    })[]>;
    getPlaylists(channelId: number, playlistId?: number): Promise<(import(".prisma/client").Playlist & {
        videos: import(".prisma/client").Video[];
    })[]>;
    getPlaylist(playlistId: number): Promise<import(".prisma/client").Playlist>;
    getVideosForPlaylist(playlistId: number, videoId?: number): Promise<import(".prisma/client").Playlist & {
        videos: import(".prisma/client").Video[];
    }>;
    getVideoToken(videoId: number, userId: number): Promise<import(".prisma/client").Video & {
        videoToken: import(".prisma/client").VideoToken;
    }>;
    private getFileName;
    handleVideoUpload(payload: {
        videoId: number;
        src: string;
    }): void;
    handleVideoTransCodeEvent(payload: {
        videoId: number;
        destDir: string;
    }): void;
    handleUploadToIpfsEvent(payload: {
        videoId: number;
        cid: CIDString;
    }): Promise<void>;
    private getCurrentTime;
}
