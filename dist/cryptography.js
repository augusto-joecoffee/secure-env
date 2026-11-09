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
const fs_1 = __importDefault(require("fs"));
const log_1 = __importStar(require("./utils/log"));
const cryptr_1 = __importDefault(require("cryptr"));
// In the code
const decrypt = (options) => {
    try {
        const secret = options.secret || 'mySecret';
        const cryptr = new cryptr_1.default(secret);
        const inputFile = options.inputFile || '.env.enc';
        if (!fs_1.default.existsSync(inputFile))
            throw new Error(`${inputFile} does not exist.`);
        if (!secret || typeof secret !== 'string')
            throw new Error('No SecretKey provided.');
        const fileBuffer = fs_1.default.readFileSync(inputFile);
        const decrypted = cryptr.decrypt(fileBuffer.toString('utf8'));
        return decrypted;
    }
    catch (e) {
        (0, log_1.default)(e, log_1.logTypes.ERROR);
    }
};
exports.decrypt = decrypt;
// With the cli
const encrypt = (options) => {
    try {
        const secret = options.secret || 'mySecret';
        const inputFile = options.inputFile || '.env';
        const outputFilePath = options.outputFile || `${inputFile}.enc`;
        const isEdit = options.isEdit;
        // presumably createCipheriv() should work for all the algo in ./openssl_list-cipher-algorithms.csv with the right key/iv length
        if (!fs_1.default.existsSync(inputFile))
            throw new Error(`Error: ${inputFile} does not exist.`);
        if (!secret || typeof secret !== 'string')
            throw new Error('No SecretKey provided.Use -s option to specify secret');
        const cryptr = new cryptr_1.default(secret);
        const input = fs_1.default.readFileSync(inputFile).toString('utf8');
        const encrypted = cryptr.encrypt(input);
        fs_1.default.writeFileSync(outputFilePath, encrypted);
        if (!isEdit) {
            (0, log_1.default)(`The Environment file "${inputFile}" has been encrypted to "${outputFilePath}".`, log_1.logTypes.INFO);
            (0, log_1.default)(`Make sure to delete "${inputFile}" for production use.`, log_1.logTypes.WARN);
        }
    }
    catch (e) {
        (0, log_1.default)(e, log_1.logTypes.ERROR);
    }
};
exports.encrypt = encrypt;
