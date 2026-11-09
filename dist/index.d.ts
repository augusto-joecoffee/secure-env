import { IDecryptOptions } from './cryptography';
import { IObject } from './parser';
interface IOptions extends Omit<IDecryptOptions, "ivLength"> {
}
declare const SecureEnv: <T extends IObject>(options: IOptions) => T | undefined;
export default SecureEnv;
export { IObject } from "./parser";
export { decrypt, encrypt } from "./cryptography";
