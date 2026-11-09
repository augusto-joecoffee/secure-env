#! /usr/bin/env node
"use strict";
/* Arguments that can be passed are
 * --secret <secretKey>  | -s <secretKey>
 * --out <file-path> | -o <file-path>
 * --algo <algoName> |  -a <algoName>
 * --decrypt | -d
 */
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
const minimist_1 = __importDefault(require("minimist"));
const colorette_1 = require("colorette");
const cryptography_1 = require("./cryptography");
const log_1 = __importStar(require("./utils/log"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const diff = __importStar(require("diff"));
const inquirer_1 = __importDefault(require("inquirer"));
const command_exists_1 = require("command-exists");
const argv = (0, minimist_1.default)(process.argv.slice(2));
const outputFile = argv.out || argv.o;
const inputFile = argv._[0] || argv.i;
const secret = argv.secret || argv.s;
// should decrypt or encrypt ?
if (argv.decrypt || argv.d) {
    (0, log_1.default)((0, cryptography_1.decrypt)({ secret, inputFile, outputFile }), log_1.logTypes.INFO);
}
else if (argv.edit || argv.e) {
    const decrypted = (0, cryptography_1.decrypt)({
        secret,
        inputFile,
        outputFile,
    });
    if (!decrypted) {
        process.exit(1);
    }
    const file = ".env.temp";
    const path = `./${file}`;
    const clean = () => fs_1.default.existsSync(path) && fs_1.default.unlinkSync(path);
    process.on("exit", clean);
    process.on("SIGINT", clean);
    process.on("SIGUSR1", clean);
    process.on("SIGUSR2", clean);
    process.on("uncaughtException", clean);
    fs_1.default.writeFileSync(path, decrypted);
    console.log((0, colorette_1.bold)((0, colorette_1.white)("Opening your text editor...")));
    const code = (0, command_exists_1.sync)("code") ? "code" : null;
    const nano = (0, command_exists_1.sync)("nano") ? "nano" : null;
    const atom = (0, command_exists_1.sync)("atom") ? "atom" : null;
    const sublime = (0, command_exists_1.sync)("subl") ? "subl" : null;
    const vim = (0, command_exists_1.sync)("vim") ? "vim" : null;
    const usersEditor = process.env.EDITOR || nano || code || sublime || atom || vim || "vi";
    const childProcess = (0, child_process_1.spawn)(usersEditor, [file], {
        stdio: "inherit",
        detached: true,
    });
    let saved = false;
    const diffAndSave = () => {
        if (saved) {
            return;
        }
        saved = true;
        const newEnvVars = fs_1.default.readFileSync(path);
        const envVarsDiff = diff.diffLines(decrypted, newEnvVars.toString(), {
            newlineIsToken: true,
        });
        const removed = envVarsDiff
            .filter((line) => line.removed)
            ?.map((line) => line.value);
        const added = envVarsDiff
            .filter((line) => line.added)
            ?.map((line) => line.value);
        if (!removed.length && !added.length) {
            abort();
        }
        console.log((0, colorette_1.bold)((0, colorette_1.white)("Your changes:")));
        console.log("\n");
        console.log((0, colorette_1.bold)((0, colorette_1.underline)((0, colorette_1.red)("Removed:"))));
        console.log("\n");
        console.log((0, colorette_1.red)(removed.join("\n")));
        console.log("\n");
        console.log((0, colorette_1.bold)((0, colorette_1.underline)((0, colorette_1.green)("Added:"))));
        console.log("\n");
        console.log((0, colorette_1.green)(added.join("\n")));
        console.log("\n");
        inquirer_1.default
            .prompt([
            {
                name: "continue",
                type: "string",
                message: "Encrypt? Yes/ No",
            },
        ])
            .then((answers) => {
            if (["yes", "y"].includes(answers.continue.toLowerCase())) {
                (0, cryptography_1.encrypt)({
                    secret,
                    inputFile: file,
                    outputFile: inputFile,
                    isEdit: true,
                });
                fs_1.default.unlinkSync(path);
                console.log("\n");
                console.log((0, colorette_1.bold)((0, colorette_1.white)(`All done!`)));
                console.log((0, colorette_1.bold)((0, colorette_1.white)(`The Environment file "${inputFile}" has been edited.`)));
                console.log((0, colorette_1.bold)((0, colorette_1.white)(`Don't forget to push and commit "${inputFile}"".`)));
                console.log("\n");
                process.exit(0);
            }
        });
    };
    if (usersEditor !== "code") {
        childProcess.on("exit", diffAndSave);
    }
    else {
        const watcher = fs_1.default.watch(path, (evenType) => {
            if (evenType === "change") {
                console.log((0, colorette_1.bold)((0, colorette_1.white)(`File saved!`)));
                diffAndSave();
                watcher.close();
            }
        });
    }
    const abort = () => {
        fs_1.default.unlinkSync(path);
        console.log("\n");
        console.log((0, colorette_1.bold)((0, colorette_1.white)(`Aborted no changes made.`)));
        console.log("\n");
        process.exit(0);
    };
}
else {
    (0, cryptography_1.encrypt)({ secret, inputFile, outputFile });
}
