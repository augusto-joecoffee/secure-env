/// <reference types="node" />
import fs from 'fs';
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
export declare const decrypt: (options: IDecryptOptions) => string | undefined;
export declare const encrypt: (options: IEncryptOptions) => void;
