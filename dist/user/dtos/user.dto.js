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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyPhoneNumDto = exports.LoginDTO = exports.UserDTO = exports.PhoneNumberDTO = void 0;
const class_validator_1 = require("class-validator");
class PhoneNumberDTO {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.IsPhoneNumber)("IN"),
    __metadata("design:type", String)
], PhoneNumberDTO.prototype, "phoneNumber", void 0);
exports.PhoneNumberDTO = PhoneNumberDTO;
class UserDTO extends PhoneNumberDTO {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UserDTO.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserDTO.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(8),
    __metadata("design:type", String)
], UserDTO.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserDTO.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserDTO.prototype, "city", void 0);
exports.UserDTO = UserDTO;
class LoginDTO extends PhoneNumberDTO {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDTO.prototype, "password", void 0);
exports.LoginDTO = LoginDTO;
class VerifyPhoneNumDto extends PhoneNumberDTO {
}
__decorate([
    (0, class_validator_1.MinLength)(4),
    (0, class_validator_1.MaxLength)(4),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyPhoneNumDto.prototype, "otp", void 0);
exports.VerifyPhoneNumDto = VerifyPhoneNumDto;
//# sourceMappingURL=user.dto.js.map