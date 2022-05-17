"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformResponsePipe = void 0;
class TransformResponsePipe {
    transform(value, metadata) {
        return {
            name: value.name,
            id: value.id
        };
    }
}
exports.TransformResponsePipe = TransformResponsePipe;
//# sourceMappingURL=transform.pipe.js.map