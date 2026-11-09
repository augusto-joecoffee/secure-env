"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = exports.decrypt = void 0;
const cryptography_1 = require("./cryptography");
const log_1 = __importStar(require("./utils/log"));
const parser_1 = __importDefault(require("./parser"));
const SecureEnv = (options) => {
    try {
        const decryptedContent = (0, cryptography_1.decrypt)(options);
        if (decryptedContent)
            return (0, parser_1.default)(decryptedContent);
    }
    catch (e) {
        (0, log_1.default)(e, log_1.logTypes.ERROR);
    }
};
exports.default = SecureEnv;
var cryptography_2 = require("./cryptography");
Object.defineProperty(exports, "decrypt", { enumerable: true, get: function () { return cryptography_2.decrypt; } });
Object.defineProperty(exports, "encrypt", { enumerable: true, get: function () { return cryptography_2.encrypt; } });
