export interface IObject {
    [key: string]: string;
}
declare const parser: (src: string) => IObject;
export default parser;
