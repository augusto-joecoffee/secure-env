"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logTypes = exports.colorCodes = void 0;
var colorCodes;
(function (colorCodes) {
    colorCodes["BLACK"] = "\u001B[30m";
    colorCodes["RED"] = "\u001B[31m";
    colorCodes["GREEN"] = "\u001B[32m";
    colorCodes["YELLOW"] = "\u001B[33m";
    colorCodes["BLUE"] = "\u001B[34m";
    colorCodes["MAGENTA"] = "\u001B[35m";
    colorCodes["CYAN"] = "\u001B[36m";
    colorCodes["RESET"] = "\u001B[0m";
})(colorCodes = exports.colorCodes || (exports.colorCodes = {}));
var logTypes;
(function (logTypes) {
    logTypes[logTypes["ERROR"] = 0] = "ERROR";
    logTypes[logTypes["WARN"] = 1] = "WARN";
    logTypes[logTypes["INFO"] = 2] = "INFO";
})(logTypes = exports.logTypes || (exports.logTypes = {}));
const getColorCode = (colorCode) => colorCode || colorCodes.RESET;
const log = (data, type, color) => {
    if (!data)
        return;
    let logData = `${colorCodes.CYAN}Secure-env : ${colorCodes.RESET}`;
    switch (type) {
        case logTypes.ERROR:
            logData += `${colorCodes.RED} ERROR OCCURED ${colorCodes.RESET}`;
            break;
        case logTypes.INFO:
            logData += `${colorCodes.GREEN} INFO ${colorCodes.RESET}`;
            break;
        case logTypes.WARN:
            logData += `${colorCodes.YELLOW} WARNING ${colorCodes.RESET}`;
            break;
    }
    logData += color ? `${getColorCode(color)}${data}${colorCodes.RESET}` : data;
    console.log(logData);
};
exports.default = log;
