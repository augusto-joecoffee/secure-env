import fs from 'fs'
import log, { logTypes } from './utils/log'
import Cryptr from 'cryptr';

/* Arguments that can be passed are
 * --secret <secretKey>  | -s <secretKey>
 * --out <file-path> | -o <file-path>
 * --algo <algoName> |  -a <algoName>
 * --decrypt | -d
 */

export interface IDecryptOptions {
  /**
   * The secret key needed to encrypt/decrypt the file.\
   * `Required`
   * */
  secret: string;

  /**
   * The env file to encrypt.\
   * Default: `.env`
   * */
  inputFile?: fs.PathLike;

  /**
   * The path and name of the generated file \
   * Default: `${inputFile}.enc`
   * */
  outputFile?: fs.PathLike;
}

export interface IEncryptOptions {
  /**
   * The secret key needed to encrypt/decrypt the file.\
   * **Required**
   * */
  secret: string;

  /**
   * The env file to encrypt.\
   * Default: `.env`
   * */
  inputFile?: fs.PathLike;

  /**
   * The path and name of the generated file \
   * Default: `${inputFile}.enc`
   * */
  outputFile?: fs.PathLike;

  isEdit?: boolean;
}

// In the code
export const decrypt = (options: IDecryptOptions) => {
  try {
    const secret = options.secret || 'mySecret'
    const cryptr = new Cryptr(secret);
    const inputFile = options.inputFile || '.env.enc'

    if (!fs.existsSync(inputFile))
      throw new Error(`${inputFile} does not exist.`)

    if (!secret || typeof secret !== 'string')
      throw new Error('No SecretKey provided.')

    const fileBuffer = fs.readFileSync(inputFile)
    const decrypted = cryptr.decrypt(fileBuffer.toString('utf8'))

    return decrypted
  } catch (e) {
    log(e, logTypes.ERROR)
  }
}

// With the cli
export const encrypt = (options: IEncryptOptions) => {
  try {
    const secret = options.secret || 'mySecret'
    const inputFile = options.inputFile || '.env'
    const outputFilePath = options.outputFile || `${inputFile}.enc`
    const isEdit = options.isEdit

    // presumably createCipheriv() should work for all the algo in ./openssl_list-cipher-algorithms.csv with the right key/iv length

    if (!fs.existsSync(inputFile))
      throw new Error(`Error: ${inputFile} does not exist.`);

    if (!secret || typeof secret !== 'string')
      throw new Error('No SecretKey provided.Use -s option to specify secret');

    const cryptr = new Cryptr(secret);
    const input = fs.readFileSync(inputFile).toString('utf8');
    const encrypted = cryptr.encrypt(input)

    fs.writeFileSync(outputFilePath, encrypted);

    if (!isEdit) {
      log(`The Environment file "${inputFile}" has been encrypted to "${outputFilePath}".`, logTypes.INFO);
      log(`Make sure to delete "${inputFile}" for production use.`, logTypes.WARN);
    }

  } catch (e) {
    log(e, logTypes.ERROR)
  }
}
