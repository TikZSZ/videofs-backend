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
exports.ChannelController = void 0;
const events_1 = require("./events");
const video_que_name_1 = require("./video.que.name");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_decorator_1 = require("../global/decorators/jwt.decorator");
const auth_guard_1 = require("../global/guards/auth.guard");
const channel_service_1 = require("./channel.service");
const platform_express_1 = require("@nestjs/platform-express");
const node_path_1 = require("node:path");
const bull_1 = require("@nestjs/bull");
const file_service_1 = require("./file.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const UPLOAD_PATH = (0, node_path_1.join)(__dirname, '..', '..', 'uploaded');
const PROCCESSED_PATH = (0, node_path_1.join)(__dirname, '..', '..', 'processed');
let ChannelController = class ChannelController {
    constructor(channelService, videoQueue, fileService, eventEmitter) {
        this.channelService = channelService;
        this.videoQueue = videoQueue;
        this.fileService = fileService;
        this.eventEmitter = eventEmitter;
        async function main() {
            await videoQueue.removeJobs('*');
        }
        main();
    }
    getChannelForToken(token) {
        return this.channelService.getChannelForJWTToken(token.id);
    }
    createChannel(data, token) {
        return this.channelService.createChannel(data, token.id);
    }
    getChannel(channelId) {
        return this.channelService.getChannel(channelId);
    }
    getVideo(videoId) {
        return this.channelService.getVideo(videoId);
    }
    async getVideos(channelId, token, req, user, videoId) {
        const videos = await this.channelService.getVideos(channelId, {
            channelId: channelId,
            id: {
                lte: videoId,
            },
            userId: user ? token.id : undefined,
        });
        return videos;
    }
    async createVideo(channelid, data, token) {
        const { videoMeta } = data, rest = __rest(data, ["videoMeta"]);
        const video = await this.channelService.createVideo(rest, token.id, parseInt(channelid), videoMeta);
        return video;
    }
    async getVideoToken(videoId, jwtToken) {
        const video = await this.channelService.getVideoToken(videoId, jwtToken.id);
        let uploadedSize;
        try {
            const fileStats = await this.fileService.getStatsFromPath(`${UPLOAD_PATH}/${video.videoToken.fileName}`);
            uploadedSize = fileStats.size;
        }
        catch (err) {
            const doesNotExist = this.isErrorNotFound(err);
            if (doesNotExist) {
                uploadedSize = 0;
            }
        }
        return Object.assign(Object.assign({}, video), { uploadedSize });
    }
    async updateVideo(jwtToken, videoId, body) {
        return this.channelService.updateVideo({ videoCid: body.videoCid }, jwtToken.id, videoId);
    }
    async uploadVideo(file, jwtToken, range, videoId, body) {
        const [rangeStart, rangeEnd, totalSize] = range
            .match(/\d+/g)
            .map((val) => parseInt(val));
        console.log([rangeStart, rangeEnd, totalSize]);
        const { fileName, fileSize, completed } = await (await this.channelService.getVideoToken(videoId, jwtToken.id)).videoToken;
        if (completed)
            throw new common_1.BadRequestException('Video has uploaded completely');
        const filePath = (0, node_path_1.join)(UPLOAD_PATH, '/', fileName);
        const fh = await this.fileService.getFileHandle(filePath, 'a+');
        const fileStats = await fh.stat();
        if (rangeStart !== fileStats.size ||
            totalSize > fileSize ||
            rangeEnd > fileSize) {
            throw new common_1.BadRequestException('Bad Range');
        }
        await this.fileService.appendStream(fh, rangeStart, file.buffer);
        if (fileSize === rangeEnd) {
            await this.channelService.updateVideo({ completed: true }, jwtToken.id, videoId);
            this.eventEmitter.emit(events_1.VIDEO_UPLOADED_EVENT, {
                videoId: videoId,
                src: filePath,
            });
            return {
                completed: true,
            };
        }
        else {
            return {
                done: true,
            };
        }
    }
    getPlaylists(channelId, token, playlistId) {
        return this.channelService.getPlaylists(channelId, playlistId);
    }
    createPlaylist(channelId, data, token) {
        return this.channelService.createPlaylist(data, channelId, token.id);
    }
    getPlaylist(playlistId, token) {
        return this.channelService.getPlaylist(playlistId);
    }
    getVideosForPlaylist(playlistId, token, videoId) {
        return this.channelService.getVideosForPlaylist(playlistId, videoId);
    }
    addVideosToPlaylist(playlistId, data, token) {
        return this.channelService.addVideosToPlaylist(playlistId, token.id, data.videos);
    }
    isErrorNotFound(err) {
        return err.code === 'ENOENT';
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, jwt_decorator_1.GetJwtToken)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "getChannelForToken", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)('data')),
    __param(1, (0, jwt_decorator_1.GetJwtToken)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "createChannel", null);
