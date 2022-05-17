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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3Service = void 0;
const common_1 = require("@nestjs/common");
const json_stringify_deterministic_1 = __importDefault(require("json-stringify-deterministic"));
const axios_1 = __importDefault(require("axios"));
const web3_storage_1 = require("web3.storage");
const web3_service_constant_1 = require("./web3.service.constant");
var APIGateWays;
(function (APIGateWays) {
    APIGateWays["IPFS"] = "https://ipfs.io";
    APIGateWays["DWeb"] = "https://cid.ipfs.dweb.link";
    APIGateWays["Web3Storage"] = "https://api.web3.storage/car/bafkreihzefx6zlktpw5naitgojqpwqp6qdjy5gabamchv7v2fdqv2zo4vm";
})(APIGateWays || (APIGateWays = {}));
let Web3Service = class Web3Service {
    constructor(options) {
        this.options = options;
        this._Web3Storage = new web3_storage_1.Web3Storage(options);
    }
    uploadFiles(files, options) {
        return this._Web3Storage.put(files, options);
    }
    getObjectFile(obj, fileName) {
        return new File([(0, json_stringify_deterministic_1.default)(obj)], fileName, {
            type: "application/json",
        });
    }
    convertDataToFile(data, fileName, options) {
        return new File([data], fileName, options);
    }
    storeFilesWithProgress(files, options, afterChunkStored, afterUpload) {
        const onRootCidReady = (cid) => {
            afterUpload && afterUpload(cid);
            console.log("uploading files with cid:", cid);
        };
        const totalSize = files
            .map((f) => f.size)
            .reduce((a, b) => a + b, 0);
        let uploaded = 0;
        const onStoredChunk = (size) => {
            uploaded += size;
            const pct = totalSize / uploaded;
            afterChunkStored && afterChunkStored(size, pct);
            console.log(`Uploading... ${pct.toFixed(2)}% complete`);
        };
        return this.uploadFiles(files, Object.assign(Object.assign({}, options), { onRootCidReady,
            onStoredChunk }));
    }
    getFiles(cid) {
        return this._Web3Storage.get(cid);
    }
    getFileUsingGateway(cid, ...ranges) {
        let headers = {};
        if (ranges.length > 0) {
            headers["Range"] = ranges.reduce((val, range, index) => {
                const rangeString = `${range[0]}-${range[1]}`;
                return (val + (index === 0 ? `bytes=${rangeString}` : `, ${rangeString}`));
            }, "");
        }
        return axios_1.default.get(`https://${cid}.ipfs.dweb.link`, { headers });
    }
};
Web3Service = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(web3_service_constant_1.WEB_3_CONFIG)),
    __metadata("design:paramtypes", [Object])
], Web3Service);
exports.Web3Service = Web3Service;
//# sourceMappingURL=ipfs.service.js.map