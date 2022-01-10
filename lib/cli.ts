#! /usr/bin/env node

/* Arguments that can be passed are
 * --secret <secretKey>  | -s <secretKey>
 * --out <file-path> | -o <file-path>
 * --algo <algoName> |  -a <algoName>
 * --decrypt | -d
 */

import { PathLike } from "fs";
import minimist from "minimist"
import { white, red, green, bold, underline } from "colorette";
import { decrypt, encrypt } from "./cryptography";
import log, { logTypes } from "./utils/log";
import fs from "fs";
import { spawn } from "child_process";
import * as diff from "diff";
import inquirer from "inquirer";
import { sync as commandExists } from "command-exists";

const argv = minimist(process.argv.slice(2));
const outputFile = argv.out || argv.o;
const inputFile = argv._[0] || argv.i;
const secret = argv.secret || argv.s;
const encryptionAlgo = argv.algo || argv.a;

// should decrypt or encrypt ?
if (argv.decrypt || argv.d) {
  log(
    decrypt({ secret, inputFile, outputFile, decryptionAlgo: encryptionAlgo }),
    logTypes.INFO
  );
} else if (argv.edit || argv.e) {
  const decrypted: any = decrypt({
    secret,
    inputFile,
    outputFile,
    decryptionAlgo: encryptionAlgo,
  });
  if (!decrypted) {
    process.exit(1);
  }

  const file: any = ".env.temp";
  const path: PathLike = `./${file}`;

  const clean = () => fs.existsSync(path) && fs.unlinkSync(path);
  process.on("exit", clean);
  process.on("SIGINT", clean);
  process.on("SIGUSR1", clean);
  process.on("SIGUSR2", clean);
  process.on("uncaughtException", clean);

  fs.writeFileSync(path, decrypted);

  console.log(bold(white("Opening your text editor...")));
  const code = commandExists("code") ? "code" : null;
  const nano = commandExists("nano") ? "nano" : null;
  const atom = commandExists("atom") ? "atom" : null;
  const sublime = commandExists("subl") ? "subl" : null;
  const vim = commandExists("vim") ? "vim" : null;
  const usersEditor: any =
    process.env.EDITOR || nano || code || sublime || atom || vim || "vi";

  const childProcess = spawn(usersEditor, [file], {
    stdio: "inherit",
    detached: true,
  });

  let saved = false;

  const diffAndSave = () => {
    if (saved) {
      return;
    }
    saved = true;
    const newEnvVars = fs.readFileSync(path);
    const envVarsDiff = diff.diffTrimmedLines(decrypted, newEnvVars.toString());

    const removed = envVarsDiff
      .filter((line) => line.removed)
      ?.map((line) => line.value);

    const added = envVarsDiff
      .filter((line) => line.added)
      ?.map((line) => line.value);

    if (!removed.length && !added.length) {
      abort();
    }
    console.log(bold(white("Your changes:")));
    console.log("\n");
    console.log(bold(underline(red("Removed:"))));
    console.log("\n");
    console.log(red(removed.join("\n")));
    console.log("\n");
    console.log(bold(underline(green("Added:"))));
    console.log("\n");
    console.log(green(added.join("\n")));
    console.log("\n");

    inquirer
      .prompt([
        {
          name: "continue",
          type: "string",
          message: "Encrypt? Yes/ No",
        },
      ])
      .then((answers) => {
        if (["yes", "y"].includes(answers.continue.toLowerCase())) {
          encrypt({
            secret,
            inputFile: file,
            outputFile: inputFile,
            encryptionAlgo,
            isEdit: true,
          })?.then(() => {
            fs.unlinkSync(path);
            console.log("\n");
            console.log(bold(white(`All done!`)));
            console.log(
              bold(
                white(`The Environment file "${inputFile}" has been edited.`)
              )
            );
            console.log(
              bold(white(`Don't forget to push and commit "${inputFile}"".`))
            );
            console.log("\n");

            process.exit(0);
          });
        } else {
          abort();
        }
      });
  };

  if (usersEditor !== "code") {
    childProcess.on("exit", diffAndSave);
  } else {
    const watcher = fs.watch(path, (evenType: any) => {
      if (evenType === "change") {
        console.log(bold(white(`File saved!`)));
        diffAndSave();
        watcher.close();
      }
    });
  }

  const abort = () => {
    fs.unlinkSync(path);
    console.log("\n");
    console.log(bold(white(`Aborted no changes made.`)));
    console.log("\n");

    process.exit(0);
  };
} else {
  encrypt({ secret, inputFile, outputFile, encryptionAlgo });
}
