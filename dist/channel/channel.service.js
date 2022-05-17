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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma.service");
const events_1 = require("./events");
const Processor_1 = require("./Processor");
const bull_1 = require("@nestjs/bull");
const video_que_name_1 = require("./video.que.name");
const path_1 = require("path");
const VIDEOS_TAKE_LIMIT = 40;
const PLAYLISTS_TAKE_LIMIT = 5;
const UPLOAD_PATH = (0, path_1.join)(__dirname, '..', '..', 'uploaded');
const PROCCESSED_PATH = (0, path_1.join)(__dirname, '..', '..', 'processed');
let ChannelService = class ChannelService {
    constructor(prismaService, videoQue) {
        this.prismaService = prismaService;
        this.videoQue = videoQue;
    }
    findChannel(args) {
        return this.prismaService.channel.findFirst(args);
    }
    getChannelForJWTToken(userId) {
        return this.findChannel({ where: { userId } });
    }
    getChannel(channelId) {
        return this.findChannel({ where: { id: channelId } });
    }
    async createChannel(data, userId) {
        return this.prismaService.channel.create({
            data: Object.assign(Object.assign({}, data), { user: {
                    connect: { id: userId },
                } }),
        });
    }
    async createVideo(data, userId, channelId, videoMeta, playlistId) {
        if (!channelId)
            throw new common_1.BadRequestException('channel id not provided');
        const channel = await this.prismaService.channel.findUnique({
            where: { id: channelId },
            include: {
                playlists: playlistId ? true : false,
            },
        });
        if (!channel)
            throw new common_1.NotFoundException('chnnael not found');
        if (channel.userId !== userId)
            throw new common_1.UnauthorizedException('You do not own the channel');
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
                create: Object.assign(Object.assign({}, videoMeta), { fileName: this.getFileName(videoMeta.fileName) }),
            },
        };
        const uploadedAt = this.getCurrentTime();
        if (!playlistId) {
            return this.prismaService.video.create({
                data: Object.assign(Object.assign(Object.assign({}, data), connectObj), { uploadedAt }),
            });
        }
        const playlistIndex = channel.playlists.findIndex((playlist) => {
            return playlist.id === playlistId;
        });
        if (playlistIndex === -1)
            throw new common_1.UnauthorizedException();
        return this.prismaService.video.create({
            data: Object.assign(Object.assign(Object.assign({}, data), connectObj), { uploadedAt, playlists: {
                    connect: { id: playlistId },
                } }),
        });
    }
    async updateVideo(data, userId, videoId) {
        const video = await this.prismaService.video.findUnique({
            where: { id: videoId },
        });
        if (video.userId !== userId)
            throw new common_1.UnauthorizedException('permission denied to modify this video');
        if (data.videoCid && video.videoCid)
            throw new common_1.UnauthorizedException('Video cid cannot be edited once it is set');
        const { completed } = data, rest = __rest(data, ["completed"]);
        if (video) {
            return await this.prismaService.video.update({
                where: { id: videoId },
                data: Object.assign({ videoToken: {
                        update: {
                            completed: data.completed,
                        },
                    } }, rest),
            });
        }
        return video;
    }
    async createPlaylist(data, channelId, userId) {
        if (!channelId)
            throw new common_1.BadRequestException();
        const channel = await this.prismaService.channel.findUnique({
            where: { id: channelId },
        });
        if (!channel)
            throw new common_1.NotFoundException('Channel does not exist');
        if (channel.userId !== userId)
            throw new common_1.UnauthorizedException('You do not own this channel');
        return this.prismaService.playlist.create({
            data: Object.assign(Object.assign({}, data), { channel: {
                    connect: {
                        id: channelId,
                    },
                }, user: {
                    connect: {
                        id: userId,
                    },
                } }),
        });
    }
    async addVideosToPlaylist(playlistId, userId, videoIds) {
        const playlist = await this.prismaService.playlist.findFirst({
            where: { id: playlistId },
        });
        if (!playlist)
            throw new common_1.NotFoundException();
        if (playlist.userId !== userId)
            throw new common_1.UnauthorizedException();
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
    async getVideo(id) {
        return this.prismaService.video.findUnique({ where: { id } });
    }
    async getVideos(channelId, where) {
        return this.prismaService.video.findMany({
            where: Object.assign({}, where),
            orderBy: {
                id: 'desc',
            },
            take: VIDEOS_TAKE_LIMIT,
            include: {
                videoToken: true,
            },
        });
    }
    async getPlaylists(channelId, playlistId) {
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
    async getPlaylist(playlistId) {
        return this.prismaService.playlist.findFirst({
            where: {
                id: playlistId,
            },
        });
    }
    async getVideosForPlaylist(playlistId, videoId) {
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
    async getVideoToken(videoId, userId) {
        const video = await this.prismaService.video.findUnique({
            where: { id: videoId },
            include: {
                videoToken: true,
            },
        });
        if (!video || !video.videoToken)
            throw new common_1.BadRequestException();
        if (video.userId !== userId)
            throw new common_1.UnauthorizedException();
        return video;
    }
    getFileName(fileName) {
        const uuid = (0, crypto_1.randomUUID)();
        return `${uuid}-${fileName}`;
    }
    handleVideoUpload(payload) {
        console.log('got video uploaded event with payload ', payload);
        this.videoQue.add(Processor_1.TRANSCODE_JOB, {
            videoId: payload.videoId,
            src: payload.src,
            destFolder: PROCCESSED_PATH
        });
    }
    handleVideoTransCodeEvent(payload) {
        console.log('received video transcoded event with payload ', payload);
        this.videoQue.add(Processor_1.PROCESS_JOB, {
            videoId: payload.videoId,
            destDir: payload.destDir,
        });
    }
    async handleUploadToIpfsEvent(payload) {
        console.log('received video processed event with payload ', payload);
        try {
            const video = await this.prismaService.video.update({
                where: { id: payload.videoId },
                data: {
                    ipfsLocation: payload.cid,
                },
            });
            console.log(`added ipfs location to video ${video.id} , cid is ${video.ipfsLocation}`);
        }
        catch (err) {
            console.log(err);
        }
    }
    getCurrentTime() {
        return new Date().toUTCString();
    }
};
__decorate([
    (0, event_emitter_1.OnEvent)(events_1.VIDEO_UPLOADED_EVENT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChannelService.prototype, "handleVideoUpload", null);
__decorate([
    (0, event_emitter_1.OnEvent)(events_1.VIDEO_TRANSCODED_EVENT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChannelService.prototype, "handleVideoTransCodeEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)(events_1.VIDEO_PROCESSED_EVENT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChannelService.prototype, "handleUploadToIpfsEvent", null);
ChannelService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bull_1.InjectQueue)(video_que_name_1.VIDEO_PROCESSOR_QUEUE)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], ChannelService);
exports.ChannelService = ChannelService;
//# sourceMappingURL=channel.service.js.map