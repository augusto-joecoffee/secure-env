#! /usr/bin/env node

/* Arguments that can be passed are
 * --secret <secretKey>  | -s <secretKey>
 * --out <file-path> | -o <file-path>
 * --algo <algoName> |  -a <algoName>
 * --decrypt | -d
 */

import { PathLike } from "fs";
import minimist from "minimist"
import { decrypt, encrypt } from './cryptography'
import log, { logTypes } from './utils/log'
import fs from 'fs';
import { spawn } from "child_process";
import * as diff from 'diff';
import colors from 'colors';
import inquirer from 'inquirer';
import { sync as commandExists } from 'command-exists';

const argv = minimist(process.argv.slice(2))
const outputFile = argv.out || argv.o
const inputFile = argv._[0] || argv.i
const secret = argv.secret || argv.s
const encryptionAlgo = argv.algo || argv.a

// should decrypt or encrypt ?
if (argv.decrypt || argv.d) {
	log(decrypt({ secret, inputFile, outputFile, decryptionAlgo: encryptionAlgo }), logTypes.INFO)
} else if (argv.edit || argv.e) {

	const decrypted: any = decrypt({ secret, inputFile, outputFile, decryptionAlgo: encryptionAlgo })
	if (!decrypted) { process.exit(1) }

	const file: any = '.env.temp';
	const path: PathLike = `./${file}`

	fs.writeFileSync(path, decrypted);

	console.log(colors.bold.white('Opening your text editor...'));
	const code = commandExists('code') ? 'code' : null;
	const nano = commandExists('nano') ? 'nano' : null;
	const vim = commandExists('vim') ? 'vim' : null;
	const usersEditor: any = process.env.EDITOR || nano || code || vim || 'vi';
	const childProcess = spawn(usersEditor, [file], {
		stdio: 'inherit',
		detached: true
	})

	childProcess.on('data', () => process.exit())

	const abort = () => {
		fs.unlinkSync(path);
		console.log('\n');
		console.log(colors.bold.white(`Aborted no changes made.`));
		console.log('\n');

		process.exit(0);

	}

	let saved = false;

	fs.watch(path, (evenType: any) => {
		console.log(evenType)
		if (evenType === "change") {
			if (saved) { return; }
			saved = true;
			const newEnvVars = fs.readFileSync(path);
			const envVarsDiff = diff.diffLines(
				decrypted,
				newEnvVars.toString()
			)

			const removed = (envVarsDiff.filter(line => line.removed))?.map((line) => line.value);
			const added = (envVarsDiff.filter(line => line.added))?.map((line) => line.value);

			if (!removed.length && !added.length) {
				abort()
			}
			console.log(colors.bold.white('Your changes:'));
			console.log('\n');
			console.log(colors.bold.underline.red('Removed:'));
			console.log('\n');
			console.log(colors.red(removed.join('\n')));
			console.log('\n');
			console.log(colors.bold.underline.green('Added:'));
			console.log('\n');
			console.log(colors.green(added.join('\n')));
			console.log('\n');

			inquirer.prompt([{
				name:'continue',
				type: 'string',
				message: 'Encrypt? Yes/ No',
			}]).then((answers) => {
				if (['yes', 'y'].includes(answers.continue.toLowerCase())) {
					encrypt({ secret, inputFile: file, outputFile: inputFile, encryptionAlgo, isEdit: true })?.then(() => {
						fs.unlinkSync(path);
						console.log('\n');
						console.log(colors.bold.white(`All done!`))
						console.log(colors.bold.white(`The Environment file "${inputFile}" has been edited.`))
						console.log(colors.bold.white(`Don't forget to push and commit "${inputFile}"".`))
						console.log('\n');

						process.exit(0);
					});
				} else {
					abort();
				}
			});
		}
	}
	);
} else {
	encrypt({ secret, inputFile, outputFile, encryptionAlgo });
}
