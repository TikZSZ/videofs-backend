/// <reference types="multer" />
import { Prisma } from '@prisma/client';
import { IJwtToken } from 'src/global/types/JwtToken';
import { ChannelService } from './channel.service';
import type { Request } from 'express';
import { Queue } from 'bull';
import { FileService } from './file.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class ChannelController {
    private channelService;
    private videoQueue;
    private fileService;
    private eventEmitter;
    constructor(channelService: ChannelService, videoQueue: Queue, fileService: FileService, eventEmitter: EventEmitter2);
    getChannelForToken(token: IJwtToken): Prisma.Prisma__ChannelClient<import(".prisma/client").Channel>;
    createChannel(data: Prisma.ChannelCreateInput, token: IJwtToken): Promise<import(".prisma/client").Channel>;
    getChannel(channelId: number): Prisma.Prisma__ChannelClient<import(".prisma/client").Channel>;
    getVideo(videoId: number): Promise<import(".prisma/client").Video>;
    getVideos(channelId: number, token: IJwtToken, req: Request, user?: boolean, videoId?: number): Promise<(import(".prisma/client").Video & {
        videoToken: import(".prisma/client").VideoToken;
    })[]>;
    createVideo(channelid: string, data: Prisma.VideoCreateInput & {
        videoMeta: Prisma.VideoTokenCreateInput;
    }, token: IJwtToken): Promise<import(".prisma/client").Video>;
    getVideoToken(videoId: number, jwtToken: IJwtToken): Promise<{
        uploadedSize: number;
        id: number;
        name: string;
        displayName: string;
        uploadedAt: string;
        description: string;
        videoCid: string;
        private: boolean;
        published: boolean;
        ipfsLocation: string;
        userId: number;
        channelId: number;
        videoToken: import(".prisma/client").VideoToken;
    }>;
    updateVideo(jwtToken: IJwtToken, videoId: number, body: {
        videoCid: string;
    }): Promise<import(".prisma/client").Video>;
    uploadVideo(file: Express.Multer.File, jwtToken: IJwtToken, range: string, videoId: number, body: any): Promise<{
        completed: boolean;
        done?: undefined;
    } | {
        done: boolean;
        completed?: undefined;
    }>;
    getPlaylists(channelId: number, token: IJwtToken, playlistId?: number): Promise<(import(".prisma/client").Playlist & {
        videos: import(".prisma/client").Video[];
    })[]>;
    createPlaylist(channelId: number, data: Prisma.PlaylistCreateInput, token: IJwtToken): Promise<import(".prisma/client").Playlist>;
    getPlaylist(playlistId: number, token: IJwtToken): Promise<import(".prisma/client").Playlist>;
    getVideosForPlaylist(playlistId: number, token: IJwtToken, videoId?: number): Promise<import(".prisma/client").Playlist & {
        videos: import(".prisma/client").Video[];
    }>;
    addVideosToPlaylist(playlistId: number, data: {
        videos: number[];
    }, token: IJwtToken): Promise<import(".prisma/client").Playlist>;
    isErrorNotFound(err: any): boolean;
}
