"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelModule = void 0;
const common_1 = require("@nestjs/common");
const channel_service_1 = require("./channel.service");
const channel_controller_1 = require("./channel.controller");
const user_module_1 = require("../user/user.module");
const bull_1 = require("@nestjs/bull");
const FFmpeg_service_1 = require("../FFmpeg.service");
const Processor_1 = require("./Processor");
const video_que_name_1 = require("./video.que.name");
const file_service_1 = require("./file.service");
const ipfs_module_1 = require("./IpfsModule/ipfs.module");
const web3_config_service_1 = require("./web3.config.service");
const queOptions = {
    name: video_que_name_1.VIDEO_PROCESSOR_QUEUE,
};
let ChannelModule = class ChannelModule {
};
ChannelModule = __decorate([
    (0, common_1.Module)({
        imports: [
            user_module_1.UserModule,
            bull_1.BullModule.registerQueue(queOptions),
            ipfs_module_1.Web3Module.registerAsync({
                useClass: web3_config_service_1.Web3ConfigService,
            }),
        ],
        providers: [channel_service_1.ChannelService, FFmpeg_service_1.FFmpegService, Processor_1.VideoConsumer, file_service_1.FileService],
        controllers: [channel_controller_1.ChannelController],
    })
], ChannelModule);
exports.ChannelModule = ChannelModule;
//# sourceMappingURL=channel.module.js.map