__decorate([
    (0, common_1.Get)('/:channelId'),
    __param(0, (0, common_1.Param)('channelid', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "getChannel", null);
__decorate([
    (0, common_1.Get)('/videos/:videoid'),
    __param(0, (0, common_1.Param)('videoid', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "getVideo", null);
__decorate([
    (0, common_1.Get)('/:channelid/videos'),
    __param(0, (0, common_1.Param)('channelid', common_1.ParseIntPipe)),
    __param(1, (0, jwt_decorator_1.GetJwtToken)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Query)('user', new common_1.DefaultValuePipe(false), common_1.ParseBoolPipe)),
    __param(4, (0, common_1.Query)('videoid', new common_1.DefaultValuePipe(undefined))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object, Boolean, Number]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "getVideos", null);
__decorate([
    (0, common_1.Post)('/:channelid/videos'),
    __param(0, (0, common_1.Param)('channelid', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('data')),
    __param(2, (0, jwt_decorator_1.GetJwtToken)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "createVideo", null);
__decorate([
    (0, common_1.Get)('/:channelid/videos/:videoid'),
    __param(0, (0, common_1.Param)('videoid', common_1.ParseIntPipe)),
    __param(1, (0, jwt_decorator_1.GetJwtToken)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "getVideoToken", null);
__decorate([
    (0, common_1.Patch)('/:channelid/videos/:videoid'),
    __param(0, (0, jwt_decorator_1.GetJwtToken)()),
    __param(1, (0, common_1.Param)('videoid', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "updateVideo", null);
__decorate([
    (0, common_1.Post)('/:channelid/videos/:videoid'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, jwt_decorator_1.GetJwtToken)()),
    __param(2, (0, common_1.Headers)('content-range')),
    __param(3, (0, common_1.Param)('videoid', common_1.ParseIntPipe)),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, Number, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "uploadVideo", null);
__decorate([
    (0, common_1.Get)('/:channelid/playlists'),
    __param(0, (0, common_1.Param)('channelid', common_1.ParseIntPipe)),
    __param(1, (0, jwt_decorator_1.GetJwtToken)()),
    __param(2, (0, common_1.Query)('playlistId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Number]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "getPlaylists", null);
__decorate([
    (0, common_1.Post)('/:channelid/playlists'),
    __param(0, (0, common_1.Param)('channelId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('data')),
    __param(2, (0, jwt_decorator_1.GetJwtToken)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "createPlaylist", null);
__decorate([
    (0, common_1.Get)('/playlists/:playlistid'),
    __param(0, (0, common_1.Param)('playlistId', common_1.ParseIntPipe)),
    __param(1, (0, jwt_decorator_1.GetJwtToken)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "getPlaylist", null);
__decorate([
    (0, common_1.Get)('/playlists/:playlistId/videos'),
    __param(0, (0, common_1.Param)('playlistId', common_1.ParseIntPipe)),
    __param(1, (0, jwt_decorator_1.GetJwtToken)()),
    __param(2, (0, common_1.Query)('videoid', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Number]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "getVideosForPlaylist", null);
__decorate([
    (0, common_1.Post)('/playlists/:playlistid/videos'),
    __param(0, (0, common_1.Param)('playlistid', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('data')),
    __param(2, (0, jwt_decorator_1.GetJwtToken)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "addVideosToPlaylist", null);
ChannelController = __decorate([
    (0, common_1.Controller)('/channels'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(1, (0, bull_1.InjectQueue)(video_que_name_1.VIDEO_PROCESSOR_QUEUE)),
    __metadata("design:paramtypes", [channel_service_1.ChannelService, Object, file_service_1.FileService,
        event_emitter_1.EventEmitter2])
], ChannelController);
exports.ChannelController = ChannelController;
//# sourceMappingURL=channel.controller.js.map